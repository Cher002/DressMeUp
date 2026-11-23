import { useState, useEffect } from 'react'
import { Route,  Routes } from 'react-router-dom'
import { type Session } from '@supabase/supabase-js'
import { supabase } from './utils/supabase'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import CreateOutfit from './components/CreateOutfit'
import './App.css'


function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Check if there's already an active session 
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for state changes: sign in, sign out, token refresh
    const {
      data: { subscription },} = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    //clean up the listener 
    return () => subscription.unsubscribe()
    }, [])

  if (loading) return <div className="loading">Loading...</div>

  //if user is not logged in, show authentication form
  if (!session) {
    return <Auth />
  }

  return(
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/create-outfit" element={<CreateOutfit userId={session.user.id} />} />

    </Routes>
  )
}

export default App
