import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const youtube = google.youtube('v3');
const openai = new OpenAI();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pageToken = searchParams.get('pageToken');
  const topic = searchParams.get('topic') || '';
  
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

    // Extract video IDs for content analysis
    const videoIds = response.data.items.map(item => item.id?.videoId).filter(Boolean);
    
    // Get detailed video information
    const videosDetails = await youtube.videos.list({
      part: ['snippet', 'statistics'],
      id: videoIds,
      key: process.env.YOUTUBE_API_KEY,
    });

    // Analyze content with OpenAI for better recommendations
    const videoDescriptions = videosDetails.data.items?.map(item => item.snippet?.description).filter(Boolean);
    const aiAnalysis = await openai.chat.completions.create({
      messages: [{
        role: 'system',
        content: `Analyze these video descriptions and rate their diversity of perspective and educational value: ${videoDescriptions?.join('\n')}`
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
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
  }
}
