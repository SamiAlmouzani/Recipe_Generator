import { type NextPage } from "next";
import Link from "next/link";
import {useEffect, useState} from 'react';
import {set} from "zod";

type Recipe = { text: string; index:number; logprobs: object; finish_reason: string}|null
type RecipeArry = {
    recipeList: Recipe[]
}
//When this page is loaded, the getServerSideProps function (further down) runs first, and returns a prop object to the Results component.
//props is an array of Recipe objects.
const Results: React.FC<RecipeArry>= (props) => {
    const [recipe1Text, setRecipe1Text] = useState("");
    const [recipe2Text, setRecipe2Text] = useState("");
    const [recipe3Text, setRecipe3Text] = useState("");


    if(props.recipeList[0]!==undefined&&props.recipeList[0]!==null) {
        console.log(props.recipeList[0].text)
    }
    useEffect(()=>{
        if(props.recipeList[0]!==undefined&&props.recipeList[0]!==null) {
            setRecipe1Text(props.recipeList[0].text)
        }
        if(props.recipeList[1]!==undefined&&props.recipeList[1]!==null) {
            setRecipe2Text(props.recipeList[1].text)
        }
        if(props.recipeList[2]!==undefined&&props.recipeList[2]!==null) {
            setRecipe3Text(props.recipeList[2].text)
        }
    }, [props.recipeList])
    return (
      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto text-left">
          <h1 className="text-2xl font-bold sm:text-3xl">...Here are some recipes to try:</h1>
        </div>

        <div className="mt-6 w-full bg-white rounded-lg shadow-lg lg:w">
            {/*When the recipe is clicked, go to the recipe page and pass it the recipe text and title*/}
            <Link href={{
                pathname: '/recipe',
                query: {
                    title:getTitle(recipe1Text),
                    text:getText(recipe1Text)
                }
            }} as={`recipe/$recipeText}`}>
          <ul className="divide-y-2 divide-gray-100">
            <li className="p-3 hover:bg-red-600 hover:text-red-200">
              <pre className="italic">{getTitle(recipe1Text)}</pre>
            </li>
          </ul>
            </Link>
        </div>
          <div className="mt-6 w-full bg-white rounded-lg shadow-lg lg:w">
              {/*When the recipe is clicked, go to the recipe page and pass it the recipe text and title*/}
              <Link href={{
                  pathname: '/recipe',
                  query: {
                      title:getTitle(recipe2Text),
                      text:getText(recipe2Text)
                  }
              }} as={`recipe/$recipeText}`}>
                  <ul className="divide-y-2 divide-gray-100">
                      <li className="p-3 hover:bg-red-600 hover:text-red-200">
                          <pre className="italic">{getTitle(recipe2Text)}</pre>
                      </li>
                  </ul>
              </Link>
          </div>
          <div className="mt-6 w-full bg-white rounded-lg shadow-lg lg:w">
              {/*When the recipe is clicked, go to the recipe page and pass it the recipe text and title*/}
              <Link href={{
                  pathname: '/recipe',
                  query: {
                      title:getTitle(recipe3Text),
                      text:getText(recipe3Text)
                  }
              }}>
                  <ul className="divide-y-2 divide-gray-100">
                      <li className="p-3 hover:bg-red-600 hover:text-red-200">
                          <pre className="italic">{getTitle(recipe3Text)}</pre>
                      </li>
                  </ul>
              </Link>
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
/*
getServerSideProps runs when the link on the main page is clicked. It makes the API call using the list of ingredients, passed
through the context object. On the main page, context is being passed in the Link component. Context has two fields - href and query.
query is an object that has an ingredients field, which is just the text the user entered on the main page.
 */
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
                'prompt': "ingredients and directions for a recipe that contains "+context.query.ingredients,
                'temperature': 0.7,
                //max_tokens is the max number of words that can be returned for one recipe. This is set to 20 just because I didn't need all
                //the directions for testing, but for demoing we'll need to set it higher (it cuts off the directions)
                'max_tokens':20,
                'top_p': 1,
                //To generate additional recipes, change n
                'n':3,
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
                return {
                    recipeList
                };
            }).catch(err => {
            console.log(err);
        });
        return {
            props: {recipeList}
        };
    }catch {
        return {
            props: {recipeList}
        };
    }
}
const getTitle=(text:string)=>{
    //All the recipes returned by the openai API begin with two newlines, then the title, another newline,
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

export default Results;
