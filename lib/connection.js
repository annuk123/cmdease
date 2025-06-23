import convex from './convexClient.js';
import { loadApi } from './loadApi.js';

export async function isOnline() {
  try {
    const { api } = await loadApi();

    await convex.query(api.commands.ping);
    return true;
  } catch (error) {
    console.error('❌ Connection check failed:', error.message);
    return false;
  }
}

