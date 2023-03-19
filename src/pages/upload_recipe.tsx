import React, { useState, ChangeEvent } from "react";

const UploadRecipe = () => {
    const [title, setTitle] = useState("");
    const [ingredients, setIngredients] = useState("");
    const [directions, setDirections] = useState("");
    const [picture, setPicture] = useState<File | null>(null);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // code to submit the form data
    };

    const handlePictureChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setPicture(file || null);
    };

    return (
        <div className="bg-gray-100 py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-xl mx-auto">
                    <form onSubmit={handleSubmit} className="space-y-8">
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
                                    <label
                                        htmlFor="file-upload"
                                        className="px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-700 active:bg-red-800 focus:outline-none focus:border-red-900 focus:shadow-outline-red disabled:opacity-25 transition ease-in-out duration-150"
                                    >
                                        <input type="file" id="picture" onChange={handlePictureChange} />
                                    </label>
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