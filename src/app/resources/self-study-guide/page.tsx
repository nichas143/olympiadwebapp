export default function SelfStudyGuidePage() {
  const studyPaths = [
    {
      level: "Beginner (6-8 months)",
      description: "For students with basic math knowledge starting their olympiad journey",
      topics: [
        {
          name: "Number Theory Basics",
          duration: "2-3 months",
          content: [
            "Divisibility rules and properties",
            "Prime numbers and factorization",
            "GCD and LCM",
            "Modular arithmetic basics",
            "Diophantine equations (simple cases)"
          ],
          resources: [
            "Art and Craft of Problem Solving - Chapter 3",
            "AoPS Number Theory Course",
            "Practice problems from MathCounts"
          ]
        },
        {
          name: "Algebra Fundamentals",
          duration: "2-3 months",
          content: [
            "Polynomials and factoring",
            "Quadratic equations and functions",
            "Systems of equations",
            "Inequalities (basic)",
            "Sequences and series (arithmetic, geometric)"
          ],
          resources: [
            "Art and Craft of Problem Solving - Chapter 4",
            "Khan Academy Algebra courses",
            "AMC 8/10 problems"
          ]
        },
        {
          name: "Geometry Essentials",
          duration: "2-3 months",
          content: [
            "Triangle properties and theorems",
            "Circle geometry",
            "Area and perimeter",
            "Similarity and congruence",
            "Coordinate geometry basics"
          ],
          resources: [
            "Art and Craft of Problem Solving - Chapter 5",
            "Euclidean Geometry in Mathematical Olympiads",
            "GeoGebra for visualization"
          ]
        }
      ]
    },
    {
      level: "Intermediate (8-12 months)",
      description: "For students with some competition experience",
      topics: [
        {
          name: "Advanced Number Theory",
          duration: "3-4 months",
          content: [
            "Chinese Remainder Theorem",
            "Euler's theorem and Fermat's little theorem",
            "Quadratic residues",
            "Pell's equation",
            "Advanced Diophantine equations"
          ],
          resources: [
            "104 Number Theory Problems",
            "Number Theory Through Problem Solving",
            "IMO training problems"
          ]
        },
        {
          name: "Combinatorics",
          duration: "3-4 months",
          content: [
            "Counting principles",
            "Permutations and combinations",
            "Binomial coefficients",
            "Inclusion-exclusion principle",
            "Recurrence relations"
          ],
          resources: [
            "102 Combinatorial Problems",
            "A Path to Combinatorics for Undergraduates",
            "Art of Problem Solving Combinatorics course"
          ]
        },
        {
          name: "Advanced Algebra",
          duration: "3-4 months",
          content: [
            "Complex numbers",
            "Functional equations",
            "Polynomials (advanced)",
            "Inequalities (Cauchy-Schwarz, AM-GM)",
            "Trigonometry for competitions"
          ],
          resources: [
            "103 Trigonometry Problems",
            "Complex Numbers from A to Z",
            "Functional Equations in Mathematical Olympiads"
          ]
        }
      ]
    },
    {
      level: "Advanced (12+ months)",
      description: "For experienced students preparing for high-level competitions",
      topics: [
        {
          name: "Real Analysis",
          duration: "4-6 months",
          content: [
            "Limits and continuity",
            "Differentiation and integration",
            "Sequences and series",
            "Convergence tests",
            "Applications to inequalities"
          ],
          resources: [
            "Problems in Mathematical Analysis",
            "Calculus by Spivak",
            "Putnam competition problems"
          ]
        },
        {
          name: "Advanced Geometry",
          duration: "4-6 months",
          content: [
            "Inversion and projective geometry",
            "Complex geometry",
            "Geometric transformations",
            "Advanced triangle geometry",
            "Locus problems"
          ],
          resources: [
            "Geometric Transformations by Yaglom",
            "Complex Numbers and Geometry",
            "IMO geometry problems"
          ]
        },
        {
          name: "Problem-Solving Techniques",
          duration: "Ongoing",
          content: [
            "Induction and recursion",
            "Invariants and monovariants",
            "Extremal principle",
            "Pigeonhole principle",
            "Contradiction and construction"
          ],
          resources: [
            "Problem Solving Strategies by Engel",
            "Mathematical Olympiad Challenges",
            "Past IMO problems"
          ]
        }
      ]
    }
  ];

  const studyTips = [
    {
      category: "Daily Routine",
      tips: [
        "Study for 2-3 hours daily, preferably in the morning",
        "Solve at least 3-5 problems every day",
        "Review previous solutions weekly",
        "Keep a problem-solving journal"
      ]
    },
    {
      category: "Problem Solving Strategy",
      tips: [
        "Read the problem carefully and identify key information",
        "Try to understand what is being asked",
        "Start with simpler cases or examples",
        "Look for patterns and connections",
        "Don't give up too quickly - persistence is key"
      ]
    },
    {
      category: "Learning Techniques",
      tips: [
        "Active reading - try to solve problems before reading solutions",
        "Create your own examples and counterexamples",
        "Explain solutions to others (or to yourself)",
        "Connect new concepts to what you already know",
        "Practice explaining your reasoning clearly"
      ]
    }
  ];

  const weeklySchedule = {
    monday: { focus: "Number Theory", duration: "2 hours", activities: ["Theory review", "Problem solving", "New concepts"] },
    tuesday: { focus: "Algebra", duration: "2 hours", activities: ["Practice problems", "Review solutions", "Study techniques"] },
    wednesday: { focus: "Geometry", duration: "2 hours", activities: ["Visual problems", "Construction exercises", "Proof writing"] },
    thursday: { focus: "Combinatorics", duration: "2 hours", activities: ["Counting problems", "Probability", "Recursion"] },
    friday: { focus: "Mixed Problems", duration: "2 hours", activities: ["Competition-style problems", "Time management", "Strategy practice"] },
    saturday: { focus: "Review & Assessment", duration: "3 hours", activities: ["Weekly review", "Mock tests", "Weak area identification"] },
    sunday: { focus: "Rest & Planning", duration: "1 hour", activities: ["Plan next week", "Organize notes", "Set goals"] }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Self Study Guide
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive guide for independent learning and practice in math olympiad preparation
          </p>
        </div>

        {/* Study Paths */}
        <div className="space-y-12 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Structured Learning Paths
          </h2>
          
          {studyPaths.map((path, pathIndex) => (
            <div key={pathIndex} className="bg-white rounded-lg shadow-md p-8">
              <div className="mb-6">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  {path.level}
                </h3>
                <p className="text-gray-600 text-lg">
                  {path.description}
                </p>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {path.topics.map((topic, topicIndex) => (
                  <div key={topicIndex} className="border border-gray-200 rounded-lg p-6">
                    <div className="mb-4">
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">
                        {topic.name}
                      </h4>
                      <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {topic.duration}
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-900 mb-2">Topics Covered:</h5>
                      <ul className="text-gray-700 space-y-1">
                        {topic.content.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Recommended Resources:</h5>
                      <ul className="text-gray-700 space-y-1">
                        {topic.resources.map((resource, resourceIndex) => (
                          <li key={resourceIndex} className="flex items-start">
                            <span className="text-green-600 mr-2">•</span>
                            <span className="text-sm">{resource}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Weekly Schedule */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Recommended Weekly Schedule
          </h2>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {Object.entries(weeklySchedule).map(([day, schedule]) => (
              <div key={day} className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 capitalize">
                  {day}
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-900">Focus:</span>
                    <p className="text-sm text-gray-700">{schedule.focus}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">Duration:</span>
                    <p className="text-sm text-gray-700">{schedule.duration}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">Activities:</span>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {schedule.activities.map((activity, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-purple-600 mr-1">•</span>
                          <span>{activity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Study Tips */}
        <div className="grid gap-8 md:grid-cols-3">
          {studyTips.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {category.category}
              </h3>
              <ul className="space-y-3">
                {category.tips.map((tip, tipIndex) => (
                  <li key={tipIndex} className="flex items-start">
                    <span className="text-orange-600 mr-2">•</span>
                    <span className="text-gray-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Success Metrics */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
            Tracking Your Progress
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Goals</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Complete 100+ problems
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Master 2-3 new topics
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Take 1-2 mock tests
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Review and organize notes
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Success Indicators</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  Consistently solving problems independently
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  Improving mock test scores
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  Understanding multiple solution approaches
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  Feeling confident with new problem types
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
