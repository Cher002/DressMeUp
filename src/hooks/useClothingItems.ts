import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'


//interface to describe clothing:
export interface ClothingItem {
    id: string;
    category: string
    image_url: string;
    signedUrl?: string; // Optional property
    name?: string; // Optional property
    created_at: string
  }

//hook
/*
retrieves users existing clothing items from supabase storage buckets
Depending on which category is called 
if no existing items in said category, no images will appear there with a itemj count of 0
*/


export default function useClothingItems({userId, category} : {userId : string, category : string}){
    const [items, setItems] = useState<ClothingItem[]>([]);
    
    // calls setItems for the caller
    //takes a ClothingItem, whats passed in changes
    const addItem = (item: ClothingItem) => {setItems ((prev) => [...prev, item])};
    
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

  return { items, addItem };
}