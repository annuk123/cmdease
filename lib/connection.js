import convex from './convexClient.js';
import { loadApi } from './loadApi.js';

export async function isOnline() {
  try {
    const loadedApi = await loadApi();

    if (!loadedApi) {
      console.warn('⚠️ Convex project not detected. Running in offline/local mode.');
      return false;
    }

    const { api } = loadedApi;

    await convex.query(api.commands.ping);
    return true;
  } catch (error) {
    console.error('❌ Connection check failed:', error.message);
    return false;
  }
}
