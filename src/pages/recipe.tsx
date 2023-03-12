import Image from 'next/image'
import { MdOutlineFavorite } from "react-icons/md";
import {useState, useEffect} from 'react';
import placeholder_image from './placeholder_image.jpg'
import Link from "next/link";
import { getJson } from "serpapi";
import {child, get, getDatabase, push, query, ref, remove, set, update} from "firebase/database";
import { db } from "../context/firebaseSetup"
import {useGlobalContext} from "../context";

//----For definitions for the Recipe, RecipeFromAPI, RecipeContext, and Comment types, see index.d.ts in the types folder----

const Recipe: React.FC<RecipeInfo>=(props)=>{
    console.log("RecipeInfo: "+JSON.stringify(props))
    let saved=props.savedByCurrentUser
    let startingHeartColor
    if(saved)
        startingHeartColor="FF0000"
    else
        startingHeartColor="808080"
    //Import the current user.
    const {currentUser, setCurrentUser}=useGlobalContext();
    //props is used to initialize a currentRecipe object. Elements of currentRecipe (rating, etc) can be modified while props is read only
    let currentRecipe={id:props.id, title:props.title, text:props.text, image:props.image, ingredients:props.ingredients, averageRating:props.averageRating, uploadedBy:props.uploadedBy, comments:props.comments}

    //When updating the id in the database, recipe didn't show the new value immediately. I'm using currentRecipe to set the new values and store them in
    //the database, then also setting those values on recipe.
    const [recipe, setRecipe] = useState({id:props.id, title:props.title, text:props.text, image:props.image, ingredients:props.ingredients, averageRating:props.averageRating, uploadedBy:props.uploadedBy, comments:props.comments});
    const [heartColor,setHeartColor]=useState(startingHeartColor)
    /*
     When a user clicks the save button this useEffect will
     a) Save this recipe to the database (if it is not already there), and update the current user's savedRecipes array
     b) Remove this recipe from the current users's savedRecipes array
     */

   /* useEffect(() => {
        console.log("")
        try {
            if (saved) {
                //Check whether this recipe is already saved in the database. If it is not, it needs to be added

                //Get a Database Reference Object for this recipe's id
                const recipeRef = query(ref(db, 'recipes/' + recipe.id));
                get(recipeRef).then((snapshot)=>{
                    //If no snapshot exists, the recipe was not found
                    if(!snapshot.exists()){
                        //Create a new entry under recipes, and save the automatically generated key
                        const key = push(child(ref(db), 'recipes'),currentRecipe).key;
                        console.log("key "+key)
                        //Set the id field of currentRecipe to be equal to the key
                        currentRecipe.id=""+key
                        console.log("Recipe after updating key: "+JSON.stringify(currentRecipe))

                        //Update the entry to the recipe object to store currentRecipe
                        update(ref(db, 'recipes/'+key), currentRecipe);
                        console.log("current recipe id "+currentRecipe.id)
                        setRecipe({id:""+currentRecipe.id, title:recipe.title, text:recipe.text, image:recipe.image, ingredients:recipe.ingredients, averageRating:recipe.averageRating, uploadedBy:recipe.uploadedBy, comments:recipe.comments})
                        console.log("recipe at the end "+JSON.stringify(recipe))
                    }else{
                        console.log("Already in database")
                    }
                }).catch(()=>{
                    console.log("There was an error querying the data")})
                //TODO -- Get the current user, and add the id of the current recipe to this users's savedRecipes array
                console.log("current user about to update "+JSON.stringify(currentUser))
                if(currentUser.savedRecipes.indexOf(currentRecipe.id)===-1) {
                    //Create a temporary array, initialized to the current saved recipe array
                    let tempSavedRecipes: string[] = currentUser.savedRecipes;
                    console.log("saved recipes before updating" + tempSavedRecipes)
                    //Update the array with the new value
                    tempSavedRecipes.push(currentRecipe.id)
                    console.log("saved recipes after updating" + tempSavedRecipes)
                    //Update the current user object with the new array
                    setCurrentUser({
                        uid: currentUser.uid, displayName: currentUser.displayName, photoURL: currentUser.photoURL,
                        savedRecipes: tempSavedRecipes, uploadedRecipes: currentUser.uploadedRecipes
                    })
                    console.log("current user after updating saved recipes: " + JSON.stringify(currentUser))
                    //Update the database with this new object
                    update(ref(db, '/users/' + currentUser.uid), currentUser);
                }
            }
            else {
                //TODO -- Get the current user, and remove the id of the current recipe from the users's savedRecipes array
                console.log("unsaved recipe");
            }
        }
        catch (e) {
            console.log("database error");
            // @ts-ignore
            console.log(e.stack);
        }
    }, [saved])
*/
    return(
        <div>
            <div className={"flow-root px-40"}>
                <div> <p className={"flex justify-center text-3xl font-bold py-2"}>{props.title}</p></div>
                <div id="id" className={"float-left"}>
                    <StarIcons/>
                </div>
                <div className={"float-right"}>
                    {/*Heart button*/}
                    <MdOutlineFavorite
                        color={heartColor}
                        size={48}
                        onClick={()=>{
                            //Clicking the heart will toggle the "saved" property, and the color
                            saved=!saved
                            if(saved){
                                setHeartColor("FF0000")
                            }else{
                                setHeartColor("808080")
                            }
                            toggleSaved()
                        }}
                    />
                </div>
            </div>
            <div className={"flex justify-center"}>
                <div className={" w-1/2 justify-center flex-wrap"}>
                    {/* <div><Image src={props.image} width={500} height={500} alt="placeholder image"></Image></div>*/}
                    <div><Image src={props.image} width={500} height={500} alt="placeholder image"></Image></div>
                    <div className="whitespace-pre-line">{props.text}</div>
                    <Link className={""} href="/results">
                        <button
                            className="block w-full rounded bg-red-600 px-12 py-3 text-sm font-medium text-white shadow hover:bg-red-700 focus:outline-none focus:ring active:bg-red-500 sm:w-auto">
                            Back
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    )
    function toggleSaved(){
        try {
            if (saved) {
                //Check whether this recipe is already saved in the database. If it is not, it needs to be added

                //Get a Database Reference Object for this recipe's id
                const recipeRef = query(ref(db, 'recipes/' + recipe.id));
                get(recipeRef).then((snapshot)=>{
                    //If no snapshot exists, the recipe was not found
                    if(!snapshot.exists()){
                        //Create a new entry under recipes, and save the automatically generated key
                        const key = push(child(ref(db), 'recipes'),currentRecipe).key;
                        console.log("key "+key)
                        //Set the id field of currentRecipe to be equal to the key
                        currentRecipe.id=""+key
                        console.log("Recipe after updating key: "+JSON.stringify(currentRecipe))

                        //Update the entry to the recipe object to store currentRecipe
                        update(ref(db, 'recipes/'+key), currentRecipe);
                        console.log("current recipe id "+currentRecipe.id)
                        setRecipe({id:""+currentRecipe.id, title:recipe.title, text:recipe.text, image:recipe.image, ingredients:recipe.ingredients, averageRating:recipe.averageRating, uploadedBy:recipe.uploadedBy, comments:recipe.comments})
                        console.log("recipe at the end "+JSON.stringify(recipe))
                    }else{
                        console.log("Already in database")
                    }
                }).catch(()=>{
                    console.log("There was an error querying the data")})
                //TODO -- Get the current user, and add the id of the current recipe to this users's savedRecipes array
                console.log("current user about to update "+JSON.stringify(currentUser))
                if(currentUser.savedRecipes.indexOf(currentRecipe.id)===-1) {
                    //Create a temporary array, initialized to the current saved recipe array
                    let tempSavedRecipes: string[] = currentUser.savedRecipes;
                    console.log("saved recipes before updating" + tempSavedRecipes)
                    //Update the array with the new value
                    tempSavedRecipes.push(currentRecipe.id)
                    console.log("saved recipes after updating" + tempSavedRecipes)
                    //Update the current user object with the new array
                    setCurrentUser({
                        uid: currentUser.uid, displayName: currentUser.displayName, photoURL: currentUser.photoURL,
                        savedRecipes: tempSavedRecipes, uploadedRecipes: currentUser.uploadedRecipes
                    })
                    console.log("current user after updating saved recipes: " + JSON.stringify(currentUser))
                    //Update the database with this new object
                    update(ref(db, '/users/' + currentUser.uid), currentUser);
                }
            }
            else {
                //TODO -- Get the current user, and remove the id of the current recipe from the users's savedRecipes array
                console.log("unsaved recipe");
            }
        }
        catch (e) {
            console.log("database error");
            // @ts-ignore
            console.log(e.stack);
        }
    }
}

