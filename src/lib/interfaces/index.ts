/**
 * Centralized interface exports
 *
 * This file re-exports all interfaces from the two categories:
 * - api-responses.ts: Types returned directly from Cloud Functions API
 * - app-types.ts: Domain models used throughout the application
 */

// Application domain types
export type {
  VenueData,
  SearchResult,
  ReservationRequest,
  GroundingChunk,
  KeyFact,
  GroundingSupport,
  GeminiSearchResponse,
  SearchFilters,
  MapSearchFilters,
  SearchPagination,
  SearchResponse,
  CalendarAvailability,
  CalendarData,
  VenueLinks,
  VenueBasicData,
  VenueLinksResponse,
  TrendingRestaurant,
  Reservation,
} from "./app-types";

// API response types (what the Cloud Functions return)
export type {
  ApiResponse,
  SearchApiResponse,
  VenueLinksApiResponse,
  CalendarApiResponse,
  GeminiSearchApiResponse,
  TrendingRestaurantsApiResponse,
} from "./api-responses";
