import Link from "next/link";
import React, { useEffect, useState } from 'react';
import { set } from "zod";
import { child, get, getDatabase, ref } from "firebase/database";
import { db, auth, app } from "../context/firebaseSetup";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { useGlobalContext } from "../context";
type RecipeFromAPI = { text: string; index: number; logprobs: object; finish_reason: string } | null

//----For definitions for the Recipe, RecipeFromAPI, RecipeContext, and Comment types, see index.d.ts in the types folder----

//When this page is loaded, the getServerSideProps function (further down) runs first, and returns a prop object to the Results component.
//props is an array of Recipe objects.
const Results: React.FC<RecipeArray> = (props) => {
    const [isLoading, setIsLoading] = useState(false);

    //Import the current user.
    const { currentUser, setCurrentUser } = useGlobalContext();
    console.log("current user: (accessed from main screen)" + currentUser.displayName)
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
                <h1 className="text-2xl font-bold sm:text-3xl">...Here are some recipes to try:</h1>
            </div>
            {isLoading ? (
                <div className="flex justify-center items-center mt-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                </div>
            ) : (
                <div className="mt-6 w-full bg-white rounded-lg shadow-lg lg:w">
                    <div>
                        {props.recipeList.map((recipe: Recipe) =>
                            <div key={recipe.id}>
                            <div className="mt-6 w-full bg-white rounded-lg shadow-lg lg:w">
                                    <Link href={{
                                        pathname: '/recipe',
                                        query: {recipeString:JSON.stringify(recipe)}
                                    }} as={`recipe/$recipeText}`} onClick={() => setIsLoading(true)}>
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
                </div>
            )}
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
}
/*
getServerSideProps runs when the link on the main page is clicked. It makes the API call using the list of ingredients, passed
through the context object. On the main page, context is being passed in the Link component. Context has two fields - href and query.
query is an object that has an ingredients field, which is just the text the user entered on the main page.
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/require-await
export async function getServerSideProps(context) {
    let titleList: string[] = []
    const titleListNoDuplicates: string[] = []
    let recipeList: Recipe[] = []
    const tempRatingMap: Map<string, number> = new Map<string, number>()
    //This try/catch block uses the API to generate only a recipe title. Comment out this block to pull recipes from the database instead for testing
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
                'prompt': "name of a recipe that contains " + context.query.ingredients,
                'temperature': 0.7,
                //max_tokens is the max number of words that can be returned for one recipe. This is set to 20 just because I didn't need all
                //the directions for testing, but for demoing we'll need to set it higher (it cuts off the directions)
                'max_tokens': 20,
                'top_p': 1,
                //To generate additional recipes, change n
                'n': 7,
                'frequency_penalty': 0,
                'presence_penalty': 0.5,
                'stop': ["\"\"\""],
            })
        };
        await fetch('https://api.openai.com/v1/completions', requestOptions)
            .then(response => response.json())
            .then(data => {
                console.log(data)
                //Store all of the generated recipe titles in the titleList array
                //eslint-disable-next-line
                titleList = data.choices.map((r: RecipeFromAPI) => {
                    //Sometimes the API will return text before the title. Remove anything above the last occurrence of a newline
                    if(r!==null&&r!==undefined)
                        return r.text.substring(r.text.lastIndexOf('\n') + 1, r.text.length)
                })
                //Remove duplicates from titleList
                titleList.forEach((r) => {
                    //Check whether this recipe was already added to titleListNoDuplicates
                    if (!(titleListNoDuplicates.indexOf(r) > -1)) {
                        titleListNoDuplicates.push(r)
                    }
                })
                console.log("Titles after removing duplicates")
                console.log(titleListNoDuplicates)
                //Map each of these titles into a recipe array (all fields of each recipe will be empty, except for the title
                recipeList = titleListNoDuplicates.map((title) => {
                    const recipe: Recipe = {
                        id: "",
                        title: title,
                        text: "",
                        image: "",
                        //eslint-disable-next-line
                        ingredients: context.query.ingredients as string,
                        averageRating: 0,
                        uploadedBy: "0",
                        UserComments:[]as UserComment[],
                        ratingMap: JSON.stringify(Array.from(tempRatingMap.entries())),
                        ratingSum: 0,
                        totalRatings: 0
                    }
                    return recipe
                })
            }).catch(err => {
                console.log(err);
            });
        return {
            props: { recipeList }
        };
    } catch {
        return {
            props: { recipeList }
        };
    }
    return {
        props: { recipeList }
    }
}
export default Results;
