import path from 'path';
import { pathToFileURL } from 'url';
import fs from 'fs';

// This flag ensures the warning is shown only once per CLI session
let hasShownWarning = false;

export async function loadApi() {
  const apiPath = path.resolve(process.cwd(), 'convex/_generated/api.js');

  if (!fs.existsSync(apiPath)) {
    if (!hasShownWarning) {
      console.warn('⚠️ Convex project not detected. Running in offline/local mode.');
      hasShownWarning = true;
    }
    return null;
  }

  try {
    const { api } = await import(pathToFileURL(apiPath).href);
    return { api }; // ✅ Always return an object for consistency
  } catch (error) {
    console.error('❌ Failed to load Convex API:', error.message);
    return null;
  }
}
