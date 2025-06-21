import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

// Lightweight ping for connection check
export const ping = query({
  handler: async () => {
    return 'pong';
  },
});

// Query commands by type
export const getByType = query({
  args: { type: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query('commands')
      .filter(q => q.eq(q.field('type'), args.type))
      .collect();
  },
});

// Delete a command by ID
export const deleteCommand = mutation({
  args: { id: v.id('commands') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true, deletedId: args.id }; // Return confirmation
  },
});
