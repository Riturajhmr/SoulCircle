import React, { useState, useEffect } from "react"
import { Moon, User, Settings, Calendar, Activity, LogOut, RefreshCw, ArrowLeft, Heart, Shield, Trash2, Plus, Users, BarChart3 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../src/contexts/AuthContext"
import { useUserData } from "../src/hooks/useUserData"
import { getUserFeelNotes } from "../src/services/feelNotesService"
import Card from "../src/components/ui/card"
import Button from "../src/components/ui/button"

const ProfilePage = () => {
  const navigate = useNavigate()
  const { currentUser, logout } = useAuth()
  const { 
    userProfile, 
    userActivities, 
    userPreferences, 
    questionResponses,
    loading, 
    error, 
    trackActivity,
    updateProfile,
    updatePreferences,
    refreshData
  } = useUserData()

  const [isUpdating, setIsUpdating] = useState(false)
  const [currentMood, setCurrentMood] = useState("")
  const [displayName, setDisplayName] = useState(userProfile?.displayName || "Soul Wanderer")
  const [moodHistory, setMoodHistory] = useState([])
  const [showMoodQuestion, setShowMoodQuestion] = useState(false)
  const [userFeelNotes, setUserFeelNotes] = useState([])

  // Get user's actual name or display name
  const userName = userProfile?.displayName || currentUser?.displayName || "Soul Wanderer"
  
  // Mood options
  const moodOptions = [
    { emoji: "🌙", label: "Calm", color: "from-blue-400 to-purple-400" },
    { emoji: "💜", label: "Hopeful", color: "from-purple-400 to-pink-400" },
    { emoji: "💧", label: "Sad", color: "from-blue-300 to-cyan-300" },
    { emoji: "🔥", label: "Energetic", color: "from-orange-400 to-red-400" },
    { emoji: "🌱", label: "Growing", color: "from-green-400 to-emerald-400" },
    { emoji: "☁️", label: "Numb", color: "from-gray-300 to-slate-300" }
  ]

  // Avatar options
  const avatarOptions = [
    { emoji: "🌙", name: "Moon Child" },
    { emoji: "🌸", name: "Flower Soul" },
    { emoji: "💫", name: "Star Gazer" },
    { emoji: "🦋", name: "Butterfly" },
    { emoji: "🌊", name: "Ocean Wave" },
    { emoji: "🌿", name: "Forest Spirit" }
  ]

  // Mock communities data
  const communities = [
    { name: "Night Owls Circle", emoji: "🌙", members: 234, color: "from-purple-500 to-indigo-500" },
    { name: "Healing Hearts", emoji: "💜", members: 189, color: "from-pink-500 to-rose-500" },
    { name: "Motivation Hub", emoji: "🔥", members: 156, color: "from-orange-500 to-red-500" },
    { name: "Calm Waters", emoji: "🌊", members: 98, color: "from-blue-500 to-cyan-500" }
  ]

  // Load mood history from Firebase
  useEffect(() => {
    const loadMoodHistory = async () => {
      if (currentUser) {
        try {
          // Load mood history from user's activities
          const activities = userActivities.filter(activity => activity.type === 'mood_check')
          const moodData = activities.map(activity => ({
            date: activity.metadata?.date || activity.timestamp,
            mood: activity.metadata?.mood || 'Unknown',
            emoji: activity.metadata?.emoji || '❓',
            timestamp: activity.timestamp
          }))
          setMoodHistory(moodData)
        } catch (error) {
          console.error('Error loading mood history:', error)
        }
      }
    }
    loadMoodHistory()
  }, [currentUser, userActivities])

  // Load user's FeelNotes
  useEffect(() => {
    const loadUserFeelNotes = async () => {
      if (currentUser) {
        try {
          const notes = await getUserFeelNotes(currentUser.uid, 10) // Last 10 notes
          setUserFeelNotes(notes)
        } catch (error) {
          console.error('Error loading user FeelNotes:', error)
        }
      }
    }
    loadUserFeelNotes()
  }, [currentUser])

  // Check if user has answered mood question today
  useEffect(() => {
    const checkTodayMood = () => {
      if (currentUser) {
        const today = new Date().toDateString()
        
        // Check localStorage first (faster)
        const lastMoodCheck = localStorage.getItem(`moodCheck_${currentUser.uid}`)
        if (lastMoodCheck === today) {
          console.log('✅ Mood already checked today (localStorage)')
          return
        }
        
        // Check mood history
        const todayMood = moodHistory.find(mood => 
          new Date(mood.date?.seconds ? mood.date.seconds * 1000 : mood.date).toDateString() === today
        )
        if (todayMood) {
          console.log('✅ Mood already checked today (moodHistory)')
          localStorage.setItem(`moodCheck_${currentUser.uid}`, today)
          return
        }
        
        // If no mood check found for today, show the question
        console.log('❌ No mood check found for today, showing question')
        setShowMoodQuestion(true)
      }
    }
    
    const timer = setTimeout(checkTodayMood, 1000)
    return () => clearTimeout(timer)
  }, [currentUser, moodHistory])

  // Generate weekly mood summary
  const getWeeklyMoodSummary = () => {
    const last7Days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
      
      const dayMoods = moodHistory.filter(mood => {
        const moodDate = new Date(mood.date?.seconds ? mood.date.seconds * 1000 : mood.date)
        return moodDate.toDateString() === date.toDateString()
      })
      
      last7Days.push({
        day: dayName,
        date: date.toDateString(),
        moods: dayMoods,
        primaryMood: dayMoods.length > 0 ? dayMoods[dayMoods.length - 1] : null
      })
    }
    return last7Days
  }

  const weeklySummary = getWeeklyMoodSummary()

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
      
      setCurrentMood(mood)
      setShowMoodQuestion(false)
      
      // Refresh data to update mood history
      await refreshData()
      
      console.log(`✅ Mood saved: ${mood} for ${today}`)
      alert(`Thank you for sharing your mood! ${selectedMood?.emoji}`)
    } catch (err) {
      console.error('Error saving mood:', err)
      alert(`Error saving mood: ${err.message}`)
    }
  }

  const handleTrackActivity = async (activityType) => {
    try {
      await trackActivity({
        type: activityType,
        description: `User performed ${activityType} action`,
        metadata: { timestamp: new Date().toISOString() }
      })
      alert(`Activity '${activityType}' tracked!`)
    } catch (err) {
      alert(`Error tracking activity: ${err.message}`)
    }
  }

  const handleUpdateProfile = async () => {
    setIsUpdating(true)
    try {
      await updateProfile({ profileViews: (userProfile?.profileViews || 0) + 1 })
      alert('Profile updated (view count increased)!')
    } catch (err) {
      alert(`Error updating profile: ${err.message}`)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUpdatePreferences = async (key, value) => {
    try {
      await updatePreferences({ [key]: value })
      alert(`Preference '${key}' updated to '${value}'!`)
    } catch (err) {
      alert(`Error updating preference: ${err.message}`)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (err) {
      alert(`Error logging out: ${err.message}`)
    }
  }

  if (loading) {
    return (
      <div
        className="min-h-screen relative overflow-hidden flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #1e215d 0%, #9461fd 40%, #d9afdf 100%)",
        }}
      >
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div
        className="min-h-screen relative overflow-hidden flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #1e215d 0%, #9461fd 40%, #d9afdf 100%)",
        }}
      >
        <div className="text-center text-white">
          <p className="text-xl mb-4">Please log in to view your profile.</p>
          <Button onClick={() => navigate('/login')} className="bg-purple-500 hover:bg-purple-600 text-white">
            Go to Login
          </Button>
        </div>
      </div>
    )
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
            <div className="w-1 h-1 bg-white opacity-60 rounded-full"></div>
          </div>
        ))}
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/10 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate('/dashboard')}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 rounded-full px-6 py-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center space-x-2">
                <Moon className="w-6 h-6 text-purple-200" />
                <span className="text-white font-semibold text-lg">SoulCircle</span>
              </div>
            </div>
            
            {/* User Actions */}
            <div className="flex items-center space-x-3">
              <Button
                onClick={refreshData}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 rounded-full p-2"
                title="Refresh your data"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
              Your Space
            </h1>
            <p className="text-xl text-purple-200 max-w-2xl mx-auto">
              This is your safe corner — customize it as you like. 🌙
            </p>
          </div>

          {/* User Profile & Identity */}
          <Card className="p-8 bg-white/10 backdrop-blur-md border-white/20 rounded-3xl">
            <div className="text-center space-y-6">
              {/* Avatar Selection */}
              <div className="flex justify-center">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-4xl shadow-lg">
                  🌙
                </div>
              </div>
              
              {/* User Name */}
              <div className="space-y-2">
                <p className="text-3xl font-bold text-white">Welcome, {userName}! 🌸</p>
                <p className="text-purple-200">Your safe space for healing and growth</p>
              </div>

              {/* Display Name Editor */}
              <div className="flex items-center justify-center space-x-3">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="bg-white/20 border border-white/30 rounded-full px-4 py-2 text-white text-center placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="Your display name..."
                />
                <Button 
                  onClick={() => updateProfile({ displayName: displayName })}
                  className="bg-purple-500/20 hover:bg-purple-500/30 text-white border-purple-300/30"
                >
                  Save
                </Button>
              </div>
            </div>
          </Card>

          {/* Daily Mood Question */}
          {showMoodQuestion && (
            <Card className="p-8 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md border-purple-300/30 rounded-3xl">
              <div className="text-center space-y-6">
                <h2 className="text-2xl font-semibold text-white">
                  How are you feeling today, {userName}? 💫
                </h2>
                <p className="text-purple-200">Take a moment to check in with yourself</p>
                
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
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
              </div>
            </Card>
          )}

          {/* Mood Tracker Section */}
          <Card className="p-8 bg-white/10 backdrop-blur-md border-white/20 rounded-3xl">
            <h2 className="text-2xl font-semibold text-white mb-6 text-center">
              Your Mood Journey 💫
            </h2>
            
            {/* Current Mood Display */}
            {currentMood && (
              <div className="text-center mb-6">
                <p className="text-purple-200 mb-2">Today's mood:</p>
                <div className="inline-flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2">
                  <span className="text-2xl">
                    {moodOptions.find(m => m.label === currentMood)?.emoji}
                  </span>
                  <span className="text-white font-semibold">{currentMood}</span>
                </div>
              </div>
            )}

            {/* Weekly Mood Chart */}
            <div className="bg-white/10 rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 text-center">This Week's Mood Pattern</h3>
              <div className="flex justify-between items-end space-x-2">
                {weeklySummary.map((day, index) => (
                  <div key={index} className="flex flex-col items-center space-y-2 flex-1">
                    <div className="text-2xl">
                      {day.primaryMood ? day.primaryMood.emoji : '⚪'}
                    </div>
                    <div className="text-white text-sm font-medium">{day.day}</div>
                    <div className="text-purple-200 text-xs">
                      {day.moods.length > 0 ? `${day.moods.length} mood${day.moods.length > 1 ? 's' : ''}` : 'No data'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mood Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-white">
                  {moodHistory.length}
                </div>
                <div className="text-purple-200 text-sm">Total Mood Checks</div>
              </div>
              <div className="bg-white/10 rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-white">
                  {weeklySummary.filter(day => day.moods.length > 0).length}
                </div>
                <div className="text-purple-200 text-sm">Active Days This Week</div>
              </div>
              <div className="bg-white/10 rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-white">
                  {moodHistory.length > 0 ? 
                    moodOptions.find(m => m.label === moodHistory[moodHistory.length - 1]?.mood)?.emoji || '❓' 
                    : '❓'
                  }
                </div>
                <div className="text-purple-200 text-sm">Most Recent Mood</div>
              </div>
            </div>

            {/* Mood Pattern Analysis */}
            {moodHistory.length > 0 && (
              <div className="bg-white/10 rounded-2xl p-6 mt-6">
                <h4 className="text-lg font-semibold text-white mb-4 text-center">Mood Pattern Insights</h4>
                <div className="space-y-3">
                  {(() => {
                    const moodCounts = {}
                    moodHistory.forEach(mood => {
                      moodCounts[mood.mood] = (moodCounts[mood.mood] || 0) + 1
                    })
                    const mostCommonMood = Object.keys(moodCounts).reduce((a, b) => 
                      moodCounts[a] > moodCounts[b] ? a : b
                    )
                    const mostCommonEmoji = moodOptions.find(m => m.label === mostCommonMood)?.emoji || '❓'
                    
                    return (
                      <div className="text-center">
                        <p className="text-purple-200 mb-2">Your most common mood this week:</p>
                        <div className="inline-flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2">
                          <span className="text-2xl">{mostCommonEmoji}</span>
                          <span className="text-white font-semibold">{mostCommonMood}</span>
                          <span className="text-purple-300 text-sm">({moodCounts[mostCommonMood]} times)</span>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>
            )}

            {/* Manual Mood Check Button */}
            <div className="text-center mt-6">
              <Button 
                onClick={() => setShowMoodQuestion(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl px-6 py-3"
              >
                Check In Again 💫
              </Button>
            </div>
          </Card>

              {/* FeelNotes Section */}
              <Card className="p-8 bg-white/10 backdrop-blur-md border-white/20 rounded-3xl">
                <h2 className="text-2xl font-semibold text-white mb-6 text-center">
                  My Reflections ✍️
                </h2>
                
                <div className="space-y-4 mb-6">
                  {userFeelNotes.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">📝</div>
                      <p className="text-purple-200 mb-4">You haven't written any FeelNotes yet</p>
                      <p className="text-purple-300 text-sm">Share your thoughts with the community</p>
                    </div>
                  ) : (
                    userFeelNotes.slice(0, 3).map((note, index) => (
                      <div key={note.id} className="bg-white/10 rounded-2xl p-4 border border-white/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-purple-200 text-sm">
                            {note.title || `Reflection #${index + 1}`}
                          </span>
                          <span className="text-purple-300 text-xs">
                            {note.createdAt ? 
                              new Date(note.createdAt.seconds * 1000).toLocaleDateString() : 
                              'Recently'
                            }
                          </span>
                        </div>
                        <p className="text-white text-sm line-clamp-2">
                          {note.content}
                        </p>
                        {note.emotion && (
                          <div className="flex items-center mt-2">
                            <span className="text-lg mr-2">{note.emotion.split(' ')[0]}</span>
                            <span className="text-purple-300 text-xs">{note.emotion}</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="flex space-x-3">
                  <Button 
                    onClick={() => navigate('/feelnotes')}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl py-4 text-lg font-semibold"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Write New FeelNote
                  </Button>
                  {userFeelNotes.length > 0 && (
                    <Button 
                      onClick={() => navigate('/feelnotes')}
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30 rounded-2xl py-4 px-6"
                    >
                      View All
                    </Button>
                  )}
                </div>
              </Card>

          {/* Communities Section */}
          <Card className="p-8 bg-white/10 backdrop-blur-md border-white/20 rounded-3xl">
            <h2 className="text-2xl font-semibold text-white mb-6 text-center">
              Your Circles 🌸
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {communities.map((community, index) => (
                <div key={index} className={`bg-gradient-to-r ${community.color} rounded-2xl p-4 text-white`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{community.emoji}</span>
                    <span className="text-sm opacity-80">{community.members} souls</span>
                  </div>
                  <h3 className="font-semibold text-lg">{community.name}</h3>
                </div>
              ))}
            </div>

            <Button 
              onClick={() => navigate('/dashboard')}
              className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30 rounded-2xl py-4 text-lg font-semibold"
            >
              <Users className="w-5 h-5 mr-2" />
              Discover New Circles
            </Button>
          </Card>

          {/* Safety & Privacy */}
          <Card className="p-8 bg-white/10 backdrop-blur-md border-white/20 rounded-3xl">
            <div className="text-center space-y-4">
              <Shield className="w-12 h-12 text-purple-300 mx-auto" />
              <h2 className="text-2xl font-semibold text-white">Safety & Privacy</h2>
              <p className="text-purple-200 text-lg">
                You are anonymous here. No personal data is ever shared. 🌙
              </p>
              <div className="flex justify-center space-x-4">
                <Button 
                  onClick={() => {
                    if (confirm("This will clear all your notes and chat history. Are you sure?")) {
                      alert("History cleared (this is a demo)")
                    }
                  }}
                  className="bg-red-500/20 hover:bg-red-500/30 text-white border-red-300/30"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear History
                </Button>
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="bg-purple-500/20 hover:bg-purple-500/30 text-white border-purple-300/30"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </Card>

          {/* Footer */}
          <div className="text-center space-y-4 pb-8">
            <p className="text-purple-300 italic text-lg">
              "Healing takes time, and SoulCircle walks with you." 🌙
            </p>
            <div className="flex justify-center space-x-4">
              <Button 
                onClick={handleLogout}
                className="bg-red-500/20 hover:bg-red-500/30 text-white border-red-300/30"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
