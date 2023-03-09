import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import {getAuth, GoogleAuthProvider, signInWithPopup} from "@firebase/auth";
import { app,db } from "../context/firebaseSetup"
import {useRouter} from "next/router";

const Home: NextPage = () => {
  const provider=new GoogleAuthProvider();
  const auth=getAuth(app);
  const router=useRouter();
  const handleLogin=()=>{
    signInWithPopup(auth,provider).then((result)=>{
      const credential=
          GoogleAuthProvider.credentialFromResult(result);
      const token=credential?.accessToken;
      const user=result.user;
      console.log(user);
      console.log(user.displayName)
      console.log(user.uid)
      router.push("/main");
    })
        .catch((error)=>{
          const errorCode=error.code;
          const errorMessage=error.message;
          const email=error.customDate.email;
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
