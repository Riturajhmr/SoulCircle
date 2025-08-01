import React from "react"
import { Moon, Heart, MessageCircle, Users, PenTool, Star } from "lucide-react"
import { useNavigate } from "react-router-dom"

const DashboardPage = () => {
  const navigate = useNavigate()
  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #1e215d 0%, #9461fd 40%, #d9afdf 100%)",
      }}
    >
      {/* Animated Stars Background */}
      <div className="absolute inset-0">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          >
            <Star className="w-1 h-1 text-white opacity-60 fill-current" />
          </div>
        ))}
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/10 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-2">
              <Moon className="w-6 h-6 text-purple-200" />
              <span className="text-white font-semibold text-lg">SoulCircle</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Welcome to Your
              <span className="bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent block">
                SoulCircle Dashboard
              </span>
            </h1>
            <p className="text-xl text-purple-200 max-w-2xl mx-auto">
              Your safe space for healing, connection, and growth. Choose how you'd like to begin your journey today.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              {
                icon: MessageCircle,
                title: "Chat Rooms",
                description: "Join emotion-based conversations with others who understand",
                color: "from-blue-500 to-purple-500",
              },
              {
                icon: PenTool,
                title: "FeelNotes",
                description: "Share your story anonymously or read others' experiences",
                color: "from-purple-500 to-pink-500",
              },
              {
                icon: Users,
                title: "Support Circles",
                description: "Join small, intimate groups for deeper connections",
                color: "from-pink-500 to-red-500",
              },
              {
                icon: Heart,
                title: "Mood Tracker",
                description: "Track your emotional journey and see your progress",
                color: "from-green-500 to-teal-500",
              },
            ].map((feature, index) => (
              <div
                key={index}
                onClick={() => {
                  if (feature.title === "Chat Rooms") {
                    navigate("/chatroom")
                  } else if (feature.title === "FeelNotes") {
                    navigate("/feelnotes")
                  }
                }}
                className="bg-white/15 backdrop-blur-md border border-white/30 p-6 rounded-2xl hover:bg-white/20 transition-all duration-300 hover:scale-105 cursor-pointer shadow-lg"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-purple-200 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white/15 backdrop-blur-md border border-white/30 p-8 rounded-2xl text-center shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-6">Ready to Begin?</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => navigate("/chatroom")}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 rounded-full px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105 flex items-center justify-center"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Join a Chat Room
              </button>
              <button 
                onClick={() => navigate("/feelnotes")}
                className="border border-white/30 text-white hover:bg-white/10 bg-transparent rounded-full px-8 py-4 text-lg font-semibold transition-all duration-300 flex items-center justify-center"
              >
                <PenTool className="w-5 h-5 mr-2" />
                Write a FeelNote
              </button>
            </div>
            <p className="text-purple-300 italic opacity-90 mt-6">
              Remember: You're not alone in this journey. We're here for you. 🌙
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
