import Link from "next/link";
import React from 'react';
import {child, get, getDatabase, ref} from "firebase/database";
import {app} from "../context/firebaseSetup";
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
        <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto text-left">
                <h1 className="text-2xl font-bold sm:text-3xl">Previously generated recipes:</h1>
            </div>

            <div className="mt-6 w-full bg-white rounded-lg shadow-lg lg:w">
                <div>
                    {props.recipeList.map((recipe:Recipe) =>
                        <div key={recipe.id}>
                            <div className="mt-6 w-full bg-white rounded-lg shadow-lg lg:w">
                                <Link href={{
                                    pathname: '/recipe',
                                    query: {recipeString:JSON.stringify(recipe)}
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
                <footer className="flex flex-col space-y-10 justify-center m-10 position-relative">
                <nav className="flex justify-center flex-wrap gap-6 text-gray-500 font-medium">
                    <a className="hover:text-gray-900" href="main.tsx">Home</a>
                    <a className="hover:text-gray-900" href="#">About</a>
                    <a className="hover:text-gray-900" href="index.tsx">Gallery</a>
                    <a className="hover:text-gray-900" href="#">Contact</a>
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
                <p className="text-center text-gray-700 font-medium">&copy; 2023 Company Ltd. All rights reservered.</p>
            </footer>
            </div>
        </div>
        </section>
    );
}
/*
getServerSideProps runs when the link on the main page is clicked. It loads all the saved recipes from the database, and
returns them to the AllSavedRecipes page
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/require-await
export async function getServerSideProps () {
    const recipeList:Recipe[]=[]
    let index=0
    //This try/catch block pulls in the recipes from the database
    try{
        const dbRef=ref(getDatabase(app))
        await get(child(dbRef, 'recipes/')).then((snapshot) => {
            if(snapshot.exists()) {
                console.log("snapshot:\n" +JSON.stringify(snapshot));
                snapshot.forEach((s)=> {
                    let commentsArray:UserComment[]=[]
                    const r:Recipe=s.val() as Recipe
                    if(r.UserComments!==undefined&&r.UserComments!==null)
                        commentsArray=r.UserComments
                    recipeList[index]={
                        id: r.id,
                        image: r.image,
                        title: r.title,
                        text: r.text,
                        ingredients: r.ingredients,
                        averageRating: r.averageRating,
                        uploadedBy: r.uploadedBy,
                        UserComments: commentsArray,
                        ratingMap: r.ratingMap,
                        ratingSum: r.ratingSum,
                        totalRatings: r.totalRatings
                    }
                    index++;
                })
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