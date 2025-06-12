import convex from './convexClient.js';
import { api } from '../convex/_generated/api.js';
import { loadLocalHistory, saveLocalHistory } from './localCache.js';

class HistoryService {
  async add(cmd) {
    try {
      const existing = await convex.query(api.history.getByName, {
        cmdName: cmd.cmdName,
        category: cmd.category,
      });

      if (existing.length === 0) {
        await convex.mutation(api.history.addHistory, {
          cmdName: cmd.cmdName,
          category: cmd.category,
          user: cmd.user || 'default',
        });
      }
    } catch (error) {
      console.log('⚠️ Convex unreachable. Falling back to local cache.');
      this.addToLocalCache(cmd);
    }
  }

  async getAll() {
    try {
      return await convex.query(api.history.getAllHistory, {});
    } catch (error) {
      console.log('⚠️ Convex unreachable. Loading history from local cache.');
      return loadLocalHistory();
    }
  }

  async isInHistory(cmd) {
    try {
      const existing = await convex.query(api.history.getByName, {
        cmdName: cmd.cmdName,
        category: cmd.category,
      });
      return existing.length > 0;
    } catch (error) {
      console.log('⚠️ Convex unreachable. Checking local cache.');
      const localData = loadLocalHistory();
      return localData.some(item => item.cmdName === cmd.cmdName && item.category === cmd.category);
    }
  }

  addToLocalCache(cmd) {
    const localData = loadLocalHistory();
    const exists = localData.some(item => item.cmdName === cmd.cmdName && item.category === cmd.category);
    if (!exists) {
      localData.push(cmd);
      saveLocalHistory(localData);
    }
  }

  async syncLocal() {
    const localData = loadLocalHistory();
    if (localData.length === 0) return;

    console.log('🔄 Syncing local history to Convex...');

    for (const cmd of localData) {
      try {
        await this.add(cmd);
      } catch (error) {
        console.error('❌ Failed to sync command:', cmd, error);
        return; // Stop sync on failure to avoid partial state
      }
    }

    saveLocalHistory([]);
    console.log('✅ Local history synced successfully!');
  }
}

const historyService = new HistoryService();

export default historyService;

// Add to history (auto fallback)
export const addToHistory = async (cmd) => {
  await historyService.add(cmd);
};

// Get history (auto fallback)
export const getHistory = async () => {
  return await historyService.getAll();
};

// Sync local history to Convex
export const syncLocalHistory = async () => {
  await historyService.syncLocal();
};
