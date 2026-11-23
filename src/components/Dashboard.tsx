import './Dashboard.css'
import './Auth'
import UploadRetrieveItems from './RetrieveImages'
import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'
import {type User} from '@supabase/supabase-js' 
import { useNavigate, Link } from 'react-router-dom'




  export default function Dashboard() {
    const [user, setUser] = useState<User|null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    //const [error, setError] = useState<string | null>(null)
    //const [images, setImages] = useState<string[]>([]);
    const [isSignedOut, setIsSignedOut] = useState(false);
    //const [isuploaded, setUploading] = useState(false);


    const navigate = useNavigate();

    
    /*Login Screen
    
    */
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
        };
        verifyUser()
    }, [])


    //Sign user out if user presses 'sign out' button
    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setIsSignedOut(true); 
    };

    //const for the buttons 

  if (loading) return <div className="loading">Loading your account...</div>


     

  return (
    <div className="dashboard-container">

      <header className="dash-header">
        <div className ="welcome-msg">
          <p>Welcome!!</p>
          <h1>DressMeUp</h1>
        </div>
        <div className="toggle-switch"></div>
      </header>
      

      {/*Action cards */}
      <section className = "action-cards">
        <Link to="/create-outfit" className="dark-card">Create Outfit</Link>
        <div className="light-card">Make album</div>
      </section>


      {/* Navigation bar tabs ----- figure out active tab navigation */}
      <nav className="dashboard-tabs">
        <button className="tab">Saved Outfits</button>
        <button className="tab">Favorites</button>
        <button className="tab">Albums</button>

        {/*When clicked changes url*/}
        <button className="create-outfit-btn" onClick={() => navigate('/create-outfit')}>Create Outfit</button> 
      </nav>
            


      <section className="wardrobe-section">
        <h2>My Wardrobe</h2>
        {/*going to call wardrobe functikon for image fetching*/ }

        {user && (
        <>
          <UploadRetrieveItems category="Tops" userId={user.id} />
          <UploadRetrieveItems category="Bottoms" userId={user.id} /> 
          <UploadRetrieveItems category="Shoes" userId={user.id} /> 
          <UploadRetrieveItems category="Accessories" userId={user.id} /> 
        </>
      )}
    </section>


       
    <div className="signout">
      <button className="signout-btn"
        onClick={handleSignOut}>
        Sign Out
      </button>
    </div>



      {/*bottom nav bar */}
      <nav className="bottom-nav">
        {/* home closet create*/}
      </nav>
    </div>
     
  );
}
