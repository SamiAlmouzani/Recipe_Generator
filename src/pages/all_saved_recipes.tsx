import Link from "next/link";
import React, {useEffect, useState} from 'react';
import {set} from "zod";
import {child, get, getDatabase, ref} from "firebase/database";
import {db, auth, app} from "../context/firebaseSetup";
import {getAnalytics} from "firebase/analytics";
import {getAuth} from "firebase/auth";
import {useGlobalContext} from "../context";

//----For definitions for the Recipe, RecipeFromAPI, RecipeContext, and Comment types, see index.d.ts in the types folder----

//When this page is loaded, the getServerSideProps function (further down) runs first, and returns a prop object to the Results component.
//props is an array of Recipe objects pulled from the database.
const AllSavedRecipes: React.FC<RecipeArray>= (props) => {

    //Import the current user.
    const {currentUser, setCurrentUser}=useGlobalContext();
    console.log("current user: (accessed from main screen)"+currentUser.displayName)
    console.log("recipes from props\n")
    console.log(props.recipeList)
    // @ts-ignore
    // @ts-ignore
    // @ts-ignore
    return (
        <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto text-left">
                <h1 className="text-2xl font-bold sm:text-3xl">Previously generated recipes:</h1>
            </div>

            <div className="mt-6 w-full bg-white rounded-lg shadow-lg lg:w">
                <div>
                    {props.recipeList.map((recipe:Recipe) =>
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
                                        //@ts-ignore
                                        comments:recipe.comments,
                                        ratingMap:recipe.ratingMap,
                                        //@ts-ignore
                                        ratingSum:recipe.ratingSum,
                                        totalRatings:recipe.totalRatings
                                    }
                                }} as={`recipe/$recipeText}`}>
                                    <ul className="divide-y-2 divide-gray-100">
                                        <li className="p-3 hover:bg-red-600 hover:text-red-200">
                                            <pre className="italic">{recipe.title}</pre>
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
getServerSideProps runs when the link on the main page is clicked. It loads all the saved recipes from the database, and
returns them to the AllSavedRecipes page
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/require-await
export async function getServerSideProps (context) {
    let recipeList:Recipe[]=[]
    let index=0
    //This try/catch block pulls in the recipes from the database
    try{
        let dbRef=ref(getDatabase(app))
        await get(child(dbRef, 'recipes/')).then((snapshot) => {
            if(snapshot.exists()) {
                console.log("snapshot:\n" +JSON.stringify(snapshot));
                snapshot.forEach((s)=> {
                    // @ts-ignore
                    const newRecipe={id:s.val().id, image:s.val().image,title:s.val().title,text:s.val().text, ingredients: s.val().ingredients, averageRating:s.val().averageRating as number, uploadedBy:s.val().uploadedBy,comments:s.val().comments,ratingMap:s.val().ratingMap,ratingSum:s.val().ratingSum,totalRatings:s.val().totalRatings}
                    recipeList[index]=newRecipe
                    index++;
                })
                recipeList.forEach((r)=>{ // @ts-ignore
                    console.log(r)})
                return {
                    props: {recipeList}
                }
            } else {
                console.log("No data available");
            }
        });}
    catch(e){
        console.log(e)
    }
    return {
        props: {recipeList}
    }
}
export default AllSavedRecipes;