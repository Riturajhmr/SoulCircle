import React, { useState, useEffect } from "react"
import { Star, PenTool, Heart, ArrowLeft, Clock, Plus, BookOpen, Users, TrendingUp } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../src/contexts/AuthContext"
import { getAllFeelNotes, saveUserFeelNote, likeFeelNote, getFeelNoteStats, listenToAllFeelNotes } from "../src/services/feelNotesService"
import Button from "../src/components/ui/button"
import Card from "../src/components/ui/card"
import Input from "../src/components/ui/input"
import Textarea from "../src/components/ui/textarea"

const emotions = [
  "💜 Peaceful",
  "😢 Sad",
  "😰 Anxious",
  "😡 Angry",
  "🤗 Hopeful",
  "😴 Tired",
  "🌟 Grateful",
  "💭 Thoughtful",
]

const categories = [
  "Daily Struggles",
  "Breakthrough Moments",
  "Relationships",
  "Self-Discovery",
  "Mental Health",
  "Life Changes",
]

const FeelNotesPage = () => {
  const [feelNotes, setFeelNotes] = useState([])
  const [showWriteForm, setShowWriteForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({ totalNotes: 0, totalLikes: 0, recentNotes: 0 })
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    emotion: "",
    category: "",
  })
  const navigate = useNavigate()
  const { currentUser } = useAuth()

  // Load all FeelNotes from all users
  useEffect(() => {
    const loadFeelNotes = async () => {
      try {
        setIsLoading(true)
        const [notes, feelNoteStats] = await Promise.all([
          getAllFeelNotes(100),
          getFeelNoteStats()
        ])
        setFeelNotes(notes)
        setStats(feelNoteStats)
      } catch (error) {
        console.error('Error loading FeelNotes:', error)
        // Fallback to sample data if Firebase fails
        setFeelNotes([
          {
            id: "sample1",
            title: "Finding Light in Dark Days",
            content: "Today was particularly hard. The weight of everything felt overwhelming, but I realized that even in my darkest moments, there's a tiny spark of hope that refuses to go out. Maybe that's enough for now. Maybe that's everything.",
            emotion: "😢 Sad",
            category: "Daily Struggles",
            likes: 12,
            createdAt: { seconds: Date.now() / 1000 - 7200 }
          },
          {
            id: "sample2", 
            title: "A Small Victory",
            content: "I managed to get out of bed today. It might seem small, but for me, it was everything. Sometimes the biggest battles are the quietest ones we fight within ourselves.",
            emotion: "🌟 Grateful",
            category: "Breakthrough Moments",
            likes: 8,
            createdAt: { seconds: Date.now() / 1000 - 14400 }
          }
        ])
      } finally {
        setIsLoading(false)
      }
    }

    loadFeelNotes()

    // Set up real-time listener
    const unsubscribe = listenToAllFeelNotes((notes) => {
      setFeelNotes(notes)
    })

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  const handleInputChange = (e) => {
    setNewNote({
      ...newNote,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!currentUser) {
      alert('Please log in to share your FeelNote')
      return
    }

    if (newNote.title && newNote.content) {
      try {
        const noteData = {
          title: newNote.title,
          content: newNote.content,
          emotion: newNote.emotion,
          category: newNote.category,
        }
        
        await saveUserFeelNote(currentUser.uid, noteData)
        
        // Refresh the notes
        const updatedNotes = await getAllFeelNotes(100)
        setFeelNotes(updatedNotes)
        
        setNewNote({
          title: "",
          content: "",
          emotion: "",
          category: "",
        })
        setShowWriteForm(false)
        
        alert('Your FeelNote has been shared with the community! 💜')
      } catch (error) {
        console.error('Error saving FeelNote:', error)
        alert('Error saving your FeelNote. Please try again.')
      }
    }
  }

  const handleLike = async (noteId, authorId) => {
    if (!currentUser) {
      alert('Please log in to like FeelNotes')
      return
    }

    try {
      const newLikeCount = await likeFeelNote(authorId, noteId)
      setFeelNotes(prevNotes => 
        prevNotes.map(note => 
          note.id === noteId ? { ...note, likes: newLikeCount } : note
        )
      )
    } catch (error) {
      console.error('Error liking FeelNote:', error)
      alert('Error liking FeelNote. Please try again.')
    }
  }

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Unknown time'
    
    const now = new Date()
    const noteTime = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp)
    const diffInMinutes = Math.floor((now - noteTime) / (1000 * 60))
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  const handleGoBack = () => {
    navigate("/dashboard")
  }

  if (isLoading) {
    return (
      <div
        className="min-h-screen relative overflow-hidden flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #1e215d 0%, #9461fd 40%, #d9afdf 100%)",
        }}
      >
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Loading community FeelNotes...</p>
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
        {[...Array(60)].map((_, i) => (
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

      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="flex items-center space-x-3">
          <PenTool className="w-6 h-6 text-purple-200" />
          <h1 className="text-xl font-bold text-white">FeelNotes</h1>
          <span className="text-purple-300 text-sm">Community Stories & Feelings</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setShowWriteForm(!showWriteForm)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Write FeelNote
          </Button>
          <Button
            onClick={handleGoBack}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 bg-transparent rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        {/* Community Stats */}
        <Card className="mb-6 p-6 bg-white/15 backdrop-blur-md border-white/30 rounded-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="flex items-center justify-center space-x-2">
              <BookOpen className="w-5 h-5 text-purple-300" />
              <div>
                <div className="text-2xl font-bold text-white">{stats.totalNotes}</div>
                <div className="text-purple-300 text-sm">Total FeelNotes</div>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Heart className="w-5 h-5 text-pink-300" />
              <div>
                <div className="text-2xl font-bold text-white">{stats.totalLikes}</div>
                <div className="text-purple-300 text-sm">Hearts Given</div>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-300" />
              <div>
                <div className="text-2xl font-bold text-white">{stats.recentNotes}</div>
                <div className="text-purple-300 text-sm">Today's Stories</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Write Form */}
        {showWriteForm && (
          <Card className="mb-6 p-6 bg-white/15 backdrop-blur-md border-white/30 rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <PenTool className="w-5 h-5 mr-2" />
              Share Your FeelNote
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                name="title"
                placeholder="Give your note a title..."
                value={newNote.title}
                onChange={handleInputChange}
                className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 rounded-xl"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  name="emotion"
                  value={newNote.emotion}
                  onChange={handleInputChange}
                  className="bg-white/10 border border-white/20 text-white rounded-xl px-3 py-2"
                >
                  <option value="">Select feeling...</option>
                  {emotions.map((emotion) => (
                    <option key={emotion} value={emotion} className="bg-slate-800">
                      {emotion}
                    </option>
                  ))}
                </select>
                <select
                  name="category"
                  value={newNote.category}
                  onChange={handleInputChange}
                  className="bg-white/10 border border-white/20 text-white rounded-xl px-3 py-2"
                >
                  <option value="">Select category...</option>
                  {categories.map((category) => (
                    <option key={category} value={category} className="bg-slate-800">
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <Textarea
                name="content"
                placeholder="Share what's in your heart... Your words might be exactly what someone else needs to hear."
                value={newNote.content}
                onChange={handleInputChange}
                className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 rounded-xl min-h-32"
                required
              />
              <div className="flex space-x-2">
                <Button
                  type="submit"
                  disabled={!newNote.title.trim() || !newNote.content.trim()}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 rounded-xl"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Publish FeelNote
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowWriteForm(false)}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 bg-transparent rounded-xl"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Feel Notes List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Users className="w-6 h-6 mr-2 text-purple-400" />
              Community FeelNotes
            </h2>
            <span className="text-purple-300">{feelNotes.length} stories shared</span>
          </div>
          
          {feelNotes.length === 0 ? (
            <Card className="p-8 text-center bg-white/15 backdrop-blur-md border-white/30 rounded-2xl">
              <BookOpen className="w-12 h-12 text-purple-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No FeelNotes yet</h3>
              <p className="text-purple-200 mb-4">Be the first to share your story with the community!</p>
              <Button
                onClick={() => setShowWriteForm(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Write First FeelNote
              </Button>
            </Card>
          ) : (
            feelNotes.map((note) => (
              <Card
                key={note.id}
                className="p-6 bg-white/15 backdrop-blur-md border-white/30 rounded-2xl hover:bg-white/20 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{note.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-purple-300">
                      <span>by Anonymous Soul</span>
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTimeAgo(note.createdAt)}
                      </span>
                      {note.category && (
                        <span className="bg-purple-500/20 px-2 py-1 rounded-full text-xs">{note.category}</span>
                      )}
                    </div>
                  </div>
                  {note.emotion && (
                    <span className="text-2xl">{note.emotion.split(" ")[0]}</span>
                  )}
                </div>
                <p className="text-purple-100 leading-relaxed mb-4">{note.content}</p>
                <div className="flex items-center justify-between">
                  <Button
                    onClick={() => handleLike(note.id, note.authorId)}
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10 bg-transparent rounded-xl"
                  >
                    <Heart className="w-4 h-4 mr-2 text-pink-400" />
                    {note.likes || 0} hearts
                  </Button>
                  {note.emotion && (
                    <span className="text-purple-300 text-sm">{note.emotion}</span>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default FeelNotesPage