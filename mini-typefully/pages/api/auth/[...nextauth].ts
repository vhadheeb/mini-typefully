import NextAuth from 'next-auth';
import TwitterProvider from 'next-auth/providers/twitter';

export const authOptions = {
  providers: [
    TwitterProvider({
      clientId: process.env.TW_CLIENT_ID!,
      clientSecret: process.env.TW_CLIENT_SECRET!,
      version: '2.0' // OAuth 2.0
    })
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, account, profile }: any) {
      if (account) {
        token.access_token = account.access_token;
        token.refresh_token = account.refresh_token;
        token.providerAccountId = account.providerAccountId;
        token.username = profile?.username || token.username;
      }
      return token;
    },
    async session({ session, token }: any) {
      (session as any).access_token = token.access_token;
      (session as any).providerAccountId = token.providerAccountId;
      (session as any).username = token.username;
      return session;
    }
  }
};

export default NextAuth(authOptions as any);
