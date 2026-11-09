import './Dashboard.css'
import './Auth'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../utils/supabase'
import {type User} from '@supabase/supabase-js' 



//interface to describe clothing:
interface ClothingItem {
  id: string;
  category: string
  image_url: string;
  signedUrl?: string; // Optional property
  name?: string; // Optional property
  created_at: string;
}



function WardrobeCategory ({ category, userId}: { category : string, userId: string }) {
  
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [items, setItems] = useState<ClothingItem[]>([]);


    useEffect(() => {
      const retrieveImages = async () => {

        //retieves all existing clothing from the specified category, from the user
        const { data, error } = await supabase.from('clothing').select('*').eq('user_id', userId).eq('category', category);

        if(error){
          console.error("Error retrieving images:", error);
          return;
        } 
          
        //if there are existing clothing in the specified category 
        if (data && data.length >0){
          const paths = data.map((item: { image_url: string }) => item.image_url);
          const { data: signedData, error: signError } = await supabase.storage.from('clothing_images')                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       .createSignedUrls(paths, 3600);
        

          if (signError){
            console.error("Error creating signed URLs:", signError);
            return;
          }

          const urlByPath = new Map((signedData ?? []).map((entry) => [entry.path, entry.signedUrl]) ?? []);
          const itemsWithUrls = data.map((item) => ({
            ...item,
            signedUrl: urlByPath.get(item.image_url), // Add the signed URL to the item}))
          }));


          setItems(itemsWithUrls); //add the items with signedUrl
        } else {
          setItems([]); // No items found, set to empty array
        }
      };
      
      retrieveImages();
  }, [category, userId]);



  //file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    //no files currently uploaded
    if (!file) return;

    //uploading image to supabase storage and inserting into database
    try{
      
      setUploading(true)
      const fileName = `${userId}/${category.toUpperCase()}/${crypto.randomUUID()}-${file.name}`;
    
      //upload fie into storage bucket clthing_images
      const { error: uploadError } = await supabase.storage.from('clothing_images').upload(fileName, file);
      if (uploadError) throw uploadError;


      // Let Postgres default created_at (timestamptz).   not Date.now()!
      const insertPayload = { user_id: userId, category: category, is_short: false, image_url: fileName };
    
      //insert data into table 'clothing'
      const {error: dbError } = await supabase.from('clothing').insert(insertPayload);
     
      /*is short functionaloty to added later, for now just set to false*/
      if (dbError) throw dbError;

      console.log("uploaded and saved to database")
    
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage.from('clothing_images').createSignedUrl(fileName, 3600);
      //CREATES A SIGNED URL FOR THE UPLOADED FILE
      if (signedUrlError) throw signedUrlError;

      //refresh local state with the NEW signed url, 
      setItems((prev) => [...prev, { id: fileName, category, name: file.name, image_url: fileName, signedUrl: signedUrlData?.signedUrl, created_at: new Date().toISOString() }]);


    }catch(err){    
          console.error("Upload error:", err);
         
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };
 




  //handle buttom click
  const handleAddItem = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (inputRef.current) {
      inputRef.current.click(); // Trigger the file input click
    }
  };

  return(
    <div className="clothing-category">
      <div className="category-header">
        <h3>{category}</h3>
       {/* <span>{items.length}</span>*/}
      </div>
      <div className="clothing-scroll-list">
        <button className="add-item-btn" onClick={handleAddItem} disabled={uploading}>
          {uploading ? "..." : "+"}
        </button>
        <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />


      {/*placeholder cards for f4tch4ed it4ems*/}
   
      {items.map((item) => (
        <div key={item.id} className="clothing-placeholder">
           <img
             src={item.signedUrl}
             alt={item.name ?? item.category}
             onLoad={() => {
               // #region agent log
               fetch('http://127.0.0.1:7885/ingest/9107199e-57df-46c6-82aa-5370ac86b64b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0622b4'},body:JSON.stringify({sessionId:'0622b4',runId:'pre-fix',hypothesisId:'E',location:'Dashboard.tsx:img:onLoad',message:'img loaded',data:{category,itemId:item.id,hasSrc:Boolean(item.signedUrl)},timestamp:Date.now()})}).catch(()=>{});
               // #endregion
             }}
             onError={() => {
               // #region agent log
               fetch('http://127.0.0.1:7885/ingest/9107199e-57df-46c6-82aa-5370ac86b64b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0622b4'},body:JSON.stringify({sessionId:'0622b4',runId:'pre-fix',hypothesisId:'E',location:'Dashboard.tsx:img:onError',message:'img failed to load',data:{category,itemId:item.id,srcPreview:item.signedUrl?.slice?.(0,80) ?? null},timestamp:Date.now()})}).catch(()=>{});
               // #endregion
             }}
           />
           {/*maybe for easy convenience they are all category or it is all names?*/}
        </div>
        
      ))}
      <span>{items.length}</span>
      </div>
    </div>
    
  );
}

  export default function Dashboard() {
    const [user, setUser] = useState<User|null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [images, setImages] = useState<string[]>([]);
    const [isSignedOut, setIsSignedOut] = useState(false);
    const [isuploaded, setUploading] = useState(false);


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
        {/*going to call wardrobe functikon for image fetching*/ }

        {user && (
        <>
          <WardrobeCategory category="Tops" userId={user.id} />
          <WardrobeCategory category="Bottoms" userId={user.id} /> 
          <WardrobeCategory category="Shoes" userId={user.id} /> 
          <WardrobeCategory category="Accessories" userId={user.id} /> 
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
