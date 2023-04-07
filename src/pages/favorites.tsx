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
    console.log("current user: (accessed from main screen)"+currentUser.displayName)
    console.log("recipes from props\n")
    console.log(props.recipeList)

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
                                    query: {recipeString:JSON.stringify(recipe)}
                                }} as={`recipe/$recipeText}`}>
                                    <ul className="divide-y-2 divide-gray-100">
                                        <li className="p-3 hover:bg-red-600 hover:text-red-200">
                                            <pre className="italic">{
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
getServerSideProps runs when the link on the main page is clicked. It loads the current user's saved recipes from the database
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/require-await
export async function getServerSideProps (context) {
    let recipeList:Recipe[]=[]
    let recipeIds:string[]=[]
    //This try/catch block pulls in the recipes from the database
    try{
        let userRef=ref(getDatabase(app),'users/'+context.query.uid)
        console.log("user ref "+JSON.stringify(userRef))
        await get(userRef).then((snapshot) => {
            if (snapshot.exists()) {
                recipeIds=snapshot.val().savedRecipes
                console.log(recipeIds)
            }
        });
        for(let i=0;i<recipeIds.length;i++){
            const recipeRef =query(ref(getDatabase(app), 'recipes/' + recipeIds[i]));
            await get(recipeRef).then((snapshot)=>{
                recipeList.push(snapshot.val());
                console.log(recipeList.length+" "+recipeList)
                if(recipeList.length===recipeIds.length){
                    console.log("about to return")
                    recipeList.forEach((r)=>{
                        console.log(r.title)})
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
export default Favorites;