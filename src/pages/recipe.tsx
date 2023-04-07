import Image from 'next/image'
import { MdOutlineFavorite } from "react-icons/md";
import {useState, useEffect} from 'react';
import placeholder_image from './placeholder_image.jpg'
import Link from "next/link";
import { getJson } from "serpapi";
import {child, get, getDatabase, push, query, ref, remove, set, update} from "firebase/database";
import {app, db} from "../context/firebaseSetup"
import {useGlobalContext} from "../context";

//----For definitions for the Recipe, RecipeFromAPI, RecipeContext, and Comment types, see index.d.ts in the types folder----

//The getServerSideProps function at the bottom of this page runs when the page is first loaded. It will either load the recipe from the database
//(if it's an existing recipe), or get the text and image through an API call (if it's a new recipe). When it's finished, it passes the recipe as a
//props object to this page (below).

const Recipe: React.FC<Recipe>=(props)=>{
    //Import the current user.
    const {currentUser, setCurrentUser}=useGlobalContext();
    let startingHeartColor
    let startingSavedState

    //Check whether the id of this recipe is already in the current user's saved array. If so, set the color of the heart
    //to red and set the initial state of "saved" to true
    if((currentUser.savedRecipes.indexOf(props.id)>-1)&&props.id!=="0"){
        startingHeartColor = "FF0000"
        startingSavedState=true
    }else{
        startingHeartColor="808080"
        startingSavedState=false
    }
    console.log("props: "+JSON.stringify(props))
    //props is used to initialize a currentRecipe object.
   // let currentRecipe={id:props.id, title:props.title, text:props.text, image:props.image, ingredients:props.ingredients, averageRating:props.averageRating, uploadedBy:props.uploadedBy, comments:props.comments,ratingMap:props.ratingMap,ratingSum:props.ratingSum,totalRatings:props.totalRatings}

    //When updating the id in the database, recipe didn't show the new value immediately. I'm using currentRecipe to set the new values and store them in
    //the database, then also setting those values on recipe.
    //@ts-ignore
    const [recipe, setRecipe] = useState({id:props.id, title:props.title, text:props.text, image:props.image, ingredients:props.ingredients, averageRating:props.averageRating, uploadedBy:props.uploadedBy, comments:props.comments,ratingMap:props.ratingMap,ratingSum:parseFloat(props.ratingSum),totalRatings:props.totalRatings});
    const [heartColor,setHeartColor]=useState(startingHeartColor)
    const[saved, setSaved]=useState(startingSavedState)

    //@ts-ignore
    console.log("Rating sum in main page :"+typeof parseFloat(recipe.ratingSum))

    return (
        <div className="px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-center text-3xl font-bold mb-8">{props.title}</h1>
            <div className="flex justify-between items-center mb-4">
              <div>
                <StarIcons recipe={recipe} />
              </div>
              <div>
                <MdOutlineFavorite
                  color={heartColor}
                  size={48}
                  onClick={() => {
                    setSaved(!saved);
                    setHeartColor(saved ? "FF0000" : "808080");
                    toggleSaved(saved);
                  }}
                />
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-full md:w-1/2">
                <Image src={props.image} width={500} height={500} alt="placeholder image" className="mb-4" />
                <div className="whitespace-pre-line mb-6">{props.text}</div>
                <div className="flex justify-between">
                  <Link href="/results">
                    <button className="block w-full md:w-auto rounded bg-red-600 px-8 py-3 text-sm font-medium text-white shadow hover:bg-red-700 focus:outline-none focus:ring active:bg-red-500">
                      Back
                    </button>
                  </Link>
                  <Link href={{ pathname: '/comments', query: { id: recipe.id } }}>
                    <button className="block w-full md:w-auto rounded bg-red-600 px-8 py-3 text-sm font-medium text-white shadow hover:bg-red-700 focus:outline-none focus:ring active:bg-red-500">
                      Comments
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
      
    /*When a user clicks the save button this function will
    a) Save this recipe to the database (if it is not already there), and update the current user's savedRecipes array
    b) Remove this recipe from the current users's savedRecipes array*/
    function toggleSaved(saved:boolean){
        try {
            if (saved) {
                if(currentUser.savedRecipes.indexOf(recipe.id)===-1) {
                    //Create a temporary array, initialized to the current saved recipe array
                    let tempSavedRecipes: string[] = currentUser.savedRecipes;

                    if(tempSavedRecipes[0]===""){
                        tempSavedRecipes[0]=recipe.id
                    }else{
                        tempSavedRecipes.push(recipe.id)
                    }
                    //Update the current user object with the new array
                    setCurrentUser({
                        uid: currentUser.uid, displayName: currentUser.displayName, photoURL: currentUser.photoURL,
                        savedRecipes: tempSavedRecipes, uploadedRecipes: currentUser.uploadedRecipes
                    })
                    //Update the database with this new object
                    update(ref(db, '/users/' + currentUser.uid), currentUser);
                }
            }
            else {
                //Create a temporary array, initialized to the current saved recipe array
                let tempSavedRecipes:string[]=currentUser.savedRecipes;
                //Remove the current recipe's id from the array
                let indexOfRecipe=tempSavedRecipes.indexOf(recipe.id)
                if(indexOfRecipe>-1)
                    tempSavedRecipes.splice(indexOfRecipe, 1)

                setCurrentUser({uid:currentUser.uid,displayName:currentUser.displayName,photoURL:currentUser.photoURL,
                    savedRecipes:tempSavedRecipes,uploadedRecipes:currentUser.uploadedRecipes})
                //Update the database with this new object
                update(ref(db, '/users/'+currentUser.uid), currentUser);
                return recipe.id
            }
        }
        catch (e) {
            // @ts-ignore
            console.log(e.stack);
        }
        return recipe.id
    }
}
//This function is called by the StarIcons component. It takes the rating that was set, and updates the
//ratingMap hashmap with the current user's rating. It calculates the new average rating, and stores the new
//hashmap, average rating, total rating, and rating sum in the database. It then returns the average rating
//back to the StarIcons component, which then uses it to set the rating variable on the page.
function setNewRating(rating:number,recipe:Recipe,uid:string){
    console.log(recipe)
    //Get the current rating hashmap
    let tempRatingMap:Map<string,number>=new Map(JSON.parse(recipe.ratingMap))
    let ratingSum:number=recipe.ratingSum
    console.log("ratingSum: "+typeof ratingSum)
    let totalRatings:number=recipe.totalRatings
    let averageRating:number=0
    //Check whether this user is rating this recipe for the first time, or whether they are replacing an old rating
    if(tempRatingMap.has(uid)){
        //Get the user's previous rating
        // @ts-ignore
        let previousRating:number=tempRatingMap.get(uid)
        console.log("previous rating: "+ previousRating)
        console.log("rating: "+rating)
        ratingSum=ratingSum+(rating-previousRating)
        console.log("ratingSum: "+ratingSum)
    }else{
        console.log("totalRatings: "+totalRatings)
        totalRatings++
        ratingSum=(ratingSum+rating as number) as number
        console.log("totalRatings: "+totalRatings)
        console.log("ratingSum: "+ratingSum)
    }
    //update the hashmap
    tempRatingMap.set(uid,rating)
    //calculate the new average
    console.log("totalRatings: "+totalRatings)
    averageRating=ratingSum/totalRatings
    console.log(recipe)
    //Update the recipe object with these values
    recipe.ratingMap=JSON.stringify(Array.from(tempRatingMap.entries())),
    recipe.totalRatings=totalRatings
    recipe.ratingSum=ratingSum
    recipe.averageRating=averageRating
    //Update the database with this new object
    update(ref(db, '/recipes/' + recipe.id), recipe);
    //Return the new average
    return averageRating
}

function StarIcons(r: {recipe:Recipe}){
    const {currentUser, setCurrentUser}=useGlobalContext();

    const [star1color,setStar1Color]=useState("grey")
    const [star2color,setStar2Color]=useState("grey")
    const [star3color,setStar3Color]=useState("grey")
    const [star4color,setStar4Color]=useState("grey")
    const [star5color,setStar5Color]=useState("grey")
    const [rating, setRating]=useState(0)
    let a=r.recipe.averageRating as number
    //@ts-ignore
    const [averageRating, setAverageRating]=useState(parseFloat((r.recipe.averageRating)).toFixed(2))

    return(
        <div>
            {/*The fill color for each star icon is grey by default. When the star is clicked, the rating is set to the corresponding number, and
            the color of the other stars is changed to match the new rating (if the rating was 5 and star 3 is clicked, stars 4 and 5 are changed to grey.
            Or if the rating is 1 and star 4 is clicked, set stars 2, 3, and 4 to #F7C600
       */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={star1color} className="w-8 h-8 inline" onClick={()=>
            {
                if(rating===0){
                    setStar1Color("#F7C600")
                    setRating(1)
                    setAverageRating(setNewRating(1,r.recipe,currentUser.uid).toFixed(2))
                }
                else if(rating===1){
                    setStar1Color("grey")
                    setRating(0)
                    setAverageRating(setNewRating(0,r.recipe,currentUser.uid).toFixed(2))
                }
                else{
                    setStar2Color("grey")
                    setStar3Color("grey")
                    setStar4Color("grey")
                    setStar5Color("grey")
                    setRating(1)
                    setAverageRating(setNewRating(1,r.recipe,currentUser.uid).toFixed(2))
                }
            }
            }>
                <path fillRule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                      clipRule="evenodd"
                />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={star2color} className="w-8 h-8 inline" onClick={()=>
            {
                if(rating<2){
                    setStar1Color("#F7C600")
                    setStar2Color("#F7C600")
                }
                else if(rating>2){
                    setStar3Color("grey")
                    setStar4Color("grey")
                    setStar5Color("grey")
                }
                setAverageRating(setNewRating(2,r.recipe,currentUser.uid).toFixed(2))
                setRating(2)
            }}>
                <path fillRule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                      clipRule="evenodd"/>
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={star3color} className="w-8 h-8 inline" onClick={()=>
            {
                if(rating<3){
                    setStar1Color("#F7C600")
                    setStar2Color("#F7C600")
                    setStar3Color("#F7C600")
                }
                else if(rating>3){
                    setStar4Color("grey")
                    setStar5Color("grey")
                }
                setRating(3)
                setAverageRating(setNewRating(3,r.recipe,currentUser.uid).toFixed(2))
            }}>
                <path fillRule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                      clipRule="evenodd"/>
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={star4color} className="w-8 h-8 inline" onClick={()=>
            {
                if(rating<4){
                    setStar1Color("#F7C600")
                    setStar2Color("#F7C600")
                    setStar3Color("#F7C600")
                    setStar4Color("#F7C600")
                }
                else if(rating>4){
                    setStar5Color("grey")
                }
                setRating(4)
                setAverageRating(setNewRating(4,r.recipe,currentUser.uid).toFixed(2))

            }}>
                <path fillRule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                      clipRule="evenodd"/>
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={star5color} className="w-8 h-8 inline" onClick={()=>
            {
                if(rating<5){
                    setStar1Color("#F7C600")
                    setStar2Color("#F7C600")
                    setStar3Color("#F7C600")
                    setStar4Color("#F7C600")
                    setStar5Color("#F7C600")
                }
                setRating(5)
                setAverageRating(setNewRating(5,r.recipe,currentUser.uid).toFixed(2))
            }}>
                <path fillRule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                      clipRule="evenodd"/>
            </svg>
          <div> <label className="font-bold text-[#F7C600]">Average rating</label><h1 className="font-bold text-3xl text-[#F7C600]">{averageRating}</h1></div>
        </div>
    )
}
//When this page is loaded, it is passed the recipe object from the preceding screen. This function checks whether this recipe
//already exists in the database, or whether it is a new one (meaning the text and photo need to be added). It passes the recipe
//back up to the main page through the props object.
export async function getServerSideProps(context:RecipeContext){
    //If there is text, it means that this was an existing recipe that is already in the database. Return the recipe.
    if(context.query.text.length>1){
        console.log("recipe already exists")
        return{
            props:{
                // @ts-ignore
                id:context.query.id,
                title:context.query.title,
                text:context.query.text,
                image:context.query.image,
                ingredients:context.query.ingredients,
                averageRating:context.query.averageRating,
                uploadedBy:context.query.uploadedBy,
                comments:context.query.comments,
                ratingMap:context.query.ratingMap,
                ratingSum:context.query.ratingSum,
                totalRatings:context.query.totalRatings}
        }
    }
    //If the text is empty, it means this is a new recipe, and so far only the title has been generated.
    //Generate the text with the openAI API, and generate the image with SerpAPI. The recipe will then need to be saved in the database.
    else {
        let text:string=""
        //This try/catch block makes the API call to generate the text
        try {
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
                    'Authorization': "Bearer " + process.env.OPENAI_API_KEY
                },
                body: JSON.stringify({
                    'model': "text-davinci-003",
                    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands,@typescript-eslint/no-unsafe-member-access
                    'prompt': "ingredients and directions for a recipe called " + context.query.title,
                    'temperature': 0.7,
                    //max_tokens is the max number of words that can be returned for one recipe. This is set to 20 just because I didn't need all
                    //the directions for testing, but for demoing we'll need to set it higher (it cuts off the directions)
                    'max_tokens': 500,
                    'top_p': 1,
                    //To generate additional recipes, change n
                    'n': 1,
                    'frequency_penalty': 0,
                    'presence_penalty': 0.5,
                    'stop': ["\"\"\""],
                })
            };
            await fetch('https://api.openai.com/v1/completions', requestOptions)
                .then(response => response.json())
                .then(data => {
                    console.log(data.choices)
                    text=data.choices[0].text

                }).catch(err => {
                    console.log(err);
                });

        } catch(e){
            console.log(e)
        }
        //Make the API call to get the image
        const response = await getJson("google", {
            api_key: process.env.GOOGLE_IMAGES_API_KEY,
            tbm: "isch",
            q: context.query.title
        });
        console.log("image and text were generated")
        //Create a recipe object using the newly generated text and image
        let recipe:Recipe={
            id:context.query.id,
            title:context.query.title,
            text:text,
            image:response["images_results"][0].original,
            ingredients:context.query.ingredients,
            averageRating:0,
            uploadedBy:context.query.uploadedBy,
            comments:context.query.comments,
            ratingMap:context.query.ratingMap,
            ratingSum:0,
            totalRatings:0}

        console.log(recipe)
        //Store this recipe in the database
        try{
            //Create a new entry under recipes, and save the automatically generated key
            const key =push(child(ref(getDatabase(app)), 'recipes'),recipe).key;
            //Set the id field of recipe to be equal to the key
            recipe.id=""+key
            console.log("id "+recipe.id)
            //Update the entry to the recipe object to store the recipe
            update(ref(getDatabase(app), 'recipes/'+key), recipe);
            console.log("updated database, id is "+recipe.id)
        }
        catch(e){
            console.log(e)
        }
        //Return the recipe
        return{
            props:{id:recipe.id,title:recipe.title,text:recipe.text,image:recipe.image,ingredients:recipe.ingredients,averageRating:recipe.averageRating,uploadedBy:recipe.uploadedBy,comments:recipe.comments,ratingMap:recipe.ratingMap,ratingSum:recipe.ratingSum, totalRatings:recipe.totalRatings}
        }
    }
}
export default Recipe;