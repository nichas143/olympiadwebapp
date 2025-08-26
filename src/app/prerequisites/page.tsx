export default function Prerequisites() {
  const prerequisites = [
    {
      category: 'Basic Mathematics',
      skills: [
        'Strong foundation in arithmetic and basic algebra',
        'Understanding of fractions, decimals, and percentages',
        'Knowledge of basic geometric concepts and formulas',
        'Familiarity with simple equations and inequalities'
      ],
      level: 'Beginner'
    },
    {
      category: 'Algebra',
      skills: [
        'Quadratic equations and their solutions',
        'Polynomial functions and their properties',
        'Systems of linear equations',
        'Basic inequalities and their solutions',
        'Understanding of functions and their graphs'
      ],
      level: 'Intermediate'
    },
    {
      category: 'Geometry',
      skills: [
        'Properties of triangles, circles, and quadrilaterals',
        'Understanding of similarity and congruence',
        'Basic coordinate geometry',
        'Area and perimeter calculations',
        'Basic trigonometry concepts'
      ],
      level: 'Intermediate'
    },
    {
      category: 'Number Theory',
      skills: [
        'Divisibility rules and prime factorization',
        'Greatest common divisor (GCD) and least common multiple (LCM)',
        'Modular arithmetic basics',
        'Understanding of prime numbers and their properties'
      ],
      level: 'Intermediate'
    },
    {
      category: 'Combinatorics',
      skills: [
        'Basic counting principles (addition and multiplication)',
        'Permutations and combinations',
        'Understanding of probability basics',
        'Simple combinatorial problems'
      ],
      level: 'Intermediate'
    }
  ];

  const studyTips = [
    {
      title: 'Build Strong Foundations',
      description: 'Ensure you have a solid understanding of basic mathematical concepts before moving to advanced topics.',
      icon: '🏗️'
    },
    {
      title: 'Practice Regularly',
      description: 'Solve problems daily to develop problem-solving skills and mathematical intuition.',
      icon: '📝'
    },
    {
      title: 'Understand, Don\'t Memorize',
      description: 'Focus on understanding the underlying concepts rather than memorizing formulas.',
      icon: '🧠'
    },
    {
      title: 'Work on Proofs',
      description: 'Practice writing mathematical proofs to develop logical thinking skills.',
      icon: '✍️'
    },
    {
      title: 'Join Study Groups',
      description: 'Collaborate with peers to discuss problems and learn different approaches.',
      icon: '👥'
    },
    {
      title: 'Use Multiple Resources',
      description: 'Refer to different textbooks and online resources for comprehensive learning.',
      icon: '📚'
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
              Understand the mathematical background and skills you need to excel in IOQM, RMO, and INMO
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
              These are the fundamental skills and knowledge areas you should master before starting olympiad preparation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                <ul className="space-y-2">
                  {prereq.skills.map((skill, skillIndex) => (
                    <li key={skillIndex} className="flex items-start">
                      <span className="text-green-500 mr-2 mt-1">•</span>
                      <span className="text-gray-700">{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Study Tips */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Effective Study Strategies
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Proven tips to help you prepare effectively for mathematical olympiads
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {studyTips.map((tip, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="text-4xl mb-4">{tip.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{tip.title}</h3>
                <p className="text-gray-600">{tip.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Assessment Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Assess Your Skills?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Take our diagnostic test to evaluate your current mathematical proficiency and identify areas for improvement.
          </p>
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Free Diagnostic Assessment</h3>
            <p className="text-blue-100 mb-6">
              Get a personalized report of your strengths and areas that need attention
            </p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200">
              Take Assessment
            </button>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            What's Next?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">If You Meet Prerequisites</h3>
              <p className="text-gray-600 mb-4">
                You're ready to start our comprehensive curriculum designed for olympiad preparation.
              </p>
              <a href="/curriculum" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                Explore Curriculum
              </a>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">If You Need More Foundation</h3>
              <p className="text-gray-600 mb-4">
                We offer foundational courses to strengthen your mathematical base before olympiad prep.
              </p>
              <button className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200">
                Foundation Courses
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
