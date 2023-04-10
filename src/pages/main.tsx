import { type NextPage } from "next";
import Link from "next/link";
import React, {useContext, useEffect, useState} from "react";
import { useGlobalContext } from '../context';
import {getAuth} from "firebase/auth";
import {FirebaseAuth} from "@firebase/auth-types";
import Loader from "react-loader-spinner";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import navBar from './navBar'
import Sidebar from "react-sidebar";
import UploadRecipe from "./upload_recipe";
import Favorites from "./favorites";
import AllSavedRecipes from "./all_saved_recipes";




//localIngredients is the local value updated every time the contents of the text box are changed
let localIngredientsList:string
const RecipeGenerator: NextPage = () => {

  //Import the global variable ingredientsList, and it's setter function, from the global context (defined in the context folder)
  const { ingredientsList,setIngredientsList } = useGlobalContext();
  console.log("global context "+ingredientsList);

  //Import the current user.
  const {currentUser, setCurrentUser}=useGlobalContext();

  // Check if its loading
  const [isLoading, setIsLoading] = useState(false);

  console.log("current user: (accessed from main screen)"+currentUser.displayName)

    return (

    <section className="bg-gray-50">

            <nav className="font-extrabold text-red-700 sm:block text-3xl">
                <strong>
                    SuperChef.
                </strong>
            </nav>


  <div className="mx-auto max-w-screen-xl px-4 py-32 lg:flex lg:h-screen lg:items-center relative">
    <div className="absolute left-10 top-10">
      <Link
        href={{
          pathname: '/all_saved_recipes',
          query: {
            uid: currentUser.uid,
          },
        }}
      >
        <button className="block w-full rounded bg-red-600 px-12 py-3 text-sm font-medium text-white shadow hover:bg-red-700 focus:outline-none focus:ring active:bg-red-500 sm:w-auto">
          See All Recipes
        </button>
      </Link>
    </div>
    <div className="mx-auto max-w-xl text-center">
      <h1 className="text-3xl font-extrabold sm:text-5xl">
        <strong className="font-extrabold text-red-700 sm:block">
          Enter Ingredients
        </strong>
      </h1>

      {isLoading ? (
        <div className="flex justify-center items-center mt-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : (
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <IngredientsInput />
        <Link
          href={{
            pathname: '/results',
            query: {
              ingredients: ingredientsList,
            },
          }}
        >
          <button 
            className="block w-full rounded bg-red-600 px-12 py-3 text-sm font-medium text-white shadow hover:bg-red-700 focus:outline-none focus:ring active:bg-red-500 sm:w-auto"
            onClick={() => {
              setIsLoading(true);
            }}
          >
            Enter
          </button>
        </Link>
      </div>
      )
    }
      <div className="absolute right-10 top-10">
        <Link
          href={{
            pathname: '/favorites',
            query: {
              uid: currentUser.uid,
            },
          }}
        >
          <button className="block w-full rounded bg-red-600 px-12 py-3 text-sm font-medium text-white shadow hover:bg-red-700 focus:outline-none focus:ring active:bg-red-500 sm:w-auto">
            Favorites
          </button>
        </Link>
      </div>
      <div className="absolute bottom-10 left-10">
      <Link
          href={{
            pathname: '/upload_recipe',
            query: {
              uid: currentUser.uid,
            },
          }}
        >
          <button className="block w-full rounded bg-green-600 px-12 py-3 text-sm font-medium text-white shadow hover:bg-green-700 focus:outline-none focus:ring active:bg-green-500 sm:w-auto">
            Upload Recipe
          </button>
        </Link>
      </div>
    </div>
  </div>
        <footer className="flex flex-col space-y-10 justify-center m-10 position-relative">
            <nav className="flex justify-center flex-wrap gap-6 text-gray-500 font-medium">
                <a className="hover:text-gray-900" href="#">Home</a>
                <a className="hover:text-gray-900" href='\index.tsx'>About</a>
            </nav>

            <div className="flex justify-center space-x-5">
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
//Ingredients input field
function IngredientsInput(){
    const { ingredientsList,setIngredientsList } = useGlobalContext();
    //Save the state of the value entered into the text box
  const [ingredients, setIngredients] = useState("");
  return (
      <>
          <form>
              <input
                  type="text"
                  value={ingredients}
                  //whenever the value of the text box is changed, save it in localIngredientsList so it can be accessed in the outer function above
                  onChange={e => {
                      setIngredients(e.target.value);
                      localIngredientsList = e.target.value;
                      console.log(localIngredientsList);
                      setIngredientsList(localIngredientsList);
                  }}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="avocado"
                  required
              ></input>
          </form>
</>
)
}

export default RecipeGenerator;