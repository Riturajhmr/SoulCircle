import React, { useState, useEffect, useRef } from "react"
import { Star, Users, Heart, Clock, ArrowLeft, UserPlus, MessageCircle, Shield, Calendar, CheckCircle, Sparkles, Send, Search, X, Filter, ChevronDown, User as UserIcon, Plus, Copy, Share2, Edit, Trash2 } from "lucide-react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "../src/contexts/AuthContext"
import {
  getAllCircles,
  joinCircle,
  leaveCircle,
  getUserCircles,
  listenToCircles,
  initializeDefaultCircles,
  getCircleMembers,
  searchCircles,
  createCircle,
  joinCircleByInviteCode,
  deleteCircle,
  updateCircle
} from "../src/services/circlesService"
import CircleChat from "../src/components/chat/CircleChat"
import Button from "../src/components/ui/button"
import Card from "../src/components/ui/card"

const SupportCircles = () => {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [searchParams] = useSearchParams()
  
  const [allCircles, setAllCircles] = useState([])
  const [circles, setCircles] = useState([])
  const [userCircles, setUserCircles] = useState([])
  const [selectedTopic, setSelectedTopic] = useState("All")
  const [selectedDay, setSelectedDay] = useState("All")
  const [showJoinModal, setShowJoinModal] = useState(null)
  const [selectedCircleForChat, setSelectedCircleForChat] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(null)
  const [showMembersModal, setShowMembersModal] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(null)
  const [showJoinByCodeModal, setShowJoinByCodeModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [inviteCode, setInviteCode] = useState("")
  const [circleMembers, setCircleMembers] = useState([])

  const topics = [
    "All",
    "Anxiety & Stress",
    "Grief & Loss",
    "Life Transitions",
    "Mindfulness & Meditation",
    "Young Adult Support",
    "Creative Therapy",
  ]

  const days = [
    "All",
    "Mondays",
    "Tuesdays",
    "Wednesdays",
    "Thursdays",
    "Fridays",
    "Saturdays",
    "Sundays"
  ]

  useEffect(() => {
    if (!currentUser) {
      navigate("/login")
      return
    }

    loadCircles()
    const unsubscribe = listenToCircles((updatedCircles) => {
      setAllCircles(updatedCircles)
      if (!searchTerm) {
        setCircles(updatedCircles)
      }
    })

    return () => unsubscribe()
  }, [currentUser, navigate])

  useEffect(() => {
    if (currentUser) {
      loadUserCircles()
    }
  }, [currentUser, circles])

  useEffect(() => {
    if (searchTerm) {
      handleSearch()
    }
  }, [searchTerm])

  useEffect(() => {
    const inviteParam = searchParams.get('invite')
    if (inviteParam && currentUser && allCircles.length > 0) {
      setInviteCode(inviteParam.toUpperCase())
      setShowJoinByCodeModal(true)
    }
  }, [searchParams, currentUser, allCircles])

  const loadCircles = async () => {
    try {
      setLoading(true)
      setError("")
      
      const fetchedCircles = await getAllCircles()
      
      if (fetchedCircles.length === 0) {
        await initializeDefaultCircles()
        const newCircles = await getAllCircles()
        setAllCircles(newCircles)
        setCircles(newCircles)
      } else {
        setAllCircles(fetchedCircles)
        setCircles(fetchedCircles)
      }
    } catch (err) {
      console.error("Error loading circles:", err)
      setError("Failed to load support circles. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const loadUserCircles = async () => {
    if (!currentUser) return
    
    try {
      const myCircles = await getUserCircles(currentUser.uid)
      setUserCircles(myCircles)
    } catch (err) {
      console.error("Error loading user circles:", err)
    }
  }

  const loadCircleMembers = async (circleId) => {
    try {
      const members = await getCircleMembers(circleId)
      setCircleMembers(members)
    } catch (err) {
      console.error("Error loading members:", err)
    }
  }

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setCircles(allCircles)
      return
    }

    const searchLower = searchTerm.toLowerCase()
    const results = allCircles.filter(circle => 
      circle.name.toLowerCase().includes(searchLower) ||
      circle.description.toLowerCase().includes(searchLower) ||
      circle.topic.toLowerCase().includes(searchLower) ||
      circle.facilitator?.toLowerCase().includes(searchLower) ||
      circle.tags?.some(tag => tag.toLowerCase().includes(searchLower))
    )
    
    setCircles(results)
  }

  const handleClearSearch = () => {
    setSearchTerm("")
    setCircles(allCircles)
  }

  const isUserInCircle = (circleId) => {
    return userCircles.some(c => c.id === circleId)
  }

  const getFilteredCircles = () => {
    let filtered = circles

    if (selectedTopic !== "All") {
      filtered = filtered.filter(c => c.topic === selectedTopic)
    }

    if (selectedDay !== "All") {
      filtered = filtered.filter(c => c.meetingDay === selectedDay)
    }

    return filtered
  }

  const filteredCircles = getFilteredCircles()
  const joinedCircles = allCircles.filter((circle) => isUserInCircle(circle.id))

  const handleJoinCircle = async (circleId) => {
    if (!currentUser) {
      alert("Please log in to join a circle")
      navigate("/login")
      return
    }

    try {
      setActionLoading(true)
      setError("")
      
      const circle = allCircles.find(c => c.id === circleId)
      const userName = currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous'
      
      await joinCircle(circleId, currentUser.uid, userName)
      await loadUserCircles()
      
      setShowJoinModal(null)
      alert(`🎉 You've joined ${circle?.name || 'the circle'}! Welcome to the circle.`)
    } catch (err) {
      console.error("Error joining circle:", err)
      setError(err.message || "Failed to join circle. Please try again.")
      alert(err.message || "Failed to join circle. Please try again.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleLeaveCircle = async (circleId) => {
    if (!confirm("Are you sure you want to leave this circle?")) {
      return
    }

    try {
      setActionLoading(true)
      setError("")
      
      await leaveCircle(circleId, currentUser.uid)
      await loadUserCircles()
      
      if (selectedCircleForChat === circleId) {
        setSelectedCircleForChat(null)
      }
      
      alert("You've left the circle. You can rejoin anytime!")
    } catch (err) {
      console.error("Error leaving circle:", err)
      setError("Failed to leave circle. Please try again.")
      alert("Failed to leave circle. Please try again.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleBack = () => {
    navigate("/dashboard")
  }

  const openChat = (circleId) => {
    if (!isUserInCircle(circleId)) {
      alert("You must join the circle first to access the chat!")
      return
    }
    const circle = allCircles.find(c => c.id === circleId)
    setSelectedCircleForChat(circle)
  }

  const openDetails = (circleId) => {
    setShowDetailsModal(circleId)
  }

  const openMembers = (circleId) => {
    setShowMembersModal(circleId)
    loadCircleMembers(circleId)
  }

  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    topic: "Anxiety & Stress",
    maxMembers: 12,
    meetingTime: "",
    meetingDay: "Mondays",
    facilitator: "",
    tags: ""
  })

  const handleCreateCircle = async (e) => {
    e.preventDefault()
    if (!currentUser) return

    try {
      setActionLoading(true)
      setError("")

      const tags = createForm.tags.split(',').map(t => t.trim()).filter(t => t)
      const userName = currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous'

      const circleData = {
        name: createForm.name,
        description: createForm.description,
        topic: createForm.topic,
        maxMembers: parseInt(createForm.maxMembers),
        meetingTime: createForm.meetingTime,
        meetingDay: createForm.meetingDay,
        facilitator: createForm.facilitator || userName,
        nextMeeting: `Every ${createForm.meetingDay}`,
        tags: tags,
        color: "from-purple-500 to-pink-500"
      }

      const result = await createCircle(circleData, currentUser.uid, userName)
      
      setShowCreateModal(false)
      setCreateForm({
        name: "",
        description: "",
        topic: "Anxiety & Stress",
        maxMembers: 12,
        meetingTime: "",
        meetingDay: "Mondays",
        facilitator: "",
        tags: ""
      })

      setShowInviteModal(result.id)
      setInviteCode(result.inviteCode)
      
      await loadCircles()
      await loadUserCircles()
      
      alert(`🎉 Circle "${circleData.name}" created successfully!`)
    } catch (err) {
      console.error("Error creating circle:", err)
      setError(err.message || "Failed to create circle. Please try again.")
      alert(err.message || "Failed to create circle. Please try again.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleJoinByCode = async () => {
    if (!inviteCode.trim() || !currentUser) return

    try {
      setActionLoading(true)
      setError("")
      
      const userName = currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous'
      const result = await joinCircleByInviteCode(inviteCode.toUpperCase(), currentUser.uid, userName)
      
      setShowJoinByCodeModal(false)
      setInviteCode("")
      
      await loadCircles()
      await loadUserCircles()
      
      alert(`🎉 You've joined "${result.name}"!`)
    } catch (err) {
      console.error("Error joining by code:", err)
      alert(err.message || "Invalid invite code. Please try again.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteCircle = async (circleId) => {
    if (!confirm("Are you sure you want to delete this circle? This cannot be undone.")) {
      return
    }

    try {
      setActionLoading(true)
      await deleteCircle(circleId, currentUser.uid)
      
      await loadCircles()
      await loadUserCircles()
      
      alert("Circle deleted successfully")
    } catch (err) {
      console.error("Error deleting circle:", err)
      alert(err.message || "Failed to delete circle")
    } finally {
      setActionLoading(false)
    }
  }

  const copyInviteCode = (code) => {
    navigator.clipboard.writeText(code)
    alert("Invite code copied to clipboard!")
  }

  const shareInviteLink = (code) => {
    const link = `${window.location.origin}/supportcircles?invite=${code}`
    navigator.clipboard.writeText(link)
    alert("Invite link copied to clipboard!")
  }

  const isCreator = (circle) => {
    return circle.createdBy === currentUser?.uid
  }

  if (loading) {
    return (
      <div
        className="min-h-screen relative overflow-hidden flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #1e215d 0%, #9461fd 40%, #d9afdf 100%)",
        }}
      >
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Loading Support Circles...</p>
        </div>
      </div>
    )
  }

  const detailCircle = showDetailsModal ? allCircles.find(c => c.id === showDetailsModal) : null
  const membersCircle = showMembersModal ? allCircles.find(c => c.id === showMembersModal) : null

  if (selectedCircleForChat) {
    return (
      <div
        className="min-h-screen relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1e215d 0%, #9461fd 40%, #d9afdf 100%)",
        }}
      >
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
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

        <div className="relative z-10 p-6 max-w-6xl mx-auto h-screen flex flex-col">
          <CircleChat 
            circle={selectedCircleForChat}
            onBack={() => setSelectedCircleForChat(null)}
            onShowInvite={() => {
              setShowInviteModal(selectedCircleForChat.id)
              setInviteCode(selectedCircleForChat.inviteCode)
            }}
            onShowMembers={() => {
              setShowMembersModal(selectedCircleForChat.id)
              loadCircleMembers(selectedCircleForChat.id)
            }}
            isCreator={isCreator(selectedCircleForChat)}
          />
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
        {[...Array(50)].map((_, i) => (
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

      {/* Main Content */}
      <div className="relative z-10 p-4 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pt-4 flex-wrap gap-4">
          <Button
            onClick={handleBack}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-purple-200" />
            <h1 className="text-3xl font-bold text-white">Support Circles</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowJoinByCodeModal(true)}
              className="bg-blue-500/20 hover:bg-blue-500/30 text-white border-blue-300/30"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Join by Code
            </Button>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Circle
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-400/50 text-red-200 rounded-xl flex items-center">
            <div className="w-5 h-5 mr-2">⚠️</div>
            {error}
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search circles by name, topic, or tags..."
                className="w-full pl-11 pr-12 py-3 bg-white/10 border border-white/30 rounded-full text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 backdrop-blur-sm"
              />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <Button
              onClick={handleSearch}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-white/15 backdrop-blur-md border border-white/30 p-6 rounded-xl">
              <div className="space-y-4">
                <div>
                  <h3 className="text-white font-semibold mb-3">Filter by Topic</h3>
                  <div className="flex flex-wrap gap-2">
                    {topics.map((topic) => (
                      <button
                        key={topic}
                        onClick={() => setSelectedTopic(topic)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                          selectedTopic === topic
                            ? "bg-white/20 text-white border border-white/40 shadow-lg"
                            : "bg-white/10 text-white/80 hover:bg-white/15 hover:text-white border border-white/20"
                        }`}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-3">Filter by Meeting Day</h3>
                  <div className="flex flex-wrap gap-2">
                    {days.map((day) => (
                      <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                          selectedDay === day
                            ? "bg-white/20 text-white border border-white/40 shadow-lg"
                            : "bg-white/10 text-white/80 hover:bg-white/15 hover:text-white border border-white/20"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Welcome Message */}
        <div className="bg-white/15 backdrop-blur-md border border-white/30 p-8 rounded-xl mb-8">
          <div className="text-center">
            <div className="text-4xl mb-4">🤝</div>
            <h2 className="text-2xl font-bold text-white mb-4">Find Your Circle</h2>
            <p className="text-purple-100 text-lg leading-relaxed max-w-3xl mx-auto">
              Join small, supportive groups where you can share your experiences, learn from others, and build
              meaningful connections. Our circles are facilitated by trained volunteers and provide a safe, confidential
              space for healing and growth.
            </p>
          </div>
        </div>

        {/* My Circles Section */}
        {joinedCircles.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Heart className="w-5 h-5 mr-2 text-pink-400" />
              My Circles ({joinedCircles.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {joinedCircles.map((circle) => (
                <Card key={circle.id} className="bg-white/20 backdrop-blur-md border border-white/40 p-6 rounded-xl">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-white font-semibold text-lg">{circle.name}</h4>
                    <div className="flex items-center gap-2">
                      {isCreator(circle) && (
                        <div className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                          <Star className="w-3 h-3 mr-1 fill-current" />
                          Creator
                        </div>
                      )}
                      <div className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Joined
                      </div>
                    </div>
                  </div>
                  <p className="text-purple-200 text-sm mb-4 line-clamp-2">{circle.description}</p>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center text-purple-300">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{circle.nextMeeting}</span>
                    </div>
                    <div className="flex items-center text-purple-300">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>
                        {circle.meetingDay}s at {circle.meetingTime}
                      </span>
                    </div>
                    <div className="flex items-center text-purple-300">
                      <Users className="w-4 h-4 mr-2" />
                      <span>{circle.memberCount || 0}/{circle.maxMembers} members</span>
                    </div>
                  </div>
                  <div className={`grid ${isCreator(circle) ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
                    <button 
                      onClick={() => openChat(circle.id)}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center"
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Chat
                    </button>
                    <button
                      onClick={() => openMembers(circle.id)}
                      className="bg-white/10 hover:bg-white/20 text-white py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center"
                    >
                      <Users className="w-4 h-4 mr-1" />
                      Members
                    </button>
                    <button
                      onClick={() => openDetails(circle.id)}
                      className="bg-white/10 hover:bg-white/20 text-white py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200"
                    >
                      Details
                    </button>
                    {isCreator(circle) && (
                      <>
                        <button
                          onClick={() => {
                            setShowInviteModal(circle.id)
                            setInviteCode(circle.inviteCode)
                          }}
                          className="bg-blue-500/20 hover:bg-blue-500/30 text-white py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center"
                        >
                          <Share2 className="w-4 h-4 mr-1" />
                          Invite
                        </button>
                        <button
                          onClick={() => handleDeleteCircle(circle.id)}
                          disabled={actionLoading}
                          className="bg-red-500/20 hover:bg-red-500/30 text-white py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </button>
                      </>
                    )}
                    {!isCreator(circle) && (
                      <button
                        onClick={() => handleLeaveCircle(circle.id)}
                        disabled={actionLoading}
                        className="bg-red-500/20 hover:bg-red-500/30 text-white py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50"
                      >
                        Leave
                      </button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Available Circles */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-yellow-300" />
            Available Circles ({filteredCircles.filter((circle) => !isUserInCircle(circle.id)).length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCircles
              .filter((circle) => !isUserInCircle(circle.id))
              .map((circle) => (
                <div
                  key={circle.id}
                  className="bg-white/15 backdrop-blur-md border border-white/30 p-6 rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-white font-semibold text-lg">{circle.name}</h4>
                    <div className="text-purple-300 text-sm font-medium">
                      {circle.memberCount || 0}/{circle.maxMembers}
                    </div>
                  </div>

                  <div className="bg-purple-500/20 text-purple-200 px-3 py-1 rounded-full text-xs font-medium mb-3 inline-block">
                    {circle.topic}
                  </div>

                  <p className="text-purple-200 text-sm mb-4 leading-relaxed line-clamp-3">{circle.description}</p>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center text-purple-300">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>
                        {circle.meetingDay}s at {circle.meetingTime}
                      </span>
                    </div>
                    <div className="flex items-center text-purple-300">
                      <UserIcon className="w-4 h-4 mr-2" />
                      <span>Facilitated by {circle.facilitator}</span>
                    </div>
                    <div className="flex items-center text-purple-300">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{circle.nextMeeting}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {circle.tags && circle.tags.map((tag, index) => (
                      <span key={index} className="bg-white/10 text-purple-200 px-2 py-1 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => openDetails(circle.id)}
                      className="bg-white/10 hover:bg-white/20 text-white py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => setShowJoinModal(circle.id)}
                      disabled={circle.memberCount >= circle.maxMembers || actionLoading}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center"
                    >
                      {circle.memberCount >= circle.maxMembers ? (
                        "Full"
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-1" />
                          Join
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
          </div>
          
          {filteredCircles.filter((circle) => !isUserInCircle(circle.id)).length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎉</div>
              <p className="text-white text-xl mb-2">
                {searchTerm ? "No circles found matching your search" : "You've joined all available circles in this category!"}
              </p>
              <p className="text-purple-300">
                {searchTerm ? "Try a different search term" : "Try browsing other topics or check back later for new circles."}
              </p>
            </div>
          )}
        </div>

        {/* Guidelines */}
        <div className="bg-white/15 backdrop-blur-md border border-white/30 p-8 rounded-xl">
          <div className="flex items-center mb-4">
            <Shield className="w-6 h-6 text-green-400 mr-3" />
            <h3 className="text-xl font-bold text-white">Circle Guidelines</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-purple-200">
            <div>
              <h4 className="text-white font-semibold mb-2 flex items-center">
                <span className="text-xl mr-2">🔒</span> Confidentiality
              </h4>
              <p className="text-sm">What's shared in the circle stays in the circle. Respect everyone's privacy.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2 flex items-center">
                <span className="text-xl mr-2">🤝</span> Respect
              </h4>
              <p className="text-sm">Listen without judgment and speak with kindness and empathy.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2 flex items-center">
                <span className="text-xl mr-2">💬</span> Participation
              </h4>
              <p className="text-sm">Share as much or as little as you're comfortable with. No pressure to speak.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2 flex items-center">
                <span className="text-xl mr-2">💛</span> Support
              </h4>
              <p className="text-sm">Offer encouragement and avoid giving unsolicited advice unless asked.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/20 backdrop-blur-md border border-white/30 p-8 rounded-xl max-w-md w-full">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🌟</div>
              <h3 className="text-2xl font-bold text-white mb-4">Join Support Circle</h3>
            </div>
            <p className="text-purple-200 mb-6 text-center">
              Are you ready to join this supportive community? By joining, you agree to follow our circle guidelines and
              participate respectfully.
            </p>
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => handleJoinCircle(showJoinModal)}
                disabled={actionLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Joining...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Join Circle
                  </>
                )}
              </button>
              <button
                onClick={() => setShowJoinModal(null)}
                disabled={actionLoading}
                className="w-full bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && detailCircle && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/20 backdrop-blur-md border border-white/30 p-8 rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">{detailCircle.name}</h3>
              <button
                onClick={() => setShowDetailsModal(null)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 text-purple-200">
              <div>
                <h4 className="text-white font-semibold mb-2">About</h4>
                <p className="text-sm leading-relaxed">{detailCircle.description}</p>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-2">Topic</h4>
                <span className="bg-purple-500/20 text-purple-200 px-3 py-1 rounded-full text-sm">
                  {detailCircle.topic}
                </span>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-2">Meeting Schedule</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{detailCircle.nextMeeting}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{detailCircle.meetingDay}s at {detailCircle.meetingTime}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-2">Facilitator</h4>
                <p className="text-sm">{detailCircle.facilitator}</p>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-2">Capacity</h4>
                <p className="text-sm">{detailCircle.memberCount || 0} / {detailCircle.maxMembers} members</p>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {detailCircle.tags && detailCircle.tags.map((tag, index) => (
                    <span key={index} className="bg-white/10 text-purple-200 px-3 py-1 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {!isUserInCircle(detailCircle.id) && (
              <button
                onClick={() => {
                  setShowDetailsModal(null)
                  setShowJoinModal(detailCircle.id)
                }}
                disabled={detailCircle.memberCount >= detailCircle.maxMembers}
                className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-all duration-200"
              >
                {detailCircle.memberCount >= detailCircle.maxMembers ? "Circle Full" : "Join Circle"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Members Modal */}
      {showMembersModal && membersCircle && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/20 backdrop-blur-md border border-white/30 p-8 rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center">
                <Users className="w-6 h-6 mr-2" />
                Members
              </h3>
              <button
                onClick={() => setShowMembersModal(null)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3">
              {circleMembers.length === 0 ? (
                <p className="text-purple-300 text-center py-4">No active members yet</p>
              ) : (
                circleMembers.map((member) => (
                  <div
                    key={member.id}
                    className="bg-white/10 backdrop-blur-sm p-4 rounded-lg flex items-center space-x-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{member.userName}</p>
                      <p className="text-purple-300 text-sm">
                        Joined {new Date(member.joinedAt?.toDate?.() || member.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Circle Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white/20 backdrop-blur-md border border-white/30 p-8 rounded-xl max-w-2xl w-full my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center">
                <Plus className="w-6 h-6 mr-2" />
                Create Your Support Circle
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateCircle} className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">Circle Name *</label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                  placeholder="e.g., Evening Support Group"
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Description *</label>
                <textarea
                  required
                  value={createForm.description}
                  onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                  placeholder="Describe what your circle is about and who it's for..."
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">Topic *</label>
                  <select
                    required
                    value={createForm.topic}
                    onChange={(e) => setCreateForm({...createForm, topic: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    {topics.filter(t => t !== "All").map(topic => (
                      <option key={topic} value={topic} className="bg-purple-900">{topic}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Max Members *</label>
                  <input
                    type="number"
                    required
                    min="2"
                    max="50"
                    value={createForm.maxMembers}
                    onChange={(e) => setCreateForm({...createForm, maxMembers: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">Meeting Day *</label>
                  <select
                    required
                    value={createForm.meetingDay}
                    onChange={(e) => setCreateForm({...createForm, meetingDay: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    {days.filter(d => d !== "All").map(day => (
                      <option key={day} value={day} className="bg-purple-900">{day}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Meeting Time *</label>
                  <input
                    type="time"
                    required
                    value={createForm.meetingTime}
                    onChange={(e) => setCreateForm({...createForm, meetingTime: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Facilitator Name</label>
                <input
                  type="text"
                  value={createForm.facilitator}
                  onChange={(e) => setCreateForm({...createForm, facilitator: e.target.value})}
                  placeholder="Leave empty to use your name"
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Tags</label>
                <input
                  type="text"
                  value={createForm.tags}
                  onChange={(e) => setCreateForm({...createForm, tags: e.target.value})}
                  placeholder="e.g., Support, Healing, Growth (comma separated)"
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={actionLoading}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
                >
                  {actionLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Circle
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/20 backdrop-blur-md border border-white/30 p-8 rounded-xl max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center">
                <Share2 className="w-6 h-6 mr-2" />
                Invite Members
              </h3>
              <button
                onClick={() => setShowInviteModal(null)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <p className="text-purple-200 mb-4 text-lg">
                  Share this code to invite people to your circle
                </p>
                <div className="bg-gradient-to-r from-purple-500/30 to-pink-500/30 border-2 border-white/40 rounded-xl p-6 mb-4 shadow-lg">
                  <p className="text-white text-4xl font-bold text-center tracking-widest mb-2">{inviteCode}</p>
                  <p className="text-purple-200 text-sm">Invite Code</p>
                </div>
              </div>

              <div className="bg-white/10 rounded-lg p-4 space-y-3">
                <h4 className="text-white font-semibold text-sm mb-2">📋 How to share:</h4>
                <ol className="text-purple-200 text-sm space-y-2 list-decimal list-inside">
                  <li>Click "Copy Code" or "Copy Link" below</li>
                  <li>Send it to your friends via text, email, or social media</li>
                  <li>They click "Join by Code" button on Support Circles page</li>
                  <li>Enter the code and join instantly!</li>
                </ol>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => copyInviteCode(inviteCode)}
                  className="bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Code
                </button>
                <button
                  onClick={() => shareInviteLink(inviteCode)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Copy Link
                </button>
              </div>

              <div className="bg-blue-500/20 border border-blue-300/30 rounded-lg p-3 text-center">
                <p className="text-blue-200 text-xs">
                  💡 Tip: The link will automatically fill in the code for them!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Join by Code Modal */}
      {showJoinByCodeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/20 backdrop-blur-md border border-white/30 p-8 rounded-xl max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center">
                <UserPlus className="w-6 h-6 mr-2" />
                Join by Invite Code
              </h3>
              <button
                onClick={() => {
                  setShowJoinByCodeModal(false)
                  setInviteCode("")
                }}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <p className="text-purple-200 mb-4 text-lg">
                  Enter the 8-character code you received
                </p>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="ABC12345"
                  className="w-full px-4 py-4 bg-white/10 border-2 border-white/30 rounded-lg text-white text-center text-2xl font-bold tracking-widest placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 uppercase"
                  maxLength={8}
                  autoFocus
                />
                <p className="text-purple-300 text-xs mt-2">Code is case-insensitive</p>
              </div>

              <div className="bg-white/10 rounded-lg p-4 space-y-2">
                <h4 className="text-white font-semibold text-sm mb-2">💡 How it works:</h4>
                <ol className="text-purple-200 text-sm space-y-1 list-decimal list-inside">
                  <li>Paste or type the invite code above</li>
                  <li>Click "Join Circle" button</li>
                  <li>You'll be added to the circle instantly</li>
                  <li>Start chatting with circle members!</li>
                </ol>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleJoinByCode}
                  disabled={!inviteCode.trim() || inviteCode.length < 6 || actionLoading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
                >
                  {actionLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Joining...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Join Circle
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowJoinByCodeModal(false)
                    setInviteCode("")
                  }}
                  disabled={actionLoading}
                  className="w-full bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>

              <div className="bg-green-500/20 border border-green-300/30 rounded-lg p-3 text-center">
                <p className="text-green-200 text-xs">
                  ✨ Don't have a code? Ask circle creators to share their invite code!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SupportCircles
