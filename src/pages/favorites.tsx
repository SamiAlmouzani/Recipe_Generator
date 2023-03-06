import { type NextPage } from "next";
import Link from "next/link";
import { useState, useEffect, JSXElementConstructor, ReactElement, ReactFragment } from "react";

import { getDatabase, ref, child, get } from "firebase/database";
import Image from "next/image";

type Recipe = { title: string, text: string, image: string }



const favorites: Recipe[] = [];

const Favorites: NextPage = () => {

  const [message, setMessage] = useState("");
  const [listItems, setListItems] = useState({});

  useEffect(() => {

    setListItems(getListItems());

  }, [favorites]);


  useEffect(() => {

    try {
      const dbRef = ref(getDatabase());

      get(child(dbRef, 'recipes/')).then((snapshot) => {

          if (snapshot.exists()) {
            setMessage("");

            snapshot.forEach((child) => {

              favorites.push(child.val());
            });

            setListItems(getListItems());
          }
          else {
           setMessage("You don't have any favorites yet!");
          }
      });
    }
    catch {

      setMessage("You don't have any favorites yet!");
      console.log("database error");


    }


  }, []);

  // @ts-ignore
  // @ts-ignore
  return (

    <div className="mx-auto max-w-screen-xl px-4 py-8 lg:flex lg:h-screen lg:items-top">
      <div >
        <h1 className="text-3xl font-extrabold sm:text-5xl">Favorites:</h1>

      </div>

      <div className="absolute top-20">
        <h3 className="text-1xl font-extrabold sm:text-3xl ">{message}</h3>
      </div>



      <Link className={""} href="/main">
        <button
          className=" absolute bottom-10 left-20 block w-full rounded bg-red-600 px-12 py-3 text-sm font-medium text-white shadow hover:bg-red-700 focus:outline-none focus:ring active:bg-red-500 sm:w-auto">
          Back
        </button>
      </Link>
        <button
          onClick={()=>{ try {favorites.length = 0; // @ts-ignore
            listItems.length = 0; } catch{} window.location.reload(); }} className=" absolute bottom-10 right-20 block w-full rounded bg-red-600 px-12 py-3 text-sm font-medium text-white shadow hover:bg-red-700 focus:outline-none focus:ring active:bg-red-500 sm:w-auto">
          Clear
        </button>
    </div>


  );

}

function getListItems(): JSX.Element[] {

  return (
   favorites.map((favorite) =>
    <div>
      <li>{favorite['title']}</li>
      <li>{favorite['text']}</li>
      <li>{<Image src={favorite['image']} width={500} height={500} alt="placeholder image"></Image>}</li>
    </div> ));
}


export default Favorites;