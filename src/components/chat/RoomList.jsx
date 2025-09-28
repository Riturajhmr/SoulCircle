import React, { useState, useEffect } from 'react'
import { Plus, Search, Users, MessageCircle, Clock, Wifi } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { 
  listenToRooms, 
  createRoom, 
  listenToPresence,
  getOnlineUsers,
  formatMessageTime
} from '../../services/chatService'
import Button from '../ui/button'
import Card from '../ui/card'
import Input from '../ui/input'

const RoomList = ({ onRoomSelect, onCreateRoom }) => {
  const { currentUser } = useAuth()
  const [rooms, setRooms] = useState([])
  const [filteredRooms, setFilteredRooms] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newRoom, setNewRoom] = useState({ name: '', description: '' })
  const [onlineUsers, setOnlineUsers] = useState([])

  // Load rooms
  useEffect(() => {
    const unsubscribe = listenToRooms((newRooms) => {
      setRooms(newRooms)
      setIsLoading(false)
    })

    return unsubscribe
  }, [])

  // Load presence
  useEffect(() => {
    const unsubscribe = listenToPresence((presence) => {
      const online = getOnlineUsers(presence)
      setOnlineUsers(online)
    })

    return unsubscribe
  }, [])

  // Filter rooms based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredRooms(rooms)
    } else {
      const filtered = rooms.filter(room =>
        room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredRooms(filtered)
    }
  }, [rooms, searchQuery])

  // Handle create room
  const handleCreateRoom = async (e) => {
    e.preventDefault()
    if (!newRoom.name.trim() || !currentUser) return

    try {
      const roomId = await createRoom({
        name: newRoom.name.trim(),
        description: newRoom.description.trim(),
        createdBy: currentUser.uid,
        createdByName: currentUser.displayName || 'Anonymous'
      })

      setNewRoom({ name: '', description: '' })
      setShowCreateForm(false)
      
      // Select the newly created room
      const newRoomData = { id: roomId, ...newRoom }
      onRoomSelect(newRoomData)
    } catch (error) {
      console.error('Error creating room:', error)
      alert('Failed to create room. Please try again.')
    }
  }

  // Get online count for a room
  const getRoomOnlineCount = (roomId) => {
    return onlineUsers.filter(user => user.currentRoom === roomId).length
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading chat rooms...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-white/10 border-b border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <MessageCircle className="w-6 h-6 mr-2" />
            Chat Rooms
          </h2>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 rounded-full px-4 py-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Room
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-300" />
          <Input
            type="text"
            placeholder="Search rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 bg-white/20 border-white/30 text-white placeholder-purple-300 rounded-xl"
          />
        </div>
      </div>

      {/* Create Room Form */}
      {showCreateForm && (
        <div className="p-4 bg-white/10 border-b border-white/20">
          <Card className="p-4 bg-white/20 border-white/30 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Room</h3>
            <form onSubmit={handleCreateRoom} className="space-y-3">
              <Input
                type="text"
                placeholder="Room name..."
                value={newRoom.name}
                onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                className="bg-white/20 border-white/30 text-white placeholder-purple-300 rounded-xl"
                required
              />
              <Input
                type="text"
                placeholder="Room description (optional)..."
                value={newRoom.description}
                onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                className="bg-white/20 border-white/30 text-white placeholder-purple-300 rounded-xl"
              />
              <div className="flex space-x-2">
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 rounded-xl"
                >
                  Create Room
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 rounded-xl"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Rooms List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredRooms.length === 0 ? (
          <div className="text-center text-purple-200 py-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">
              {searchQuery ? 'No rooms found' : 'No chat rooms yet'}
            </p>
            <p className="text-sm">
              {searchQuery ? 'Try a different search term' : 'Be the first to create a room!'}
            </p>
          </div>
        ) : (
          filteredRooms.map((room) => {
            const onlineCount = getRoomOnlineCount(room.id)
            return (
              <Card
                key={room.id}
                onClick={() => onRoomSelect(room)}
                className="p-4 bg-white/10 hover:bg-white/20 border-white/20 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {room.name}
                    </h3>
                    <p className="text-purple-200 text-sm mb-2 line-clamp-2">
                      {room.description || 'No description'}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-purple-300">
                      <div className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>{onlineCount} online</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {room.lastMessage 
                            ? formatMessageTime(room.lastMessage.timestamp)
                            : 'No messages yet'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {onlineCount > 0 && (
                      <div className="flex items-center space-x-1 text-green-400">
                        <Wifi className="w-4 h-4" />
                        <span className="text-xs">{onlineCount}</span>
                      </div>
                    )}
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  </div>
                </div>
                
                {room.lastMessage && (
                  <div className="mt-3 p-2 bg-white/10 rounded-lg">
                    <p className="text-white text-sm line-clamp-1">
                      <span className="text-purple-300 font-medium">
                        {room.lastMessage.senderName}:
                      </span>{' '}
                      {room.lastMessage.text}
                    </p>
                  </div>
                )}
              </Card>
            )
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-white/10 border-t border-white/20">
        <div className="flex items-center justify-between text-sm text-purple-200">
          <span>{filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''}</span>
          <div className="flex items-center space-x-1">
            <Wifi className="w-4 h-4 text-green-400" />
            <span>{onlineUsers.length} users online</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoomList
