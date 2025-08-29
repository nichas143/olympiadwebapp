export default function ReferenceBooksPage() {
  const books = [
    {
      category: "Beginner Level",
      description: "Books suitable for students starting their math olympiad journey",
      books: [
        {
          title: "Art and Craft of Problem Solving",
          author: "Paul Zeitz",
          publisher: "Wiley",
          description: "Excellent introduction to mathematical problem solving with clear explanations and examples",
          topics: ["Problem Solving", "Number Theory", "Algebra", "Geometry"],
          difficulty: "Beginner to Intermediate",
          isbn: "978-0471789017",
          image: "/book-covers/art-and-craft-problem-solving.jpg"
        },
        {
          title: "Mathematical Circles: Russian Experience",
          author: "Dmitri Fomin, Sergey Genkin, and Ilia Itenberg",
          publisher: "American Mathematical Society",
          description: "A collection of mathematical problems and solutions from Russian mathematical circles, providing excellent training for mathematical competitions",
          topics: ["Problem Solving", "Algebra", "Geometry", "Number Theory", "Combinatorics"],
          difficulty: "Beginner to Intermediate",
          isbn: "978-0821804305",
          image: "/book-covers/mathematical-circles.jpg"
        },
        {
          title: "Challenges and Thrills of Pre-College Mathematics",
          author: "V. Krishnamurthy",
          publisher: "New Age International",
          description: "Comprehensive textbook covering fundamental mathematical concepts with challenging problems and detailed solutions",
          topics: ["Algebra", "Geometry", "Trigonometry", "Number Theory", "Combinatorics"],
          difficulty: "Beginner to Intermediate",
          isbn: "978-8122415540",
          image: "/book-covers/challenges-thrills-mathematics.jpeg"
        },
        {
          title: "Elementary Number Theory",
          author: "David Burton",
          publisher: "McGraw-Hill",
          description: "Classic textbook providing a solid foundation in number theory with clear explanations and numerous examples",
          topics: ["Number Theory", "Divisibility", "Primes", "Congruences", "Diophantine Equations"],
          difficulty: "Beginner to Intermediate",
          isbn: "978-0073383149",
          image: "/book-covers/elementary-number-theory.jpg"
        }
      ]
    },
    {
      category: "Intermediate Level",
      description: "Books for students with some experience in math competitions",
      books: [
        {
          title: "Problems in Plane Geometry",
          author: "I. F. Sharygin",
          publisher: "Mir Publishers",
          description: "Comprehensive collection of geometric problems with detailed solutions, covering various techniques in plane geometry",
          topics: ["Geometry", "Plane Geometry", "Geometric Constructions", "Geometric Inequalities"],
          difficulty: "Intermediate",
          isbn: "978-5030009434",
          image: "/book-covers/problems-plane-geometry.jpeg"
        },
        {
          title: "An Introduction to the Theory of Numbers",
          author: "Ivan Niven & Herbert S. Zuckerman",
          publisher: "Wiley",
          description: "Rigorous introduction to number theory with proofs and applications, suitable for advanced high school and undergraduate students",
          topics: ["Number Theory", "Divisibility", "Primes", "Congruences", "Quadratic Reciprocity"],
          difficulty: "Intermediate to Advanced",
          isbn: "978-0471625469",
          image: "/book-covers/introduction-theory-numbers.jpg"
        },
        {
          title: "Inequalities: An Approach Through Problems",
          author: "B. J. Venkatachala",
          publisher: "Hindustan Book Agency",
          description: "Systematic approach to inequalities through carefully selected problems with detailed solutions and techniques",
          topics: ["Inequalities", "Algebra", "Analysis", "Geometric Inequalities"],
          difficulty: "Intermediate",
          isbn: "978-8185931613",
          image: "/book-covers/inequalities-approach-problems.jpeg"
        }
      ]
    },
    {
      category: "Advanced Level",
      description: "Books for experienced students preparing for high-level competitions",
      books: [
        {
          title: "Problem Solving Strategies",
          author: "Arthur Engel",
          publisher: "Springer",
          description: "Comprehensive guide to problem-solving techniques with extensive examples and systematic approaches to mathematical problems",
          topics: ["Problem Solving", "All Topics", "Advanced Techniques", "Proof Methods"],
          difficulty: "Advanced",
          isbn: "978-0387982199",
          image: "/book-covers/problem-solving-strategies.png"
        },
        {
          title: "Polynomials",
          author: "Edward J. Barbeau",
          publisher: "Springer",
          description: "In-depth treatment of polynomials with applications to algebra, geometry, and number theory",
          topics: ["Polynomials", "Algebra", "Complex Numbers", "Roots and Coefficients"],
          difficulty: "Advanced",
          isbn: "978-0387406275",
          image: "/book-covers/polynomials.jpg"
        },
        {
          title: "College Geometry",
          author: "Nathan Altshiller-Court",
          publisher: "Dover Publications",
          description: "Comprehensive treatment of modern geometry including synthetic, analytic, and differential geometry",
          topics: ["Geometry", "Synthetic Geometry", "Analytic Geometry", "Geometric Transformations"],
          difficulty: "Advanced",
          isbn: "978-0486458052",
          image: "/book-covers/college-geometry.jpg"
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Reference Books
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Recommended textbooks and study materials for math olympiad preparation
          </p>
        </div>

        {/* Books by Category */}
        <div className="space-y-12">
          {books.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-lg shadow-md p-8">
              <div className="mb-6">
                <h2 className="text-3xl font-semibold text-gray-900 mb-2">
                  {category.category}
                </h2>
                <p className="text-gray-600 text-lg">
                  {category.description}
                </p>
              </div>
              
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {category.books.map((book, bookIndex) => (
                  <div key={bookIndex} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200 bg-white">
                    {/* Book Cover Image */}
                    <div 
                      className="h-48 bg-cover bg-center relative"
                      style={{
                        backgroundImage: `url(${book.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                    </div>
                    
                    <div className="p-6">
                      <div className="mb-4">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 leading-tight">
                          {book.title}
                        </h3>
                        <p className="text-gray-600 font-medium">
                          by {book.author}
                        </p>
                        <p className="text-sm text-gray-500">
                          {book.publisher}
                        </p>
                      </div>
                      
                      <p className="text-gray-700 mb-4 leading-relaxed">
                        {book.description}
                      </p>
                      
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-900">Topics:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {book.topics.map((topic, topicIndex) => (
                              <span 
                                key={topicIndex}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-sm font-medium text-gray-900">Difficulty:</span>
                          <span className="ml-2 text-sm text-gray-700">{book.difficulty}</span>
                        </div>
                        
                        {book.isbn !== "N/A" && (
                          <div>
                            <span className="text-sm font-medium text-gray-900">ISBN:</span>
                            <span className="ml-2 text-sm text-gray-700 font-mono">{book.isbn}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Study Tips */}
        <div className="mt-12 bg-green-50 rounded-lg p-8">
          <h3 className="text-2xl font-semibold text-green-900 mb-4">
            How to Use These Books Effectively
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-medium text-green-800 mb-3">Reading Strategy</h4>
              <ul className="text-green-700 space-y-2">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  Start with beginner books and progress gradually
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  Read actively - try to solve problems before looking at solutions
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  Take notes and create your own problem-solving strategies
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-medium text-green-800 mb-3">Practice Approach</h4>
              <ul className="text-green-700 space-y-2">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  Solve problems from multiple books on the same topic
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  Review solutions even for problems you solved correctly
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  Create a study schedule and stick to it consistently
                </li>
                <li className="flex items-start">These books are not exhaustive, but they are a good starting point.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
