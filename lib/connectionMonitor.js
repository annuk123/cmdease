import dns from 'dns';
import { syncLocalHistory } from './historyService.js';
import { syncLocalFavorites } from './favoritesService.js';

let wasOffline = false;

export function startConnectionMonitor() {
  setInterval(() => {
    dns.lookup('google.com', async (err) => {
      if (err && err.code === 'ENOTFOUND') {
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
  }, 5000); // Check every 5 seconds
}
