import React, { useState, useEffect } from 'react'
import { ArrowLeft, MessageCircle, Users, Wifi } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../src/contexts/AuthContext'
import { setUserOnline, setUserOffline } from '../src/services/chatService'
import ChatRoom from '../src/components/chat/ChatRoom'
import RoomList from '../src/components/chat/RoomList'
import Button from '../src/components/ui/button'

const ChatroomPage = () => {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [isConnected, setIsConnected] = useState(true)

  // Set user online when entering chat
  useEffect(() => {
    if (currentUser) {
      setUserOnline(currentUser.uid, {
        displayName: currentUser.displayName || 'Anonymous',
        email: currentUser.email
      }, selectedRoom?.id)

      // Set offline when leaving
      return () => {
        setUserOffline(currentUser.uid)
      }
    }
  }, [currentUser, selectedRoom?.id])

  // Handle room selection
  const handleRoomSelect = (room) => {
    setSelectedRoom(room)
  }

  // Handle back to room list
  const handleBackToRooms = () => {
    setSelectedRoom(null)
  }

  // Handle create room
  const handleCreateRoom = () => {
    // This will be handled by the RoomList component
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
          <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-xl mb-4">Please log in to access chat rooms</p>
          <Button 
            onClick={() => navigate('/login')} 
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
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

      {/* Header */}
      <div className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/10 border-b border-white/20">
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
                <MessageCircle className="w-6 h-6 text-purple-200" />
                <span className="text-white font-semibold text-lg">SoulCircle Chat</span>
              </div>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center space-x-2 text-sm text-purple-200">
              <Wifi className={`w-4 h-4 ${isConnected ? 'text-green-400' : 'text-red-400'}`} />
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Welcome to
              <span className="bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent block">
                SoulCircle Chat
              </span>
            </h1>
            <p className="text-xl text-purple-200 max-w-2xl mx-auto">
              Connect with others who understand. Share your thoughts, find support, and build meaningful connections in our safe community spaces.
            </p>
          </div>

          {/* Chat Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            {/* Room List */}
            <div className="lg:col-span-1">
              <RoomList 
                onRoomSelect={handleRoomSelect}
                onCreateRoom={handleCreateRoom}
              />
            </div>

            {/* Chat Room */}
            <div className="lg:col-span-2">
              {selectedRoom ? (
                <ChatRoom 
                  room={selectedRoom}
                  onBack={handleBackToRooms}
                />
              ) : (
                <div className="h-full bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center">
                  <div className="text-center text-white">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">Select a Chat Room</h3>
                    <p className="text-purple-200">
                      Choose a room from the list to start chatting, or create a new one!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Features Info */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl text-center">
              <Users className="w-8 h-8 text-purple-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Real-time Chat</h3>
              <p className="text-purple-200 text-sm">
                Connect instantly with others through live messaging and see who's online.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl text-center">
              <MessageCircle className="w-8 h-8 text-purple-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Safe Spaces</h3>
              <p className="text-purple-200 text-sm">
                Join supportive communities where you can share openly and find understanding.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl text-center">
              <Wifi className="w-8 h-8 text-purple-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Always Connected</h3>
              <p className="text-purple-200 text-sm">
                Stay connected with offline support and automatic reconnection.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatroomPage