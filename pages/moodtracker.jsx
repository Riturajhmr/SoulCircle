import React, { useState, useEffect } from "react"
import { Moon, Star, Heart, Calendar, TrendingUp, ArrowLeft, Plus, Edit3 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import Button from "../src/components/ui/button"
import Card from "../src/components/ui/card"

const moodOptions = [
  { name: "Amazing", emoji: "🌟", color: "from-yellow-400 to-orange-400", intensity: 5 },
  { name: "Great", emoji: "😊", color: "from-green-400 to-emerald-400", intensity: 4 },
  { name: "Good", emoji: "🙂", color: "from-blue-400 to-cyan-400", intensity: 3 },
  { name: "Okay", emoji: "😐", color: "from-gray-400 to-slate-400", intensity: 2 },
  { name: "Low", emoji: "😔", color: "from-purple-400 to-indigo-400", intensity: 1 },
  { name: "Struggling", emoji: "😢", color: "from-blue-500 to-purple-500", intensity: 0 },
]

const MoodTrackerPage = () => {
  const [entries, setEntries] = useState([])
  const [selectedMood, setSelectedMood] = useState("")
  const [note, setNote] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [view, setView] = useState("today")
  const navigate = useNavigate()

  // Helper function to safely get mood name
  const getMoodName = (mood) => {
    if (typeof mood === 'string') return mood
    if (typeof mood === 'object' && mood?.label) return mood.label
    if (typeof mood === 'object' && mood?.name) return mood.name
    return "Good" // fallback
  }

  useEffect(() => {
    // Load mood entries from localStorage
    const savedEntries = localStorage.getItem("soulcircle-mood-entries")
    if (savedEntries) {
      try {
        const parsedEntries = JSON.parse(savedEntries)
        // Ensure entries is always an array and normalize entry format
        const validEntries = Array.isArray(parsedEntries) 
          ? parsedEntries.map(entry => {
              if (!entry || !entry.id || !entry.date) return null
              
              // Normalize mood format
              return {
                ...entry,
                mood: getMoodName(entry.mood),
              }
            }).filter(entry => entry !== null)
          : []
        setEntries(validEntries)
      } catch (error) {
        console.error("Error parsing saved mood entries:", error)
        // Clear corrupted data
        localStorage.removeItem("soulcircle-mood-entries")
        setEntries([])
      }
    }
  }, [])

  const saveMoodEntry = () => {
    if (!selectedMood) return

    const moodData = moodOptions.find((m) => m.name === selectedMood)
    if (!moodData) return

    const newEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      mood: selectedMood,
      intensity: moodData.intensity,
      note: note.trim(),
      timestamp: Date.now(),
    }

    const updatedEntries = [newEntry, ...entries]
    setEntries(updatedEntries)
    localStorage.setItem("soulcircle-mood-entries", JSON.stringify(updatedEntries))

    // Reset form
    setSelectedMood("")
    setNote("")
    setShowAddForm(false)
  }

  const getTodaysEntry = () => {
    const today = new Date().toLocaleDateString()
    return entries.find((entry) => entry.date === today)
  }

  const getWeeklyAverage = () => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    const weekEntries = entries.filter((entry) => entry.timestamp > weekAgo)
    if (weekEntries.length === 0) return 0
    const sum = weekEntries.reduce((acc, entry) => acc + entry.intensity, 0)
    return Math.round((sum / weekEntries.length) * 10) / 10
  }

  const handleBack = () => {
    navigate("/dashboard")
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

      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="flex items-center space-x-3">
          <TrendingUp className="w-6 h-6 text-purple-200" />
          <h1 className="text-xl font-bold text-white">Mood Tracker</h1>
          <span className="text-purple-300 text-sm">Track Your Daily Journey</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleBack}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 bg-transparent rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-6 max-w-4xl mx-auto">
        {/* View Toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-xl p-1">
            <button
              onClick={() => setView("today")}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                view === "today" ? "bg-white/20 text-white" : "text-white/70 hover:text-white"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setView("history")}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                view === "history" ? "bg-white/20 text-white" : "text-white/70 hover:text-white"
              }`}
            >
              History
            </button>
          </div>
        </div>

        {view === "today" ? (
          <>
            {/* Today's Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Today's Mood */}
              <Card className="bg-white/15 backdrop-blur-md border-white/30 p-6 rounded-2xl">
                <div className="flex items-center space-x-3 mb-4">
                  <Heart className="w-5 h-5 text-pink-400" />
                  <h3 className="text-white font-semibold">Today's Mood</h3>
                </div>
{(() => {
                  const todayEntry = getTodaysEntry()
                  if (todayEntry) {
                    const moodName = getMoodName(todayEntry.mood)
                    const moodData = moodOptions.find((m) => m.name === moodName)
                    return (
                      <div className="text-center">
                        <div className="text-4xl mb-2">
                          {moodData?.emoji || "😊"}
                        </div>
                        <p className="text-purple-200 font-medium">{moodName}</p>
                      </div>
                    )
                  } else {
                    return <p className="text-purple-300 text-center">Not tracked yet</p>
                  }
                })()}
              </Card>

              {/* Weekly Average */}
              <Card className="bg-white/15 backdrop-blur-md border-white/30 p-6 rounded-2xl">
                <div className="flex items-center space-x-3 mb-4">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <h3 className="text-white font-semibold">Weekly Average</h3>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">{getWeeklyAverage() || "—"}</div>
                  <p className="text-purple-200 text-sm">out of 5</p>
                </div>
              </Card>

              {/* Total Entries */}
              <Card className="bg-white/15 backdrop-blur-md border-white/30 p-6 rounded-2xl">
                <div className="flex items-center space-x-3 mb-4">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <h3 className="text-white font-semibold">Total Entries</h3>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">{entries.length}</div>
                  <p className="text-purple-200 text-sm">mood entries</p>
                </div>
              </Card>
            </div>

            {/* Add Mood Entry */}
            {!showAddForm && !getTodaysEntry() && (
              <Card className="bg-white/15 backdrop-blur-md border-white/30 p-8 rounded-2xl mb-8 text-center">
                <div className="text-6xl mb-4">🌙</div>
                <h3 className="text-2xl font-bold text-white mb-4">How are you feeling today?</h3>
                <p className="text-purple-200 mb-6 text-lg">Take a moment to check in with yourself</p>
                <Button
                  onClick={() => setShowAddForm(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Track My Mood
                </Button>
              </Card>
            )}

            {/* Mood Entry Form */}
            {showAddForm && (
              <Card className="bg-white/15 backdrop-blur-md border-white/30 p-8 rounded-2xl mb-8">
                <h3 className="text-2xl font-bold text-white mb-8 text-center flex items-center justify-center">
                  <Heart className="w-6 h-6 mr-2 text-pink-400" />
                  How are you feeling right now?
                </h3>

                {/* Mood Selection */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  {moodOptions.map((mood) => (
                    <button
                      key={mood.name}
                      onClick={() => setSelectedMood(mood.name)}
                      className={`p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                        selectedMood === mood.name
                          ? "border-purple-400 bg-purple-500/30 scale-105"
                          : "border-white/30 hover:border-white/50 hover:bg-white/10"
                      }`}
                    >
                      <div className="text-4xl mb-3">{mood.emoji}</div>
                      <p className="text-white font-medium">{mood.name}</p>
                    </button>
                  ))}
                </div>

                {/* Note Input */}
                <div className="mb-8">
                  <label className="block text-white font-medium mb-3 text-lg flex items-center">
                    <Edit3 className="w-5 h-5 mr-2" />
                    Add a note (optional)
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="What's on your mind? How was your day? What influenced your mood today?"
                    className="w-full p-4 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none"
                    rows={4}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <Button
                    onClick={() => setShowAddForm(false)}
                    variant="outline"
                    className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white border-white/30 rounded-xl font-medium"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={saveMoodEntry}
                    disabled={!selectedMood}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all duration-200"
                  >
                    Save Entry
                  </Button>
                </div>
              </Card>
            )}

            {/* Today's Entry Display */}
            {getTodaysEntry() && (
              <Card className="bg-white/15 backdrop-blur-md border-white/30 p-6 rounded-2xl">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-blue-400" />
                  Today's Entry
                </h3>
                <div className="flex items-start space-x-4">
                  {(() => {
                    const todayEntry = getTodaysEntry()
                    if (todayEntry) {
                      const moodName = getMoodName(todayEntry.mood)
                      const moodData = moodOptions.find((m) => m.name === moodName)
                      return (
                        <>
                          <div className="text-5xl">{moodData?.emoji || "😊"}</div>
                          <div className="flex-1">
                            <p className="text-white font-semibold text-lg mb-1">{moodName}</p>
                            <p className="text-purple-300 mb-3">{todayEntry.date || "Today"}</p>
                            {todayEntry.note && (
                              <div className="bg-white/10 p-4 rounded-xl">
                                <p className="text-purple-100 italic">"{todayEntry.note}"</p>
                              </div>
                            )}
                          </div>
                        </>
                      )
                    }
                    return null
                  })()}
                </div>
              </Card>
            )}
          </>
        ) : (
          /* History View */
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Calendar className="w-6 h-6 mr-2 text-purple-400" />
              Mood History
            </h2>
            {entries.length === 0 ? (
              <Card className="bg-white/15 backdrop-blur-md border-white/30 p-8 rounded-2xl text-center">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-white mb-3">No entries yet</h3>
                <p className="text-purple-200 text-lg">Start tracking your mood to see your history here</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {entries.map((entry) => {
                  const moodName = getMoodName(entry.mood)
                  const moodData = moodOptions.find((m) => m.name === moodName)
                  return (
                    <Card
                      key={entry.id}
                      className="bg-white/15 backdrop-blur-md border-white/30 p-6 rounded-2xl hover:bg-white/20 transition-all duration-300"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="text-3xl">{moodData?.emoji || "😊"}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-white font-semibold text-lg">{moodName}</p>
                            <p className="text-purple-300">{entry.date || "Unknown date"}</p>
                          </div>
                          {entry.note && (
                            <div className="bg-white/10 p-3 rounded-lg">
                              <p className="text-purple-100 italic">"{entry.note}"</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MoodTrackerPage