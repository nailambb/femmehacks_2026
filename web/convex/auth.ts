// convex/auth.ts
import Google from "@auth/core/providers/google";
import Resend from "@auth/core/providers/resend";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [Google, Password, Resend],
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      if (args.existingUserId) {
        // update name/image if signing in via Google and they changed it
        await ctx.db.patch(args.existingUserId, {
          name: args.profile.name ?? undefined,
          image: args.profile.image ?? undefined,
        });
        return args.existingUserId;
      }
      // create new user
      return await ctx.db.insert("users", {
        name: args.profile.name ?? undefined,
        email: args.profile.email ?? undefined,
        image: args.profile.image ?? undefined,
        phone: undefined,
        emailVerificationTime: undefined,
        phoneVerificationTime: undefined,
        isAnonymous: false,
      });
    },
  },
});