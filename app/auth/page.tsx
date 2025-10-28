'use client'

import { useState } from 'react'

export default function AuthPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Form submitted:', formData)
    } catch (error) {
      setErrors({ submit: 'Sign in failed. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B365D] to-[#0F1B2E] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Tailored Care Solutions
            </h1>
            <p className="text-white/80 text-sm">
              Admin Portal Access
            </p>
          </div>

          <form onSubmit={handleSubmit} role="form" aria-label="Admin sign in form" noValidate>
            <div className="space-y-6">
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium text-white mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  autoFocus
                  autoComplete="email"
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  aria-invalid={!!errors.email}
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:border-transparent backdrop-blur-sm transition-all duration-200"
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p 
                    id="email-error" 
                    role="alert" 
                    aria-live="polite"
                    className="mt-2 text-sm text-red-300"
                  >
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium text-white mb-2"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  autoComplete="current-password"
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  aria-invalid={!!errors.password}
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:border-transparent backdrop-blur-sm transition-all duration-200"
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <p 
                    id="password-error" 
                    role="alert" 
                    aria-live="polite"
                    className="mt-2 text-sm text-red-300"
                  >
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-[#D4A574] bg-white/10 border-white/30 rounded focus:ring-[#D4A574] focus:ring-2 focus:ring-offset-0"
                />
                <label 
                  htmlFor="rememberMe" 
                  className="ml-3 text-sm text-white cursor-pointer"
                >
                  Remember me
                </label>
              </div>

              {errors.submit && (
                <div 
                  role="alert" 
                  aria-live="assertive"
                  className="p-3 bg-red-500/20 border border-red-400/30 rounded-lg text-red-300 text-sm"
                >
                  {errors.submit}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#D4A574] hover:bg-[#C19660] disabled:bg-[#D4A574]/50 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:ring-offset-2 focus:ring-offset-transparent disabled:cursor-not-allowed"
                aria-describedby="submit-button-description"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing In...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
              <p id="submit-button-description" className="sr-only">
                Click to sign in to the admin portal
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
