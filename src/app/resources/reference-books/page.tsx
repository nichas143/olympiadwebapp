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
          isbn: "978-0471789017"
        },
        {
          title: "Mathematical Olympiad Challenges",
          author: "Titu Andreescu & Razvan Gelca",
          publisher: "Birkhäuser",
          description: "Collection of problems with detailed solutions, perfect for beginners",
          topics: ["Algebra", "Geometry", "Number Theory", "Combinatorics"],
          difficulty: "Beginner",
          isbn: "978-0817641556"
        },
        {
          title: "Problem Solving Strategies",
          author: "Arthur Engel",
          publisher: "Springer",
          description: "Comprehensive guide to problem-solving techniques with extensive examples",
          topics: ["Problem Solving", "All Topics"],
          difficulty: "Beginner to Advanced",
          isbn: "978-0387982199"
        }
      ]
    },
    {
      category: "Intermediate Level",
      description: "Books for students with some experience in math competitions",
      books: [
        {
          title: "102 Combinatorial Problems",
          author: "Titu Andreescu & Zuming Feng",
          publisher: "Birkhäuser",
          description: "Focused on combinatorics with detailed solutions and explanations",
          topics: ["Combinatorics", "Counting", "Probability"],
          difficulty: "Intermediate",
          isbn: "978-0817643178"
        },
        {
          title: "103 Trigonometry Problems",
          author: "Titu Andreescu & Zuming Feng",
          publisher: "Birkhäuser",
          description: "Comprehensive coverage of trigonometry for math competitions",
          topics: ["Trigonometry", "Geometry", "Algebra"],
          difficulty: "Intermediate",
          isbn: "978-0817643345"
        },
        {
          title: "104 Number Theory Problems",
          author: "Titu Andreescu & Dorin Andrica",
          publisher: "Birkhäuser",
          description: "Extensive collection of number theory problems with solutions",
          topics: ["Number Theory", "Divisibility", "Primes", "Congruences"],
          difficulty: "Intermediate",
          isbn: "978-0817645271"
        }
      ]
    },
    {
      category: "Advanced Level",
      description: "Books for experienced students preparing for high-level competitions",
      books: [
        {
          title: "Problems in Mathematical Analysis",
          author: "W. J. Kaczor & M. T. Nowak",
          publisher: "AMS",
          description: "Three-volume series covering real analysis problems",
          topics: ["Real Analysis", "Calculus", "Limits", "Series"],
          difficulty: "Advanced",
          isbn: "978-0821820503"
        },
        {
          title: "A Path to Combinatorics for Undergraduates",
          author: "Titu Andreescu & Zuming Feng",
          publisher: "Birkhäuser",
          description: "Advanced combinatorics with emphasis on problem-solving techniques",
          topics: ["Combinatorics", "Graph Theory", "Generating Functions"],
          difficulty: "Advanced",
          isbn: "978-0817642881"
        },
        {
          title: "Complex Numbers from A to Z",
          author: "Titu Andreescu & Dorin Andrica",
          publisher: "Birkhäuser",
          description: "Comprehensive treatment of complex numbers with applications",
          topics: ["Complex Numbers", "Geometry", "Algebra"],
          difficulty: "Advanced",
          isbn: "978-0817643260"
        }
      ]
    },
    {
      category: "Specialized Topics",
      description: "Books focusing on specific areas of mathematics",
      books: [
        {
          title: "Geometric Transformations",
          author: "I. M. Yaglom",
          publisher: "MAA",
          description: "Classic text on geometric transformations and their applications",
          topics: ["Geometry", "Transformations", "Symmetry"],
          difficulty: "Intermediate to Advanced",
          isbn: "978-0883856086"
        },
        {
          title: "Functional Equations in Mathematical Olympiads",
          author: "Amir Hossein Parvardi",
          publisher: "Self-published",
          description: "Comprehensive guide to functional equations with examples",
          topics: ["Functional Equations", "Algebra"],
          difficulty: "Intermediate to Advanced",
          isbn: "N/A"
        },
        {
          title: "Inequalities: A Mathematical Olympiad Approach",
          author: "Radmila Bulajich Manfrino & Juan Carlos Ortiz",
          publisher: "Birkhäuser",
          description: "Systematic approach to inequalities with applications",
          topics: ["Inequalities", "Algebra", "Analysis"],
          difficulty: "Intermediate to Advanced",
          isbn: "978-3034600491"
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
                  <div key={bookIndex} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
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
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
