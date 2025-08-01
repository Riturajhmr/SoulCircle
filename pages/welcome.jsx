import React, { useState, useEffect } from "react"
import { Moon, Star, Heart, MessageCircle, Users, PenTool, Sparkles, X } from "lucide-react"
import { useNavigate } from "react-router-dom"

const WelcomePage = () => {
  const [answers, setAnswers] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    // Load answers from localStorage
    const savedAnswers = localStorage.getItem("soulcircle-answers")
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers))
    }
  }, [])

  const handleClose = () => {
    navigate("/")
  }

  const handleEnterSoulCircle = () => {
    // Navigate to main app or dashboard
    navigate("/dashboard") // You can change this to your main app route
  }

  const getPersonalizedMessage = () => {
    const feeling = answers[1]
    const need = answers[2]
    if (feeling && need) {
      return `We understand you're feeling ${feeling.toLowerCase()} and need ${need.toLowerCase()}. You've taken a brave step by being here.`
    }
    return "Thank you for sharing your story with us. You've taken a brave step by being here."
  }

  const getRecommendations = () => {
    const participation = answers[6]
    const recommendations = []

    if (participation === "Chat anonymously" || participation === "Both") {
      recommendations.push({
        icon: MessageCircle,
        title: "Join Chat Rooms",
        description: "Connect with others who understand your feelings",
      })
    }

    if (participation === "Read only" || participation === "Both") {
      recommendations.push({
        icon: PenTool,
        title: "Browse FeelNotes",
        description: "Read stories and experiences from the community",
      })
    }

    if (answers[3]?.includes("Loneliness")) {
      recommendations.push({
        icon: Users,
        title: "Support Circles",
        description: "Join small, supportive groups for deeper connections",
      })
    }

    // Always include this as a fallback
    if (recommendations.length === 0) {
      recommendations.push({
        icon: Heart,
        title: "Explore SoulCircle",
        description: "Discover all the ways we can support your journey",
      })
    }

    return recommendations
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #1e215d 0%, #9461fd 40%, #d9afdf 100%)",
      }}
    >
      {/* Animated Stars Background */}
      <div className="absolute inset-0">
        {[...Array(60)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          >
            <Star className="w-1 h-1 text-white opacity-70 fill-current" />
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-3xl">
          <div
            className="relative backdrop-blur-md border border-white/30 p-8 rounded-3xl shadow-2xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(30, 33, 93, 0.95) 0%, rgba(148, 97, 253, 0.95) 40%, rgba(217, 175, 223, 0.95) 100%)",
            }}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors duration-200 p-2 rounded-full hover:bg-white/10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-3 mb-6">
                <div className="relative">
                  <Moon className="w-16 h-16 text-purple-200" />
                  <div className="absolute -inset-2 bg-purple-400/20 rounded-full blur-xl animate-pulse" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white">Welcome to</h1>
                  <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
                    SoulCircle
                  </h2>
                </div>
              </div>
            </div>

            {/* Welcome Message */}
            <div className="bg-white/15 backdrop-blur-md border border-white/30 p-8 mb-8 rounded-xl shadow-lg">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold text-white mb-4">{"You're All Set!"}</h3>
                <p className="text-lg text-purple-100 leading-relaxed">{getPersonalizedMessage()}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-6 mb-6 border border-white/20">
                <h4 className="text-white font-semibold mb-3 text-center">Remember:</h4>
                <div className="space-y-2 text-purple-100">
                  <p className="flex items-center justify-center space-x-2">
                    <Heart className="w-4 h-4 text-pink-400" />
                    <span>You are not alone in this journey</span>
                  </p>
                  <p className="flex items-center justify-center space-x-2">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <span>Your feelings are valid and heard here</span>
                  </p>
                  <p className="flex items-center justify-center space-x-2">
                    <Moon className="w-4 h-4 text-purple-400" />
                    <span>This is your safe space to heal and grow</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Personalized Recommendations */}
            <div className="bg-white/15 backdrop-blur-md border border-white/30 p-8 mb-8 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-white mb-6 text-center">Recommended for You</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {getRecommendations().map((rec, index) => (
                  <div
                    key={index}
                    className="bg-white/10 rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer transform hover:scale-105"
                  >
                    <div className="flex items-start space-x-3">
                      <rec.icon className="w-6 h-6 text-purple-300 mt-1" />
                      <div>
                        <h4 className="text-white font-medium mb-1">{rec.title}</h4>
                        <p className="text-purple-200 text-sm">{rec.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Continue Button */}
            <div className="text-center">
              <button
                onClick={handleEnterSoulCircle}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 rounded-full px-12 py-6 text-lg font-semibold shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500/50 inline-flex items-center"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Enter SoulCircle
              </button>
              <p className="text-purple-300 italic opacity-90 mt-4">
                Your journey of healing and connection begins now 🌙
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WelcomePage
