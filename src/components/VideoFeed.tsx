'use client';

import { useState } from 'react';
import Image from 'next/image';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useInfiniteQuery } from '@tanstack/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { usePreferences } from '@/contexts/PreferencesContext';

const queryClient = new QueryClient();

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

  const { preferences } = usePreferences();
  
  const fetchVideos = async ({ pageParam = '' }) => {
    const params = new URLSearchParams({
      pageToken: pageParam,
      topic: topic,
      outOfEchoChamber: preferences.outOfEchoChamber.toString(),
      contentTypes: preferences.contentTypes.join(','),
      activePrompts: JSON.stringify(preferences.customPrompts.filter(p => p.active)),
    });

    const mockResponse: VideoResponse = {
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
      nextPageToken: undefined
    };

    try {
      const response = await fetch(`/api/videos?${params}`);
      if (!response.ok) return mockResponse;
      const data = await response.json();
      return data as VideoResponse;
    } catch (error) {
      console.error('Error fetching videos:', error);
      return mockResponse;
    }
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
    return null;
  }

  const allVideos = data?.pages.flatMap((page) => page.videos) ?? [];

  return (
    <div id="feed" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12">
      {allVideos.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No videos found matching your criteria</p>
          <p className="text-sm text-gray-400">Try adjusting your search terms or preferences</p>
        </div>
      )}
      <div className="max-w-3xl mx-auto mb-6 sm:mb-12">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
            <span>Active Filters</span>
          </div>
          {preferences.outOfEchoChamber && (
            <span className="text-sm text-indigo-600">
              Echo Chamber Protection: Active
            </span>
          )}
        </div>
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Type 'sad', 'happy', 'motivated' or any topic..."
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
            className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-[1.02] transition-all duration-300 opacity-0 animate-fadeIn"
          >
            <div className="relative group">
              <div className="relative w-full h-40 sm:h-48">
                <Image
                  src={video.snippet.thumbnails.high.url}
                  alt={video.snippet.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300" />
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
            </div>
          </div>
        ))}
      </InfiniteScroll>
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
