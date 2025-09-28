import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  listenToRooms, 
  listenToMessages, 
  listenToPresence,
  listenToTyping,
  setUserOnline,
  setUserOffline,
  sendMessage,
  createRoom,
  addReaction,
  removeReaction,
  getOnlineUsers,
  getTypingUsers
} from '../services/chatService'

export const useChat = () => {
  const { currentUser } = useAuth()
  const [rooms, setRooms] = useState([])
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [onlineUsers, setOnlineUsers] = useState([])
  const [typingUsers, setTypingUsers] = useState([])
  const [isConnected, setIsConnected] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

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

  // Load messages for selected room
  useEffect(() => {
    if (!selectedRoom?.id) {
      setMessages([])
      return
    }

    const unsubscribe = listenToMessages(selectedRoom.id, (newMessages) => {
      setMessages(newMessages)
    })

    return unsubscribe
  }, [selectedRoom?.id])

  // Load typing indicators for selected room
  useEffect(() => {
    if (!selectedRoom?.id || !currentUser) {
      setTypingUsers([])
      return
    }

    const unsubscribe = listenToTyping(selectedRoom.id, (typing) => {
      const typingUserIds = getTypingUsers(typing, currentUser.uid)
      setTypingUsers(typingUserIds)
    })

    return unsubscribe
  }, [selectedRoom?.id, currentUser])

  // Set user online when component mounts
  useEffect(() => {
    if (currentUser) {
      setUserOnline(currentUser.uid, {
        displayName: currentUser.displayName || 'Anonymous',
        email: currentUser.email
      }, selectedRoom?.id)

      return () => {
        setUserOffline(currentUser.uid)
      }
    }
  }, [currentUser, selectedRoom?.id])

  // Send message
  const sendChatMessage = useCallback(async (text) => {
    if (!selectedRoom?.id || !currentUser || !text.trim()) return

    try {
      await sendMessage(selectedRoom.id, {
        text: text.trim(),
        senderId: currentUser.uid,
        senderName: currentUser.displayName || 'Anonymous'
      })
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }, [selectedRoom?.id, currentUser])

  // Create room
  const createChatRoom = useCallback(async (roomData) => {
    if (!currentUser) return

    try {
      const roomId = await createRoom({
        ...roomData,
        createdBy: currentUser.uid,
        createdByName: currentUser.displayName || 'Anonymous'
      })
      return roomId
    } catch (error) {
      console.error('Error creating room:', error)
      throw error
    }
  }, [currentUser])

  // Add reaction
  const addMessageReaction = useCallback(async (messageId, emoji) => {
    if (!selectedRoom?.id || !currentUser) return

    try {
      const message = messages.find(m => m.id === messageId)
      const hasReacted = message?.reactions?.[currentUser.uid]

      if (hasReacted) {
        await removeReaction(selectedRoom.id, messageId, currentUser.uid)
      } else {
        await addReaction(selectedRoom.id, messageId, currentUser.uid, emoji)
      }
    } catch (error) {
      console.error('Error adding reaction:', error)
      throw error
    }
  }, [selectedRoom?.id, currentUser, messages])

  // Get online count for a room
  const getRoomOnlineCount = useCallback((roomId) => {
    return onlineUsers.filter(user => user.currentRoom === roomId).length
  }, [onlineUsers])

  // Get typing text
  const getTypingText = useCallback(() => {
    if (typingUsers.length === 0) return ''
    if (typingUsers.length === 1) return 'Someone is typing...'
    if (typingUsers.length <= 3) return `${typingUsers.length} people are typing...`
    return 'Several people are typing...'
  }, [typingUsers])

  return {
    // State
    rooms,
    selectedRoom,
    messages,
    onlineUsers,
    typingUsers,
    isConnected,
    isLoading,
    
    // Actions
    setSelectedRoom,
    sendChatMessage,
    createChatRoom,
    addMessageReaction,
    getRoomOnlineCount,
    getTypingText
  }
}
