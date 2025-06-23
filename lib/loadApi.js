import path from 'path';
import { pathToFileURL } from 'url';
import fs from 'fs';
import { getConvexPath } from './globalConfig.js';

export async function loadApi() {
  const convexProjectPath = getConvexPath();
  if (!convexProjectPath) {
    console.warn('⚠️ No Convex project linked. Please run: cmdease link /path/to/project');
    return null;
  }

  const apiPath = path.resolve(convexProjectPath, 'convex/_generated/api.js');

  if (!fs.existsSync(apiPath)) {
    console.warn('⚠️ Convex project not detected at the linked path. Please re-link.');
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
