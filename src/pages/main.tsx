import { type NextPage } from "next";
import Link from "next/link";
import {useContext, useEffect, useState} from "react";
import { useGlobalContext } from '../context';
import {getAuth} from "firebase/auth";
import {FirebaseAuth} from "@firebase/auth-types";

//localIngredients is the local value updated every time the contents of the text box are changed
let localIngredientsList:string
const RecipeGenerator: NextPage = () => {

  //Import the global variable ingredientsList, and it's setter function, from the global context (defined in the context folder)
  const { ingredientsList,setIngredientsList } = useGlobalContext();
  console.log("global context "+ingredientsList);

  return (
        <section className="bg-gray-50">
      <div
        className="mx-auto max-w-screen-xl px-4 py-32 lg:flex lg:h-screen lg:items-center"
      >
        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-3xl font-extrabold sm:text-5xl">
            <strong className="font-extrabold text-red-700 sm:block">
              Enter Ingredients
            </strong>
          </h1>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <IngredientsInput />
            <Link href={{
                pathname: '/results',
                query: {
                    ingredients:ingredientsList
                }
            }}>
              <button
              className="block w-full rounded bg-red-600 px-12 py-3 text-sm font-medium text-white shadow hover:bg-red-700 focus:outline-none focus:ring active:bg-red-500 sm:w-auto">
                Enter
              </button>
            </Link>
          </div>

          <div className="absolute right-10 top-10">
            <Link href={{
              pathname: '/favorites'
            }}>
              <button
                className="block w-full rounded bg-red-600 px-12 py-3 text-sm font-medium text-white shadow hover:bg-red-700 focus:outline-none focus:ring active:bg-red-500 sm:w-auto">
                Favorites
              </button>
            </Link>

          </div>



        </div>
      </div>
    </section>
    );
}
//Ingredients input field
function IngredientsInput(){
    const { ingredientsList,setIngredientsList } = useGlobalContext();
  //Save the state of the value entered into the text box
  const [ingredients, setIngredients] = useState("");
  return (
    <form>
      <input
        type="text"
        value={ingredients}
        //whenever the value of the text box is changed, save it in localIngredientsList so it can be accessed in the outer function above
        onChange={e => {setIngredients(e.target.value);localIngredientsList=e.target.value;console.log(localIngredientsList);setIngredientsList(localIngredientsList)}}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        placeholder="avocado"
        required
      ></input>
    </form>
  )
}
export default RecipeGenerator;