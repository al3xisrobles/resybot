/**
 * API Response Types
 * These interfaces represent the exact structure returned by the Cloud Functions API
 */

import type {
  SearchResult,
  SearchPagination,
  VenuePhotoData,
  CalendarData,
  GeminiSearchResponse,
  TrendingRestaurant,
  VenueLinks,
  VenueBasicData,
} from "./app-types";

/**
 * Generic API response wrapper
 * Used by most endpoints that return a single data object
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Search API response structure
 * Used by /search and /search_map endpoints
 * Unlike other endpoints, this has both data and pagination at the top level
 */
export interface SearchApiResponse {
  success: boolean;
  data: SearchResult[];
  pagination: SearchPagination;
  error?: string;
}

/**
 * Venue links API response structure
 * Used by /venue_links endpoint
 */
export interface VenueLinksApiResponse {
  success: boolean;
  links: VenueLinks;
  venueData: VenueBasicData;
  error?: string;
}

// Re-export common response wrappers for convenience
export type VenuePhotoApiResponse = ApiResponse<VenuePhotoData>;
export type CalendarApiResponse = ApiResponse<CalendarData>;
export type GeminiSearchApiResponse = ApiResponse<GeminiSearchResponse>;
export type TrendingRestaurantsApiResponse = ApiResponse<TrendingRestaurant[]>;
