import fs from 'fs';
import path from 'path';
import { getConvexPath } from './globalConfig.js';

export function checkConvexProject() {
  const convexPath = getConvexPath();

  if (!convexPath || !fs.existsSync(convexPath)) {
    console.warn('⚠️ Convex project not detected at the linked path. Please re-link.');
    return false;
  }

  const apiPath = path.join(convexPath, '_generated', 'api.js');

  if (!fs.existsSync(apiPath)) {
    console.warn('⚠️ Convex project not detected at the linked path. Required file "_generated/api.js" is missing.');
    return false;
  }

  return true;
}
