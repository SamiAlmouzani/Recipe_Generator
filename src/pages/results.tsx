import { type NextPage } from "next";
import Link from "next/link";
import {useEffect, useState} from 'react';
import {set} from "zod";

type Recipe = { text: string; index:number; logprobs: object; finish_reason: string}|null
type Data = {
    recipeList: Recipe[]
}
//When this page is loaded, the getServerSideProps function (further down) runs first, and returns a prop object to the Results component.
//props is an array of Recipe objects.
const Results: React.FC<Data>= (props) => {
  const [recipeText, setRecipeText] = useState("");
    if(props.recipeList[0]!==undefined&&props.recipeList[0]!==null) {
        console.log(props.recipeList[0].text)
    }
    useEffect(()=>{
        if(props.recipeList[0]!==undefined&&props.recipeList[0]!==null) {
            setRecipeText(props.recipeList[0].text)
        }
    }, [props.recipeList])
    return (
      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto text-left">
          <h1 className="text-2xl font-bold sm:text-3xl">...Here is a recipe to try:</h1>
        </div>

        <div className="mt-6 w-full bg-white rounded-lg shadow-lg lg:w">
          <ul className="divide-y-2 divide-gray-100">
            <li className="p-3 hover:bg-red-600 hover:text-red-200">
              <pre className="italic">{recipeText}</pre>

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
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/require-await
export async function getServerSideProps (context) {
    let recipeList:Recipe[]=[null]
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
                'prompt': "ingredients and directions for a recipe with "+context.query.ingredients,
                'temperature': 0.1,
                'max_tokens':500,
                'top_p': 1,
                'frequency_penalty': 0,
                'presence_penalty': 0.5,
                'stop': ["\"\"\""],
            })
        };
        await fetch('https://api.openai.com/v1/completions', requestOptions)
            .then(response => response.json())
            .then(data => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
                recipeList=data.choices
                console.log("returning")
                console.log(recipeList)
                console.log("first recipe")
                console.log(recipeList[0])
                return {
                    recipeList
                };
            }).catch(err => {
            console.log("Ran out of tokens for today! Try tomorrow!");
        });
        console.log("about to return")
        console.log(recipeList)
        return {
            props: {recipeList}
        };
    }catch {
        return {
            props: {recipeList}
        };
    }
}

export default Results;
