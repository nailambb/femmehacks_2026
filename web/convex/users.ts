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

// makes sure multiple user's of same email don't get created 
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const normalized = email.trim().toLowerCase();

    return await ctx.db
      .query("users")
      .withIndex("email", q => q.eq("email", normalized))
      .first();
  },
});


export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveProfileImage = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Get the public URL for the stored file
    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) throw new Error("Failed to get image URL");

    const db = ctx.db as any;
    await db.patch(userId, { image: url });
    return url;
  },
});