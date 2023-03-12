type Comment={username:string,text:string,}
type RecipeFromAPI = { text: string; index:number; logprobs: object; finish_reason: string}|null
type RecipeContext={query:RecipeInfo}

type RecipeInfo={id:string, title:string, text:string, image:string, ingredients:string, averageRating:number, uploadedBy:0, comments:Comment[],savedByCurrentUser:boolean}
type Recipe={id:string, title:string, text:string, image:string, ingredients:string, averageRating:number, uploadedBy:0, comments:Comment[]}
type RecipeArray = {
    recipeList: Recipe[]
}
type customUser={uid:string, displayName:string, photoURL:string, savedRecipes:string[], uploadedRecipes:string[]}