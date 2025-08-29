import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      subscriptionStatus: string
      subscriptionPlan?: string
      subscriptionEndDate?: Date
    } & DefaultSession["user"]
  }

  interface User {
    role: string
    subscriptionStatus: string
    subscriptionPlan?: string
    subscriptionEndDate?: Date
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    subscriptionStatus: string
    subscriptionPlan?: string
    subscriptionEndDate?: Date
  }
}



