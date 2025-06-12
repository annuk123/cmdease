import convex from './convexClient.js';
import { api } from '../convex/_generated/api.js';

export async function isOnline() {
  try {
    // Lightweight ping query to test connectivity
    await convex.query(api.commands.ping);
    return true;
  } catch {
    return false;
  }
}
