import React, { useState, useEffect } from "react"
import { Moon, Heart, MessageCircle, Users, PenTool, Star, TrendingUp, User, LogOut, Mail } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../src/contexts/AuthContext"
import { useUserData } from "../src/hooks/useUserData"
import Button from "../src/components/ui/button"
import Card from "../src/components/ui/card"

const DashboardPage = () => {
  const navigate = useNavigate()
  const { currentUser, logout } = useAuth()
  const { 
    userProfile, 
    userActivities,
    trackActivity,
    refreshData
  } = useUserData()

  const [showMoodCheck, setShowMoodCheck] = useState(false)
  const [moodOptions] = useState([
    { emoji: "🌙", label: "Calm", color: "from-blue-400 to-purple-400" },
    { emoji: "💜", label: "Hopeful", color: "from-purple-400 to-pink-400" },
    { emoji: "💧", label: "Sad", color: "from-blue-300 to-cyan-300" },
    { emoji: "🔥", label: "Energetic", color: "from-orange-400 to-red-400" },
    { emoji: "🌱", label: "Growing", color: "from-green-400 to-emerald-400" },
    { emoji: "☁️", label: "Numb", color: "from-gray-300 to-slate-300" }
  ])

  // Check if user has answered mood question today
  useEffect(() => {
    const checkTodayMood = () => {
      if (!currentUser) return

      const today = new Date().toDateString()

      // Check localStorage first (fast path)
      const lastMoodCheck = localStorage.getItem(`moodCheck_${currentUser.uid}`)
      if (lastMoodCheck === today) return

      // Prefer Firestore server timestamp when available
      const getActivityDateString = (activity) => {
        if (activity?.timestamp?.seconds) {
          return new Date(activity.timestamp.seconds * 1000).toDateString()
        }
        if (activity?.metadata?.date) {
          return new Date(activity.metadata.date).toDateString()
        }
        return ''
      }

      const todayMood = (userActivities || []).find((activity) =>
        activity.type === 'mood_check' && getActivityDateString(activity) === today
      )

      if (todayMood) {
        localStorage.setItem(`moodCheck_${currentUser.uid}`, today)
        return
      }

      setShowMoodCheck(true)
    }

    const timer = setTimeout(checkTodayMood, 800)
    return () => clearTimeout(timer)
  }, [currentUser, userActivities])

  const handleMoodSubmit = async (mood) => {
    try {
      const selectedMood = moodOptions.find(m => m.label === mood)
      const today = new Date().toDateString()
      
      await trackActivity({
        type: 'mood_check',
        description: `Mood check: ${mood}`,
        metadata: {
          mood: mood,
          emoji: selectedMood?.emoji || '❓',
          date: new Date().toISOString()
        }
      })
      
      // Update localStorage to prevent showing again today
      localStorage.setItem(`moodCheck_${currentUser.uid}`, today)
      
      setShowMoodCheck(false)
      await refreshData()
      
      console.log(`✅ Mood saved: ${mood} for ${today}`)
      alert(`Thank you for sharing your mood! ${selectedMood?.emoji}`)
    } catch (err) {
      console.error('Error saving mood:', err)
      alert(`Error saving mood: ${err.message}`)
    }
  }

  const handleSkipMoodCheck = () => {
    const today = new Date().toDateString()
    localStorage.setItem(`moodCheck_${currentUser.uid}`, today)
    setShowMoodCheck(false)
    console.log('⏭️ Mood check skipped for today')
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (err) {
      alert(`Error logging out: ${err.message}`)
    }
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
            
                {/* User Profile & Actions */}
                <div className="flex items-center space-x-4">
                  {currentUser && (
                    <>
                      <Button
                        onClick={() => navigate('/profile')}
                        className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                      >
                        <User className="w-4 h-4 mr-2" />
                        {userProfile?.displayName || currentUser.email?.split('@')[0]}
                      </Button>
                      
                      <Button
                        onClick={handleLogout}
                        className="bg-red-500/20 hover:bg-red-500/30 text-white border-red-300/30"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </>
                  )}
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

          {/* Daily Mood Check Modal */}
          {showMoodCheck && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <Card className="p-8 bg-white/10 backdrop-blur-md border-white/20 rounded-3xl max-w-md w-full">
                <div className="text-center space-y-6">
                  <h2 className="text-2xl font-semibold text-white">
                    How are you feeling today? 💫
                  </h2>
                  <p className="text-purple-200">Take a moment to check in with yourself</p>
                  
                  <div className="grid grid-cols-3 gap-4">
                    {moodOptions.map((mood, index) => (
                      <button
                        key={index}
                        onClick={() => handleMoodSubmit(mood.label)}
                        className={`p-4 rounded-2xl bg-gradient-to-br ${mood.color} transition-all duration-300 hover:scale-105 hover:shadow-lg`}
                      >
                        <div className="text-3xl mb-2">{mood.emoji}</div>
                        <div className="text-white text-sm font-medium">{mood.label}</div>
                      </button>
                    ))}
                  </div>
                  
                  <Button 
                    onClick={handleSkipMoodCheck}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    Skip for now
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              {
                icon: MessageCircle,
                title: "Chat Rooms",
                description: "Join emotion-based conversations with others who understand",
                color: "from-blue-500 to-purple-500",
                route: "/chatroom"
              },
              {
                icon: Mail,
                title: "Direct Messages",
                description: "Have private one-on-one conversations",
                color: "from-indigo-500 to-purple-500",
                route: "/dms"
              },
              {
                icon: PenTool,
                title: "FeelNotes",
                description: "Share your story anonymously or read others' experiences",
                color: "from-purple-500 to-pink-500",
                route: "/feelnotes"
              },
              {
                icon: Users,
                title: "Support Circles",
                description: "Join small, intimate groups for deeper connections",
                color: "from-pink-500 to-red-500",
                route: "/supportcircles"
              },
              {
                icon: TrendingUp,
                title: "Mood Tracker",
                description: "Track your emotional journey and see your progress",
                color: "from-green-500 to-teal-500",
                route: "/moodtracker"
              },
            ].map((feature, index) => (
              <div
                key={index}
                onClick={() => navigate(feature.route)}
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
              <button 
                onClick={() => navigate("/moodtracker")}
                className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white border-0 rounded-full px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-green-500/30 transition-all duration-300 hover:scale-105 flex items-center justify-center"
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                Track My Mood
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
