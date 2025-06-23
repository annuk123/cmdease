import fs from 'fs';
import path from 'path';
import { getConvexPath, unlinkConvexPath } from './globalConfig.js';

export function checkConvexProject() {
  const convexPath = getConvexPath();

  if (!convexPath || !fs.existsSync(convexPath)) {
    console.warn('⚠️ Convex project not detected at the linked path. It may have been moved or deleted.');
    console.log('\n⚡ Previous Convex link removed due to invalid path.\n');
    unlinkConvexPath();
    return false;
  }

  const apiPath = path.join(convexPath, '_generated', 'api.js');

  if (!fs.existsSync(apiPath)) {
    console.warn('⚠️ Convex project detected, but required file "_generated/api.js" is missing.');
    console.log('\n⚡ Previous Convex link removed due to incomplete project setup.\n');
    unlinkConvexPath();
    return false;
  }

  return true;
}
