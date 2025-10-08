import React, { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Send, MessageCircle, User } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../src/contexts/AuthContext'
import { 
  getOrCreateDM,
  listenToUserDMs,
  listenToDMMessages,
  sendDM,
  markDMAsRead,
  getOtherUser
} from '../src/services/dmService'
import { getUserProfile } from '../src/services/userDataService'
import Button from '../src/components/ui/button'
import Card from '../src/components/ui/card'

const DMsPage = () => {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [searchParams] = useSearchParams()
  const targetUserId = searchParams.get('user')
  
  const [conversations, setConversations] = useState([])
  const [selectedConv, setSelectedConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [otherUserProfiles, setOtherUserProfiles] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load conversations
  useEffect(() => {
    if (!currentUser) return

    const unsubscribe = listenToUserDMs(currentUser.uid, async (dms) => {
      setConversations(dms)
      
      // Load other user profiles
      const profiles = {}
      for (const dm of dms) {
        const otherUserId = getOtherUser(dm, currentUser.uid)
        if (otherUserId && !profiles[otherUserId]) {
          try {
            const profile = await getUserProfile(otherUserId)
            profiles[otherUserId] = profile
          } catch (error) {
            console.error('Error loading user profile:', error)
          }
        }
      }
      setOtherUserProfiles(profiles)
      setIsLoading(false)
    })

    return unsubscribe
  }, [currentUser])

  // Auto-create DM if user param provided
  useEffect(() => {
    if (targetUserId && currentUser && !selectedConv) {
      const createDM = async () => {
        try {
          const conv = await getOrCreateDM(currentUser.uid, targetUserId)
          setSelectedConv(conv)
          
          // Load other user profile
          const profile = await getUserProfile(targetUserId)
          setOtherUserProfiles(prev => ({ ...prev, [targetUserId]: profile }))
        } catch (error) {
          console.error('Error creating DM:', error)
          alert('Failed to create conversation')
        }
      }
      createDM()
    }
  }, [targetUserId, currentUser, selectedConv])

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedConv) {
      setMessages([])
      return
    }

    const unsubscribe = listenToDMMessages(selectedConv.id, (newMessages) => {
      setMessages(newMessages)
    })

    // Mark as read
    markDMAsRead(selectedConv.id, currentUser.uid)

    return unsubscribe
  }, [selectedConv, currentUser])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConv || !currentUser) return

    try {
      await sendDM(selectedConv.id, {
        text: newMessage.trim(),
        senderId: currentUser.uid,
        senderName: currentUser.displayName || 'Anonymous'
      })

      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message')
    }
  }

  const getOtherUserProfile = (conv) => {
    const otherUserId = getOtherUser(conv, currentUser.uid)
    return otherUserProfiles[otherUserId]
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900 text-white">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-xl mb-4">Please log in to access messages</p>
          <Button onClick={() => navigate('/login')} className="bg-purple-500 hover:bg-purple-600">
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => navigate('/dashboard')}
              className="bg-white/20 hover:bg-white/30 text-white rounded-full p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <MessageCircle className="w-6 h-6 text-purple-200" />
            <h1 className="text-xl font-bold text-white">Direct Messages</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-150px)]">
          {/* Conversations List */}
          <div className="lg:col-span-1 bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/20">
              <h2 className="font-semibold text-white">Conversations</h2>
            </div>
            <div className="overflow-y-auto h-full">
              {isLoading ? (
                <div className="p-4 text-center text-purple-200">Loading...</div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-purple-200">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No conversations yet</p>
                </div>
              ) : (
                conversations.map((conv) => {
                  const otherProfile = getOtherUserProfile(conv)
                  const unread = conv.unreadCount?.[currentUser.uid] || 0
                  
                  return (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedConv(conv)}
                      className={`p-4 cursor-pointer hover:bg-white/10 transition border-b border-white/10 ${
                        selectedConv?.id === conv.id ? 'bg-white/20' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-white">
                              {otherProfile?.displayName || 'User'}
                            </p>
                            {unread > 0 && (
                              <span className="bg-pink-500 text-white text-xs rounded-full px-2 py-1">
                                {unread}
                              </span>
                            )}
                          </div>
                          {conv.lastMessage && (
                            <p className="text-sm text-purple-300 truncate">
                              {conv.lastMessage.text}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="lg:col-span-2 bg-white/10 backdrop-blur-md rounded-2xl flex flex-col">
            {!selectedConv ? (
              <div className="flex-1 flex items-center justify-center text-purple-200">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-white/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        {getOtherUserProfile(selectedConv)?.displayName || 'User'}
                      </p>
                      <p className="text-sm text-purple-300">Active now</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === currentUser.uid ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-2xl ${
                          message.senderId === currentUser.uid
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                            : 'bg-white/20 text-white'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-white/20">
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 bg-white/20 border border-white/30 rounded-full px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    <Button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full p-3 disabled:opacity-50"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DMsPage



