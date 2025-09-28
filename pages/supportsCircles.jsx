"use client"

import { useState } from "react"
import { Star, Users, Heart, Clock, ArrowLeft, UserPlus, MessageCircle, Shield, Calendar } from "lucide-react"
import Navigation from "../components/navigation"

const supportCircles = [
  {
    id: "1",
    name: "Anxiety Warriors",
    description: "A safe space for those dealing with anxiety to share experiences and coping strategies.",
    topic: "Anxiety & Stress",
    memberCount: 8,
    maxMembers: 12,
    meetingTime: "7:00 PM",
    meetingDay: "Tuesdays",
    facilitator: "Sarah M.",
    isJoined: false,
    nextMeeting: "Dec 24, 2024",
    tags: ["Anxiety", "Coping Skills", "Mindfulness"],
  },
  {
    id: "2",
    name: "Healing Hearts",
    description: "For those navigating grief, loss, and the journey of healing after difficult life changes.",
    topic: "Grief & Loss",
    memberCount: 6,
    maxMembers: 10,
    meetingTime: "6:30 PM",
    meetingDay: "Thursdays",
    facilitator: "Michael R.",
    isJoined: true,
    nextMeeting: "Dec 26, 2024",
    tags: ["Grief", "Loss", "Healing", "Support"],
  },
  {
    id: "3",
    name: "New Beginnings",
    description: "Supporting each other through major life transitions and finding strength in change.",
    topic: "Life Transitions",
    memberCount: 10,
    maxMembers: 15,
    meetingTime: "8:00 PM",
    meetingDay: "Mondays",
    facilitator: "Emma L.",
    isJoined: false,
    nextMeeting: "Dec 23, 2024",
    tags: ["Change", "Growth", "Resilience"],
  },
  {
    id: "4",
    name: "Mindful Moments",
    description: "Practicing mindfulness and meditation together to find peace in daily life.",
    topic: "Mindfulness & Meditation",
    memberCount: 12,
    maxMembers: 20,
    meetingTime: "7:30 PM",
    meetingDay: "Wednesdays",
    facilitator: "David K.",
    isJoined: false,
    nextMeeting: "Dec 25, 2024",
    tags: ["Mindfulness", "Meditation", "Peace"],
  },
  {
    id: "5",
    name: "Young Adults Circle",
    description: "A supportive community for young adults (18-25) navigating the challenges of early adulthood.",
    topic: "Young Adult Support",
    memberCount: 15,
    maxMembers: 18,
    meetingTime: "9:00 PM",
    meetingDay: "Fridays",
    facilitator: "Alex T.",
    isJoined: false,
    nextMeeting: "Dec 27, 2024",
    tags: ["Young Adults", "Life Skills", "Community"],
  },
  {
    id: "6",
    name: "Creative Souls",
    description: "Using art, writing, and creativity as tools for healing and self-expression.",
    topic: "Creative Therapy",
    memberCount: 7,
    maxMembers: 12,
    meetingTime: "6:00 PM",
    meetingDay: "Saturdays",
    facilitator: "Luna P.",
    isJoined: false,
    nextMeeting: "Dec 28, 2024",
    tags: ["Creativity", "Art Therapy", "Expression"],
  },
]

