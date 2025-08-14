import NextAuth, { NextAuthOptions } from "next-auth";
import Twitter from "next-auth/providers/twitter";

export const authOptions: NextAuthOptions = {
  providers: [
    Twitter({
      // OAuth 2.0 credentials (not the API key/secret)
      clientId: process.env.TW_CLIENT_ID!,
      clientSecret: process.env.TW_CLIENT_SECRET!,
      version: "2.0",
      // Ask X for the exact permissions we need
      authorization: {
        url: "https://twitter.com/i/oauth2/authorize",
        params: {
          // read profile/tweets, WRITE tweets, and allow refresh tokens
          scope: "users.read tweet.read tweet.write offline.access"
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // keep the access/refresh tokens in the JWT so server routes & cron can post
    async jwt({ token, account, profile }) {
      if (account) {
        token.access_token = account.access_token;
        token.refresh_token = account.refresh_token;
        token.expires_at = account.expires_at; // seconds since epoch
      }
      // keep a simple username/id if available
      if (profile && typeof profile === "object") {
        // next-auth's twitter profile fields vary; we store what we can
        // @ts-ignore
        token.username = profile.username || profile.screen_name || token.username;
        // @ts-ignore
        token.twitterId = profile.id || profile.sub || token.twitterId;
      }
      return token;
    },
    async session({ session, token }) {
      // expose to client/server
      // @ts-ignore
      session.access_token = token.access_token;
      // @ts-ignore
      session.refresh_token = token.refresh_token;
      // @ts-ignore
      session.username = token.username;
      // @ts-ignore
      session.twitterId = token.twitterId;
      return session;
    },
  },
  // good practice
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
