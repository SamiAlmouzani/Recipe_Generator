type Comment={username:string,text:string}
type RecipeContext={query:Recipe}
type Recipe={id:string, title:string, text:string, image:string, ingredients:string, averageRating:number, uploadedBy:string, comments:Comment[]}

type RecipeArray = {
    recipeList: Recipe[]
}
type CommentArray = {

    commentList: Comment[]
}
type customUser={uid:string, displayName:string, photoURL:string, savedRecipes:string[], uploadedRecipes:string[]}