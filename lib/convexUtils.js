import fs from 'fs';
import path from 'path';
import { getConvexPath, unlinkConvexPath } from './globalConfig.js';

export function checkConvexProject() {
  const convexPath = getConvexPath();

  // Check if path does not exist
  if (!convexPath || !fs.existsSync(convexPath)) {
    console.log('⚠️ Linked Convex project not found or may have been moved.');
    console.log('🔗 Previous link removed.\n');
    unlinkConvexPath();
    return false;
  }

  // Check if _generated/api.js is missing
  const apiPath = path.join(convexPath, '_generated', 'api.js');

  if (!fs.existsSync(apiPath)) {
    console.log('⚠️ Linked Convex project is incomplete (missing "_generated/api.js").');
    console.log('🔗 Previous link removed.\n');
    unlinkConvexPath();
    return false;
  }

  return true;
}
