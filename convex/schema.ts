
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  favorites: defineTable(
    v.object({
      cmdName: v.string(),
      category: v.string(),
      user: v.string(), // For future multi-user support
    })
  ),
  history: defineTable(
    v.object({
      cmdName: v.string(),
      category: v.string(),
      timestamp: v.number(),
      user: v.string(), // For future multi-user support
    })
  ),
});
