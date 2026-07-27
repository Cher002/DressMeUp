import { useState, useEffect } from 'react'
import { supabase } from './utils/supabase'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'

import './App.css'

function App() {
  const [session, setSession] = useState(false)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Check if there's already an active session 
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(!!session)
      setLoading(false)
    })

    // Listen for state changes: sign in, sign out, token refresh
    const {
      data: { subscription },} = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(!!session)
    })

    //clean up the listener 
    return () => subscription.unsubscribe()
    }, [])

  if (loading) return <div className="loading">Loading...</div>

  //if user is nhot logged in, show authentication form
  if (!session) {
    return <Auth />
  }

  // If the user is logged in, show the main app content --> c  // call dashboard fro9m another file. create a dashboard and import here
  return session  ? <Dashboard client={session.client} /> : <Auth />
}

export default App