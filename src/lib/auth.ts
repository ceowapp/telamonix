import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import { authConfig } from "@/config/auth.config";

export const authOptions: NextAuthOptions = {
   ...authConfig,
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login", 
  },
  session: {
    strategy: "jwt", 
  },
  debug: false,
  callbacks: {
    async jwt({ token, account }) {
      if (account?.id_token) {
        try {
          const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: account.id_token }),
          });
          if (!response.ok) {
            throw new Error('Failed to verify token');
          }
          const data = await response.json();
          token.accessToken = account.access_token;
          token.customToken = data.authToken;
        } catch (error) {
          console.error("Token verification failed:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session && token.customToken) {
        session.customToken = token.customToken as string;
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
};

export const { handlers: { GET, POST }, signIn, signOut, auth } = NextAuth(authOptions);

