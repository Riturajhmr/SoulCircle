import React, { useState, useEffect } from "react"
import { Moon, Star, Heart, MessageCircle, Users, PenTool, Sparkles } from "lucide-react"
import { useNavigate } from "react-router-dom"
import Button from "../src/components/ui/button"
import Card from "../src/components/ui/card"
import AuthModal from "../src/components/AuthModal"

const questions = [
  {
    id: 1,
    emoji: "🌙",
    question: "How are you feeling right now?",
    options: ["Sad", "Anxious", "Angry", "Numb", "Lost", "Hopeful"],
  },
  {
    id: 2,
    emoji: "👥",
    question: "What do you need today?",
    options: [
      "Someone to listen",
      "Someone to talk to",
      "A safe place to vent",
      "Read others' stories",
      "Just some silence",
    ],
  },
  {
    id: 3,
    emoji: "📊",
    question: "What is weighing you down?",
    options: ["Stress", "Loneliness", "Family issues", "Relationship pain", "Self-doubt"],
  },
  {
    id: 4,
    emoji: "🔍",
    question: "What often triggers these feelings?",
    options: ["Work/Study pressure", "Family", "Friends", "Social media", "Health"],
  },
  {
    id: 5,
    emoji: "💡",
    question: "What do you hope to get here?",
    options: ["Relief", "Connection", "Clarity", "Comfort", "Understanding"],
  },
  {
    id: 6,
    emoji: "🎭",
    question: "How do you want to participate?",
    options: ["Chat anonymously", "Read only", "Both", "Not sure yet"],
  },
]

