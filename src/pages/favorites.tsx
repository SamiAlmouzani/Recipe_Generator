import { type NextPage } from "next";
import Link from "next/link";
import React, { useState, useEffect, JSXElementConstructor, ReactElement, ReactFragment } from "react";

import {getDatabase, ref, child, get, query, set} from "firebase/database";
import Image from "next/image";
import {useGlobalContext} from "../context";
import {app, db} from "../context/firebaseSetup";
import {render} from "react-dom";
import {async} from "@firebase/util";

/*
On this page, the recipes are currently being loaded in from the database, but I think the HTML is rendering before the recipes
are finished being loaded in.
 */

type UserContext={query:{uid:string}}
let favorites: Recipe[] = [];

const Favorites: NextPage = () => {

    const [message, setMessage] = useState("");
    const [m, setM] = useState("");
    const [listItems, setListItems] = useState({});
    const {currentUser, setCurrentUser}=useGlobalContext();
    const [savedRecipes, setSavedRecipes]=useState([])

    useEffect(() => {
        setListItems(savedRecipes);
    }, [favorites]);

    useEffect(() => {
        try {
            console.log("user id "+currentUser.uid)
            //Get a Database Reference object to the current user
            const userRef = query(ref(db, 'users/'+currentUser.uid));
            console.log(userRef)

            //Get a snapshot from the database using the Database Reference object returned by the query
            get(userRef).then((snapshot) => {
                if (snapshot.exists()) {
                    console.log(snapshot.val().savedRecipes)
                    favorites=[]
                    //For each saved recipe, get that recipe in the database
                    snapshot.val().savedRecipes.forEach((r:string)=>{
                        console.log(r)
                        const recipeRef = query(ref(db, 'recipes/' + r));
                        get(recipeRef).then((s)=>{
                            favorites.push(s.val());
                            console.log(favorites.length)
                            // @ts-ignore
                            setSavedRecipes(favorites)
                            // @ts-ignore
                        })
                    })
                }
                //If the snapshot does not exist, it means there is no user with this uid.
                else {
                    setMessage("You don't have any favorites yet!")
                }
            }).catch(() => {
            })
        }
        catch(e) {
            console.log(e);
        }
    }, []);
    console.log("savedRecipes "+savedRecipes)

    // @ts-ignore
    return (
        <div className="mx-auto max-w-screen-xl px-4 py-8 lg:flex lg:h-screen lg:items-top">
            <div >
                <h1 className="text-3xl font-extrabold sm:text-5xl">Favorites:</h1>

            </div>

            <div className="absolute top-20">
                <h3 className="text-1xl font-extrabold sm:text-3xl ">{message}</h3>
            </div>

            <div>
                {savedRecipes.map((recipe:Recipe) =>
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
                                    comments:recipe.comments
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
            </div> );

            <Link className={""} href="/main">
                <button
                    className=" absolute bottom-10 left-20 block w-full rounded bg-red-600 px-12 py-3 text-sm font-medium text-white shadow hover:bg-red-700 focus:outline-none focus:ring active:bg-red-500 sm:w-auto">
                    Back
                </button>
            </Link>
            <button
                onClick={()=>{ try {favorites.length = 0; // @ts-ignore
                    listItems.length = 0; } catch{} window.location.reload(); }} className=" absolute bottom-10 right-20 block w-full rounded bg-red-600 px-12 py-3 text-sm font-medium text-white shadow hover:bg-red-700 focus:outline-none focus:ring active:bg-red-500 sm:w-auto">
                Clear
            </button>
        </div>
    );
}

function getListItems(savedRecipes:Recipe[]): JSX.Element {
    return (
        <div>
            {savedRecipes.map((recipe:Recipe) =>
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
                                comments:recipe.comments
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
        </div> );
}

export default Favorites;