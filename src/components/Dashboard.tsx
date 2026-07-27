import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'


export default function Dashboard() {
    const [session, setSession] = useState(false)
    //const [Loading, setLoading] = useState(true)
    //const [error, setError] = useState<string | null>(null)


    useEffect(() => {
        const verifyUser = async () => {
            const { data: { user }, error } = await supabase.auth.getUser()

            if(error || !user){
                setSession(false)
                return
            }

            setSession(true)
        }
        verifyUser()
    }, [])



  
  if (Loading) return <div className="loading">Loading your account...</div>

  return (
    <div className="dashboard">
      <header className="dash-header">
        <h1>DressMeUp</h1>
        <div className="user-info">
            <span>{user.email}</span>

            <div className= "user-wardrobe">
                <h2>Your Wardrobe</h2>
                <


          </div>





          <button className="signout-btn" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </header>

      {/* closet pressed? */}
        <main className="subs-main">
          <div className="subs-header">
            <h2>Your closet</h2>
            <ol>
                
            <ol/>
          </div>

          {error && <p className="error-msg">{error}</p>}

          }
            </ul>
          
        </main>
      )}
    </div>
  )
}
