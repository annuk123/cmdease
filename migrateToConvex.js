#!/usr/bin/env node

const { ConvexHttpClient } = require('convex/browser');
const { api } = require('./convex/_generated/api.js');
const fs = require('fs');

// 👉 Replace this with your actual Convex URL
const convex = new ConvexHttpClient('https://neighborly-ox-873.convex.cloud');

// Load local JSON files
const history = fs.existsSync('./.cmdease-history.json') ? JSON.parse(fs.readFileSync('./.cmdease-history.json', 'utf8')) : [];
const favorites = fs.existsSync('./.cmdease-favorites.json') ? JSON.parse(fs.readFileSync('./.cmdease-favorites.json', 'utf8')) : [];

// Generic migration function
async function migrate(dataArray, mutationFunction, type) {
  for (const item of dataArray) {
    try {
      // Check for duplicate
      const existing = await convex.query(api.commands.getByName, { cmdName: item.cmdName, category: item.category, type });
      if (existing && existing.length > 0) {
        console.log(`⚠️ Skipped duplicate: ${item.category} → ${item.cmdName}`);
        continue;
      }

      // Insert into Convex
      await convex.mutation(mutationFunction, {
        cmdName: item.cmdName,
        category: item.category,
        type, // 'history' or 'favorite'
      });
      console.log(`✅ Migrated: ${item.category} → ${item.cmdName}`);
    } catch (err) {
      console.error(`❌ Error migrating ${item.cmdName}:`, err.message);
    }
  }
}

// Start migration
(async () => {
  console.log('🚀 Starting migration to Convex...');

  await migrate(history, api.commands.addCommand, 'history');
  await migrate(favorites, api.commands.addCommand, 'favorite');

  console.log('🎉 Migration completed!');
})();
