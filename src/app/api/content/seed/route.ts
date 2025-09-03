import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { Content } from '@/models/Content'

// POST /api/content/seed - Add sample content (superadmin only)
export async function POST(_request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized. Superadmin access required.' }, { status: 401 })
    }

    await connectDB()

    // Check if content already exists
    const existingContent = await Content.countDocuments()
    if (existingContent > 0) {
      return NextResponse.json({ error: 'Content already exists. Use this endpoint only for initial seeding.' }, { status: 409 })
    }

    const sampleContent = [
      {
        unit: 'Number Theory',
        chapter: 'Divisibility',
        topic: 'GCD and LCM',
        concept: 'Euclidean Algorithm',
        contentType: 'video',
        instructionType: 'conceptDiscussion',
        duration: 25,
        videoLink: 'https://www.youtube.com/watch?v=JUzYl1TYMcU',
        description: 'Learn the Euclidean algorithm for finding the greatest common divisor of two numbers. This fundamental algorithm is essential for solving many number theory problems.',
        sequenceNo: 1,
        docCategory: 'Learning',
        createdBy: session.user.id,
        isActive: true
      },
      {
        unit: 'Algebra',
        chapter: 'Polynomials',
        topic: 'Factorization',
        concept: 'Quadratic Factoring Techniques',
        contentType: 'video',
        instructionType: 'problemDiscussion',
        level: 'Intermediate',
        duration: 30,
        videoLink: 'https://www.youtube.com/watch?v=rUUqnZVdnMI',
        description: 'Master various techniques for factoring quadratic expressions including grouping, completing the square, and using the quadratic formula.',
        sequenceNo: 2,
        docCategory: 'Learning',
        createdBy: session.user.id,
        isActive: true
      },
      {
        unit: 'Geometry',
        chapter: 'Triangles',
        topic: 'Triangle Inequality',
        concept: 'Triangle Inequality Theorem',
        contentType: 'video',
        instructionType: 'conceptDiscussion',
        level: 'Beginner',
        duration: 20,
        videoLink: 'https://www.youtube.com/watch?v=ty-zGtgtlSY',
        description: 'Understand the triangle inequality theorem and its applications in solving geometric problems and proving geometric relationships.',
        sequenceNo: 3,
        docCategory: 'Learning',
        createdBy: session.user.id,
        isActive: true
      },
      {
        unit: 'Combinatorics',
        chapter: 'Counting Principles',
        topic: 'Permutations and Combinations',
        concept: 'Basic Counting Problems',
        contentType: 'video',
        instructionType: 'problemDiscussion',
        level: 'Intermediate',
        duration: 35,
        videoLink: 'https://www.youtube.com/watch?v=iyScoaVTYTg',
        description: 'Solve counting problems using permutations and combinations. Learn when to use each method and practice with real olympiad problems.',
        sequenceNo: 4,
        docCategory: 'Learning',
        createdBy: session.user.id,
        isActive: true
      },
      {
        unit: 'Functional Equations',
        chapter: 'Linear Functions',
        topic: 'Cauchy Functional Equation',
        concept: 'Additive Functions',
        contentType: 'video',
        instructionType: 'conceptDiscussion',
        level: 'Advanced',
        duration: 40,
        videoLink: 'https://www.youtube.com/watch?v=_c7-J4E_K_Q',
        description: 'Introduction to functional equations starting with the Cauchy functional equation f(x+y) = f(x) + f(y) and its properties.',
        sequenceNo: 5,
        docCategory: 'Learning',
        createdBy: session.user.id,
        isActive: true
      },
      {
        unit: 'Inequalities',
        chapter: 'Classical Inequalities',
        topic: 'AM-GM Inequality',
        concept: 'Arithmetic-Geometric Mean Inequality',
        contentType: 'video',
        instructionType: 'problemDiscussion',
        level: 'Intermediate',
        duration: 28,
        videoLink: 'https://www.youtube.com/watch?v=8QQ6I2OfQW8',
        description: 'Learn the AM-GM inequality and its applications in solving optimization problems and proving other inequalities.',
        sequenceNo: 6,
        docCategory: 'Learning',
        createdBy: session.user.id,
        isActive: true
      },
      {
        unit: 'Number Theory',
        chapter: 'Divisibility',
        topic: 'Practice Problems',
        concept: 'Divisibility Rules Practice Set',
        contentType: 'testpaperLink',
        instructionType: 'problemDiscussion',
        level: 'Beginner',
        duration: 90,
        videoLink: 'https://example.com/divisibility-practice.pdf',
        description: 'Comprehensive practice set covering divisibility rules, prime factorization, and GCD/LCM problems.',
        sequenceNo: 7,
        docCategory: 'PracticeSet',
        noOfProblems: 25,
        createdBy: session.user.id,
        isActive: true
      },
      {
        unit: 'Algebra',
        chapter: 'Polynomials',
        topic: 'Assessment',
        concept: 'Polynomial Operations Mock Test',
        contentType: 'testpaperLink',
        instructionType: 'problemDiscussion',
        level: 'Intermediate',
        duration: 120,
        videoLink: 'https://example.com/polynomial-mock-test.pdf',
        description: 'Timed mock test covering polynomial operations, factorization, and applications.',
        sequenceNo: 8,
        docCategory: 'MockTest',
        noOfProblems: 15,
        createdBy: session.user.id,
        isActive: true
      }
    ]

    // Insert sample content
    const createdContent = await Content.insertMany(sampleContent)

    return NextResponse.json({
      message: 'Sample content created successfully',
      count: createdContent.length,
      content: createdContent
    }, { status: 201 })

  } catch (error) {
    console.error('Error seeding content:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
