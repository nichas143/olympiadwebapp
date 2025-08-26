import Link from 'next/link';

export default function Home() {
  const examStages = [
    {
      name: 'IOQM',
      fullName: 'Indian Olympiad Qualifier in Mathematics',
      description: 'The first stage of the mathematical olympiad journey in India',
      level: 'Class 8-12',
      duration: '3 hours',
      topics: ['Algebra', 'Geometry', 'Number Theory', 'Combinatorics']
    },
    {
      name: 'RMO',
      fullName: 'Regional Mathematical Olympiad',
      description: 'Regional level competition that selects students for the next stage',
      level: 'Class 9-12',
      duration: '3 hours',
      topics: ['Advanced Algebra', 'Euclidean Geometry', 'Number Theory', 'Combinatorics']
    },
    {
      name: 'INMO',
      fullName: 'Indian National Mathematical Olympiad',
      description: 'National level competition that selects students for international training',
      level: 'Class 9-12',
      duration: '4 hours',
      topics: ['Olympiad Algebra', 'Synthetic Geometry', 'Advanced Number Theory', 'Combinatorial Geometry']
    }
  ];

  const features = [
    {
      title: 'Comprehensive Curriculum',
      description: 'Structured learning path covering all topics from basic to advanced olympiad level',
      icon: '📚'
    },
    {
      title: 'Expert Guidance',
      description: 'Learn from experienced olympiad mentors and former participants',
      icon: '🎯'
    },
    {
      title: 'Practice Problems',
      description: 'Extensive collection of problems from previous olympiads and similar competitions',
      icon: '✏️'
    },
    {
      title: 'Mock Tests',
      description: 'Timed practice tests to simulate real exam conditions',
      icon: '⏱️'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Master the Art of
              <span className="block text-yellow-300">Mathematical Olympiads</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Comprehensive preparation for IOQM, RMO, and INMO - your pathway to representing India at the International Mathematical Olympiad (IMO)
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/curriculum"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-200"
              >
                Start Learning
              </Link>
              <Link
                href="/prerequisites"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors duration-200"
              >
                Check Prerequisites
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Program?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We provide everything you need to excel in mathematical olympiads
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Exam Progression Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Your Journey to IMO
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Understand the progression through India&apos;s mathematical olympiad system
            </p>
          </div>

          <div className="space-y-8">
            {examStages.map((exam, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{exam.name}</h3>
                        <p className="text-gray-600">{exam.fullName}</p>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">{exam.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                        {exam.level}
                      </span>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                        {exam.duration}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-6 lg:mt-0 lg:ml-8">
                    <h4 className="font-semibold text-gray-900 mb-3">Key Topics:</h4>
                    <div className="flex flex-wrap gap-2">
                      {exam.topics.map((topic, topicIndex) => (
                        <span key={topicIndex} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Begin Your Olympiad Journey?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of students who have successfully prepared for mathematical olympiads with our comprehensive program.
          </p>
          <Link
            href="/curriculum"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-200 inline-block"
          >
            Explore Our Curriculum
          </Link>
        </div>
      </section>
    </div>
  );
}
