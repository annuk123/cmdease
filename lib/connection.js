import convex from './convexClient.js';
import { api } from '../convex/_generated/api.js';

export async function isOnline() {
  try {
    await convex.query(api.commands.ping);
    return true;
  } catch (error) {
    console.error('❌ Connection check failed:', error.message);
    return false;
  }
}

