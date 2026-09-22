import { useRef } from 'react'
import './Dashboard.css'
import './Auth'
import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'
import type {User} from '@supabase/supabase-js' //supabasde user object0



//interface to describe cvlothing:
interface ClothingItem {
  id: string;
  name: string;
  brand?: string; // The ? makes it optional!
}

function WardrobeCategory ({ category, userId}: { category : string, userId: string }) {
  
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  


  //function handling file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files?.[0];

    if (!files) return;

    //uploading image to supabase storage and inserting into database
    try{
     
      //create unique file name
      const fileName = `${userId}/${category.toUpperCase()}/${Date.now()}_${files.name}`;
      /*date.now() switch for other date method)*/
      
      
      setUploading(true);

      //insert into storage bucket
      const { data, error: uploadError } = await supabase.storage.from('clothing_images').upload(fileName, files);
      if (uploadError) throw uploadError;

      //insert into database table
      const {error: dbError } = await supabase.from('clothing').insert({user_id: userId, category: category,is_short: false, image_url: fileName, created_at: Date.now() }).select();
      /*is short functionaloty to added later, for now just set to false*/
      if (dbError) throw dbError;
    

    }catch{
       
          console.error("Error uploading file:", uploadError);

          console.error("Error inserting into database:", dbError);

    } finally {
      setUploading(false);
    }

  }


    //handle buttom click
  const handleAddItem = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (inputRef.current) {
      inputRef.current.click(); // Trigger the file input click
    }
    else return;
  }

  return(
    <div className="clothing-category">
      <div className="category-header">
        <h3>{category}</h3>
        <span>0</span>
      </div>
      <div className="clothing-scroll-list">
        <button className="add-item-btn" onClick={handleAddItem}>+</button>
        <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
           

      </div>
    </div>
  );
}

  export default function Dashboard() {
    const [user, setUser] = useState<User|null>(null)
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


      <section className="wardrobe-section">
        <h2>My Wardrobe</h2>

      {/*user wardrobeno type mismatch, using && en sures  */}
        {user && (<WardrobeCategory category="Tops" userId={user.id} /> )}
        {user && (<WardrobeCategory category="Bottoms" userId={user.id} /> )}
        {user && (<WardrobeCategory category="Shoes" userId={user.id} /> )}
        {user && (<WardrobeCategory category="Accessories" userId={user.id} /> )}

        <div style={{ marginTop: '20px' }}>
          <button className="add-item-btn"
            onClick={() => {
              /*await supabase.storage.from('wardrobe').upload('imagepathway.imp', file);*/
              console.log("need to putnput type ='file' before uploading ")
            }} //error
          >
            Test Upload
          </button>
        </div>
    
      </section>
          

      <div className="signout">
        <button className="signout-btn"
          onClick={async () => {
            await supabase.auth.signOut()
          }}
         >
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
