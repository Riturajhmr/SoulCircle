import React, { useState, useEffect } from "react"
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowLeft, AlertCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../src/contexts/AuthContext"
import { useUserData } from "../src/hooks/useUserData"
import Button from "../src/components/ui/button"
import Card from "../src/components/ui/card"

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const { login, currentUser, clearError } = useAuth()
  const { questionResponses, loading } = useUserData()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  useEffect(() => {
    if (currentUser && !loading) {
      // Check if user has already answered questions
      if (questionResponses && questionResponses.responses) {
        console.log('✅ User has answered questions, redirecting to dashboard')
        navigate("/dashboard")
      } else {
        // Check localStorage as backup
        const savedAnswers = localStorage.getItem("soulcircle-answers")
        if (savedAnswers) {
          try {
            const parsedAnswers = JSON.parse(savedAnswers)
            if (Object.keys(parsedAnswers).length === 6) { // 6 questions total
              console.log('✅ User has completed questions in localStorage, redirecting to dashboard')
              navigate("/dashboard")
              return
            }
          } catch (error) {
            console.error('Error parsing saved answers:', error)
          }
        }
        // If no previous answers, go to questions
        navigate("/questions")
      }
    }
  }, [currentUser, questionResponses, loading, navigate])

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    if (error) {
      setError("")
      clearError()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await login(formData.email, formData.password)
      // The useEffect will handle the redirect based on whether user has answered questions
    } catch (error) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: "linear-gradient(135deg, #1e215d 0%, #9461fd 40%, #d9afdf 100%)",
      }}
    >
      {/* Background Stars */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          >
            <div className="w-1 h-1 bg-white/60 rounded-full" />
          </div>
        ))}
      </div>

      <Card className="relative w-full max-w-md bg-white/95 backdrop-blur-md border-white/30 shadow-2xl">
        <div className="p-8">
          {/* Back Button */}
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to continue your healing journey</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/80"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/80"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <button className="text-sm text-purple-600 hover:text-purple-700">
                Forgot your password?
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Signing In...
                </div>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              Don't have an account?
              <button onClick={() => navigate("/signup")} className="ml-2 text-purple-600 hover:text-purple-700 font-semibold">
                Sign Up
              </button>
            </p>
          </div>

          {/* Privacy Note */}
          <div className="text-center mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">Your privacy is our priority. All data is encrypted and secure.</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default LoginPage
