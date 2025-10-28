import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Simple in-memory user store for now (will migrate to DB later)
const users = [
  {
    id: '1',
    name: 'Admin',
    email: 'admin@tailoredcare.com',
    // Password: "psw2025" hashed with bcrypt
    password: '$2a$10$YourHashedPasswordHere', // Will be replaced at runtime
  },
];

// Initialize default admin password if needed
async function initializeUsers() {
  if (users[0].password === '$2a$10$YourHashedPasswordHere') {
    users[0].password = await bcrypt.hash('psw2025', 10);
  }
}

initializeUsers();

async function getUser(email: string): Promise<(typeof users)[0] | undefined> {
  return users.find((user) => user.email === email);
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);

          if (!user) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
            };
          }
        }

        console.log('Invalid credentials');
        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
