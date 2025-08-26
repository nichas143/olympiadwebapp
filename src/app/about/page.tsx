export default function About() {
  const teamMembers = [
     {
      name: 'Mr. Sachin Gadkar',
      role: 'Mathematics Instructor',
      expertise: 'Math Olympiad Trainer',
      description: 'Developed Math Olympiad curriculum from basic to advanced level',
      achievements: [ 'Masters in Mathematics,IITB', 'JEE Advanced Trainer', '22+ Years Teaching']
    },
    
  ];

  const achievements = [
    {
      number: '100+',
      label: 'Students Qualified for RMO',
      description: 'Successfully guided students to regional level'
    },
    {
      number: '30+',
      label: 'IOQM & RMO Qualifiers',
      description: 'Students who reached national level'
    },
    {
      number: '5+',
      label: 'IMO Training Camp Selections',
      description: 'Students selected for international training'
    },
    {
      number: '80%',
      label: 'Success Rate',
      description: 'Students who improved their performance'
    }
  ];

  const values = [
    {
      title: 'Excellence',
      description: 'We strive for mathematical excellence and encourage students to reach their full potential.',
      icon: '🏆'
    },
    {
      title: 'Innovation',
      description: 'We use innovative teaching methods and modern technology to make learning engaging.',
      icon: '💡'
    },
    {
      title: 'Community',
      description: 'We foster a supportive community where students can learn from each other and grow together.',
      icon: '🤝'
    },
    {
      title: 'Accessibility',
      description: 'We believe quality mathematical education should be accessible to all talented students.',
      icon: '🌍'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About Our Mission
            </h1>
            <p className="text-xl md:text-2xl text-purple-100 max-w-3xl mx-auto">
              Empowering the next generation of mathematical minds to represent India on the global stage
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-lg text-gray-700">
                <p>
                  Founded in 2010 by Mr. Sachin Gadkar, 
                  our organization was born from a simple belief: every talented student deserves the 
                  opportunity to excel in mathematics and and make most out of this opportunity of learning non-traditional Mathematical curriculum.
                </p>
                <p>
                  Purpose is to enhance problem solving skill and abstract thinking which eventually helps students excel in Mathematical and in general thinking. As a by-product selections in IOQM, RMO, INMO and JEE Advanced towards IITs. 
                </p>
                <p>
                  This venture is a small endevour to form only one batch of students on a yearly basis for Coaching MathOlympiad right from class 7th till class 10th.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-lg mb-6">
                To provide world-class mathematical olympiad preparation that nurtures creativity, 
                logical thinking, and problem-solving skills in students, preparing them to represent 
                India at the International Mathematical Olympiad.
              </p>
              <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
              <p className="text-lg">
                To establish India as a global leader in mathematical olympiads by creating a 
                sustainable ecosystem of mathematical talent development.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Achievements
            </h2>
            <p className="text-xl text-gray-600">
              Track record of success in mathematical olympiad preparation
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="text-4xl font-bold text-blue-600 mb-2">{achievement.number}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{achievement.label}</h3>
                <p className="text-gray-600">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600">
              The principles that guide our approach to mathematical education
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Expert Team
            </h2>
            <p className="text-xl text-gray-600">
              Experienced educators and former olympiad participants dedicated to your success
            </p>
          </div>
          
          <div className="grid md:grid-cols-1 lg:grid-cols-1 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow duration-200">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="text-xl font-bold text-gray-900 text-center mb-1">{member.name}</h3>
                <p className="text-blue-600 text-center font-medium mb-2">{member.role}</p>
                <p className="text-sm text-gray-600 text-center mb-3">{member.expertise}</p>
                {/* <p className="text-gray-700 text-sm mb-4">{member.description}</p> */}
                <div className="flex flex-wrap gap-1 justify-center">
                  {member.achievements.map((achievement, achievementIndex) => (
                    <span key={achievementIndex} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                      {achievement}
                    </span>
                  ))}
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
            Join Our Community
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Be part of a community that celebrates mathematical excellence and nurtures young talent.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/curriculum"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
            >
              Start Learning
            </a>
            <a
              href="/prerequisites"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-200"
            >
              Check Prerequisites
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
