'use client';

import { useState } from 'react';
import Image from 'next/image';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useInfiniteQuery } from '@tanstack/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { usePreferences } from '@/contexts/PreferencesContext';
import { useProgress } from '@/hooks/useProgress';
import ProgressChart from './ProgressChart';
import GoalForm from './GoalForm';
import VideoPreview from './VideoPreview';

const queryClient = new QueryClient();

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop';

interface Video {
  id: string;
  snippet: {
    title: string;
    thumbnails: {
      high: {
        url: string;
      };
    };
    channelTitle: string;
    description: string;
  };
  statistics?: {
    viewCount: string;
    likeCount: string;
  };
  player?: {
    embedHtml: string;
  };
  aiInsights?: string;
}

interface VideoResponse {
  videos: Video[];
  nextPageToken?: string;
  aiInsights?: string;
}

function VideoFeedContent() {
  const [topic, setTopic] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [previewVideoId, setPreviewVideoId] = useState<string | null>(null);

  const { preferences } = usePreferences();
  
  const fetchVideos = async ({ pageParam = '' }) => {
    const params = new URLSearchParams({
      pageToken: pageParam,
      topic: topic,
      outOfEchoChamber: preferences.outOfEchoChamber.toString(),
      contentTypes: preferences.contentTypes.join(','),
      activePrompts: JSON.stringify(preferences.customPrompts.filter(p => p.active)),
    });

    const response = await fetch(`/api/videos?${params}`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    return data as VideoResponse;
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['videos', topic],
    queryFn: fetchVideos,
    getNextPageParam: (lastPage: VideoResponse) => lastPage.nextPageToken,
    initialPageParam: '',
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setTopic(searchInput);
  };

  if (isLoading) return (
    <div className="flex flex-col justify-center items-center min-h-[400px] space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      <p className="text-gray-600">Curating content based on your preferences...</p>
      {preferences.outOfEchoChamber && (
        <p className="text-sm text-indigo-600">Looking for diverse perspectives...</p>
      )}
    </div>
  );

  if (isError) {
    console.error('Error loading videos');
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px] space-y-4">
        <p className="text-red-600">Error loading videos. Please try again.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const allVideos = data?.pages.flatMap((page) => page.videos) ?? [];

  return (
    <div id="feed" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12">
      <div className="mb-8 space-y-6 sticky top-0 z-10 -mx-3 px-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 py-4 bg-gradient-to-b from-white via-white to-transparent">
        <ProgressChart />
        <GoalForm />
      </div>
      {allVideos.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No growth content found for your journey</p>
          <p className="text-sm text-gray-400">Try exploring different topics or adjusting your goals</p>
        </div>
      )}
      <div className="max-w-3xl mx-auto mb-6 sm:mb-12 relative z-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
            <span>Growth Focus</span>
          </div>
          {preferences.outOfEchoChamber && (
            <span className="text-sm text-indigo-600">
              Diverse Perspectives: Active
            </span>
          )}
        </div>
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search for inspiration, growth stories, or goal-related content..."
            className="w-full p-3 sm:p-4 pr-10 sm:pr-12 text-base sm:text-lg border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-colors bg-white text-gray-900 placeholder-gray-500 shadow-sm"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <MagnifyingGlassIcon className="h-6 w-6" />
          </button>
        </form>
      </div>

      <InfiniteScroll
        dataLength={allVideos.length}
        next={fetchNextPage}
        hasMore={!!hasNextPage}
        loader={
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        }
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
      >
        {allVideos.map((video: Video) => (
          <div
            key={video.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-[1.02] transition-all duration-300"
          >
            <div className="relative group">
              <div className="relative w-full h-40 sm:h-48">
                <Image
                  src={video.snippet.thumbnails.high.url || FALLBACK_IMAGE}
                  alt={video.snippet.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  priority
                />
                {video.statistics && (
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    {parseInt(video.statistics.viewCount).toLocaleString()} views
                  </div>
                )}
                <button
                  onClick={() => setPreviewVideoId(video.id)}
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300"
                >
                  <div className="transform scale-0 group-hover:scale-100 transition-transform duration-300">
                    <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
                {video.snippet.title}
              </h3>
              <p className="text-sm text-gray-600 mb-2">{video.snippet.channelTitle}</p>
              {video.aiInsights && (
                <div className="text-xs text-indigo-600 italic">
                  {video.aiInsights}
                </div>
              )}
              <div className="mt-2 flex items-center space-x-4">
                <a
                  href={`https://www.youtube.com/watch?v=${video.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Open in YouTube
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        ))}
      </InfiniteScroll>

      <VideoPreview
        videoId={previewVideoId || ''}
        isVisible={!!previewVideoId}
        onClose={() => setPreviewVideoId(null)}
      />
    </div>
  );
}

export default function VideoFeed() {
  return (
    <QueryClientProvider client={queryClient}>
      <VideoFeedContent />
    </QueryClientProvider>
  );
}
