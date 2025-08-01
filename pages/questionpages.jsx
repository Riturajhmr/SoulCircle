import React, { useState, useEffect } from "react"
import { Moon, Star, Sparkles, ArrowLeft, ArrowRight, X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import Button from "../src/components/ui/button"
import Card from "../src/components/ui/card"

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

const QuestionsPage = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedOption, setSelectedOption] = useState("")
  const [answers, setAnswers] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    setSelectedOption(answers[currentStep] || "")
  }, [currentStep, answers])

  const handleOptionSelect = (option) => {
    setSelectedOption(option)
    const newAnswers = { ...answers, [currentStep]: option }
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (!selectedOption) return
    if (currentStep === questions.length) {
      // Store answers in localStorage and navigate to welcome page
      localStorage.setItem("soulcircle-answers", JSON.stringify(answers))
      navigate("/welcome")
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleClose = () => {
    if (confirm("Are you sure you want to close? Your progress will be lost.")) {
      window.location.reload()
    }
  }

  const currentQuestion = questions.find((q) => q.id === currentStep)
  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === questions.length

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #1e215d 0%, #9461fd 40%, #d9afdf 100%)",
      }}
    >
      {/* Animated Stars Background */}
      <div className="absolute inset-0">
        {[...Array(80)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
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

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-2xl">
          <Card
            className="relative bg-gradient-to-br from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-md border-white/30 p-8 rounded-3xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(30, 33, 93, 0.95) 0%, rgba(148, 97, 253, 0.95) 40%, rgba(217, 175, 223, 0.95) 100%)",
            }}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Header with Progress */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Moon className="w-8 h-8 text-purple-200" />
                <h1 className="text-2xl font-bold text-white">SoulCircle</h1>
              </div>
              <div className="flex items-center justify-center space-x-2 mb-2">
                {questions.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index + 1 === currentStep
                        ? "bg-purple-400 scale-125"
                        : index + 1 < currentStep
                          ? "bg-purple-300"
                          : "bg-white/30"
                    }`}
                  />
                ))}
              </div>
              <p className="text-purple-200 text-sm">
                Step {currentStep} of {questions.length}
              </p>
            </div>

            {/* Question Content */}
            {currentQuestion && (
              <div className="transition-all duration-500 opacity-100 translate-y-0 scale-100">
                {/* Question */}
                <div className="text-center mb-8">
                  <div className="text-6xl mb-4">{currentQuestion.emoji}</div>
                  <h2 className="text-3xl font-bold text-white mb-2">{currentQuestion.question}</h2>
                  <p className="text-purple-200">Choose the option that resonates with you most</p>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={option}
                      onClick={() => handleOptionSelect(option)}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 text-left hover:scale-105 hover:shadow-lg ${
                        selectedOption === option
                          ? "bg-purple-500/30 border-purple-400 text-white shadow-purple-500/20 shadow-lg"
                          : "bg-white/10 border-white/20 text-purple-100 hover:bg-white/15 hover:border-white/30"
                      }`}
                      style={{
                        animationDelay: `${index * 100}ms`,
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                            selectedOption === option ? "bg-purple-400 border-purple-400" : "border-white/40"
                          }`}
                        >
                          {selectedOption === option && (
                            <div className="w-full h-full rounded-full bg-white scale-50" />
                          )}
                        </div>
                        <span className="font-medium">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center">
                  {!isFirstStep ? (
                    <Button
                      onClick={handleBack}
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                  ) : (
                    <div></div>
                  )}
                  <Button
                    onClick={handleNext}
                    disabled={!selectedOption}
                    className={`transition-all duration-300 ${
                      selectedOption
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-purple-500/30 hover:scale-105"
                        : "bg-gray-500 text-gray-300 cursor-not-allowed"
                    }`}
                  >
                    {isLastStep ? (
                      <>
                        Complete
                        <Sparkles className="w-4 h-4 ml-2" />
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>

                {/* Encouraging Message */}
                <div className="text-center mt-6">
                  <p className="text-purple-200 italic opacity-90 text-sm">
                    {currentStep === 1 && "Take your time. There are no wrong answers here. 💜"}
                    {currentStep === 2 && "Your needs are valid and important. 🤗"}
                    {currentStep === 3 && "You're not alone in carrying these burdens. 🌟"}
                    {currentStep === 4 && "Understanding your triggers is the first step to healing. 🌱"}
                    {currentStep === 5 && "Your hopes matter. We're here to support them. ✨"}
                    {currentStep === 6 && "However you choose to participate, you're welcome here. 🏠"}
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

export default QuestionsPage
