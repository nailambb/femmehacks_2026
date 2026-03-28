import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(userId);
  },
});

export const updateUser = mutation({
  args: {
    skills: v.optional(v.array(v.string())),
    proficiencyLevel: v.optional(v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced")
    )),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;

    const db = ctx.db as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    await db.patch(userId, {
      ...(args.skills !== undefined && { skills: args.skills }),
      ...(args.proficiencyLevel !== undefined && { proficiencyLevel: args.proficiencyLevel }),
    });
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;
    const db = ctx.db as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    await db.patch(userId, {
      ...(args.name !== undefined && { name: args.name }),
      ...(args.email !== undefined && { email: args.email }),
      ...(args.image !== undefined && { image: args.image }),
    });
  },
});