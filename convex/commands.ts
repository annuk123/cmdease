// convex/commands.ts
import { v } from 'convex/values';
export const getByType = query({
  args: { type: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query('commands').filter((q: { eq: (arg0: any, arg1: any) => any; field: (arg0: string) => any; }) => q.eq(q.field('type'), args.type)).collect();
  },
});

export const deleteCommand = mutation({
  args: { id: v.id('commands') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
function query(arg0: { args: { type: any; }; handler: (ctx: any, args: any) => Promise<any>; }) {
  throw new Error("Function not implemented.");
}

function mutation(arg0: { args: { id: any; }; handler: (ctx: any, args: any) => Promise<void>; }) {
  throw new Error("Function not implemented.");
}

