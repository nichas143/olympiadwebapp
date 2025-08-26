export default function UsefulLinksPage() {
  const usefulLinks = [
    {
      category: "Problem Solving Platforms",
      links: [
        {
          name: "Art of Problem Solving (AoPS)",
          url: "https://artofproblemsolving.com",
          description: "Comprehensive platform with forums, courses, and problem archives"
        },
        {
          name: "Brilliant.org",
          url: "https://brilliant.org",
          description: "Interactive problem-solving with step-by-step solutions"
        },
        {
          name: "Project Euler",
          url: "https://projecteuler.net",
          description: "Mathematical and computational programming problems"
        }
      ]
    },
    {
      category: "Math Olympiad Resources",
      links: [
        {
          name: "International Mathematical Olympiad (IMO)",
          url: "https://www.imo-official.org",
          description: "Official IMO website with past problems and results"
        },
        {
          name: "American Mathematics Competitions (AMC)",
          url: "https://maa.org/student-programs/amc/",
          description: "Official AMC 8, 10, and 12 competitions with registration and preparation resources"
        },
        {
          name: "Indian Olympiad Qualifier in Mathematics (IOQM)",
          url: "https://ioqmexam.in/",
          description: "Official IOQM website with registration, exam dates, and preparation materials"
        },
        {
          name: "HBCSE Past Papers (IOQM/RMO/INMO)",
          url: "https://olympiads.hbcse.tifr.res.in/how-to-prepare/past-papers/",
          description: "Comprehensive collection of past papers and solutions for Indian Mathematical Olympiad stages"
        },
        {
          name: "Mathematics Teachers' Association (India) - MTA(I)",
          url: "https://www.mtai.org.in/",
          description: "Official math olympiad body in India organizing IOQM and other mathematical competitions"
        }
      ]
    },
    {
      category: "Online Calculators & Tools",
      links: [
        {
          name: "Wolfram Alpha",
          url: "https://www.wolframalpha.com",
          description: "Computational knowledge engine for mathematical queries"
        },
        {
          name: "Desmos Graphing Calculator",
          url: "https://www.desmos.com/calculator",
          description: "Interactive graphing calculator and geometry tool"
        },
        {
          name: "GeoGebra",
          url: "https://www.geogebra.org",
          description: "Dynamic mathematics software for learning and teaching"
        }
      ]
    },
    {
      category: "Educational Videos",
      links: [
        {
          name: "3Blue1Brown",
          url: "https://www.youtube.com/c/3blue1brown",
          description: "Mathematical animations and explanations"
        },
        {
          name: "Numberphile",
          url: "https://www.youtube.com/user/numberphile",
          description: "Videos about numbers and mathematics"
        },
        {
          name: "Khan Academy",
          url: "https://www.khanacademy.org",
          description: "Free educational videos on various math topics"
        }
      ]
    },
    {
      category: "Practice Problems",
      links: [
        {
          name: "MathCounts",
          url: "https://www.mathcounts.org",
          description: "National middle school mathematics competition"
        },
        {
          name: "AMC Problems",
          url: "https://artofproblemsolving.com/wiki/index.php/AMC_Problems_and_Solutions",
          description: "American Mathematics Competitions problem archive"
        },
        {
          name: "Math Olympiad Training",
          url: "https://matholympiad.org",
          description: "Training materials and practice problems"
        },
        {
          name: "AoPS Contest Collection",
          url: "https://artofproblemsolving.com/community/c13_contests",
          description: "Comprehensive collection of contest papers from around the globe"
        },
        {
          name: "KöMaL Magazine",
          url: "https://www.komal.hu/verseny/korabbi.e.shtml",
          description: "Hungarian mathematical and physical journal with problems in mathematics, physics, and informatics"
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
            Useful Links
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Curated collection of helpful websites and online resources for math olympiad preparation
          </p>
        </div>

        {/* Links Grid */}
        <div className="space-y-8">
          {usefulLinks.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-2">
                {category.category}
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {category.links.map((link, linkIndex) => (
                  <div key={linkIndex} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                    <h3 className="text-lg font-medium text-blue-600 mb-2">
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-blue-800 transition-colors duration-200"
                      >
                        {link.name}
                      </a>
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {link.description}
                    </p>
                    <div className="mt-3">
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Visit Site
                        <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Additional Information */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-blue-900 mb-3">
            Tips for Using These Resources
          </h3>
          <ul className="text-blue-800 space-y-2">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              Start with problems at your current level and gradually increase difficulty
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              Use multiple resources to get different perspectives on the same topic
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              Practice regularly and track your progress
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              Join online communities to discuss problems and learn from others
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
