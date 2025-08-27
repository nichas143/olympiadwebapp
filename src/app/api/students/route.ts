import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Student from '@/models/Student';
import { sendBatchProgramAdminNotification, sendBatchProgramConfirmationEmail, validateEmail, checkRateLimit } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      name,
      currentClass,
      schoolName,
      prerequisites,
      phoneNumber,
      email
    } = body;

    // Validate required fields
    if (!name || !currentClass || !schoolName || !phoneNumber || !email) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Email validation and spam protection
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { error: emailValidation.reason },
        { status: 400 }
      );
    }

    // Rate limiting check (by IP address)
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    if (!checkRateLimit(clientIP, 3, 60000)) { // 3 attempts per minute
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Rate limiting check (by email)
    if (!checkRateLimit(email, 2, 300000)) { // 2 attempts per 5 minutes per email
      return NextResponse.json(
        { error: 'Too many registration attempts with this email. Please try again later.' },
        { status: 429 }
      );
    }

    // Check if email already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return NextResponse.json(
        { error: 'A student with this email already exists' },
        { status: 400 }
      );
    }

    // Additional spam detection
    const suspiciousPatterns = [
      /^test/i, /^admin/i, /^info/i, /^contact/i, /^hello/i, /^hi/i,
      /^a$/i, /^b$/i, /^c$/i, /^user/i, /^demo/i, /^sample/i, /^example/i
    ];

    const isSuspiciousName = suspiciousPatterns.some(pattern => pattern.test(name));
    const isSuspiciousSchool = suspiciousPatterns.some(pattern => pattern.test(schoolName));

    if (isSuspiciousName || isSuspiciousSchool) {
      return NextResponse.json(
        { error: 'Invalid information provided. Please provide real details.' },
        { status: 400 }
      );
    }

    // Create new student
    const student = new Student({
      name,
      currentClass,
      schoolName,
      prerequisites,
      phoneNumber,
      email
    });

    await student.save();

    // Send emails asynchronously (don't wait for them to complete)
    Promise.all([
      sendBatchProgramAdminNotification({
        name,
        currentClass,
        schoolName,
        phoneNumber,
        email,
        prerequisites
      }),
      sendBatchProgramConfirmationEmail({
        name,
        currentClass,
        schoolName,
        phoneNumber,
        email,
        prerequisites
      })
    ]).then(([adminEmailSent, thankYouEmailSent]) => {
      if (!adminEmailSent) {
        console.error('Failed to send admin notification email');
      }
      if (!thankYouEmailSent) {
        console.error('Failed to send thank you email');
      }
    }).catch(error => {
      console.error('Email sending error:', error);
      // Don't fail the registration if emails fail
    });

    return NextResponse.json(
      { 
        message: 'Batch program application submitted successfully! We will review your application and contact you within 2-3 business days. Please check your email for confirmation.',
        studentId: student._id 
      },
      { status: 201 }
    );

  } catch (error: unknown) {
    console.error('Registration error:', error);
    
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ValidationError') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const validationErrors = Object.values((error as any).errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    
    const students = await Student.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

