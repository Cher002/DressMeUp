import { useState, useEffect, useRef } from 'react'
import { supabase } from '../utils/supabase'
import useClothingItems from '../hooks/useClothingItems';
//import {EditUploads} from './OutfitBuilder'




export default function UploadRetrieveItems ({ category, userId}: { category : string, userId: string }) {
    const inputRef = useRef<HTMLInputElement>(null);    //input files provided by the user
    const [uploading, setUploading] = useState(false);

    //Retrieve items from hook by passing userId, and category 
    const { items, addItem } = useClothingItems({ userId, category });
      
  
    /*
    User uploads a file which will get renamed and uploaded to the supabase storage bucket
     ClothingItem data from specified image will then be uploaded to the database table
    A signedUrl is created to acess image when rendered and is added to the hook
    */
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
  
      //If no files are currently uploaded nothing will return
      if (!file) return;
  
    
      //Otherwise try uploading image to supabase storage buikets and inserting into database
      try{
        
        setUploading(true)
        const fileName = `${userId}/${category.toUpperCase()}/${crypto.randomUUID()}-${file.name}`;
      
      /*
        //Calling the Agent to render the images

        const prompt = 'Render the provided image so that the background is plain white, and only keep the ${category} item in the generated image';
        console.log("attempting to render the image. in editUploads() ");
        const cleanedImage = await EditUploads(file, prompt);
        console.log("finished edituploads()");
        const toUpload = cleanedImage ?? file  //if agent failed revert to original image provided.
        console.log("value toUpload assigned");
      */
  
        console.log('attempting file upload');
  
        //upload fie into storage bucket clthing_images
        const { error: uploadError } = await supabase.storage.from('clothing_images').upload(fileName, file, {contentType: file.type}); //toUpload
        if (uploadError) throw uploadError;
  
        console.log('successfully uploaded file to storage bucket in database ');
        
        //Data to be inserted into database table
        const insertPayload = { user_id: userId, category: category, is_short: false, image_url: fileName };  // Let Postgres make a default created_at (timestamptz).   not Date.now()!
      
        //insert data into table 'clothing'
        const {error: dbError } = await supabase.from('clothing').insert(insertPayload);
       
        console.log('file inserted to database table clothing ');
        /*is short functionaloty to added later, for now just set to false*/
        if (dbError) throw dbError;
  
        console.log("uploaded and saved to database");
        setUploading(true);

         //CREATES A SIGNED URL FOR THE UPLOADED FILE
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage.from('clothing_images').createSignedUrl(fileName, 3600);
        if (signedUrlError) throw signedUrlError;
  
        //refresh local state to the hook 
        //fileName is ploaceholder id
        addItem({ id: fileName, category, name: file.name, image_url: fileName, signedUrl: signedUrlData?.signedUrl, created_at: new Date().toISOString() });
  
  
      }catch(err){    
            console.error("Upload error:", err);
           
      } finally {
        setUploading(false);
        event.target.value = '';
      }
    };
   
  
    //Handles buttom clicks when a user wants to add a new clothing item to a specific category
    const handleAddItem = async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
  
      if (inputRef.current) {
        inputRef.current.click(); // Trigger the file input click
      }
    };
  

    //add uploadbutton
    return(
      <div className="clothing-category">
        <div className="category-header">
          <h3>{category}</h3>
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
          
               }}
               onError={() => {
  
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


  //add const switch 