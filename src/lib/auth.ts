import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import connectDB from "@/lib/mongodb"
import { User, IUser } from "@/models/User"

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  trustHost: true, // Fix CSRF issues in development
  useSecureCookies: process.env.NODE_ENV === "production",
  debug: process.env.NODE_ENV === "development",
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          await connectDB()
          
          const user = await User.findOne({ email: credentials.email }) as IUser | null
          
          if (!user) {
            return null
          }

          // Check if user is approved
          if (user.status !== 'approved') {
            return null
          }

          // Access password directly from the user document
          const passwordHash = user.password
          if (!passwordHash || typeof passwordHash !== 'string') {
            return null
          }

          const isPasswordValid = await bcrypt.compare(String(credentials.password), String(passwordHash))
          
          if (!isPasswordValid) {
            return null
          }

          return {
            id: (user._id as { toString(): string }).toString(),
            email: user.email as string,
            name: user.name as string,
            role: user.role as string,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    }
  }
})
