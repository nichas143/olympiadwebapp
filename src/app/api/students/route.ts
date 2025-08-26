import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Student from '@/models/Student';

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

    // Check if email already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return NextResponse.json(
        { error: 'A student with this email already exists' },
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

    return NextResponse.json(
      { 
        message: 'Registration successful! We will contact you soon.',
        studentId: student._id 
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Registration error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
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

