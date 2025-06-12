import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  favorites: defineTable(
    v.object({
      cmdName: v.string(),
      category: v.string(),
      user: v.string(),
    })
  ),
  history: defineTable(
    v.object({
      cmdName: v.string(),
      category: v.string(),
      timestamp: v.number(),
      user: v.string(),
    })
  ),
  commands: defineTable(
    v.object({
      cmdName: v.string(),
      category: v.string(),
      type: v.string(),
      user: v.string(),
    })
  ),
});
