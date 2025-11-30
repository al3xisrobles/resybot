import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, get, set } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBsxxRvxe_UB9VGgibgGMzWpunpo0Ji5Hc",
  authDomain: "resybot-bd2db.firebaseapp.com",
  projectId: "resybot-bd2db",
  storageBucket: "resybot-bd2db.firebasestorage.app",
  messagingSenderId: "782094781658",
  appId: "1:782094781658:web:a5935d09518547971ea9e3",
  measurementId: "G-JVN6BECKSE",
  databaseURL: "https://resybot-bd2db-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

console.log('[Firebase] Initialized with config:', {
  projectId: firebaseConfig.projectId,
  databaseURL: firebaseConfig.databaseURL
});
console.log('[Firebase] Database instance:', database);

export interface VenueCacheData {
  aiInsights?: string;
  googleMapsLink?: string;
  resyLink?: string;
  beliLink?: string;
  photoUrl?: string;
  lastUpdated: number;
}

/**
 * Check if venue data exists in cache
 */
export async function hasVenueCache(venueId: string): Promise<boolean> {
  try {
    const venueRef = ref(database, `venues/${venueId}`);
    const snapshot = await get(venueRef);
    return snapshot.exists();
  } catch (error) {
    console.error('Error checking venue cache:', error);
    return false;
  }
}

/**
 * Get cached venue data
 */
export async function getVenueCache(venueId: string): Promise<VenueCacheData | null> {
  try {
    const path = `venues/${venueId}`;
    console.log('[Firebase] Getting cache for venue:', venueId);
    console.log('[Firebase] Database path:', path);
    console.log('[Firebase] Database URL:', database.app.options.databaseURL);

    const venueRef = ref(database, path);
    const snapshot = await get(venueRef);

    console.log('[Firebase] Snapshot exists:', snapshot.exists());
    if (snapshot.exists()) {
      const data = snapshot.val() as VenueCacheData;
      console.log('[Firebase] Cache hit! Data:', data);
      return data;
    }
    console.log('[Firebase] Cache miss - no data found');
    return null;
  } catch (error) {
    console.error('[Firebase] Error getting venue cache:', error);
    console.error('[Firebase] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      venueId,
      path: `venues/${venueId}`
    });
    return null;
  }
}

/**
 * Save venue data to cache
 */
export async function saveVenueCache(venueId: string, data: Partial<VenueCacheData>): Promise<boolean> {
  try {
    const path = `venues/${venueId}`;
    console.log('[Firebase] Saving cache for venue:', venueId);
    console.log('[Firebase] Database path:', path);
    console.log('[Firebase] Data to save:', data);

    const venueRef = ref(database, path);

    // Get existing data to merge with new data
    const snapshot = await get(venueRef);
    const existingData = snapshot.exists() ? snapshot.val() : {};

    // Merge and save
    const updatedData = {
      ...existingData,
      ...data,
      lastUpdated: Date.now()
    };

    console.log('[Firebase] Merged data:', updatedData);
    await set(venueRef, updatedData);
    console.log('[Firebase] Successfully saved cache');
    return true;
  } catch (error) {
    console.error('[Firebase] Error saving venue cache:', error);
    console.error('[Firebase] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      venueId,
      path: `venues/${venueId}`,
      data
    });
    return false;
  }
}

/**
 * Update only AI insights for a venue
 */
export async function saveAiInsights(venueId: string, aiInsights: string): Promise<boolean> {
  return saveVenueCache(venueId, { aiInsights });
}

export { database, analytics };
