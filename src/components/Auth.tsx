import { useState } from 'react'
import { supabase } from '../utils/supabase'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [resetPassword, setResetPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null >(null)

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
        if (isSignUp) {
        
          // Create a new account — Supabase sends a confirmation email
          const { error } = await supabase.auth.signUp({ email, password })
        
          if (error) throw error
            setMessage("Check your email to confirm your account!")

        } else if(resetPassword){

          //send password reset email
          const { error } = await supabase.auth.resetPasswordForEmail(email,
             {redirectTo: 'http://localhost:5173/reset-password'})//add url to reset password (create )

          if (error) throw error
          setMessage("Check your email to reset your password!")
        
        } else {
        
          // Sign in with existing account
          const { error } = await supabase.auth.signInWithPassword({ email, password })
        
          if (error) throw error
          // On success, App.jsx will detect the session change and re-render
        }
    

      } catch (error) {

        if(error instanceof Error){
          setError(error.message)
        } else {
          setError('An unknown error occurred')
        }
      } finally {
        setLoading(false)
      }
  }

  return ( 
    <div className="auth-container">
      <h1>DressMeUp</h1>
      <p className="auth-siginup-text">
        {resetPassword ? 'Reset your password' : isSignUp ? 'Create an account to get started' : 'Sign in to your account'}
      </p>

      <div className="auth-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {!resetPassword && (
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        )}

        {error && <p className="error-msg">{error}</p>}
        {message && <p className="success-msg">{message}</p>}

        <button onClick={handleSubmit} disabled={loading}>
          {loading 
          ? 'Loading...' : resetPassword 
          ? 'Reset Password' : isSignUp 
          ? 'Create Account' : 'Sign In'}
        </button>

        <button
          className="toggle-btn"
          onClick={() => {
            setIsSignUp(!isSignUp)
            setResetPassword(false)
            setError(null)
            setMessage(null)
          }}
        >
          {isSignUp
            ? 'Already have an account? Sign in'
            : "Don't have an account? Sign up"}
        </button>

        <button
          className="toggle-btn"
          onClick={() => {
            setResetPassword(!resetPassword)
            setIsSignUp(false)
            setError(null)
            setMessage(null)
          }}
        >
          {resetPassword
            ?'Back to Sign In' : 'Forgot Password?'}
        </button>
      </div>
    </div>
  )
}
