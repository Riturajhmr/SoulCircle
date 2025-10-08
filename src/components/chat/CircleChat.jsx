import React, { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Send, Smile, MoreVertical, Users, Wifi, WifiOff, X, Share2, Settings } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { 
  listenToCircleMessages, 
  sendCircleMessage,
  getCircleMembers
} from '../../services/circlesService'
import Button from '../ui/button'

const CircleChat = ({ circle, onBack, onShowInvite, onShowMembers, isCreator }) => {
  const { currentUser } = useAuth()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [members, setMembers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!circle?.id) return

    const unsubscribe = listenToCircleMessages(circle.id, (newMessages) => {
      setMessages(newMessages)
      setIsLoading(false)
    })

    return unsubscribe
  }, [circle?.id])

  useEffect(() => {
    if (!circle?.id) return
    
    loadMembers()
  }, [circle?.id])

  const loadMembers = async () => {
    try {
      const circleMembers = await getCircleMembers(circle.id)
      setMembers(circleMembers)
    } catch (error) {
      console.error('Error loading members:', error)
    }
  }

  const handleTyping = (e) => {
    setNewMessage(e.target.value)
    
    if (!isTyping) {
      setIsTyping(true)
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
    }, 1000)
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentUser) return

    try {
      await sendCircleMessage(circle.id, {
        text: newMessage.trim(),
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous'
      })

      setNewMessage('')
      setIsTyping(false)
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    }
  }

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return ''
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    
    return date.toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white/10 border-b border-white/20">
        <div className="flex items-center space-x-3">
          <Button
            onClick={onBack}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30 rounded-full p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold text-white">{circle.name}</h2>
            <div className="flex items-center space-x-2 text-sm text-purple-200">
              <Users className="w-4 h-4" />
              <span>{members.length} members</span>
              {isCreator && (
                <span className="bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full text-xs">
                  Creator
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={onShowMembers}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30 rounded-full px-3 py-2"
            title="View members"
          >
            <Users className="w-4 h-4 mr-1" />
            {members.length}
          </Button>
          {isCreator && (
            <Button
              onClick={onShowInvite}
              className="bg-blue-500/20 hover:bg-blue-500/30 text-white border-blue-300/30 rounded-full px-3 py-2"
              title="Invite members"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          )}
          <Button
            className="bg-white/20 hover:bg-white/30 text-white border-white/30 rounded-full p-2"
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-purple-200 py-8">
            <p className="text-lg mb-2">Welcome to {circle.name}! 👋</p>
            <p className="text-sm">Start the conversation by sending a message below.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === currentUser?.uid ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  message.senderId === currentUser?.uid
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-white/20 text-white'
                }`}
              >
                {message.senderId !== currentUser?.uid && (
                  <p className="text-xs text-purple-200 mb-1">{message.senderName}</p>
                )}
                <p className="text-sm">{message.text}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs opacity-70">
                    {formatMessageTime(message.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/10 text-purple-200 px-4 py-2 rounded-2xl text-sm">
              Someone is typing...
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white/10 border-t border-white/20">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={handleTyping}
              placeholder="Type your message..."
              className="w-full bg-white/20 border border-white/30 rounded-full px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          <Button
            type="button"
            className="bg-white/20 hover:bg-white/30 text-white border-white/30 rounded-full p-3"
          >
            <Smile className="w-5 h-5" />
          </Button>
          <Button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 rounded-full p-3 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  )
}

export default CircleChat
