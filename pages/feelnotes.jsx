import React, { useState, useEffect } from "react"
import { Star, PenTool, Heart, ArrowLeft, Clock, Plus, BookOpen } from "lucide-react"
import { useNavigate } from "react-router-dom"
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
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    author: "",
    emotion: "",
    category: "",
  })
  const navigate = useNavigate()

  // Sample feel notes
  useEffect(() => {
    const sampleNotes = [
      {
        id: "1",
        title: "Finding Light in Dark Days",
        content:
          "Today was particularly hard. The weight of everything felt overwhelming, but I realized that even in my darkest moments, there's a tiny spark of hope that refuses to go out. Maybe that's enough for now. Maybe that's everything.",
        author: "Anonymous Soul",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        emotion: "💜 Peaceful",
        likes: 12,
        category: "Daily Struggles",
      },
      {
        id: "2",
        title: "The Power of Small Victories",
        content:
          "I got out of bed today. I made my coffee. I answered a text from a friend. These might seem like nothing to others, but for me, they're mountains I've climbed. Celebrating the small wins because they're not small at all.",
        author: "Hopeful Heart",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        emotion: "🌟 Grateful",
        likes: 18,
        category: "Breakthrough Moments",
      },
      {
        id: "3",
        title: "Learning to Be Gentle with Myself",
        content:
          "I'm learning that healing isn't linear. Some days I feel strong, others I feel broken. Both are okay. Both are part of the journey. I'm trying to speak to myself the way I would speak to a dear friend.",
        author: "Gentle Spirit",
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
        emotion: "💭 Thoughtful",
        likes: 25,
        category: "Self-Discovery",
      },
    ]
    setFeelNotes(sampleNotes)
  }, [])

  const handleSubmitNote = () => {
    if (newNote.title.trim() && newNote.content.trim() && newNote.author.trim()) {
      const feelNote = {
        id: Date.now().toString(),
        title: newNote.title,
        content: newNote.content,
        author: newNote.author,
        timestamp: new Date(),
        emotion: newNote.emotion || "💭 Thoughtful",
        likes: 0,
        category: newNote.category || "Daily Struggles",
      }
      setFeelNotes((prev) => [feelNote, ...prev])
      setNewNote({ title: "", content: "", author: "", emotion: "", category: "" })
      setShowWriteForm(false)
    }
  }

  const handleLike = (id) => {
    setFeelNotes((prev) => prev.map((note) => (note.id === id ? { ...note, likes: note.likes + 1 } : note)))
  }

  const formatTime = (date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  const handleGoBack = () => {
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
          <span className="text-purple-300 text-sm">Anonymous Stories & Feelings</span>
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
        {/* Write Form */}
        {showWriteForm && (
          <Card className="mb-6 p-6 bg-white/15 backdrop-blur-md border-white/30 rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <PenTool className="w-5 h-5 mr-2" />
              Share Your FeelNote
            </h3>
            <div className="space-y-4">
              <Input
                placeholder="Give your note a title..."
                value={newNote.title}
                onChange={(e) => setNewNote((prev) => ({ ...prev, title: e.target.value }))}
                className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 rounded-xl"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Your anonymous name..."
                  value={newNote.author}
                  onChange={(e) => setNewNote((prev) => ({ ...prev, author: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 rounded-xl"
                />
                <select
                  value={newNote.emotion}
                  onChange={(e) => setNewNote((prev) => ({ ...prev, emotion: e.target.value }))}
                  className="bg-white/10 border border-white/20 text-white rounded-xl px-3 py-2"
                >
                  <option value="">Select feeling...</option>
                  {emotions.map((emotion) => (
                    <option key={emotion} value={emotion} className="bg-slate-800">
                      {emotion}
                    </option>
                  ))}
                </select>
              </div>
              <select
                value={newNote.category}
                onChange={(e) => setNewNote((prev) => ({ ...prev, category: e.target.value }))}
                className="bg-white/10 border border-white/20 text-white rounded-xl px-3 py-2 w-full"
              >
                <option value="">Select category...</option>
                {categories.map((category) => (
                  <option key={category} value={category} className="bg-slate-800">
                    {category}
                  </option>
                ))}
              </select>
              <Textarea
                placeholder="Share what's in your heart... Your words might be exactly what someone else needs to hear."
                value={newNote.content}
                onChange={(e) => setNewNote((prev) => ({ ...prev, content: e.target.value }))}
                className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 rounded-xl min-h-32"
              />
              <div className="flex space-x-2">
                <Button
                  onClick={handleSubmitNote}
                  disabled={!newNote.title.trim() || !newNote.content.trim() || !newNote.author.trim()}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 rounded-xl"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Publish FeelNote
                </Button>
                <Button
                  onClick={() => setShowWriteForm(false)}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 bg-transparent rounded-xl"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Feel Notes List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Heart className="w-6 h-6 mr-2 text-pink-400" />
              Community FeelNotes
            </h2>
            <span className="text-purple-300">{feelNotes.length} stories shared</span>
          </div>
          {feelNotes.map((note) => (
            <Card
              key={note.id}
              className="p-6 bg-white/15 backdrop-blur-md border-white/30 rounded-2xl hover:bg-white/20 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{note.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-purple-300">
                    <span>by {note.author}</span>
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTime(note.timestamp)}
                    </span>
                    <span className="bg-purple-500/20 px-2 py-1 rounded-full text-xs">{note.category}</span>
                  </div>
                </div>
                <span className="text-2xl">{note.emotion.split(" ")[0]}</span>
              </div>
              <p className="text-purple-100 leading-relaxed mb-4">{note.content}</p>
              <div className="flex items-center justify-between">
                <Button
                  onClick={() => handleLike(note.id)}
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10 bg-transparent rounded-xl"
                >
                  <Heart className="w-4 h-4 mr-2 text-pink-400" />
                  {note.likes} hearts
                </Button>
                <span className="text-purple-300 text-sm">{note.emotion}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FeelNotesPage
