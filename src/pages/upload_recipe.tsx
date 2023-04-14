import React, { useState, ChangeEvent } from "react";
import {useGlobalContext} from "../context";
import {child, getDatabase, push, ref, update} from "firebase/database";
import {app, db} from "../context/firebaseSetup";
import axios from "axios";
import path from "path";

type Data={"form-name":string,"title":string,"ingredients":string,"directions":string,"picture":File|null}
const UploadRecipe = () => {
    const [title, setTitle] = useState("");
    const [ingredients, setIngredients] = useState("");
    const [directions, setDirections] = useState("");
    const [picture, setPicture] = useState<File | null>(null);
    const {currentUser, setCurrentUser}=useGlobalContext();

    const encode = (data:Data) => {
        const formData = new FormData();
        Object.keys(data).forEach((k)=>{
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            formData.append(k,data[k] as string)
        });
        console.log(formData)
        return formData
    }
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>){
        e.preventDefault();
        const data = { "form-name": "uploadform", title, ingredients, directions, picture}

        console.log(picture)
        let imageURL=""
        //save the image in public/user_images (uses the images.ts file in the api folder)
        try {
            if(!picture){
                alert("Please attach a photo of your recipe as a jpg, jpeg, or png file");
                return;
            }
            if (picture){
                const formData = new FormData();
                formData.append(picture.name, picture);
                //eslint-disable-next-line
                const { data } = await axios.post("/api/images", formData);
                //eslint-disable-next-line
                imageURL=path.join("/user_images",data["url"])
                console.log(imageURL)
            }
        } catch (error: any) {
            console.log(error);
        }

        fetch("/", {
            method: "POST",
            // headers: { "Content-Type": 'multipart/form-data; boundary=random' },
            body: encode(data)
        })
            .then((r) => {
                alert("Your recipe has been uploaded!")
                console.log(r)})
            .catch(error => console.log("Form Submission Failed!"));

        //Create a new recipe using the new image path
        const tempRatingMap:Map<string,number>=new Map<string, number>()
        const recipe:Recipe={id:"", title:title, text:ingredients+"\n\n"+directions, image:imageURL, ingredients:ingredients, averageRating:0, uploadedBy:currentUser.uid, UserComments:[]as UserComment[],ratingMap:JSON.stringify(Array.from(tempRatingMap.entries())), ratingSum:0, totalRatings:0}
        //Store this recipe in the database
        try{
            //Create a new entry under recipes, and save the automatically generated key
            const key=push(child(ref(getDatabase(app)), 'recipes'),recipe).key;
            //Set the id field of recipe to be equal to the key
            recipe.id=""
            recipe.id+=key as string
            console.log("id "+recipe.id)
            //Update the entry to the recipe object to store the recipe
            let queryPath="recipes/"
            queryPath+=key as string
            update(ref(getDatabase(app), queryPath), recipe).catch(e=>(console.log(e)));

            //Update the current user's uploaded recipes array
            //Create a temporary array, initialized to the current uploaded recipe array
            const tempUploadedRecipes: string[] = currentUser.uploadedRecipes;

            if(tempUploadedRecipes[0]===""){
                tempUploadedRecipes[0]=recipe.id
            }else{
                tempUploadedRecipes.push(recipe.id)
            }
            //Update the current user object with the new array
            setCurrentUser({
                uid: currentUser.uid, displayName: currentUser.displayName, photoURL: currentUser.photoURL,
                savedRecipes: currentUser.savedRecipes, uploadedRecipes: tempUploadedRecipes
            })
            //Update the database with this new object
            update(ref(db, '/users/' + currentUser.uid), currentUser).catch(e=>(console.log(e)));
        }
        catch(e){
            console.log(e)
        }
    }

    const handlePictureChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(file===undefined){
            alert("This is not a valid image file");
            return;
        }
        //Check the file extension. Reject it if it is not .jpg, .jpeg, or .png
        const extension=file.name.substring(file.name.indexOf('.')+1,file.name.length)
        if((extension!=='jpg'&&extension!=='jpeg')&&extension!=='png') {
            alert("This is not a valid image file\nAccepted extensions are jpg, jpeg, and png");
            return;
        }
        else{
            setPicture(file);
        }
    };

    return (
        <div className="bg-gray-100 py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-xl mx-auto">
                    {/*eslint-disable-next-line*/}
                    <form name="uploadform" onSubmit={handleSubmit} className="space-y-8" method="post" data-netlify="true">
                        <input type="hidden" name="form-name" value="uploadform"/>
                        <div>
                            <h2 className="text-2xl font-bold leading-7 text-gray-800">
                                Upload a Recipe
                            </h2>
                            <p className="mt-1 text-sm text-gray-600">
                                Enter the details of your recipe below.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                    Title
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="title"
                                        name="title"
                                        type="text"
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700">
                                    Ingredients
                                </label>
                                <div className="mt-1">
                                    <textarea
                                        id="ingredients"
                                        name="ingredients"
                                        required
                                        value={ingredients}
                                        onChange={(e) => setIngredients(e.target.value)}
                                        rows={4}
                                        className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="directions" className="block text-sm font-medium text-gray-700">
                                    Directions
                                </label>
                                <div className="mt-1">
                                    <textarea
                                        id="directions"
                                        name="directions"
                                        required
                                        value={directions}
                                        onChange={(e) => setDirections(e.target.value)}
                                        rows={4}
                                        className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="picture" className="block text-sm font-medium text-gray-700">
                                    Picture
                                </label>
                                <div className="mt-1 flex items-center">
                                    <input type="file" name="picture" id="picture" onChange={handlePictureChange} />
                                </div>
                                <button
                                    className="block w-full rounded bg-red-600 px-12 py-3 text-sm font-medium text-white shadow hover:bg-red-700 focus:outline-none focus:ring active:bg-red-500 sm:w-auto"
                                    type="submit"
                                >
                                    Upload Recipe
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UploadRecipe;