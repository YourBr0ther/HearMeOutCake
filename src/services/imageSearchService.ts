import { API_CONFIG } from '@/utils/constants';
import type { ImageSearchResult } from '@/types/game';

const PEXELS_API_URL = 'https://api.pexels.com/v1';

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  liked: boolean;
  alt: string;
}

interface PexelsSearchResponse {
  total_results: number;
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
  next_page?: string;
}

export const imageSearchService = {
  async search(query: string, page: number = 1, perPage: number = 20): Promise<ImageSearchResult[]> {
    if (!API_CONFIG.PEXELS_API_KEY) {
      console.warn('Pexels API key not configured');
      return [];
    }

    try {
      const response = await fetch(
        `${PEXELS_API_URL}/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`,
        {
          headers: {
            Authorization: API_CONFIG.PEXELS_API_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Pexels API error: ${response.status}`);
      }

      const data: PexelsSearchResponse = await response.json();

      return data.photos.map((photo) => ({
        id: photo.id.toString(),
        url: photo.src.large,
        thumbnailUrl: photo.src.medium,
        photographer: photo.photographer,
        alt: photo.alt,
      }));
    } catch (error) {
      console.error('Image search error:', error);
      return [];
    }
  },

  async getCurated(page: number = 1, perPage: number = 20): Promise<ImageSearchResult[]> {
    if (!API_CONFIG.PEXELS_API_KEY) {
      console.warn('Pexels API key not configured');
      return [];
    }

    try {
      const response = await fetch(
        `${PEXELS_API_URL}/curated?page=${page}&per_page=${perPage}`,
        {
          headers: {
            Authorization: API_CONFIG.PEXELS_API_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Pexels API error: ${response.status}`);
      }

      const data: PexelsSearchResponse = await response.json();

      return data.photos.map((photo) => ({
        id: photo.id.toString(),
        url: photo.src.large,
        thumbnailUrl: photo.src.medium,
        photographer: photo.photographer,
        alt: photo.alt,
      }));
    } catch (error) {
      console.error('Curated images error:', error);
      return [];
    }
  },
};
