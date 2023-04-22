import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import {getAuth, GoogleAuthProvider, signInWithPopup} from "@firebase/auth";
import { app,db } from "../context/firebaseSetup"
import {useRouter} from "next/router";
import {useGlobalContext} from "../context";
import {get, getDatabase, goOffline, query, ref, set} from "firebase/database";
import React from "react";
import 'react-slideshow-image/dist/styles.css'
import {ReactPhotoCollage} from "react-photo-collage";
import {position} from "dom-helpers";

const Home: NextPage = () => {
  const { currentUser,setCurrentUser } = useGlobalContext();

  const provider=new GoogleAuthProvider();
  const auth=getAuth(app);
  const router=useRouter();

  //The handleLogin function runs when the "Enter" button on this page is clicked
  const handleLogin=()=>{
    signInWithPopup(auth,provider).then((result)=>{
      const credential=
          GoogleAuthProvider.credentialFromResult(result);
      const user=result.user;

      console.log(user)
      console.log(user.uid)
      console.log(user.displayName)

      //The query function searches for a value in the users path of the database, with a key matching the uid of the user who just logged in
      const userRef = query(ref(db, 'users/' + user.uid));

      //Get a snapshot from the database using the Database Reference object returned by the query
      get(userRef).then((snapshot)=>{
        //If the snapshot exists, it means the user is already in the database.
        if(snapshot.exists()){
          //Create a new user object and initialize the fields with the values from Firebase
          const tempUser:customUser=snapshot.val() as customUser
          const returningUser:customUser={uid:tempUser.uid,displayName:tempUser.displayName, photoURL:tempUser.photoURL,
            savedRecipes:tempUser.savedRecipes,uploadedRecipes:tempUser.uploadedRecipes}

          //Set the current user in the global context
          setCurrentUser(returningUser)
          localStorage.setItem('user', JSON.stringify(returningUser));
        }
        //If the snapshot does not exist, it means there is no user with this uid. They need to be added to the database
        else{
          console.log("user does not exist")

          //Initialize a new user object
          const newUser:customUser={uid:user.uid,displayName:user.displayName as string,photoURL:user.photoURL as string, savedRecipes:[""],uploadedRecipes:[""]}

          //Save this new object in the database
          const db=getDatabase(app)
          set(ref(db, 'users/' + user.uid), newUser).catch(e => console.log(e));

          //Use the new object to set the currentUser in the global context
          setCurrentUser(newUser);
          localStorage.setItem('user', JSON.stringify(newUser));
         /* goOffline(db)
          goOffline(getDatabase(app))*/
        }
      }).catch(()=>{
        console.log("There was an error")
      })
      //Go to the main page
      router.push("/main").catch(e=>console.log(e));
    })
        .catch((error)=>{
       //   const credential=GoogleAuthProvider.credentialFromError(error)
        });

  }
  //formatting the slideshow images
  const settings = {
    width: "1200px",
    height: ["200px", "150px"],
    layout: [ 2,4,3],
    photos: [
      {
        source:
        "https://www.foodiesfeed.com/wp-content/uploads/2023/04/pizza-fresh-out-of-oven-close-up.jpg"
      },
      {
        source:
            "https://www.foodiesfeed.com/wp-content/uploads/2021/03/yeast-dough.jpg"
      },
      {
        source:
            "https://www.foodiesfeed.com/wp-content/uploads/2017/10/french-toast-for-breakfast.jpg"
      },
      {
        source:
           "https://www.foodiesfeed.com/wp-content/uploads/2021/02/breakfast-and-berries.jpg"
      },
      {
        source:
            "https://www.foodiesfeed.com/wp-content/uploads/2015/05/vietnamese-pho-ga-takeaway.jpg"
      },
      {
        source:
            "https://media.istockphoto.com/id/1404495570/photo/spicy-hyderabadi-chicken-biryani-served-in-dish-side-view-on-wooden-table-background.jpg?b=1&s=612x612&w=0&k=20&c=N3xwfE2nmpYJI0h5-d7EWMTZz3WSOmeyRAyGRaIPjgA="
      },
      {
        source:
            "https://media.istockphoto.com/id/1316145932/photo/table-top-view-of-spicy-food.jpg?b=1&s=612x612&w=0&k=20&c=X6CkFGpSKhNZeiii8Pp2M_YrBdqs7tRaBytkGi48a0U="
      },

      {
        source:
            "https://media.istockphoto.com/id/1345852382/photo/beef-nihari-pakistani-curry-cuisine.jpg?b=1&s=612x612&w=0&k=20&c=c_V3cjsmr7CXhbKvygKQs1r5F0KNJCsw7FqwCOoXdXo="
      },
      {
        source:
            "https://media.istockphoto.com/id/533645537/photo/breakfast-with-bacon-eggs-pancakes-and-toast.jpg?b=1&s=612x612&w=0&k=20&c=d4Lg_bgWoLnRbAxBIaducqmq8CVqLOrYiHqHADwyOIA="
      },

    ],
    showNumOfRemainingPhotos: true
  }
  const background = {
    image: 'url(img1.gif), url(img2.png), url(img3.gif)',
    background:'center top, right top, center bottom,no-repeat, repeat-x, repeat-y',
  };

  return (
    <section className="bg-gray-20" >
      <img
        src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQW47TpryE5rmsWr5aef5ZLXJMYr-socetxFw&usqp=CAU'
        className="w-32 ml-2 justify-items-center"
    />
      <div className="mx-auto max-w-screen-xl px-4 py-20 lg:flex lg:h-screen lg:items-center" >
      <div className="mx-auto max-w-xl text-center">
        <h1 className="text-3xl font-extrabold sm:text-5xl">
          <strong className="font-extrabold text-red-700 sm:block">
            SuperChef.
          </strong>
        </h1>
        <p className="mt-4 sm:text-xl sm:leading-relaxed ">
          We think of great recipes that you and your family can enjoy 
          so you don&apos;t have to!
        </p>
        <div className="mx-auto max-w-md text-center ">
          <p className="text-1xl font-bold sm:text-2xl whitespace-pre-line mt-4">Scroll down to get started!</p>
        </div>
      </div>
    </div>
      <div className="mx-auto max-w-screen-xl px-4 py-22 lg:flex lg:h-screen lg:items-center relative">
        <ReactPhotoCollage {...settings} />
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-sm-2">
        <button onClick={handleLogin}
                className="block w-full rounded bg-red-600 px-12 py-3 text-sm font-medium text-white shadow hover:bg-red-700 focus:outline-none focus:ring active:bg-red-500 sm:w-auto"
        >
          Get Started
        </button>
      </div>
      <footer className="flex flex-col space-y-5 justify-center mt-20 position-relative">
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

export default Home;