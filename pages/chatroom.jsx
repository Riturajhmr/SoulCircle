import React, { useState, useEffect, useRef } from "react"
import { Star, Send, Users, MessageCircle, ArrowLeft, Clock } from "lucide-react"
import { useNavigate } from "react-router-dom"
import Button from "../src/components/ui/button"
import Card from "../src/components/ui/card"
import Input from "../src/components/ui/input"

const emotions = ["😊", "😢", "😰", "😡", "😴", "🤗", "💜", "🌟"]
const userColors = [
  "text-purple-300",
  "text-pink-300",
  "text-blue-300",
  "text-green-300",
  "text-yellow-300",
  "text-orange-300",
  "text-red-300",
  "text-indigo-300",
]

const ChatroomPage = () => {
  const [messages, setMessages] = useState([])
  const [currentMessage, setCurrentMessage] = useState("")
  const [username, setUsername] = useState("")
  const [isJoined, setIsJoined] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState([])
  const [selectedEmotion, setSelectedEmotion] = useState("")
  const messagesEndRef = useRef(null)
  const [userColor, setUserColor] = useState("")
  const navigate = useNavigate()

  // Simulate real-time messaging (in a real app, you'd use WebSocket or similar)
  useEffect(() => {
    if (isJoined) {
      // Simulate other users joining and sending messages
      const interval = setInterval(() => {
        if (Math.random() > 0.7) {
          const randomUsers = ["Anonymous Soul", "Peaceful Mind", "Hopeful Heart", "Gentle Spirit", "Caring Friend"]
          const randomMessages = [
            "I'm feeling better today, thanks to everyone here 💜",
            "Sometimes it's okay to not be okay",
            "This community gives me hope",
            "Sending virtual hugs to everyone 🤗",
            "You're not alone in this journey",
            "Taking it one day at a time",
            "Grateful for this safe space",
          ]
          const newMessage = {
            id: Date.now().toString() + Math.random(),
            username: randomUsers[Math.floor(Math.random() * randomUsers.length)],
            message: randomMessages[Math.floor(Math.random() * randomMessages.length)],
            timestamp: new Date(),
            emotion: emotions[Math.floor(Math.random() * emotions.length)],
            color: userColors[Math.floor(Math.random() * userColors.length)],
          }
          setMessages((prev) => [...prev, newMessage])
        }
      }, 8000)
      return () => clearInterval(interval)
    }
  }, [isJoined])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleJoinChat = () => {
    if (username.trim()) {
      setIsJoined(true)
      setUserColor(userColors[Math.floor(Math.random() * userColors.length)])
      // Add welcome message
      const welcomeMessage = {
        id: Date.now().toString(),
        username: "SoulCircle",
        message: `Welcome ${username}! Feel free to share what's on your mind. 💜`,
        timestamp: new Date(),
        color: "text-purple-400",
      }
      setMessages([welcomeMessage])
      // Simulate online users
      setOnlineUsers([
        { id: "1", username: "Anonymous Soul", color: "text-purple-300", isOnline: true },
        { id: "2", username: "Peaceful Mind", color: "text-pink-300", isOnline: true },
        { id: "3", username: "Hopeful Heart", color: "text-blue-300", isOnline: true },
        { id: "4", username: username, color: userColor, isOnline: true },
      ])
    }
  }

  const handleSendMessage = () => {
    if (currentMessage.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        username: username,
        message: currentMessage,
        timestamp: new Date(),
        emotion: selectedEmotion,
        color: userColor,
      }
      setMessages((prev) => [...prev, newMessage])
      setCurrentMessage("")
      setSelectedEmotion("")
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (isJoined) {
        handleSendMessage()
      } else {
        handleJoinChat()
      }
    }
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const handleGoBack = () => {
    navigate("/dashboard")
  }

  if (!isJoined) {
    return (
      <div
        className="min-h-screen relative overflow-hidden flex items-center justify-center"
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
        <Card className="w-full max-w-md p-8 bg-gradient-to-br from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-md border-white/30 rounded-3xl">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <MessageCircle className="w-8 h-8 text-purple-200" />
              <h1 className="text-2xl font-bold text-white">Join Chat Room</h1>
            </div>
            <p className="text-purple-200">Enter a username to start chatting anonymously</p>
          </div>
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Choose your anonymous name..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 rounded-xl"
            />
            <Button
              onClick={handleJoinChat}
              disabled={!username.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 rounded-xl py-3"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Join Chat Room
            </Button>
            <Button
              onClick={handleGoBack}
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white/10 bg-transparent rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </Card>
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
            <Star className="w-1 h-1 text-white opacity-60 fill-current" />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="flex items-center space-x-3">
          <MessageCircle className="w-6 h-6 text-purple-200" />
          <h1 className="text-xl font-bold text-white">SoulCircle Chat</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-purple-300" />
            <span className="text-purple-200 text-sm">{onlineUsers.length} online</span>
          </div>
          <Button
            onClick={handleGoBack}
            variant="outline"
            size="sm"
            className="border-white/20 text-white hover:bg-white/10 bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Online Users Sidebar */}
        <div className="w-64 bg-white/5 backdrop-blur-sm border-r border-white/20 p-4">
          <h3 className="text-white font-semibold mb-4 flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Online Now
          </h3>
          <div className="space-y-2">
            {onlineUsers.map((user) => (
              <div key={user.id} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className={`text-sm ${user.color}`}>{user.username}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${message.color}`}>{message.username}</span>
                  <span className="text-xs text-purple-300 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatTime(message.timestamp)}
                  </span>
                  {message.emotion && <span className="text-sm">{message.emotion}</span>}
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 max-w-md">
                  <p className="text-white">{message.message}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 bg-white/5 backdrop-blur-sm border-t border-white/20">
            {/* Emotion Selector */}
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-purple-200 text-sm">Feeling:</span>
              {emotions.map((emotion) => (
                <button
                  key={emotion}
                  onClick={() => setSelectedEmotion(selectedEmotion === emotion ? "" : emotion)}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    selectedEmotion === emotion ? "bg-purple-500/30 scale-110" : "bg-white/10 hover:bg-white/20"
                  }`}
                >
                  {emotion}
                </button>
              ))}
            </div>

            {/* Message Input */}
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Share what's on your mind..."
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-purple-300 rounded-xl"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!currentMessage.trim()}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 rounded-xl px-6"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatroomPage
