import path from 'path';
import fs from 'fs';
import { pathToFileURL } from 'url';

export async function loadApi() {
  const apiPath = path.resolve(process.cwd(), 'convex/_generated/api.js');

  if (!fs.existsSync(apiPath)) {
    console.error('❌ convex/_generated/api.js not found. Are you running cmdease inside a Convex project?');
    process.exit(1);
  }

  return await import(pathToFileURL(apiPath).href);
}
