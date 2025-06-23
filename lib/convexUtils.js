import fs from 'fs';
import path from 'path';
import { getConvexPath } from './globalConfig.js';

export function checkConvexProject() {
  const convexPath = getConvexPath();
  if (!convexPath || !fs.existsSync(convexPath)) {
    console.warn('⚠️ Convex project not detected at the linked path. Please re-link.');
    return false;
  }
  return true;
}