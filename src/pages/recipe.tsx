import Image from 'next/image'
import { MdOutlineFavorite } from "react-icons/md";
import React, {useState, useEffect} from 'react';
import Link from "next/link";
import { getJson } from "serpapi";
import {child, get, getDatabase, push, query, ref, remove, set, update} from "firebase/database";
import {app, db} from "../context/firebaseSetup"
import { getCookies, getCookie, setCookies, removeCookies } from 'cookies-next';



//----For definitions for the Recipe, RecipeFromAPI, RecipeContext, and Comment types, see index.d.ts in the types folder----

//The getServerSideProps function at the bottom of this page runs when the page is first loaded. It will either load the recipe from the database
//(if it's an existing recipe), or get the text and image through an API call (if it's a new recipe). When it's finished, it passes the recipe as a
//props object to this page (below).

const Recipe: React.FC<Recipe>=(props)=>{
    const [currentUser, setCurrentUser] = useState({uid:"",displayName:"", photoURL:"", savedRecipes:[""], uploadedRecipes:[""]});
    //Create a recipe object and initialize the fields to blank (these will be replaced)
    const [recipe, setRecipe] = useState({id:"", title:"", text:"", image:"", ingredients:"", averageRating:0, uploadedBy:"", comments:[] as UserComment[],ratingMap:"",ratingSum:0,totalRatings:0});
    const [currentUserRating, setCurrentUserRating]=useState(0)
    const startingHeartColor="FF0000"
    const startingSavedState=false
    //When updating the id in the database, recipe didn't show the new value immediately. I'm using currentRecipe to set the new values and store them in
    //the database, then also setting those values on recipe.
    const [heartColor,setHeartColor]=useState(startingHeartColor)
    const[saved, setSaved]=useState(startingSavedState)

    //When the page is  = useState({id:props.id, title:props.title, text:props.text, image:props.image, ingredients:props.ingredients, averageRating:props.averageRating, uploadedBy:props.uploadedBy, comments:props.comments,ratingMap:props.ratingMap,ratingSum:parseFloat(String(props.ratingSum)),totalRatings:props.totalRatings});loaded or refreshed, get the current user from the local context
    useEffect(() => {
        //eslint-disable-next-line
        const user:customUser = JSON.parse(localStorage.getItem('user')+"");
        if (user) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            setCurrentUser(user);
        }
        const c=getCookie('recipe')
        const tempRecipe:Recipe=JSON.parse(c as string) as Recipe
        setRecipe({id:tempRecipe.id, title:tempRecipe.title, text:tempRecipe.text, image:tempRecipe.image, ingredients:tempRecipe.ingredients, averageRating:tempRecipe.averageRating, uploadedBy:tempRecipe.uploadedBy, comments:tempRecipe.comments,ratingMap:tempRecipe.ratingMap,ratingSum:parseFloat(String(tempRecipe.ratingSum)),totalRatings:tempRecipe.totalRatings});
        //Check whether the id of this recipe is already in the current user's saved array. If so, set the color of the heart
        //to red and set the initial state of "saved" to true
        if((user.savedRecipes.indexOf(tempRecipe.id)>-1)){
            console.log("RECIPE IS SAVED")
            setHeartColor("FF0000")
            setSaved(true)
        }else{
            console.log("RECIPE IS NOT SAVED")
            setHeartColor("808080")
            setSaved(false)
        }
    }, []);
    //   console.log("props: "+JSON.stringify(props))
    //props is used to initialize a currentRecipe object.
    // let currentRecipe={id:props.id, title:props.title, text:props.text, image:props.image, ingredients:props.ingredients, averageRating:props.averageRating, uploadedBy:props.uploadedBy, comments:props.comments,ratingMap:props.ratingMap,ratingSum:props.ratingSum,totalRatings:props.totalRatings}

    console.log("Rating sum in main page :"+typeof parseFloat(String(recipe.ratingSum)))

    return (
        <section>
            <nav className="font-extrabold text-red-700 sm:block text-3xl">
                <div className="font-extrabold text-red-700 sm:block text-3xl">
                    <img
                        src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQW47TpryE5rmsWr5aef5ZLXJMYr-socetxFw&usqp=CAU'
                        className="w-32 ml-2"

                    />
                    <strong>
                        SuperChef.
                    </strong>
                </div>
            </nav>
            <div className="px-8 py-12">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-center text-3xl font-bold mb-8">{props.title}</h1>
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <StarIcons recipe={recipe}/>
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
            <footer className="flex flex-col space-y-10 justify-center m-10 position-relative">
                <nav className="flex justify-center flex-wrap gap-6 text-gray-500 font-medium">
                    <a className="hover:text-gray-900" href="#">Home</a>
                    <a className="hover:text-gray-900" href='\index.tsx'>About</a>
                </nav>

                <div className="flex justify-center space-x-5">
                    <img
                        src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQW47TpryE5rmsWr5aef5ZLXJMYr-socetxFw&usqp=CAU'
                        className="w-12 ml-2 justify-left"
                    />
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                        <img src="https://img.icons8.com/fluent/30/000000/facebook-new.png"/>
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                        <img src="https://img.icons8.com/fluent/30/000000/instagram-new.png"/>
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                        <img src="https://img.icons8.com/fluent/30/000000/twitter.png"/>
                    </a>
                </div>
                <p className="text-center text-gray-700 font-medium">&copy; 2023 Company Ltd. All rights reserved.</p>
            </footer>
        </section>
    );

    /*When a user clicks the save button this function will
    a) Save this recipe to the database (if it is not already there), and update the current user's savedRecipes array
    b) Remove this recipe from the current users's savedRecipes array*/
    function toggleSaved(saved:boolean){
        try {
            if (saved) {
                if(currentUser.savedRecipes.indexOf(recipe.id)===-1) {
                    //Create a temporary array, initialized to the current saved recipe array
                    const tempSavedRecipes: string[] = currentUser.savedRecipes;

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
                    update(ref(db, '/users/' + currentUser.uid), currentUser).catch(e=>(console.log(e)));
                    localStorage.setItem('user',JSON.stringify(currentUser))
                    console.log(currentUser)
                }
            }
            else {
                //Create a temporary array, initialized to the current saved recipe array
                const tempSavedRecipes:string[]=currentUser.savedRecipes;
                //Remove the current recipe's id from the array
                const indexOfRecipe=tempSavedRecipes.indexOf(recipe.id)
                if(indexOfRecipe>-1)
                    tempSavedRecipes.splice(indexOfRecipe, 1)

                setCurrentUser({uid:currentUser.uid,displayName:currentUser.displayName,photoURL:currentUser.photoURL,
                    savedRecipes:tempSavedRecipes,uploadedRecipes:currentUser.uploadedRecipes})
                //Update the database with this new object
                update(ref(db, '/users/'+currentUser.uid), currentUser).catch(e=>(console.log(e)));
                localStorage.setItem('user',JSON.stringify(currentUser))
                return recipe.id
            }
        }
        catch (e:any) {
            console.log(e);
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
    const tempRatingMap:Map<string,number>=new Map(JSON.parse(recipe.ratingMap) as Map<string,number>)
    let ratingSum:number=recipe.ratingSum
    console.log("ratingSum: "+typeof ratingSum)
    let totalRatings:number=recipe.totalRatings
    let averageRating=0
    //Check whether this user is rating this recipe for the first time, or whether they are replacing an old rating
    if(tempRatingMap.has(uid)){
        //Get the user's previous rating
        const previousRating:number=tempRatingMap.get(uid) as number
        ratingSum=ratingSum+(rating-previousRating)
    }else{
        totalRatings++
        ratingSum=(ratingSum+rating)
    }
    //update the hashmap
    tempRatingMap.set(uid,rating)
    //calculate the new average
    averageRating=ratingSum/totalRatings
    console.log(recipe)
    //Update the recipe object with these values
    recipe.ratingMap=JSON.stringify(Array.from(tempRatingMap.entries()))
    recipe.totalRatings=totalRatings
    recipe.ratingSum=ratingSum
    recipe.averageRating=averageRating
    //Update the database with this new object
    update(ref(db, '/recipes/' + recipe.id), recipe).catch(e=>(console.log(e)));
    setCookies('recipe', recipe);
    console.log("new cookie value after updating rating "+JSON.stringify(getCookie('recipe')))
    //Return the new average
    return averageRating
}

function StarIcons(r: {recipe:Recipe}){
    const [star1color,setStar1Color]=useState("grey")
    const [star2color,setStar2Color]=useState("grey")
    const [star3color,setStar3Color]=useState("grey")
    const [star4color,setStar4Color]=useState("grey")
    const [star5color,setStar5Color]=useState("grey")
    const [rating, setRating]=useState(0)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const [averageRating, setAverageRating]=useState(parseFloat(String((r.recipe.averageRating))).toFixed(2))
    const [currentUser, setCurrentUser] = useState({uid:"",displayName:"", photoURL:"", savedRecipes:[""], uploadedRecipes:[""]});

    useEffect(() => {
        //eslint-disable-next-line
        const c=getCookie('recipe')
        const tempRecipe:Recipe=JSON.parse(c as string) as Recipe
        setAverageRating(parseFloat(String((tempRecipe.averageRating))).toFixed(2))
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        setCurrentUser(JSON.parse(localStorage.getItem('user')as string) as customUser);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const user:customUser=JSON.parse(localStorage.getItem('user')as string) as customUser
        console.log("user in rating component"+user.uid)
        console.log("recipe map "+tempRecipe.ratingMap)
        const tempRatingMap:Map<string,number>=new Map(JSON.parse(tempRecipe.ratingMap) as Map<string,number>)
        console.log(tempRatingMap)
        if(tempRatingMap.has(user.uid)){
            setRating(tempRatingMap.get(user.uid) as number)
            setStarColors(tempRatingMap.get(user.uid) as number)
        }
    }, []);
    return(
        <div>
            <div><label className="font-bold text-[#F7C600]">Your rating</label><h1></h1></div>
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
                    setStarColors(1)
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
                setStarColors(2)
                setAverageRating(setNewRating(2,r.recipe,currentUser.uid).toFixed(2))
                setRating(2)
            }}>
                <path fillRule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                      clipRule="evenodd"/>
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={star3color} className="w-8 h-8 inline" onClick={()=>
            {
                setStarColors(3)
                setRating(3)
                setAverageRating(setNewRating(3,r.recipe,currentUser.uid).toFixed(2))
            }}>
                <path fillRule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                      clipRule="evenodd"/>
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={star4color} className="w-8 h-8 inline" onClick={()=>
            {
                setStarColors(4)
                setRating(4)
                setAverageRating(setNewRating(4,r.recipe,currentUser.uid).toFixed(2))

            }}>
                <path fillRule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                      clipRule="evenodd"/>
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={star5color} className="w-8 h-8 inline" onClick={()=>
            {
                setStarColors(5)
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
    function setStarColors(rating:number){
        switch(rating){
            case 0:
                setStar1Color("grey")
                setStar2Color("grey")
                setStar3Color("grey")
                setStar4Color("grey")
                setStar5Color("grey")
                break;
            case 1:
                setStar1Color("#F7C600")
                setStar2Color("grey")
                setStar3Color("grey")
                setStar4Color("grey")
                setStar5Color("grey")
                break;
            case 2:
                setStar1Color("#F7C600")
                setStar2Color("#F7C600")
                setStar3Color("grey")
                setStar4Color("grey")
                setStar5Color("grey")
                break;
            case 3:
                setStar1Color("#F7C600")
                setStar2Color("#F7C600")
                setStar3Color("#F7C600")
                setStar4Color("grey")
                setStar5Color("grey")
                break;
            case 4:
                setStar1Color("#F7C600")
                setStar2Color("#F7C600")
                setStar3Color("#F7C600")
                setStar4Color("#F7C600")
                setStar5Color("grey")
                break;
            case 5:
                setStar1Color("#F7C600")
                setStar2Color("#F7C600")
                setStar3Color("#F7C600")
                setStar4Color("#F7C600")
                setStar5Color("#F7C600")
                break;
        }
    }
}
//When this page is loaded, it is passed the recipe object from the preceding screen. This function checks whether this recipe
//already exists in the database, or whether it is a new one (meaning the text and photo need to be added). It passes the recipe
//back up to the main page through the props object.

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export async function getServerSideProps(context:any){
    //eslint-disable-next-line
    const req=context.req
    //eslint-disable-next-line
    const res=context.res
    //eslint-disable-next-line
    console.log(JSON.stringify(context.query))
    //eslint-disable-next-line
    // if(context.query.recipeString===undefined){
    //eslint-disable-next-line
    const c=getCookie('recipe', {req, res});
    const recipe=JSON.parse(c as string) as Recipe
    //   }else{
    //eslint-disable-next-line
    //  recipe=JSON.parse(context.query.recipeString) as Recipe
    //eslint-disable-next-line
    //   setCookies('recipe', context.query.recipeString, {req, res, maxAge: 60 * 6 * 24 });
    //  }
    console.log("RECIPE AFTER COOKIES "+JSON.stringify(recipe))
    //If there is text, it means that this was an existing recipe that is already in the database. Return the recipe.
    if(recipe.text.length>1){
        console.log("recipe already exists")
        return{
            props:{
                id:recipe.id,
                title:recipe.title,
                text:recipe.text,
                image:recipe.image,
                ingredients:recipe.ingredients,
                averageRating:recipe.averageRating,
                uploadedBy:recipe.uploadedBy,
                comments:recipe.comments,
                ratingMap:recipe.ratingMap,
                ratingSum:recipe.ratingSum,
                totalRatings:recipe.totalRatings}
        }
    }
        //If the text is empty, it means this is a new recipe, and so far only the title has been generated.
    //Generate the text with the openAI API, and generate the image with SerpAPI. The recipe will then need to be saved in the database.
    else {
        let text=""
        //This try/catch block makes the API call to generate the text
        try {
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
                    'Authorization': "Bearer "+process.env.OPENAI_API_KEY
                },
                body: JSON.stringify({
                    'model': "text-davinci-003",
                    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands,@typescript-eslint/no-unsafe-member-access
                    'prompt': "ingredients and directions for a recipe called " + recipe.title,
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
                    console.log(data)
                    //eslint-disable-next-line
                    text=data.choices[0].text as string

                }).catch(err => {
                    console.log(err);
                });

        } catch(e){
            console.log(e)
        }
        console.log("loading image ")
        //Make the API call to get the image
        const response = await getJson("google", {
            api_key: process.env.GOOGLE_IMAGES_API_KEY,
            tbm: "isch",
            q: recipe.title
        });
        //Create a recipe object using the newly generated text and image
        const newRecipe:Recipe={
            id:recipe.id,
            title:recipe.title,
            text:text,
            //eslint-disable-next-line
            image:response["images_results"][0].original as string,
            ingredients:recipe.ingredients,
            averageRating:0,
            uploadedBy:recipe.uploadedBy,
            comments:[],
            ratingMap:recipe.ratingMap,
            ratingSum:0,
            totalRatings:0}

        console.log(newRecipe)
        //Store this recipe in the database
        try{
            //Create a new entry under recipes, and save the automatically generated key
            const key =push(child(ref(getDatabase(app)), 'recipes'),newRecipe).key;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            newRecipe.id=key
            console.log("id "+newRecipe.id)
            //Update the entry to the recipe object to store the recipe
            let queryPath="recipes/"
            queryPath+=key as string
            update(ref(getDatabase(app), queryPath), newRecipe).catch(e=>(console.log(e)));
            console.log("updated database, id is "+newRecipe.id)
            //eslint-disable-next-line
            setCookies('recipe', JSON.stringify(newRecipe), {req, res, maxAge: 60 * 6 * 24 });
        }
        catch(e){
            console.log(e)
        }
        //Return the recipe
        return{
            props:{id:newRecipe.id,title:newRecipe.title,text:newRecipe.text,image:newRecipe.image,ingredients:newRecipe.ingredients,averageRating:newRecipe.averageRating,uploadedBy:newRecipe.uploadedBy,comments:newRecipe.comments,ratingMap:newRecipe.ratingMap,ratingSum:newRecipe.ratingSum, totalRatings:newRecipe.totalRatings}
        }
    }
}
export default Recipe;