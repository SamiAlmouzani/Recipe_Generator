import { type NextPage } from "next";
import Link from "next/link";
import {useEffect, useState} from 'react';
import {set} from "zod";
import { getDatabase, ref, child, get } from "firebase/database";
import firebase from "firebase/compat";
import {type} from "os";
import recipe from "./recipe";


type RecipeFromAPI = { text: string; index:number; logprobs: object; finish_reason: string}|null
type Recipe={title:string, text:string, image:string, ingredients:string}|null
type RecipeArray = {
    recipeList: Recipe[]
}
//When this page is loaded, the getServerSideProps function (further down) runs first, and returns a prop object to the Results component.
//props is an array of Recipe objects.
const Results: React.FC<RecipeArray>= (props) => {

    const [recipe1Title, setRecipe1Title] = useState("");
    const [recipe2Title, setRecipe2Title] = useState("");
    const [recipe3Title, setRecipe3Title] = useState("");


    if(props.recipeList[0]!==undefined&&props.recipeList[0]!==null) {
        console.log(props.recipeList[0].text)
    }
    useEffect(()=>{
        if(props.recipeList[0]!==undefined&&props.recipeList[0]!==null) {
            setRecipe1Title(props.recipeList[0].title)
        }
        if(props.recipeList[1]!==undefined&&props.recipeList[1]!==null) {
            setRecipe2Title(props.recipeList[1].title)
        }
        if(props.recipeList[2]!==undefined&&props.recipeList[2]!==null) {
            setRecipe3Title(props.recipeList[2].title)
        }
    }, [props.recipeList])

    console.log("recipes from props\n")
    console.log(props.recipeList)
    // @ts-ignore
    // @ts-ignore
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
                    // @ts-ignore
                    title:props.recipeList[0].title,
                    // @ts-ignore
                    text:props.recipeList[0].text,
                    // @ts-ignore
                    image:props.recipeList[0].image,
                    // @ts-ignore
                    ingredients:props.recipeList[0].ingredients
                }
            }} as={`recipe/$recipeText}`}>
          <ul className="divide-y-2 divide-gray-100">
            <li className="p-3 hover:bg-red-600 hover:text-red-200">
              <pre className="italic">{recipe1Title}</pre>
            </li>
          </ul>
            </Link>
        </div>
          <div className="mt-6 w-full bg-white rounded-lg shadow-lg lg:w">
              {/*When the recipe is clicked, go to the recipe page and pass it the recipe text and title*/}
              <Link href={{
                  pathname: '/recipe',
                  query: {
                      // @ts-ignore
                      title:props.recipeList[1].title,
                      // @ts-ignore
                      text:props.recipeList[1].text,
                      // @ts-ignore
                      image:props.recipeList[1].image,
                      // @ts-ignore
                      ingredients:props.recipeList[1].ingredients
                  }
              }} as={`recipe/$recipeText}`}>
                  <ul className="divide-y-2 divide-gray-100">
                      <li className="p-3 hover:bg-red-600 hover:text-red-200">
                          <pre className="italic">{recipe2Title}</pre>
                      </li>
                  </ul>
              </Link>
          </div>
          <div className="mt-6 w-full bg-white rounded-lg shadow-lg lg:w">
              {/*When the recipe is clicked, go to the recipe page and pass it the recipe text and title*/}
              <Link href={{
                  pathname: '/recipe',
                  query: {
                      // @ts-ignore
                      title:props.recipeList[2].title,
                      // @ts-ignore
                      text:props.recipeList[2].text,
                      // @ts-ignore
                      image:props.recipeList[2].image,
                      // @ts-ignore
                      ingredients:props.recipeList[2].ingredients
                  }
              }}>
                  <ul className="divide-y-2 divide-gray-100">
                      <li className="p-3 hover:bg-red-600 hover:text-red-200">
                          <pre className="italic">{recipe3Title}</pre>
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
    let index=0;
    //For now, it is getting 3 recipes from the database and returning those, instead of using the API call. To use
    //the API call, comment this section and uncomment the section below
    try{
        console.log("in serverside props")
        const dbRef = ref(getDatabase());
        console.log("database "+ dbRef)
        await get(child(dbRef, `recipes/`)).then((snapshot) => {
            if (snapshot.exists()) {
                console.log("snapshot:\n" +JSON.stringify(snapshot));
                snapshot.forEach((s)=> {
                    // @ts-ignore
                    // @ts-ignore
                    const newRecipe={image:s.val().image,title:s.val().title,text:s.val().text, ingredients: s.val().ingredients}
                    console.log(index)
                    recipeList[index]=newRecipe
                    index++;
                })
                console.log("about to return")
                recipeList.forEach((r)=>{ // @ts-ignore
                    console.log(r)})
                return {
                    props: {recipeList}
                }
            } else {
                console.log("No data available");
            }
    });}catch(e){
        console.log(e)
    }
    //This is the section that makes the API call to OpenAI. For now, instead of making a request each time this method
    //is just pulling the same 3 recipes from Firebase as placeholders
    /*try{
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
                recipeList=data.choices.map((r:RecipeFromAPI)=>{
                    // @ts-ignore
                    const recipe:Recipe ={text:r.text,title:getTitle(r.text),image:"",ingredients:""+context.query.ingredients}
                    return recipe;
                })
                // @ts-ignore
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
    }*/
    return {
        props: {recipeList}
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
