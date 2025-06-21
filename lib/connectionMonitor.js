import https from 'https';
import { syncLocalHistory } from './historyService.js';
import { syncLocalFavorites } from './favoritesService.js';

let wasOffline = false;

export function startConnectionMonitor() {
  setInterval(() => {
    checkConnection(async (online) => {
      if (!online) {
        if (!wasOffline) console.log('🔌 Offline detected.');
        wasOffline = true;
      } else {
        if (wasOffline) {
          console.log('🔗 Back online! Starting sync...');
          try {
            await syncLocalHistory();
            await syncLocalFavorites();
            console.log('✅ Auto-sync complete!');
          } catch (error) {
            console.log('❌ Auto-sync failed:', error.message);
          }
        }
        wasOffline = false;
      }
    });
  }, 5000);
}

function checkConnection(callback) {
  const req = https.get('https://www.google.com', (res) => {
    callback(true);
  });

  req.on('error', () => {
    callback(false);
  });

  req.setTimeout(3000, () => {
    req.destroy();
    callback(false);
  });
}
