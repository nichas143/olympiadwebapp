import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import connectDB  from "@/lib/mongodb"
import { User } from "@/models/User"
import { sendOnlineContentAdminNotification, sendOnlineContentConfirmationEmail } from "@/lib/email"


export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      )
    }

    await connectDB()

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create new user with pending status
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "student",
      status: "pending",
    })

    // Send emails asynchronously (don't wait for them to complete)
    Promise.all([
      sendOnlineContentAdminNotification({ name, email }),
      sendOnlineContentConfirmationEmail({ name, email })
    ]).then(([adminEmailSent, confirmationEmailSent]) => {
      if (!adminEmailSent) {
        console.error('Failed to send online content admin notification email');
      }
      if (!confirmationEmailSent) {
        console.error('Failed to send online content confirmation email');
      }
    }).catch(error => {
      console.error('Email sending error:', error);
      // Don't fail the registration if emails fail
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user.toObject()

    return NextResponse.json(
      { 
        message: "Online content registration successful! Your account is pending approval. You will receive an email once your account is approved.",
        user: userWithoutPassword 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