export default function SupportCircles() {
  const [circles, setCircles] = useState(supportCircles)
  const [selectedTopic, setSelectedTopic] = useState("All")
  const [showJoinModal, setShowJoinModal] = useState(null)

  const topics = [
    "All",
    "Anxiety & Stress",
    "Grief & Loss",
    "Life Transitions",
    "Mindfulness & Meditation",
    "Young Adult Support",
    "Creative Therapy",
  ]

  const filteredCircles = selectedTopic === "All" ? circles : circles.filter((circle) => circle.topic === selectedTopic)

  const joinedCircles = circles.filter((circle) => circle.isJoined)

  const handleJoinCircle = (circleId) => {
    setCircles((prev) =>
      prev.map((circle) =>
        circle.id === circleId ? { ...circle, isJoined: true, memberCount: circle.memberCount + 1 } : circle,
      ),
    )
    setShowJoinModal(null)
  }

  const handleLeaveCircle = (circleId) => {
    setCircles((prev) =>
      prev.map((circle) =>
        circle.id === circleId ? { ...circle, isJoined: false, memberCount: circle.memberCount - 1 } : circle,
      ),
    )
  }

  const handleBack = () => {
    window.location.href = "/"
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #1e215d 0%, #9461fd 40%, #d9afdf 100%)",
      }}
    >
      <Navigation />

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
        <div className="flex items-center justify-between mb-8 pt-4">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors duration-200 p-2 rounded-full hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-purple-200" />
            <h1 className="text-3xl font-bold text-white">Support Circles</h1>
          </div>
          <div className="w-20"></div> {/* Spacer for centering */}
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
              My Circles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {joinedCircles.map((circle) => (
                <div key={circle.id} className="bg-white/20 backdrop-blur-md border border-white/40 p-6 rounded-xl">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-white font-semibold text-lg">{circle.name}</h4>
                    <div className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs font-medium">
                      Joined
                    </div>
                  </div>
                  <p className="text-purple-200 text-sm mb-4">{circle.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-purple-300">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Next: {circle.nextMeeting}</span>
                    </div>
                    <div className="flex items-center text-purple-300">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>
                        {circle.meetingDay}s at {circle.meetingTime}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200">
                      <MessageCircle className="w-4 h-4 inline mr-1" />
                      Join Meeting
                    </button>
                    <button
                      onClick={() => handleLeaveCircle(circle.id)}
                      className="bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200"
                    >
                      Leave
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Topic Filter */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Browse by Topic</h3>
          <div className="flex flex-wrap gap-2">
            {topics.map((topic) => (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedTopic === topic
                    ? "bg-white/20 text-white border border-white/40"
                    : "bg-white/10 text-white/80 hover:bg-white/15 hover:text-white border border-white/20"
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Available Circles */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-6">Available Circles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCircles
              .filter((circle) => !circle.isJoined)
              .map((circle) => (
                <div
                  key={circle.id}
                  className="bg-white/15 backdrop-blur-md border border-white/30 p-6 rounded-xl hover:bg-white/20 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-white font-semibold text-lg">{circle.name}</h4>
                    <div className="text-purple-300 text-sm">
                      {circle.memberCount}/{circle.maxMembers}
                    </div>
                  </div>

                  <div className="bg-purple-500/20 text-purple-200 px-3 py-1 rounded-full text-xs font-medium mb-3 inline-block">
                    {circle.topic}
                  </div>

                  <p className="text-purple-200 text-sm mb-4 leading-relaxed">{circle.description}</p>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center text-purple-300">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>
                        {circle.meetingDay}s at {circle.meetingTime}
                      </span>
                    </div>
                    <div className="flex items-center text-purple-300">
                      <Users className="w-4 h-4 mr-2" />
                      <span>Facilitated by {circle.facilitator}</span>
                    </div>
                    <div className="flex items-center text-purple-300">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Next meeting: {circle.nextMeeting}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {circle.tags.map((tag, index) => (
                      <span key={index} className="bg-white/10 text-purple-200 px-2 py-1 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowJoinModal(circle.id)}
                    disabled={circle.memberCount >= circle.maxMembers}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center"
                  >
                    {circle.memberCount >= circle.maxMembers ? (
                      <>
                        <Users className="w-4 h-4 mr-2" />
                        Circle Full
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Join Circle
                      </>
                    )}
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* Guidelines */}
        <div className="bg-white/15 backdrop-blur-md border border-white/30 p-8 rounded-xl">
          <div className="flex items-center mb-4">
            <Shield className="w-6 h-6 text-green-400 mr-3" />
            <h3 className="text-xl font-bold text-white">Circle Guidelines</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-purple-200">
            <div>
              <h4 className="text-white font-semibold mb-2">Confidentiality</h4>
              <p className="text-sm">What's shared in the circle stays in the circle. Respect everyone's privacy.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">Respect</h4>
              <p className="text-sm">Listen without judgment and speak with kindness and empathy.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">Participation</h4>
              <p className="text-sm">Share as much or as little as you're comfortable with. No pressure to speak.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">Support</h4>
              <p className="text-sm">Offer encouragement and avoid giving unsolicited advice unless asked.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/20 backdrop-blur-md border border-white/30 p-8 rounded-xl max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Join Support Circle</h3>
            <p className="text-purple-200 mb-6">
              Are you ready to join this supportive community? By joining, you agree to follow our circle guidelines and
              participate respectfully.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowJoinModal(null)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleJoinCircle(showJoinModal)}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200"
              >
                Join Circle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
