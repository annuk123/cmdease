import https from 'https';
import { syncLocalHistory } from './historyService.js';
import { syncLocalFavorites } from './favoritesService.js';

let wasOffline = false;
let isSyncing = false;

export function startConnectionMonitor() {
  setInterval(() => {
    checkConnection(async (online) => {
      if (!online) {
        if (!wasOffline) console.log('🔌 Offline detected.');
        wasOffline = true;
      } else {
        if (wasOffline && !isSyncing) { // Prevent overlapping syncs
          console.log('🔗 Back online! Starting sync...');
          isSyncing = true;
          try {
            await syncLocalHistory();
            await syncLocalFavorites();
            console.log('✅ Auto-sync complete!');
          } catch (error) {
            console.log('❌ Auto-sync failed:', error.message);
          } finally {
            isSyncing = false;
          }
        }
        wasOffline = false;
      }
    });
  }, 5000); // Check every 5 seconds
}

function checkConnection(callback) {
  let called = false;

  const req = https.get('https://www.google.com', (res) => {
    if (!called) {
      called = true;
      callback(true);
    }
    req.destroy(); // Clean up the request immediately after response
  });

  req.on('error', () => {
    if (!called) {
      called = true;
      callback(false);
    }
  });

  req.setTimeout(3000, () => {
    if (!called) {
      called = true;
      req.destroy();
      callback(false);
    }
  });
}

