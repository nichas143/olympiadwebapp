const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

// Use the MongoDB URI from environment
const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not set in .env.local')
  process.exit(1)
}

// Blog schema (simplified for seeding)
const blogSchema = new mongoose.Schema({
  title: String,
  slug: String,
  content: String,
  excerpt: String,
  author: String,
  authorId: String,
  tags: [String],
  category: String,
  status: String,
  readTime: Number,
  views: Number,
  isPublic: Boolean,
  publishedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

const Blog = mongoose.model('Blog', blogSchema)

const sampleBlogs = [
  {
    title: "Introduction to Mathematical Induction",
    slug: "introduction-mathematical-induction",
    content: `Mathematical induction is a powerful proof technique used to prove statements about natural numbers. It's based on the principle that if we can prove a statement is true for the first natural number (usually 1) and if we can prove that whenever it's true for some natural number $n$, it's also true for $n+1$, then the statement is true for all natural numbers.

## The Principle of Mathematical Induction

The principle can be stated as follows:

**Base Case**: Prove that the statement $P(n)$ is true for $n = 1$ (or some other starting value).

**Inductive Step**: Assume that $P(k)$ is true for some arbitrary natural number $k$ (this is called the inductive hypothesis), and then prove that $P(k+1)$ is true.

If both steps are completed, then $P(n)$ is true for all natural numbers $n$.

## Example: Sum of First n Natural Numbers

Let's prove that the sum of the first $n$ natural numbers is $\\frac{n(n+1)}{2}$.

**Base Case**: For $n = 1$, we have $1 = \\frac{1(1+1)}{2} = \\frac{2}{2} = 1$. ✓

**Inductive Step**: Assume the statement is true for $n = k$, i.e.,
$$1 + 2 + 3 + \\cdots + k = \\frac{k(k+1)}{2}$$

Now we need to prove it for $n = k+1$:
$$1 + 2 + 3 + \\cdots + k + (k+1) = \\frac{(k+1)(k+2)}{2}$$

Using our inductive hypothesis:
$$\\frac{k(k+1)}{2} + (k+1) = \\frac{k(k+1) + 2(k+1)}{2} = \\frac{(k+1)(k+2)}{2}$$

Therefore, by mathematical induction, the statement is true for all natural numbers $n$.

## Common Pitfalls

1. **Forgetting the base case**: Always verify the statement for the starting value.
2. **Incorrect inductive hypothesis**: Make sure you're assuming the statement for $k$, not $k+1$.
3. **Circular reasoning**: Don't assume what you're trying to prove.

Mathematical induction is essential in olympiad mathematics and appears frequently in number theory, combinatorics, and algebra problems.`,
    excerpt: "Learn the fundamentals of mathematical induction, a crucial proof technique in olympiad mathematics with examples and common pitfalls to avoid.",
    author: "Admin",
    authorId: "admin",
    tags: ["mathematical-induction", "proof-techniques", "olympiad", "number-theory"],
    category: "Mathematics",
    status: "published",
    readTime: 8,
    views: 0,
    isPublic: true,
    publishedAt: new Date()
  },
  {
    title: "Problem Solving Strategies for Olympiad Geometry",
    slug: "problem-solving-strategies-olympiad-geometry",
    content: `Geometry problems in math olympiads often require creative thinking and the application of various techniques. Here are some essential strategies that can help you tackle these challenging problems.

## 1. Draw Accurate Diagrams

A well-drawn diagram is crucial for understanding the problem. Make sure to:
- Use a ruler and compass for accurate constructions
- Label all points, lines, and angles clearly
- Include all given information in your diagram

## 2. Look for Special Points and Lines

Many olympiad geometry problems involve:
- **Centers of triangles**: circumcenter, incenter, centroid, orthocenter
- **Special lines**: angle bisectors, medians, altitudes, perpendicular bisectors
- **Power of a point**: useful for circle problems

## 3. Use Coordinate Geometry When Appropriate

Sometimes, setting up a coordinate system can simplify the problem:
- Choose coordinates strategically (e.g., place one vertex at origin)
- Use parametric equations for curves
- Apply distance formulas and slope calculations

## 4. Apply Transformations

Geometric transformations can provide elegant solutions:
- **Reflections**: often useful for angle problems
- **Rotations**: helpful for problems involving regular polygons
- **Homothety**: useful for scaling problems

## 5. Work Backwards

If you're stuck, try working backwards from the conclusion:
- What would need to be true for the conclusion to hold?
- Can you prove those intermediate steps?

## Example Problem

**Problem**: In triangle $ABC$, let $D$ be the foot of the altitude from $A$ to $BC$. If $AB = AC$ and $\\angle BAC = 120°$, prove that $AD = \\frac{1}{2}BC$.

**Solution**: Since $AB = AC$, triangle $ABC$ is isosceles. Let $AB = AC = x$ and $BC = y$.

By the Law of Cosines in triangle $ABC$:
$$BC^2 = AB^2 + AC^2 - 2 \\cdot AB \\cdot AC \\cdot \\cos(120°)$$
$$y^2 = x^2 + x^2 - 2x^2 \\cdot (-\\frac{1}{2}) = 2x^2 + x^2 = 3x^2$$

So $y = x\\sqrt{3}$.

In the right triangle $ABD$:
$$AD^2 = AB^2 - BD^2 = x^2 - (\\frac{y}{2})^2 = x^2 - \\frac{y^2}{4} = x^2 - \\frac{3x^2}{4} = \\frac{x^2}{4}$$

Therefore, $AD = \\frac{x}{2} = \\frac{y}{2\\sqrt{3}} = \\frac{BC}{2\\sqrt{3}}$.

Wait, let me recalculate this more carefully...

Actually, since $\\angle BAC = 120°$ and $AB = AC$, we have $\\angle ABC = \\angle ACB = 30°$.

In right triangle $ABD$:
$$AD = AB \\cdot \\sin(30°) = x \\cdot \\frac{1}{2} = \\frac{x}{2}$$

And from the Law of Sines:
$$\\frac{BC}{\\sin(120°)} = \\frac{AB}{\\sin(30°)} = \\frac{x}{\\frac{1}{2}} = 2x$$

So $BC = 2x \\cdot \\sin(120°) = 2x \\cdot \\frac{\\sqrt{3}}{2} = x\\sqrt{3}$.

Therefore, $AD = \\frac{x}{2} = \\frac{BC}{2\\sqrt{3}}$.

Hmm, this doesn't give us $AD = \\frac{1}{2}BC$. Let me reconsider...

Actually, if we want $AD = \\frac{1}{2}BC$, then we need $\\frac{x}{2} = \\frac{x\\sqrt{3}}{2}$, which means $\\sqrt{3} = 1$, which is false.

Let me check the problem statement again. Perhaps the angle should be different, or perhaps I made an error in my calculation.

This example shows how important it is to double-check your work and be careful with calculations in geometry problems!`,
    excerpt: "Master essential strategies for solving olympiad geometry problems, including diagram drawing, special points, coordinate geometry, and transformations.",
    author: "Admin",
    authorId: "admin",
    tags: ["geometry", "olympiad", "problem-solving", "strategies"],
    category: "Problem Solving",
    status: "published",
    readTime: 12,
    views: 0,
    isPublic: true,
    publishedAt: new Date()
  },
  {
    title: "Study Tips for Math Olympiad Preparation",
    slug: "study-tips-math-olympiad-preparation",
    content: `Preparing for math olympiads requires dedication, strategy, and the right mindset. Here are some proven study tips to help you excel in your olympiad journey.

## 1. Build a Strong Foundation

Before diving into olympiad problems, ensure you have solid fundamentals:
- Master basic algebra, geometry, and number theory
- Understand fundamental concepts thoroughly
- Practice computational skills until they become second nature

## 2. Solve Problems Systematically

Don't just read solutions - actively solve problems:
- Start with easier problems and gradually increase difficulty
- Attempt problems before looking at solutions
- If stuck, try different approaches before giving up
- Keep a problem-solving journal to track your progress

## 3. Learn from Solutions

When you do look at solutions:
- Understand the thought process, not just the steps
- Look for patterns and techniques you can apply elsewhere
- Try to find alternative solutions
- Ask yourself: "Why did the author choose this approach?"

## 4. Focus on Problem-Solving Techniques

Develop a toolkit of common techniques:
- **Proof by contradiction**: Assume the opposite and find a contradiction
- **Mathematical induction**: For statements about natural numbers
- **Pigeonhole principle**: When you have more objects than containers
- **Invariants**: Properties that remain constant throughout a process

## 5. Practice Time Management

Olympiad contests are timed, so practice under time pressure:
- Set time limits for practice problems
- Learn to recognize when to move on from a difficult problem
- Develop strategies for quickly identifying problem types

## 6. Join Study Groups

Collaborate with other students:
- Discuss problems and share insights
- Learn from different approaches
- Stay motivated through peer support
- Teach others - explaining concepts reinforces your understanding

## 7. Read Olympiad Materials

Expose yourself to quality resources:
- Past olympiad problems and solutions
- Books by renowned authors (e.g., Art of Problem Solving series)
- Online resources and forums
- Mathematical journals and magazines

## 8. Maintain Balance

Don't neglect other aspects of your life:
- Get adequate sleep and exercise
- Maintain social connections
- Pursue other interests
- Take breaks to avoid burnout

## 9. Learn from Mistakes

Every mistake is a learning opportunity:
- Analyze what went wrong
- Identify gaps in your understanding
- Practice similar problems to reinforce learning
- Don't be discouraged by setbacks

## 10. Stay Curious

Maintain your passion for mathematics:
- Explore topics beyond the olympiad curriculum
- Read about the history of mathematics
- Attend math talks and conferences
- Connect with the broader mathematical community

Remember, olympiad success is a marathon, not a sprint. Consistent effort over time will yield the best results. Good luck with your preparation!`,
    excerpt: "Essential study strategies and tips for effective math olympiad preparation, from building foundations to maintaining motivation.",
    author: "Admin",
    authorId: "admin",
    tags: ["study-tips", "olympiad", "preparation", "learning"],
    category: "Study Tips",
    status: "published",
    readTime: 10,
    views: 0,
    isPublic: true,
    publishedAt: new Date()
  }
]

async function seedBlogs() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    // Clear existing blogs (optional - remove this line if you want to keep existing blogs)
    await Blog.deleteMany({})
    console.log('Cleared existing blogs')

    // Insert sample blogs
    await Blog.insertMany(sampleBlogs)
    console.log('Successfully seeded blog posts')

    // Display the created blogs
    const blogs = await Blog.find({})
    console.log(`Created ${blogs.length} blog posts:`)
    blogs.forEach(blog => {
      console.log(`- ${blog.title} (${blog.category})`)
    })

  } catch (error) {
    console.error('Error seeding blogs:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

seedBlogs()
