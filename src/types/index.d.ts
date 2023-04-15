type UserComment={uid:string,username:string,text:string,date:string}
type RecipeContext={query:{recipeString:string}}
type UserContext={query:{uid:string}}
type Recipe={id:string, title:string, text:string, image:string, ingredients:string, averageRating:number, uploadedBy:string, comments:UserComment[], ratingMap:string, ratingSum:number, totalRatings:number}

type RecipeArray = {
    recipeList: Recipe[]
}
type customUser={uid:string, displayName:string, photoURL:string, savedRecipes:string[], uploadedRecipes:string[]}