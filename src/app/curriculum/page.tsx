export default function Curriculum() {
  const curriculumModules = [
    {
      level: 'Foundation',
      modules: [
        {
          title: 'Basic Number Theory',
          topics: ['Divisibility', 'Prime Numbers', 'GCD & LCM', 'Modular Arithmetic'],
          duration: '4 weeks',
          difficulty: 'Beginner',
          description: 'Build strong foundations in number theory concepts essential for olympiad problems.'
        },
        {
          title: 'Elementary Algebra',
          topics: ['Polynomials', 'Quadratic Equations', 'Inequalities', 'Functions'],
          duration: '6 weeks',
          difficulty: 'Beginner',
          description: 'Master fundamental algebraic techniques and problem-solving strategies.'
        },
        {
          title: 'Basic Geometry',
          topics: ['Triangles', 'Circles', 'Quadrilaterals', 'Area & Perimeter'],
          duration: '5 weeks',
          difficulty: 'Beginner',
          description: 'Develop geometric intuition and learn essential geometric properties.'
        },
        {
          title: 'Introduction to Combinatorics',
          topics: ['Counting Principles', 'Permutations', 'Combinations', 'Basic Probability'],
          duration: '4 weeks',
          difficulty: 'Beginner',
          description: 'Learn fundamental counting techniques and combinatorial reasoning.'
        }
      ]
    },
    {
      level: 'Intermediate',
      modules: [
        {
          title: 'Advanced Number Theory',
          topics: ['Chinese Remainder Theorem', 'Euler\'s Totient', 'Quadratic Residues', 'Diophantine Equations'],
          duration: '6 weeks',
          difficulty: 'Intermediate',
          description: 'Explore advanced number theory concepts frequently appearing in olympiads.'
        },
        {
          title: 'Olympiad Algebra',
          topics: ['Functional Equations', 'Polynomial Identities', 'Advanced Inequalities', 'Complex Numbers'],
          duration: '8 weeks',
          difficulty: 'Intermediate',
          description: 'Master sophisticated algebraic techniques for challenging olympiad problems.'
        },
        {
          title: 'Synthetic Geometry',
          topics: ['Power of a Point', 'Inversion', 'Homothety', 'Advanced Triangle Centers'],
          duration: '7 weeks',
          difficulty: 'Intermediate',
          description: 'Learn advanced geometric transformations and synthetic methods.'
        },
        {
          title: 'Combinatorial Geometry',
          topics: ['Coloring Problems', 'Pigeonhole Principle', 'Graph Theory Basics', 'Combinatorial Optimization'],
          duration: '6 weeks',
          difficulty: 'Intermediate',
          description: 'Combine geometric and combinatorial thinking for complex problems.'
        }
      ]
    },
    {
      level: 'Advanced',
      modules: [
        {
          title: 'Advanced Problem Solving',
          topics: ['Invariants', 'Monovariants', 'Extremal Principles', 'Induction'],
          duration: '8 weeks',
          difficulty: 'Advanced',
          description: 'Master advanced problem-solving techniques and proof strategies.'
        },
        {
          title: 'IMO-Level Topics',
          topics: ['Generating Functions', 'Advanced Inequalities', 'Geometric Constructions', 'Number Theory Olympiad'],
          duration: '10 weeks',
          difficulty: 'Advanced',
          description: 'Prepare for the highest level of mathematical olympiad competition.'
        },
        {
          title: 'Mock Tests & Analysis',
          topics: ['Timed Practice', 'Problem Analysis', 'Solution Review', 'Strategy Development'],
          duration: '6 weeks',
          difficulty: 'Advanced',
          description: 'Practice with real exam conditions and learn from detailed solution analysis.'
        }
      ]
    }
  ];

  const learningFeatures = [
    {
      title: 'Interactive Lessons',
      description: 'Engaging video lessons with step-by-step explanations of concepts and techniques.',
      icon: '🎥'
    },
    {
      title: 'Practice Problems',
      description: 'Extensive collection of problems with varying difficulty levels and detailed solutions.',
      icon: '📝'
    },
    {
      title: 'Live Sessions',
      description: 'Weekly live doubt-clearing sessions with expert instructors.',
      icon: '🎯'
    },
    {
      title: 'Progress Tracking',
      description: 'Monitor your learning progress with detailed analytics and performance reports.',
      icon: '📊'
    },
    {
      title: 'Mock Tests',
      description: 'Regular mock tests simulating real olympiad exam conditions.',
      icon: '⏱️'
    },
    {
      title: 'Community Support',
      description: 'Join study groups and forums to discuss problems with peers.',
      icon: '👥'
    }
  ];

  const examPreparation = [
    {
      exam: 'IOQM',
      focus: 'Foundation building and basic problem-solving techniques',
      duration: '6-8 months',
      topics: ['Basic Number Theory', 'Elementary Algebra', 'Basic Geometry', 'Introduction to Combinatorics']
    },
    {
      exam: 'RMO',
      focus: 'Advanced techniques and intermediate problem-solving',
      duration: '8-10 months',
      topics: ['Advanced Number Theory', 'Olympiad Algebra', 'Synthetic Geometry', 'Combinatorial Geometry']
    },
    {
      exam: 'INMO',
      focus: 'Mastery of advanced topics and complex problem-solving',
      duration: '10-12 months',
      topics: ['Advanced Problem Solving', 'IMO-Level Topics', 'Mock Tests & Analysis']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Comprehensive Curriculum
            </h1>
            <p className="text-xl md:text-2xl text-indigo-100 max-w-3xl mx-auto">
              Structured learning path designed to take you from basics to IMO-level proficiency
            </p>
          </div>
        </div>
      </section>

      {/* Learning Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Learning Experience
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need for effective olympiad preparation
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {learningFeatures.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum Structure */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Curriculum Structure
            </h2>
            <p className="text-xl text-gray-600">
              Progressive learning modules designed for systematic preparation
            </p>
          </div>

          <div className="space-y-12">
            {curriculumModules.map((level, levelIndex) => (
              <div key={levelIndex} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                  <h3 className="text-2xl font-bold">{level.level} Level</h3>
                  <p className="text-blue-100 mt-2">
                    {level.level === 'Foundation' && 'Building strong mathematical foundations'}
                    {level.level === 'Intermediate' && 'Developing advanced problem-solving skills'}
                    {level.level === 'Advanced' && 'Mastering olympiad-level techniques'}
                  </p>
                </div>
                
                <div className="p-6">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {level.modules.map((module, moduleIndex) => (
                      <div key={moduleIndex} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-lg font-semibold text-gray-900">{module.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            module.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                            module.difficulty === 'Intermediate' ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {module.difficulty}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{module.description}</p>
                        <div className="text-sm text-gray-500 mb-3">Duration: {module.duration}</div>
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Topics:</h5>
                          <div className="flex flex-wrap gap-1">
                            {module.topics.map((topic, topicIndex) => (
                              <span key={topicIndex} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Exam Preparation Guide */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Exam Preparation Timeline
            </h2>
            <p className="text-xl text-gray-600">
              Recommended preparation schedule for each olympiad stage
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {examPreparation.map((exam, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                <div className="text-center mb-4">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{exam.exam}</h3>
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {exam.duration}
                  </span>
                </div>
                <p className="text-gray-700 mb-4 text-center">{exam.focus}</p>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Key Focus Areas:</h4>
                  <ul className="space-y-1">
                    {exam.topics.map((topic, topicIndex) => (
                      <li key={topicIndex} className="flex items-center text-sm text-gray-600">
                        <span className="text-blue-500 mr-2">•</span>
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join our comprehensive curriculum and begin your path to mathematical olympiad success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200">
              Enroll Now
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-200">
              View Sample Lessons
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
