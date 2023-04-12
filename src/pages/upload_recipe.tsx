import React, {useState, ChangeEvent, useEffect} from "react";
import {useGlobalContext} from "../context";
import {child, getDatabase, push, ref, update} from "firebase/database";
import {app, db} from "../context/firebaseSetup";
import axios from "axios";
import path from "path";

const UploadRecipe = () => {
    const [title, setTitle] = useState("");
    const [ingredients, setIngredients] = useState("");
    const [directions, setDirections] = useState("");
    const [picture, setPicture] = useState<File | null>(null);
    const {currentUser, setCurrentUser}=useGlobalContext();
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        ingredients: "",
        directions: "",
        picture:picture
    })


    //eslint-disable-next-line
    const encode = (data:any) => {
        //eslint-disable-next-line
        return Object.keys(data)
            //eslint-disable-next-line
            .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
            .join("&");}

    useEffect(() => {
        if(isSubmitted){
            fetch("/", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: encode({ "form-name": "upload-recipe-form", ...formData })
            })
                .then(() => alert("Success!"))
                .then(() => setIsSubmitted(false))
                .then(() => setFormData({title: "", ingredients: "",  directions: "",picture:null}))
                .catch(error => alert(error))}
    }, [formData, isSubmitted])

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>){
        e.preventDefault();
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
        setFormData({title: title, ingredients: ingredients, directions: directions, picture: picture
        })
        console.log(formData)
        setIsSubmitted(true)
        e.preventDefault();
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
        <section>
            <nav className="font-extrabold text-red-700 sm:block text-3xl">
                <div className="font-extrabold text-red-700 sm:block text-3xl">
                    <img
                        src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQW47TpryE5rmsWr5aef5ZLXJMYr-socetxFw&usqp=CAU'
                        className="w-32 ml-2"

                    />
                    <strong>
                        SuperChef.
                    </strong>
                </div>
            </nav>
        <div className="bg-gray-100 py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-xl mx-auto">
                   {/*eslint-disable-next-line*/}
                    <form className="space-y-8" data-netlify="true" onSubmit={handleSubmit}>
                        <input type="hidden" name="form-name" value="upload_recipe_form" />
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
                                    <input type="hidden" name="form-name" value="upload_recipe_form" />
                                    <input
                                        id="title"
                                        type="text"
                                        name="title"
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
                                    <input type="hidden" name="form-name" value="upload_recipe_form" />
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
                                    <input type="hidden" name="form-name" value="upload_recipe_form" />
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
                                    <input type="hidden" name="form-name" value="upload_recipe_form" />
                                    <input type="file" name="picture" id="picture" onChange={handlePictureChange} />
                                </div>
                                <button
                                    className="block w-full rounded bg-red-600 px-12 py-3 text-sm font-medium text-white shadow hover:bg-red-700 focus:outline-none focus:ring active:bg-red-500 sm:w-auto mt-4"
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
            <footer className="flex flex-col space-y-10 justify-center m-10 position-relative">
                <nav className="flex justify-center flex-wrap gap-6 text-gray-500 font-medium">
                    <a className="hover:text-gray-900" href="#">Home</a>
                    <a className="hover:text-gray-900" href='\index.tsx'>About</a>
                </nav>

                <div className="flex justify-center space-x-5">
                    <img
                        src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQW47TpryE5rmsWr5aef5ZLXJMYr-socetxFw&usqp=CAU'
                        className="w-12 ml-2 justify-left"
                    />
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                        <img src="https://img.icons8.com/fluent/30/000000/facebook-new.png"/>
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                        <img src="https://img.icons8.com/fluent/30/000000/instagram-new.png"/>
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                        <img src="https://img.icons8.com/fluent/30/000000/twitter.png"/>
                    </a>
                </div>
                <p className="text-center text-gray-700 font-medium">&copy; 2023 Company Ltd. All rights reserved.</p>
            </footer>
        </section>
    );
};

export default UploadRecipe;