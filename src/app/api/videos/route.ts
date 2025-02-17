import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const youtube = google.youtube('v3');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface AlgorithmPrompt {
  name: string;
  prompt: string;
  active: boolean;
}

export async function GET(request: Request) {
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!YOUTUBE_API_KEY || !OPENAI_API_KEY) {
    console.error('Missing API keys:', { youtube: !YOUTUBE_API_KEY, openai: !OPENAI_API_KEY });
    return NextResponse.json(
      { error: 'Missing API configuration' },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const pageToken = searchParams.get('pageToken');
  const topic = searchParams.get('topic') || '';
  const outOfEchoChamber = searchParams.get('outOfEchoChamber') === 'true';
  const contentTypes = searchParams.get('contentTypes')?.split(',') || [];
  const activePrompts = JSON.parse(searchParams.get('activePrompts') || '[]') as AlgorithmPrompt[];
  
  try {
    // First, search for videos
    const searchResponse = await youtube.search.list({
      part: ['snippet'],
      maxResults: 10,
      q: topic || 'motivation inspiration goals',
      type: ['video'],
      videoDuration: 'short',
      pageToken: pageToken || undefined,
      key: YOUTUBE_API_KEY,
    });

    if (!searchResponse.data.items?.length) {
      console.error('No videos found in search');
      return NextResponse.json({ error: 'No videos found' }, { status: 404 });
    }

    // Extract video IDs
    const videoIds = searchResponse.data.items
      .map(item => item.id?.videoId)
      .filter((id): id is string => typeof id === 'string' && id.length > 0);

    if (videoIds.length === 0) {
      console.error('No valid video IDs found');
      return NextResponse.json({ error: 'No valid video IDs found' }, { status: 404 });
    }

    // Get detailed video information
    const videosDetails = await youtube.videos.list({
      part: ['snippet', 'statistics', 'player'],
      id: videoIds,
      key: YOUTUBE_API_KEY,
    });

    if (!videosDetails.data.items?.length) {
      console.error('No video details found');
      return NextResponse.json({ error: 'No video details found' }, { status: 404 });
    }

    // Analyze content with OpenAI
    const videoDescriptions = videosDetails.data.items
      .map(item => item.snippet?.description)
      .filter((desc): desc is string => typeof desc === 'string' && desc.length > 0);

    let analysisPrompt = `You are a mental health-aware content curator. Your goal is to help users maintain good mental health while enjoying social media content.\n\n`;
    
    if (videoDescriptions.some(desc => desc.toLowerCase().includes('motivation') || desc.toLowerCase().includes('inspiration'))) {
      analysisPrompt += `Focus on identifying content that:\n`;
      analysisPrompt += `1. Provides authentic, relatable stories of overcoming challenges\n`;
      analysisPrompt += `2. Offers practical, actionable advice without being overwhelming\n`;
      analysisPrompt += `3. Uses positive reinforcement and encouragement\n`;
      analysisPrompt += `4. Avoids toxic positivity or oversimplified solutions\n`;
      analysisPrompt += `5. Includes elements of hope and resilience\n\n`;
    }

    if (outOfEchoChamber) {
      analysisPrompt += '- Look for content that challenges common viewpoints and presents alternative perspectives\n';
    }
    
    if (contentTypes.length > 0) {
      analysisPrompt += `- Focus on content types: ${contentTypes.join(', ')}\n`;
    }
    
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

    // Transform video items to include required fields
    const videos = videosDetails.data.items.map((item, index) => ({
      id: item.id,
      snippet: {
        title: item.snippet?.title || '',
        description: item.snippet?.description || '',
        thumbnails: item.snippet?.thumbnails || {
          high: {
            url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop'
          }
        },
        channelTitle: item.snippet?.channelTitle || '',
      },
      statistics: item.statistics,
      player: item.player,
      aiInsights: aiAnalysis.choices[0].message.content,
    }));

    return NextResponse.json({
      videos,
      nextPageToken: searchResponse.data.nextPageToken,
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
