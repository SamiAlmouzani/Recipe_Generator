import { type NextPage } from "next";
import Link from "next/link";
import { useRouter } from 'next/router'
import { useSearchParams } from 'next/navigation'
import { GetServerSideProps } from 'next'
import { useState } from 'react';

import { useEffect } from "react";
import { useGlobalContext } from "../context";

type Recipe = { generated_text: string; title: string; ingredients: string; directions: string}
const Results: NextPage = () => {
  const { ingredientsList } = useGlobalContext();
  const [recipeText, setRecipeText] = useState("");
  {

    void query({ "inputs": ingredientsList }).then((response) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      console.log(JSON.stringify(response));

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
      setRecipeText(JSON.stringify(response));



    });

    return (



      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">



        <div className="mx-auto text-left">
          <h1 className="text-2xl font-bold sm:text-3xl">...Here is a recipe to try:</h1>
        </div>

        <div className="mt-6 w-full bg-white rounded-lg shadow-lg lg:w">
          <ul className="divide-y-2 divide-gray-100">
            <li className="p-3 hover:bg-red-600 hover:text-red-200">

              <p className="font-bold">{recipeText.substring(recipeText.indexOf("directions"),
                recipeText.length-3)}</p>
              <p className="italic">{recipeText.substring(recipeText.indexOf("ingredients")+13,
                recipeText.indexOf("directions"))}</p>

            </li>
          </ul>
        </div>

        <Link href="/main">
          <button
            className="block w-full mt-6 rounded bg-red-600 px-12 py-3 text-sm font-medium text-white shadow hover:bg-red-700 focus:outline-none focus:ring active:bg-red-500 sm:w-auto"
          >
            Back
          </button>
        </Link>

      </div>
    );
  }
}
async function query(data: object) {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/flax-community/t5-recipe-generation",
    {
      headers: { Authorization: "Bearer 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" },
      method: "POST",
      body: JSON.stringify(data),
    }
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const result = await response.json();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-member-access
  return result;
}

function getRecipeTitle(recipeText: string):string {


  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const parsedRecipe = JSON.parse(recipeText)

  if (isRecipe(parsedRecipe)) {

    return parsedRecipe.title;
  }
  else {

    console.log("error: invalid recipe")
  }
  return "";
}


//stackoverflow.com/questions/38688822/how-to-parse-json-string-in-typescript
function isRecipe(o: any): o is Recipe {
  return "name" in o && "description" in o
}


export default Results;
