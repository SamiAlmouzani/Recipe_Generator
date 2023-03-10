import { type NextPage } from "next";
import Link from "next/link";
import React, {useEffect, useState} from 'react';
import {set} from "zod";
import {child, get, getDatabase, query, ref} from "firebase/database";
import {db, auth, app} from "../context/firebaseSetup";
import {getAnalytics} from "firebase/analytics";
import {getAuth} from "firebase/auth";
import {useGlobalContext} from "../context";

//----For definitions for the Recipe, RecipeFromAPI, RecipeContext, and Comment types, see index.d.ts in the types folder----

//When this page is loaded, the getServerSideProps function (further down) runs first, and returns a prop object to the Results component.
//props is an array of Recipe objects.
const Favorites: React.FC<RecipeArray>= (props) => {
    //Import the current user.
    const {currentUser, setCurrentUser}=useGlobalContext();
    const[savedRecipes, setSavedRecipes]=useState([{}]);
    console.log("current user: (accessed from main screen)"+currentUser.displayName)
    console.log("recipes from props\n")
    console.log(props.recipeList)
    // @ts-ignore
    // @ts-ignore
    console.log(props.recipeList[0])

    let recipeArray:Recipe[]=[]
    for(let i=0;i<props.recipeList.length;i++) {
        //    recipeCounter[i]=i;
    }
    props.recipeList.forEach((r)=>{
        if(r!==undefined&&r!==null)
            recipeArray.push(r)
    })

    return (
        <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto text-left">
                <h1 className="text-2xl font-bold sm:text-3xl">Favorites</h1>
            </div>
            <div className="mt-6 w-full bg-white rounded-lg shadow-lg lg:w">
                <div>
                    {recipeArray.map((recipe) =>
                        <div>
                            <div className="mt-6 w-full bg-white rounded-lg shadow-lg lg:w">
                                <Link href={{
                                    pathname: '/recipe',
                                    query: {
                                        id:recipe.id,
                                        title:recipe.title,
                                        text:recipe.text,
                                        image:recipe.image,
                                        ingredients:recipe.ingredients,
                                        averageRating:recipe.averageRating,
                                        uploadedBy:recipe.uploadedBy,
                                        // @ts-ignore
                                        comments:recipe.comments
                                    }
                                }} as={`recipe/$recipeText}`}>
                                    <ul className="divide-y-2 divide-gray-100">
                                        <li className="p-3 hover:bg-red-600 hover:text-red-200">
                                            <pre className="italic">{                                        //@ts-ignore
                                                recipe.title}</pre>
                                        </li>
                                    </ul>
                                </Link>
                            </div>
                        </div>)}
                </div>

                <Link href="/main">
                    <button
                        className="block w-full mt-6 rounded bg-red-600 px-12 py-3 text-sm font-medium text-white shadow hover:bg-red-700 focus:outline-none focus:ring active:bg-red-500 sm:w-auto"
                    >
                        Back
                    </button>
                </Link>
            </div></div>
    );
}
/*
getServerSideProps runs when the link on the main page is clicked. It makes the API call using the list of ingredients, passed
through the context object. On the main page, context is being passed in the Link component. Context has two fields - href and query.
query is an object that has an ingredients field, which is just the text the user entered on the main page.
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/require-await
export async function getServerSideProps (context) {
    let recipeList:Recipe[]=[]
    let recipeIds:string[]=[]
    let index=0
    //This try/catch block pulls in the recipes from the database
    try{
        let userRef=ref(getDatabase(app),'users/'+context.query.uid)
        console.log("user ref "+JSON.stringify(userRef))
        await get(userRef).then((snapshot) => {
            if (snapshot.exists()) {
               // console.log(snapshot.val().savedRecipes)
                recipeIds=snapshot.val().savedRecipes
                console.log(recipeIds)
                //For each saved recipe, get that recipe in the database
                snapshot.val().savedRecipes.forEach((r:string)=>{
                    console.log(r)
                    const recipeRef =query(ref(getDatabase(app), 'recipes/' + r));
                    get(recipeRef).then((s)=>{
                        recipeList.push(s.val());
                        console.log(recipeList.length+" "+recipeList+" "+snapshot.val().savedRecipes.length)
                        if(recipeList.length===snapshot.val().savedRecipes.length-1){
                            console.log("about to return")
                            recipeList.forEach((r)=>{ // @ts-ignore
                                console.log(r.title)})
                            console
                            return {
                                props: {recipeList}
                            }
                        }
                    })
                })
            }
        });
        for(let i=0;i<recipeIds.length;i++){
            const recipeRef =query(ref(getDatabase(app), 'recipes/' + recipeIds[i]));
            await get(recipeRef).then((snapshot)=>{
                recipeList.push(snapshot.val());
                console.log(recipeList.length+" "+recipeList+" "+snapshot.val().savedRecipes.length)
                if(recipeList.length===snapshot.val().savedRecipes.length-1){
                    console.log("about to return")
                    recipeList.forEach((r)=>{ // @ts-ignore
                        console.log(r.title)})
                    console
                    return {
                        props: {recipeList}
                    }
                }
            })
        }
    }
    catch(e){
        console.log(e)
    }
    return{
        props:{recipeList}
    }
}
const getTitle=(text:string)=>{
    //Most of the recipes returned by the openai API begin with two newlines, then the title, another newline,
    //followed by the ingredients. We probably could add in some input validation here or use a regex if we need to.

    //Get everything before "Ingredients" (the title and newlines)
    let title=text.substring(0,text.indexOf("Ingredients"))
    //Trim the newlines by removing the first two characters, and the last character
    title=title.substring(2,title.length-1)
    return title;
}
const getText=(text:string)=>{
    //Return everything after (and including) "Ingredients"
    return text.substring(text.indexOf("Ingredients"))
}

export default Favorites;