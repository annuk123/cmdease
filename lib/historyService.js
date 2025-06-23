import convex from './convexClient.js';
import { loadLocalHistory, saveLocalHistory } from './localCache.js';
import path from 'path';
import { pathToFileURL } from 'url';
import fs from 'fs';

class HistoryService {
  async loadApi() {
    const apiPath = path.resolve(process.cwd(), 'convex/_generated/api.js');

    if (!fs.existsSync(apiPath)) {
      return null; // 👉 No API file, handle this gracefully.
    }

    try {
      const module = await import(pathToFileURL(apiPath).href);
      return module.api;
    } catch (err) {
      console.error('❌ Failed to load Convex API module:', err.message);
      return null;
    }
  }

  async add(cmd) {
    const api = await this.loadApi();
    if (!api) {
      console.log('⚠️ Convex API not found. Falling back to local cache.');
      return this.addToLocalCache(cmd);
    }

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
    const api = await this.loadApi();
    if (!api) {
      console.log('⚠️ Convex API not found. Loading from local cache.');
      return loadLocalHistory();
    }

    try {
      return await convex.query(api.history.getAllHistory, {});
    } catch (error) {
      console.log('⚠️ Convex unreachable. Loading from local cache.');
      return loadLocalHistory();
    }
  }

  async isInHistory(cmd) {
    const api = await this.loadApi();
    if (!api) {
      console.log('⚠️ Convex API not found. Checking local cache.');
      const localData = loadLocalHistory();
      return localData.some(item => item.cmdName === cmd.cmdName && item.category === cmd.category);
    }

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
    const api = await this.loadApi();
    if (!api) {
      console.log('⚠️ Convex API not found. Skipping sync.');
      return;
    }

    const localData = loadLocalHistory();
    if (localData.length === 0) return;

    console.log(`🔄 Syncing ${localData.length} local history item(s) to Convex...`);

    const unsynced = [];

    for (const cmd of localData) {
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
