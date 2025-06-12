import convex from './convexClient.js';
import { api } from '../convex/_generated/api.js';
import {
  loadLocalHistory,
  saveLocalHistory,
} from './localCache.js';

class HistoryService {
  async add(cmd) {
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
  }

  async getAll() {
    return await convex.query(api.history.getAllHistory, {});
  }

  async isInHistory(cmd) {
    const existing = await convex.query(api.history.getByName, {
      cmdName: cmd.cmdName,
      category: cmd.category,
    });
    return existing.length > 0;
  }
}

const historyService = new HistoryService();

export default historyService;

export const addToHistory = async (cmd) => {
  try {
    await historyService.add(cmd);
  } catch (error) {
    console.log('Offline - Saving to local cache');
    const localData = loadLocalHistory();

    const exists = localData.some(item => item.cmdName === cmd.cmdName && item.category === cmd.category);
    if (!exists) {
      localData.push(cmd);
      saveLocalHistory(localData);
    }
  }
};


// export const getHistory = () => historyService.getAll();
export const getHistory = async () => {
  try {
    return await historyService.getAll();
  } catch (error) {
    console.log('Offline - Loading history from local cache');
    return loadLocalHistory();
  }
};

// Sync local history when back online
export const syncLocalHistory = async () => {
  try {
    const localData = loadLocalHistory();

    if (localData.length === 0) return;

    console.log('Syncing local history to Convex...');

    // Convex batch sync API (optional if you create one)
    for (const cmd of localData) {
      await historyService.add(cmd);
    }

    saveLocalHistory([]);
    console.log('Local history synced successfully!');
  } catch (err) {
    console.error('Error syncing local history:', err);
  }
};