function StarIcons(){
    const [rating, setRating]=useState(0)

    const [star1color,setStar1Color]=useState("grey")
    const [star2color,setStar2Color]=useState("grey")
    const [star3color,setStar3Color]=useState("grey")
    const [star4color,setStar4Color]=useState("grey")
    const [star5color,setStar5Color]=useState("grey")
    return(
        <div>
            {/*The fill color for each star icon is grey by default. When the star is clicked, the rating is set to the corresponding number, and
            the color of the other stars is changed to match the new rating (if the rating was 5 and star 3 is clicked, stars 4 and 5 are changed to grey.
            Or if the rating is 1 and star 4 is clicked, set stars 2, 3, and 4 to yellow)*/}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={star1color} className="w-8 h-8 inline" onClick={()=>
            {
                if(rating===0){
                    setStar1Color("yellow")
                    setRating(1)
                }
                else if(rating===1){
                    setStar1Color("grey")
                    setRating(0)
                }
                else{
                    setStar2Color("grey")
                    setStar3Color("grey")
                    setStar4Color("grey")
                    setStar5Color("grey")
                    setRating(1)
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
                    setStar1Color("yellow")
                    setStar2Color("yellow")
                    setRating(2)
                }
                else if(rating>2){
                    setStar3Color("grey")
                    setStar4Color("grey")
                    setStar5Color("grey")
                    setRating(2)
                }
            }}>
                <path fillRule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                      clipRule="evenodd"/>
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={star3color} className="w-8 h-8 inline" onClick={()=>
            {
                if(rating<3){
                    setStar1Color("yellow")
                    setStar2Color("yellow")
                    setStar3Color("yellow")
                    setRating(3)
                }
                else if(rating>3){
                    setStar4Color("grey")
                    setStar5Color("grey")
                    setRating(3)
                }
            }}>
                <path fillRule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                      clipRule="evenodd"/>
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={star4color} className="w-8 h-8 inline" onClick={()=>
            {
                if(rating<4){
                    setStar1Color("yellow")
                    setStar2Color("yellow")
                    setStar3Color("yellow")
                    setStar4Color("yellow")
                    setRating(4)
                }
                else if(rating>4){
                    setStar5Color("grey")
                    setRating(4)
                }
            }}>
                <path fillRule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                      clipRule="evenodd"/>
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={star5color} className="w-8 h-8 inline" onClick={()=>
            {
                if(rating<5){
                    setStar1Color("yellow")
                    setStar2Color("yellow")
                    setStar3Color("yellow")
                    setStar4Color("yellow")
                    setStar5Color("yellow")
                    setRating(5)
                }
            }}>
                <path fillRule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                      clipRule="evenodd"/>
            </svg>

        </div>
    )
}
//When this page is loaded, it is passed the recipe text from the results screen
export async function getServerSideProps(context:RecipeContext){
    //To use the API call to get an image, uncomment this block below, and uncomment the line that uses the
    //image url in the props object

    /*console.log("Recipe context: "+JSON.stringify(context.query))
      const response = await getJson("google", {
      api_key: process.env.GOOGLE_IMAGES_API_KEY,
      tbm: "isch",
      q: context.query.title
  });*/
    console.log("this is the response from getServerSideProps")
    //   console.log(response["images_results"][0].original);
    return{
        props:{
            // @ts-ignore
            id:context.query.id,
            title:context.query.title,
            text:context.query.text,
            image:context.query.image,
            //  image:response["images_results"][0].original,
            ingredients:context.query.ingredients,
            averageRating:context.query.averageRating,
            uploadedBy:context.query.uploadedBy,
            comments:context.query.comments,
            savedByCurrentUser:context.query.savedByCurrentUser
        }
    }

}
export default Recipe;