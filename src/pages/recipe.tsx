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
    let currentRecipe={id:props.id, title:props.title, text:props.text, image:props.image, ingredients:props.ingredients, averageRating:props.averageRating, uploadedBy:props.uploadedBy, comments:props.comments}

    //When updating the id in the database, recipe didn't show the new value immediately. I'm using currentRecipe to set the new values and store them in
    //the database, then also setting those values on recipe.
    const [recipe, setRecipe] = useState({id:props.id, title:props.title, text:props.text, image:props.image, ingredients:props.ingredients, averageRating:props.averageRating, uploadedBy:props.uploadedBy, comments:props.comments});
    const [heartColor,setHeartColor]=useState(startingHeartColor)
    const[saved, setSaved]=useState(startingSavedState)
    /*
        I moved the contents of the useEffect function that was here, to a regular function further down the page. The useEffect seemed to be
        running multiple times, not necessarily when the heart button was clicked, and it had some weird results once I started setting
        the value of saved when the page is first loaded.
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
                            setSaved(!saved)
                            if(saved){
                                setHeartColor("FF0000")
                            }else{
                                setHeartColor("808080")
                            }
                            toggleSaved(saved)
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
                            className="my-8 float-left block w-full rounded bg-red-600 px-12 py-3 text-sm font-medium text-white shadow hover:bg-red-700 focus:outline-none focus:ring active:bg-red-500 sm:w-auto">
                            Back
                        </button>
                    </Link>
                    {/*pass the user and the recipe id to comments page */}
                    <Link href={{
                        pathname: '/comments',
                        query: {
                            id:recipe.id
                        }
                    }}>
                        <button
                            className="my-8 float-right block w-full rounded bg-red-600 px-12 py-3 text-sm font-medium text-white shadow hover:bg-red-700 focus:outline-none focus:ring active:bg-red-500 sm:w-auto justify-content:right">
                            Comments
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    )
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
//When this page is loaded, it is passed the recipe object from the preceding screen
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
                comments:context.query.comments}
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
            averageRating:context.query.averageRating,
            uploadedBy:context.query.uploadedBy,
            comments:context.query.comments}
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
            props:{id:recipe.id,title:recipe.title,text:recipe.text,image:recipe.image,ingredients:recipe.ingredients,averageRating:recipe.averageRating,uploadedBy:recipe.uploadedBy,comments:recipe.comments}
        }
    }
}
export default Recipe;