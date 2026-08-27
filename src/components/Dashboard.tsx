import './Dashboard.css'
import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'
import type {User} from '@supabase/supabase-js' //supabasde user object0



//interface to describe cvlothing:
interface ClothingItem {
  id: string;
  name: string;
  brand?: string; // The ? makes it optional!
}


export default function Dashboard() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)


    useEffect(() => {
        const verifyUser = async () => {
            const { data: { user }, error } = await supabase.auth.getUser()


            //error loggining in or no user found, set user to null and return
            if(error || !user){  
                setLoading(false)
                return
            }

            setUser(user)  //save user object to state?
            setLoading(false) //stop loading screen once user is verified
        }
        verifyUser()
    }, [])



  
  if (loading) return <div className="loading">Loading your account...</div>



  return (
    <div className="dashboard-container">

      <header className="dash-header">
        <div className ="welcome-msg">
          <p>Welcome!!</p>
          <h1>DressMeUp</h1>
        </div>

        <div className="toggle-switch">
        </div>
      </header>
      

      {/* NEW SECTION // Action cards */}
      <section className = "action-cards">
        <div className="dark-card">Create Outfit</div>
        <div className="light-card">Make album</div>
      </section>


      {/* Navigation bar tabs ----- figure out active tab navigation */}
      <nav className="dashboard-tabs">
        <button className="tab">Saved Outfits</button>
        <button className="tab">Favorites</button>
        <button className="tab">Albums</button>
        <button className="tab">CreateOutfit</button>
      </nav>
            
      {/*tab content --- to be done later*/}
      <section className="tab-content">
        <button className="create-outfit-btn">Create Outfit</button>

      </section>

      {/*user wardrobe */}
      <section className="wardrobe">
        <h2>My Wardrobe</h2>

        {/*Map out clothing items*/}
        <div className="clothing-category">
          <div className="category-header">
            <h3>Tops</h3>
            <span>3</span>
          </div>
          <div className="clothing-scroll-list">
            <button className="add-item-btn">+ Add</button>
            <div className="clothing-placeholder">Img 1</div>
            <div className="clothing-placeholder">Img 2</div>
          </div>
        </div>
      </section>

      {/*bottom nav bar*/}
      <nav className="bottom-nav">
        {/* home closet create*/}
      </nav>
    </div>

         
      
  )
}
