import { create } from 'zustand';

interface SpotifyTrack {
  id: string;
  name: string;
  artists: string[];
  imageUrl: string;
  previewUrl: string | null;
  energy: number;
  valence: number;
}

interface SpotifyState {
  isConnected: boolean;
  recentTracks: SpotifyTrack[];
  currentMood: {
    energy: number;    // 0-1: how energetic the music is
    valence: number;   // 0-1: how positive the music is
  };
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshMood: () => Promise<void>;
}

// This would need to be configured in your Spotify Developer Dashboard
const SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = typeof window !== 'undefined' 
  ? `${window.location.origin}/api/spotify/callback`
  : '';

export const useSpotify = create<SpotifyState>((set) => ({
  isConnected: false,
  recentTracks: [],
  currentMood: {
    energy: 0.5,
    valence: 0.5
  },

  connect: async () => {
    const scope = 'user-read-recently-played user-read-currently-playing user-top-read';
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(scope)}`;
    window.location.href = authUrl;
  },

  disconnect: () => {
    set({ isConnected: false, recentTracks: [] });
    // Clear token from localStorage or wherever you store it
    localStorage.removeItem('spotify_token');
  },

  refreshMood: async () => {
    try {
      const response = await fetch('/api/spotify/mood');
      const data = await response.json();
      
      if (data.success) {
        set({ 
          currentMood: {
            energy: data.energy,
            valence: data.valence
          },
          recentTracks: data.tracks
        });
      }
    } catch (error) {
      console.error('Failed to refresh mood:', error);
    }
  }
}));
