type Comment={username:string,text:string,}
type RecipeFromAPI = { text: string; index:number; logprobs: object; finish_reason: string}|null
type RecipeContext={query:Recipe}
type Recipe={title:string, text:string, image:string, ingredients:string, comments:Comment[]}
type RecipeArray = {
    recipeList: Recipe[]
}
type customUser={uid:string, displayName:string, savedRecipes:string[], uploadedRecipes:string[]}