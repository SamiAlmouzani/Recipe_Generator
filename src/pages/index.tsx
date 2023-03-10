import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import {getAuth, GoogleAuthProvider, signInWithPopup} from "@firebase/auth";
import { app,db } from "../context/firebaseSetup"
import {useRouter} from "next/router";
import {useGlobalContext} from "../context";
import {get, getDatabase, query, ref, set} from "firebase/database";

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
      const token=credential?.accessToken;
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
          const returningUser:customUser={uid:snapshot.val().uid,displayName:snapshot.val().displayName, photoURL:snapshot.val().photoURL,
            savedRecipes:snapshot.val().savedRecipes,uploadedRecipes:snapshot.val().uploadedRecipes}

          //Set the current user in the global context
          setCurrentUser(returningUser)
        }
        //If the snapshot does not exist, it means there is no user with this uid. They need to be added to the database
        else{
          console.log("user does not exist")

          //Initialize a new user object
          // @ts-ignore
          const newUser:customUser={uid:user.uid,displayName:user.displayName,photoURL:user.photoURL, savedRecipes:[""],uploadedRecipes:[""]}

          //Save this new object in the database
          const db=getDatabase(app)
          set(ref(db, 'users/' + user.uid), newUser);

          //Use the new object to set the currentUser in the global context
          setCurrentUser(newUser);
        }
      }).catch(()=>{
        console.log("There was an error")
      })
      //Go to the main page
      router.push("/main");
    })
        .catch((error)=>{
          const credential=GoogleAuthProvider.credentialFromError(error)
        });
  }

  return (
    <section className="bg-gray-50">
    <div
      className="mx-auto max-w-screen-xl px-4 py-32 lg:flex lg:h-screen lg:items-center"
    >
      <div className="mx-auto max-w-xl text-center">
        <h1 className="text-3xl font-extrabold sm:text-5xl">
          <strong className="font-extrabold text-red-700 sm:block">
            Recipe Generator.
          </strong>
        </h1>

        <p className="mt-4 sm:text-xl sm:leading-relaxed">
          We think of great recipes that you and your family can enjoy 
          so you don&apos;t have to 
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button onClick={handleLogin}
            className="block w-full rounded bg-red-600 px-12 py-3 text-sm font-medium text-white shadow hover:bg-red-700 focus:outline-none focus:ring active:bg-red-500 sm:w-auto"
            >
              Get Started
            </button>
        </div>
      </div>
    </div>
  </section>
);
};

export default Home;
