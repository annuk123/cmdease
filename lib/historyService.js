import convex from './convexClient.js';
import { loadApi } from './loadApi.js'; //  Dynamic loader
import { loadLocalHistory, saveLocalHistory } from './localCache.js';

class HistoryService {
  async add(cmd) {
    try {
      const { api } = await loadApi(); 

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
      const { api } = await loadApi(); // 🔥 Load dynamically

      return await convex.query(api.history.getAllHistory, {});
    } catch (error) {
      console.log('⚠️ Convex unreachable. Loading history from local cache.');
      return loadLocalHistory();
    }
  }

  async isInHistory(cmd) {
    try {
      const { api } = await loadApi(); // 🔥 Load dynamically

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

    console.log(`🔄 Syncing ${localData.length} local history item(s) to Convex...`);

    const unsynced = [];

    for (const cmd of localData) {
      try {
        const { api } = await loadApi(); // 🔥 Load dynamically inside loop

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
        console.error('❌ Failed to sync command:', cmd, error);
        unsynced.push(cmd);
      }
    }

    saveLocalHistory(unsynced);

    if (unsynced.length === 0) {
      console.log('✅ Local history synced successfully!');
    } else {
      console.log(`⚠️ Some history items failed to sync. ${unsynced.length} item(s) will retry later.`);
    }
  }
}

const historyService = new HistoryService();

export default historyService;

// Public API
export const addToHistory = async (cmd) => {
  await historyService.add(cmd);
};

export const getHistory = async () => {
  return await historyService.getAll();
};

export const syncLocalHistory = async () => {
  await historyService.syncLocal();
};