const SoulCircleHero = () => {
  const [animationPhase, setAnimationPhase] = useState(0)
  const [hasSeenLogoEffect, setHasSeenLogoEffect] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user has seen the logo effect before
    const hasSeenEffect = localStorage.getItem('soulcircle-logo-effect-seen')
    
    if (hasSeenEffect === 'true') {
      // Skip logo effect and go directly to main content
      setAnimationPhase(4)
      setHasSeenLogoEffect(true)
    } else {
      // First time visitor - show logo effect
      setHasSeenLogoEffect(false)
      setAnimationPhase(0) // Ensure we start from phase 0
      const timer1 = setTimeout(() => setAnimationPhase(1), 800) // Faster initial
      const timer2 = setTimeout(() => setAnimationPhase(2), 2200) // More dramatic pause
      const timer3 = setTimeout(() => setAnimationPhase(3), 4000) // Build suspense
      const timer4 = setTimeout(() => {
        setAnimationPhase(4)
        // Mark that user has seen the logo effect
        localStorage.setItem('soulcircle-logo-effect-seen', 'true')
      }, 6000) // Longer reveal

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
        clearTimeout(timer3)
        clearTimeout(timer4)
      }
    }
  }, [])

  const handleGetStarted = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Show auth modal
    setShowAuthModal(true)
  }

  const handleSkip = () => {
    navigate("/questions")
  }

  // Function to reset logo effect (for testing or user preference)
  const resetLogoEffect = () => {
    localStorage.removeItem('soulcircle-logo-effect-seen')
    setAnimationPhase(0)
    setHasSeenLogoEffect(false)
    // Restart the animation sequence
    const timer1 = setTimeout(() => setAnimationPhase(1), 800)
    const timer2 = setTimeout(() => setAnimationPhase(2), 2200)
    const timer3 = setTimeout(() => setAnimationPhase(3), 4000)
    const timer4 = setTimeout(() => {
      setAnimationPhase(4)
      localStorage.setItem('soulcircle-logo-effect-seen', 'true')
    }, 6000)
  }

  return (
    <div
      className="h-screen relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #1e215d 0%, #9461fd 40%, #d9afdf 100%)",
      }}
    >
      {/* Animated Stars Background */}
      <div className="absolute inset-0">
        {[...Array(120)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${2 + Math.random() * 4}s`,
            }}
          >
            <Star className={`${Math.random() > 0.6 ? "w-2 h-2" : "w-1 h-1"} text-white opacity-80 fill-current`} />
          </div>
        ))}
      </div>

      {/* Navbar */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-1000 ${
          hasSeenLogoEffect || animationPhase >= 4 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}
      >
        <div className="backdrop-blur-md bg-white/10 border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3">
              <div className="flex items-center space-x-2">
                <Moon className="w-6 h-6 text-purple-200" />
                <span className="text-white font-semibold text-lg">SoulCircle</span>
              </div>
              <div className="hidden md:flex space-x-8">
                <a href="#" className="text-purple-200 hover:text-white transition-colors">
                  Home
                </a>
                <a href="#" className="text-purple-200 hover:text-white transition-colors">
                  About
                </a>
                {/* Debug button - remove in production */}
                <button 
                  onClick={resetLogoEffect}
                  className="text-purple-200 hover:text-white transition-colors text-xs"
                  title="Reset logo effect (debug)"
                >
                  Reset Logo
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* CINEMATIC POWERFUL INTRO - SMOOTH & ELEGANT */}
      {!hasSeenLogoEffect && (
        <div
          className={`fixed inset-0 flex flex-col items-center justify-center z-40 transition-all duration-2000 ${
            animationPhase >= 4 ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
          style={{
            background: "linear-gradient(135deg, #1e215d 0%, #9461fd 40%, #d9afdf 100%)",
          }}
        >
        {/* Subtle Background Particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white/30 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `float ${4 + Math.random() * 3}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 4}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* SMOOTH CENTRAL LOGO */}
        <div
          className={`relative mb-20 transition-all duration-2000 ease-out ${
            animationPhase >= 1 ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-75 translate-y-8"
          }`}
        >
          {/* Elegant Rotating Rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-64 h-64 rounded-full border border-white/20"
              style={{
                animation: animationPhase >= 1 ? "spin 30s linear infinite" : "none",
              }}
            />
            <div
              className="absolute w-48 h-48 rounded-full border border-white/15"
              style={{
                animation: animationPhase >= 1 ? "spin 25s linear infinite reverse" : "none",
              }}
            />
            <div
              className="absolute w-32 h-32 rounded-full border border-white/10"
              style={{
                animation: animationPhase >= 1 ? "spin 20s linear infinite" : "none",
              }}
            />
          </div>

          {/* Central Moon with Smooth Appearance */}
          <div className="relative flex items-center justify-center">
            {/* Subtle Background Glow */}
            <div className="absolute inset-0 bg-white/5 rounded-full blur-3xl w-80 h-80" />

            {/* Main Moon Icon */}
            <Moon
              className={`w-28 h-28 text-white relative z-10 transition-all duration-1500 ease-out ${
                animationPhase >= 1 ? "drop-shadow-2xl" : ""
              }`}
            />
          </div>
        </div>

        {/* SMOOTH TITLE REVEAL */}
        <div
          className={`text-center transition-all duration-2500 ease-out ${
            animationPhase >= 2 ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-12 scale-95"
          }`}
        >
          {/* Main Title with Clean Effect */}
          <div className="relative mb-8">
            {/* Main Title */}
            <h1 className="relative text-8xl md:text-9xl font-black tracking-wider">
              <span className="bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-transparent drop-shadow-xl">
                SoulCircle
              </span>
            </h1>

            {/* Clean Underline Effect */}
            <div
              className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 h-1 bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-2000 ease-out rounded-full"
              style={{ width: animationPhase >= 2 ? "180px" : "0px" }}
            />
          </div>
        </div>

        {/* SMOOTH TAGLINE */}
        <div
          className={`text-center transition-all duration-2000 ease-out ${
            animationPhase >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="relative">
            {/* Clean Tagline */}
            <p className="text-2xl md:text-3xl text-white/90 font-light tracking-widest uppercase">
              <span
                className={`inline-block mx-2 transition-all duration-500 ${
                  animationPhase >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: "0ms" }}
              >
                Speak.
              </span>
              <span
                className={`inline-block mx-2 transition-all duration-500 ${
                  animationPhase >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: "200ms" }}
              >
                Heal.
              </span>
              <span
                className={`inline-block mx-2 transition-all duration-500 ${
                  animationPhase >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: "400ms" }}
              >
                Be Free.
              </span>
            </p>
          </div>
        </div>

        {/* SMOOTH FADE OUT EFFECT */}
        <div
          className={`absolute inset-0 transition-opacity duration-2000 ease-out ${
            animationPhase >= 4 ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background: "linear-gradient(135deg, #1e215d 0%, #9461fd 40%, #d9afdf 100%)",
          }}
        />
      </div>
      )}

      {/* SINGLE SECTION MAIN CONTENT - NO SCROLLING */}
      <div className={`transition-all duration-2000 ${hasSeenLogoEffect || animationPhase >= 4 ? "opacity-100" : "opacity-0"}`}>
        <div className="h-screen flex items-center pt-16 pb-8">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center h-full">
              {/* Left Side - COMPACT CONTENT */}
              <div className=" flex flex-col justify-center">
                {/* Header Quote */}
                <div className="space-y-0">
                  <blockquote className="text-xl lg:text-2xl text-purple-100 italic leading-relaxed border-l-4 border-purple-300 pl-6">
                    "You are not broken. You are simply carrying more than anyone knows."
                  </blockquote>
                  <p className="text-base lg:text-lg text-purple-200 leading-relaxed">
                    Welcome to a space where your silence is heard, your chaos is understood, and your emotions are
                    safe.
                  </p>
                </div>

                {/* Why & Mission Combined */}
                <Card className="bg-white/15 space-y-2 backdrop-blur-md border-white/30 p-4 rounded-2xl">
                  <h3 className="text-xl font-semibold text-white mb-2">💬 Why SoulCircle Exists</h3>
                  <p className="text-base text-purple-100 leading-relaxed mb-3">
                    Millions struggle with overthinking, anxiety, and thoughts they can't express. Sometimes you just
                    need someone who says, "Me too."
                  </p>
                  <p className="text-base text-purple-100 font-medium">
                    🌌 This isn't a startup. It's a lifeboat — for all of us silently struggling.
                  </p>
                </Card>

                {/* Compact Features */}
                <div className="space-y-0">
                  <h3 className="text-lg font-semibold text-white">🤝 What You'll Find Here</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { icon: MessageCircle, title: "Emotion-Based Chat Rooms" },
                      { icon: PenTool, title: "Anonymous FeelNotes" },
                      { icon: Users, title: "Support Circles" },
                      { icon: Heart, title: "Total Anonymity" },
                    ].map((feature, index) => (
                      <Card
                        key={index}
                        className="bg-white/10 backdrop-blur-sm border-white/20 p-3 rounded-xl hover:bg-white/15 transition-all duration-300 text-center"
                      >
                        <feature.icon className="w-6 h-6 text-purple-300 mx-auto mb-3" />
                        <h4 className="font-medium text-purple-100 text-base leading-tight">{feature.title}</h4>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* CTA Section */}
                <div className="space-y-0 pt-2">
                  <div className="text-center lg:text-left">
                    <h3 className="text-xl font-semibold text-white mb-2">💫 Let's Begin...</h3>
                    <p className="text-base text-purple-200 mb-3">
                      You've held it in long enough. It's time to speak, to heal, to be free.
                    </p>
                  </div>
                  <div className="flex flex-col items-center lg:items-start space-y-3 relative z-10">
                    <Button
                      onClick={handleGetStarted}
                      type="button"
                      size="lg"
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 rounded-full px-10 py-4 text-lg font-semibold shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105 cursor-pointer group relative z-20"
                      style={{ pointerEvents: 'auto' }}
                    >
                      <Sparkles className="w-6 h-6 mr-3 group-hover:animate-spin transition-transform duration-300 group-hover:text-yellow-200" />
                      <span className="group-hover:text-yellow-100 transition-colors duration-300 group-hover:font-bold">
                        Get Started 💫
                      </span>
                    </Button>
                    <p className="text-purple-300 italic opacity-90 text-xs">📝 You are not alone anymore. 🌙</p>
                  </div>
                </div>
              </div>

              {/* Right Side - HIGHLIGHTED PROMINENT IMAGE */}
              <div className="relative flex items-center justify-center">
                <div className="relative h-[350px] lg:h-[450px] xl:h-[550px] w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-500">
                  {/* Enhanced Glow Effect */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-purple-400 via-pink-300 to-indigo-400 rounded-3xl blur-2xl opacity-30 animate-pulse" />
                  {/* Main Image Container */}
                  <div className="relative h-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 backdrop-blur-sm border-2 border-white/40 rounded-3xl overflow-hidden">
                    <img
                      src="https://sjc.microlink.io/KkLeIZOUuEyNx7KSVURBEkMnvP9ldcsn8mNgbuiB-Ir-93HMJS6axZjc8Tdy0ziTy0M0q-rrj3mBIVpTJ_DHpA.jpeg"
                      alt="Peaceful mountain landscape at sunset with calm waters reflecting the sky, representing inner peace and emotional healing"
                      className="w-full h-full object-cover"
                    />
                    {/* Highlighting Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-transparent to-pink-300/10" />
                    {/* Floating Magical Elements */}
                    <div className="absolute inset-0 pointer-events-none">
                      {[...Array(18)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute animate-bounce"
                          style={{
                            left: `${10 + Math.random() * 80}%`,
                            top: `${10 + Math.random() * 80}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${4 + Math.random() * 4}s`,
                          }}
                        >
                          <div className="w-4 h-4 bg-white/40 rounded-full blur-sm animate-pulse" />
                        </div>
                      ))}
                    </div>
                    {/* Corner Sparkles */}
                    <div className="absolute top-4 right-4">
                      <Sparkles className="w-7 h-7 text-white/60 animate-spin" />
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <Sparkles className="w-6 h-6 text-white/40 animate-bounce" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onContinueWithoutAccount={handleSkip}
      />
    </div>
  )
}

export default SoulCircleHero
