import React, { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Send, Smile, MoreVertical, Users, Wifi, WifiOff } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { 
  listenToMessages, 
  sendMessage, 
  setTyping, 
  listenToTyping, 
  listenToPresence,
  addReaction,
  removeReaction,
  formatMessageTime,
  getOnlineUsers,
  getTypingUsers
} from '../../services/chatService'
import Button from '../ui/button'
import Card from '../ui/card'

const ChatRoom = ({ room, onBack, onUserClick }) => {
  const { currentUser } = useAuth()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState([])
  const [onlineUsers, setOnlineUsers] = useState([])
  const [isConnected, setIsConnected] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load messages
  useEffect(() => {
    if (!room?.id) return

    const unsubscribe = listenToMessages(room.id, (newMessages) => {
      setMessages(newMessages)
      setIsLoading(false)
    })

    return unsubscribe
  }, [room?.id])

  // Listen to typing indicators
  useEffect(() => {
    if (!room?.id || !currentUser) return

    const unsubscribe = listenToTyping(room.id, (typing) => {
      const typingUserIds = getTypingUsers(typing, currentUser.uid)
      setTypingUsers(typingUserIds)
    })

    return unsubscribe
  }, [room?.id, currentUser])

  // Listen to presence
  useEffect(() => {
    const unsubscribe = listenToPresence((presence) => {
      const online = getOnlineUsers(presence)
      setOnlineUsers(online)
    })

    return unsubscribe
  }, [])

  // Handle typing
  const handleTyping = (e) => {
    setNewMessage(e.target.value)
    
    if (!isTyping) {
      setIsTyping(true)
      setTyping(room.id, currentUser.uid, true)
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      setTyping(room.id, currentUser.uid, false)
    }, 1000)
  }

  // Handle send message
  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentUser) return

    try {
      await sendMessage(room.id, {
        text: newMessage.trim(),
        senderId: currentUser.uid,
        senderName: currentUser.displayName || 'Anonymous'
      })

      setNewMessage('')
      setIsTyping(false)
      setTyping(room.id, currentUser.uid, false)
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    }
  }

  // Handle reaction
  const handleReaction = async (messageId, emoji) => {
    if (!currentUser) return

    try {
      const message = messages.find(m => m.id === messageId)
      const hasReacted = message?.reactions?.[currentUser.uid]

      if (hasReacted) {
        await removeReaction(room.id, messageId, currentUser.uid)
      } else {
        await addReaction(room.id, messageId, currentUser.uid, emoji)
      }
    } catch (error) {
      console.error('Error adding reaction:', error)
    }
  }

  // Get typing indicator text
  const getTypingText = () => {
    if (typingUsers.length === 0) return ''
    if (typingUsers.length === 1) return 'Someone is typing...'
    if (typingUsers.length <= 3) return `${typingUsers.length} people are typing...`
    return 'Several people are typing...'
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
            <h2 className="text-lg font-semibold text-white">{room.name}</h2>
            <div className="flex items-center space-x-2 text-sm text-purple-200">
              <Users className="w-4 h-4" />
              <span>{onlineUsers.length} online</span>
              {isConnected ? (
                <Wifi className="w-4 h-4 text-green-400" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-400" />
              )}
            </div>
          </div>
        </div>
        <Button
          className="bg-white/20 hover:bg-white/30 text-white border-white/30 rounded-full p-2"
        >
          <MoreVertical className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-purple-200 py-8">
            <p className="text-lg mb-2">Welcome to {room.name}! 👋</p>
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
                    {message.edited && ' (edited)'}
                  </span>
                  {Object.keys(message.reactions || {}).length > 0 && (
                    <div className="flex space-x-1">
                      {Object.entries(message.reactions).map(([userId, emoji]) => (
                        <span key={userId} className="text-xs">
                          {emoji}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        
        {/* Typing indicator */}
        {getTypingText() && (
          <div className="flex justify-start">
            <div className="bg-white/10 text-purple-200 px-4 py-2 rounded-2xl text-sm">
              {getTypingText()}
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

export default ChatRoom
