// lib/historyService.js (Complete with syncLocalHistory)

import convex from './convexClient.js';
import { api } from '../convex/_generated/api.js';
import fs from 'fs/promises';

const LOCAL_HISTORY_PATH = './localHistory.json';

class HistoryService {
  async add(cmd) {
    const existing = await convex.query(api.commands.getByName, {
      cmdName: cmd.cmdName,
      category: cmd.category,
      type: 'history'
    });

    if (existing.length === 0) {
      await convex.mutation(api.commands.addCommand, {
        cmdName: cmd.cmdName,
        category: cmd.category,
        type: 'history'
      });
    }
  }

  async getAll() {
    return await convex.query(api.commands.getByType, { type: 'history' });
  }

  async isInHistory(cmd) {
    const existing = await convex.query(api.commands.getByName, {
      cmdName: cmd.cmdName,
      category: cmd.category,
      type: 'history'
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
    // Save locally if offline
    console.log('Offline - Saving to local cache');
    await saveLocalHistory(cmd);
  }
};

export const getHistory = () => historyService.getAll();

// Save history locally if offline
async function saveLocalHistory(cmd) {
  try {
    let localData = [];
    try {
      const file = await fs.readFile(LOCAL_HISTORY_PATH, 'utf-8');
      localData = JSON.parse(file);
    } catch (err) {
      // File may not exist, ignore
    }
    localData.push(cmd);
    await fs.writeFile(LOCAL_HISTORY_PATH, JSON.stringify(localData, null, 2));
  } catch (err) {
    console.error('Error saving to local history cache', err);
  }
}

// Sync local history when back online
export const syncLocalHistory = async () => {
  try {
    const file = await fs.readFile(LOCAL_HISTORY_PATH, 'utf-8');
    const localData = JSON.parse(file);

    if (localData.length === 0) return;

    console.log('Syncing local history to Convex...');
    for (const cmd of localData) {
      await historyService.add(cmd);
    }

    // Clear local cache after sync
    await fs.writeFile(LOCAL_HISTORY_PATH, JSON.stringify([], null, 2));
    console.log('Local history synced successfully!');
  } catch (err) {
    console.error('Error syncing local history:', err);
  }
};
