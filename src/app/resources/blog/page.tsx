export default function BlogPage() {
  const featuredPost = {
    title: "The Art of Mathematical Problem Solving: A Beginner's Guide",
    excerpt: "Discover the fundamental strategies and mindset needed to approach mathematical problems effectively. This comprehensive guide covers everything from understanding the problem to writing elegant solutions.",
    author: "Dr. Sarah Chen",
    date: "December 15, 2024",
    readTime: "8 min read",
    category: "Problem Solving",
    image: "/api/placeholder/600/300",
    featured: true
  };

  const blogPosts = [
    {
      title: "Number Theory Essentials: Divisibility and Primes",
      excerpt: "Master the basics of number theory with this detailed exploration of divisibility rules, prime numbers, and their applications in mathematical competitions.",
      author: "Prof. Michael Rodriguez",
      date: "December 12, 2024",
      readTime: "6 min read",
      category: "Number Theory",
      image: "/api/placeholder/400/250"
    },
    {
      title: "Geometry Visualization Techniques for Olympiad Problems",
      excerpt: "Learn how to effectively visualize geometric problems and use drawing techniques to solve complex geometry questions in math competitions.",
      author: "Dr. Emily Watson",
      date: "December 10, 2024",
      readTime: "7 min read",
      category: "Geometry",
      image: "/api/placeholder/400/250"
    },
    {
      title: "Combinatorics Made Simple: Counting Principles",
      excerpt: "Break down complex counting problems using fundamental principles like the multiplication rule, addition rule, and inclusion-exclusion principle.",
      author: "Prof. David Kim",
      date: "December 8, 2024",
      readTime: "5 min read",
      category: "Combinatorics",
      image: "/api/placeholder/400/250"
    },
    {
      title: "Algebraic Inequalities: From AM-GM to Cauchy-Schwarz",
      excerpt: "Explore powerful inequality techniques that frequently appear in mathematical olympiads, with step-by-step examples and practice problems.",
      author: "Dr. Lisa Thompson",
      date: "December 5, 2024",
      readTime: "9 min read",
      category: "Algebra",
      image: "/api/placeholder/400/250"
    },
    {
      title: "Mental Math Strategies for Faster Problem Solving",
      excerpt: "Develop mental calculation skills and learn shortcuts that can save valuable time during mathematical competitions.",
      author: "Prof. James Wilson",
      date: "December 3, 2024",
      readTime: "4 min read",
      category: "Techniques",
      image: "/api/placeholder/400/250"
    },
    {
      title: "Preparing for Your First Math Olympiad: A Complete Guide",
      excerpt: "Everything you need to know about preparing for and participating in your first mathematical olympiad competition.",
      author: "Dr. Sarah Chen",
      date: "November 30, 2024",
      readTime: "10 min read",
      category: "Preparation",
      image: "/api/placeholder/400/250"
    }
  ];

  const categories = [
    { name: "All Posts", count: 7, active: true },
    { name: "Problem Solving", count: 1, active: false },
    { name: "Number Theory", count: 1, active: false },
    { name: "Geometry", count: 1, active: false },
    { name: "Combinatorics", count: 1, active: false },
    { name: "Algebra", count: 1, active: false },
    { name: "Techniques", count: 1, active: false },
    { name: "Preparation", count: 1, active: false }
  ];



  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Latest articles, tips, and insights on math olympiad preparation
          </p>
        </div>

        {/* Categories */}
        <div className="mb-12">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category, index) => (
              <button
                key={index}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  category.active
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Featured Post */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Article</h2>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2">
                <div className="h-64 md:h-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                  <div className="text-white text-center">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm opacity-75">Featured Image</p>
                  </div>
                </div>
              </div>
              <div className="md:w-1/2 p-8">
                <div className="flex items-center mb-4">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {featuredPost.category}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">{featuredPost.readTime}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
                  {featuredPost.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {featuredPost.author.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{featuredPost.author}</p>
                      <p className="text-sm text-gray-500">{featuredPost.date}</p>
                    </div>
                  </div>
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                    Read More
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Latest Articles</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blogPosts.map((post, index) => (
              <article key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <div className="text-gray-500 text-center">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    <p className="text-xs">Post Image</p>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                      {post.category}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">{post.readTime}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 leading-tight">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        {post.author.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="ml-2">
                        <p className="text-xs font-medium text-gray-900">{post.author}</p>
                        <p className="text-xs text-gray-500">{post.date}</p>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Read →
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Get the latest math olympiad tips, problem-solving strategies, and competition updates delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200">
              Subscribe
            </button>
          </div>
        </div>

        {/* Popular Topics */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Popular Topics</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { topic: "Problem Solving", count: "15 articles", color: "from-blue-500 to-blue-600" },
              { topic: "Number Theory", count: "12 articles", color: "from-green-500 to-green-600" },
              { topic: "Geometry", count: "10 articles", color: "from-purple-500 to-purple-600" },
              { topic: "Combinatorics", count: "8 articles", color: "from-orange-500 to-orange-600" }
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-lg p-6 text-center shadow-md hover:shadow-lg transition-shadow duration-200">
                <div className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-lg mx-auto mb-4 flex items-center justify-center`}>
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.topic}</h3>
                <p className="text-gray-600 text-sm">{item.count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
