import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const youtube = google.youtube('v3');
const openai = new OpenAI();

interface AlgorithmPrompt {
  name: string;
  prompt: string;
  active: boolean;
}

export async function GET(request: Request) {
  if (!process.env.YOUTUBE_API_KEY || !process.env.OPENAI_API_KEY) {
    // Return mock data for development
    return NextResponse.json({
      videos: [
        {
          id: 'mock1',
          snippet: {
            title: 'Setting and Achieving Your Goals',
            thumbnails: {
              high: {
                url: 'https://picsum.photos/400/300'
              }
            },
            channelTitle: 'Personal Growth Channel',
            description: 'Learn how to set and achieve your personal goals effectively.'
          },
          aiInsights: 'This video provides practical advice on goal setting and achievement.'
        },
        {
          id: 'mock2',
          snippet: {
            title: 'Mindfulness for Success',
            thumbnails: {
              high: {
                url: 'https://picsum.photos/400/300'
              }
            },
            channelTitle: 'Wellness & Growth',
            description: 'Discover how mindfulness can help you achieve your goals.'
          },
          aiInsights: 'Focuses on mental well-being and personal development.'
        }
      ],
      nextPageToken: null
    });
  }
  const { searchParams } = new URL(request.url);
  const pageToken = searchParams.get('pageToken');
  const topic = searchParams.get('topic') || '';
  const outOfEchoChamber = searchParams.get('outOfEchoChamber') === 'true';
  const contentTypes = searchParams.get('contentTypes')?.split(',') || [];
  const activePrompts = JSON.parse(searchParams.get('activePrompts') || '[]') as AlgorithmPrompt[];
  
  try {
    const response = await youtube.search.list({
      part: ['snippet'],
      maxResults: 10,
      q: topic,
      type: ['video'],
      videoDuration: 'short',
      pageToken: pageToken || undefined,
      key: process.env.YOUTUBE_API_KEY,
    });

    if (!response.data.items) {
      return NextResponse.json({ error: 'No videos found' }, { status: 404 });
    }

    // Extract video IDs and ensure they are valid strings
    const videoIds = response.data.items
      .map(item => item.id?.videoId)
      .filter((id): id is string => typeof id === 'string' && id.length > 0);
    
    if (videoIds.length === 0) {
      return NextResponse.json({ error: 'No valid video IDs found' }, { status: 404 });
    }

    // Get detailed video information
    const videosDetails = await youtube.videos.list({
      part: ['snippet', 'statistics'],
      id: videoIds,
      key: process.env.YOUTUBE_API_KEY,
    });

    if (!videosDetails.data.items) {
      return NextResponse.json({ error: 'No video details found' }, { status: 404 });
    }

    // Analyze content with OpenAI for better recommendations
    const videoDescriptions = videosDetails.data.items
      .map(item => item.snippet?.description)
      .filter((desc): desc is string => typeof desc === 'string' && desc.length > 0);

    // Build the AI analysis prompt based on user preferences and wellness profile
    let analysisPrompt = `You are a mental health-aware content curator. Your goal is to help users maintain good mental health while enjoying social media content.\n\n`;
    
    // Add wellness-specific instructions
    if (videoDescriptions.some(desc => desc.toLowerCase().includes('motivation') || desc.toLowerCase().includes('inspiration'))) {
      analysisPrompt += `Focus on identifying content that:\n`;
      analysisPrompt += `1. Provides authentic, relatable stories of overcoming challenges\n`;
      analysisPrompt += `2. Offers practical, actionable advice without being overwhelming\n`;
      analysisPrompt += `3. Uses positive reinforcement and encouragement\n`;
      analysisPrompt += `4. Avoids toxic positivity or oversimplified solutions\n`;
      analysisPrompt += `5. Includes elements of hope and resilience\n\n`;
    }

    // Add ADHD-friendly content guidelines
    if (videoDescriptions.some(desc => desc.toLowerCase().includes('adhd') || desc.toLowerCase().includes('focus'))) {
      analysisPrompt += `For ADHD-friendly content, ensure:\n`;
      analysisPrompt += `1. Content is concise and engaging\n`;
      analysisPrompt += `2. Information is broken down into digestible parts\n`;
      analysisPrompt += `3. Uses visual aids and dynamic presentation\n`;
      analysisPrompt += `4. Includes practical coping strategies\n`;
      analysisPrompt += `5. Features relatable ADHD experiences\n\n`;
    }

    // Add mindfulness and mental health aspects
    if (videoDescriptions.some(desc => desc.toLowerCase().includes('mindful') || desc.toLowerCase().includes('mental health'))) {
      analysisPrompt += `For mental health content, prioritize:\n`;
      analysisPrompt += `1. Evidence-based information\n`;
      analysisPrompt += `2. Content from qualified professionals\n`;
      analysisPrompt += `3. Gentle and non-judgmental approaches\n`;
      analysisPrompt += `4. Practical self-care techniques\n`;
      analysisPrompt += `5. Community support and shared experiences\n\n`;
    }

    analysisPrompt += 'Analyze these videos considering:\n';
    
    if (outOfEchoChamber) {
      analysisPrompt += '- Look for content that challenges common viewpoints and presents alternative perspectives\n';
    }
    
    if (contentTypes.length > 0) {
      analysisPrompt += `- Focus on content types: ${contentTypes.join(', ')}\n`;
    }
    
    // Add custom algorithm prompts
    activePrompts.forEach(prompt => {
      analysisPrompt += `- ${prompt.prompt}\n`;
    });
    
    analysisPrompt += `\nVideo descriptions:\n${videoDescriptions.join('\n')}`;

    const aiAnalysis = await openai.chat.completions.create({
      messages: [{
        role: 'system',
        content: analysisPrompt
      }],
      model: 'gpt-3.5-turbo',
    });

    return NextResponse.json({
      videos: videosDetails.data.items,
      nextPageToken: response.data.nextPageToken,
      aiInsights: aiAnalysis.choices[0].message.content,
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch videos', details: errorMessage },
      { status: 500 }
    );
  }
}
