export default function Prerequisites() {
  const prerequisites = [
    {
      category: 'Algebra',
      skills: [
        'Basic fraction addition, multiplication, division',
        'BODMAS rule',
        'Solving linear equation in one variable',
        'Solving simultaneous linear equation in two variables',
        'Working and finding roots of 2-3 digits numbers',
        'Knowing what are square of numbers',
        'Know what are polynomials in 1-2 variables, Monomials, working with product, addition, subtraction of polynomials',
        'Division of polynomials (long division) with linear divisor'
      ],
      level: 'Compulsory',
      description: 'Core algebraic concepts and techniques essential for olympiad problem solving'
    },
    {
      category: 'Geometry',
      skills: [
        'Corresponding, alternate, interior, vertically opposite angles in parallel lines with transversal',
        'Types of triangles (acute, obtuse, right angled) (isosceles, equilateral, scalene)',
        'Circle, tangent, secant',
        'Arc of circle',
        'Pythagoras theorem',
        'Linear pair formation',
        'Sum of angles in a triangle, polygon'
      ],
      level: 'Compulsory',
      description: 'Fundamental geometric concepts and properties needed for olympiad geometry problems'
    },
    {
      category: 'Number Theory',
      skills: [
        'Finding GCD and LCM of numbers',
        'Know what are prime numbers, composites',
        'Division algorithm'
      ],
      level: 'Compulsory',
      description: 'Basic number theory concepts that form the foundation for advanced olympiad problems'
    },
    {
      category: 'Combinatorics',
      skills: [
        'Addition, multiplication principle',
        'Permutations',
        'Combination'
      ],
      level: 'Optional',
      description: 'Counting principles and combinatorial techniques for olympiad problems'
    },
    {
      category: 'Functional',
      skills: [
        'Concept of functions'
      ],
      level: 'Optional',
      description: 'Understanding of function concepts and their applications'
    },
    {
      category: 'Basic Inequalities',
      skills: [
        'Basic rules of inequalities',
        'Addition, multiplication in inequalities',
        'Inequalities in one, two variable',
        'SOS method'
      ],
      level: 'Optional',
      description: 'Inequality techniques and methods commonly used in olympiad problems'
    }
  ];

  const studyTips = [
    {
      title: 'Master the Fundamentals',
      description: 'Ensure you have a solid understanding of all prerequisite topics before starting olympiad preparation.',
      icon: '🏗️'
    },
    {
      title: 'Practice Problem Solving',
      description: 'Solve problems from each topic area to develop strong problem-solving skills.',
      icon: '📝'
    },
    {
      title: 'Understand Concepts Deeply',
      description: 'Focus on understanding the underlying principles rather than memorizing formulas.',
      icon: '🧠'
    },
    {
      title: 'Work on Proofs',
      description: 'Practice writing mathematical proofs to develop logical thinking and rigor.',
      icon: '✍️'
    },
    {
      title: 'Use Multiple Resources',
      description: 'Refer to different textbooks and online resources for comprehensive learning.',
      icon: '📚'
    },
    {
      title: 'Join Study Groups',
      description: 'Collaborate with peers to discuss problems and learn different approaches.',
      icon: '👥'
    }
  ];

  const assessmentAreas = [
    {
      title: 'Algebra Assessment',
      topics: ['Fractions & BODMAS', 'Linear Equations', 'Polynomials', 'Square Roots'],
      color: 'blue'
    },
    {
      title: 'Geometry Assessment', 
      topics: ['Angles & Triangles', 'Circles & Tangents', 'Pythagoras Theorem', 'Polygons'],
      color: 'green'
    },
    {
      title: 'Number Theory Assessment',
      topics: ['GCD & LCM', 'Prime Numbers', 'Division Algorithm'],
      color: 'purple'
    },
    {
      title: 'Combinatorics Assessment',
      topics: ['Counting Principles', 'Permutations', 'Combinations'],
      color: 'orange'
    },
    {
      title: 'Functions Assessment',
      topics: ['Function Concepts', 'Function Properties'],
      color: 'red'
    },
    {
      title: 'Inequalities Assessment',
      topics: ['Basic Rules', 'Operations', 'SOS Method'],
      color: 'indigo'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Prerequisites for Mathematical Olympiads
            </h1>
            <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto">
              Master these fundamental mathematical concepts before starting your olympiad preparation journey
            </p>
          </div>
        </div>
      </section>

      {/* Prerequisites Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Required Mathematical Background
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These are the specific skills and knowledge areas you should master before enrolling in our olympiad preparation program
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {prerequisites.map((prereq, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{prereq.category}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    prereq.level === 'Beginner' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {prereq.level}
                  </span>
                </div>
                <p className="text-gray-600 mb-4 text-sm">{prereq.description}</p>
                <ul className="space-y-2">
                  {prereq.skills.map((skill, skillIndex) => (
                    <li key={skillIndex} className="flex items-start">
                      <span className="text-green-500 mr-2 mt-1">•</span>
                      <span className="text-gray-700 text-sm">{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Assessment Areas */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Assessment Areas
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our diagnostic assessment will evaluate your proficiency in these specific areas
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assessmentAreas.map((area, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className={`w-12 h-12 rounded-lg bg-${area.color}-100 flex items-center justify-center mb-4`}>
                  <span className={`text-${area.color}-600 font-bold text-lg`}>
                    {index + 1}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{area.title}</h3>
                <ul className="space-y-1">
                  {area.topics.map((topic, topicIndex) => (
                    <li key={topicIndex} className="text-sm text-gray-600 flex items-center">
                      <span className="text-gray-400 mr-2">•</span>
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Study Tips */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Effective Study Strategies
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Proven tips to help you master the prerequisites and prepare effectively for mathematical olympiads
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {studyTips.map((tip, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
                <div className="text-4xl mb-4">{tip.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{tip.title}</h3>
                <p className="text-gray-600">{tip.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Assessment Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Assess Your Skills?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Take our comprehensive diagnostic test to evaluate your current mathematical proficiency across all prerequisite areas.
          </p>
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Free Diagnostic Assessment</h3>
            <p className="text-blue-100 mb-6">
              Get a detailed report of your strengths and areas that need attention in each prerequisite category
            </p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200">
              Take Assessment
            </button>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            What's Next?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">If You Meet Prerequisites</h3>
              <p className="text-gray-600 mb-4">
                You're ready to start our comprehensive curriculum designed for olympiad preparation.
              </p>
              <a href="/curriculum" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                Explore Curriculum
              </a>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Ready to Enroll?</h3>
              <p className="text-gray-600 mb-4">
                Join our program and start your journey towards mathematical olympiad success.
              </p>
              <a href="/join" className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200">
                Enroll Now
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
