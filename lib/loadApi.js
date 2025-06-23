// convexLoader.js
import path from 'path';
import { pathToFileURL } from 'url';
import fs from 'fs';

export async function loadConvexApi() {
  const apiPath = path.resolve(process.cwd(), 'convex/_generated/api.js');

  if (!fs.existsSync(apiPath)) {
    console.warn('⚠️ Convex project not detected. Running in offline/local mode.');
    return null;
  }

  try {
    const { api } = await import(pathToFileURL(apiPath).href);
    return api;
  } catch (error) {
    console.error('❌ Failed to load Convex API:', error.message);
    return null;
  }
}
