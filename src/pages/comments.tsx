import { type NextPage } from "next";
import Link from "next/link";
import React, {useEffect, useState} from 'react';
import { child, get, getDatabase, push, query, ref, update } from "firebase/database";
import {db, auth, app} from "../context/firebaseSetup";
import {useGlobalContext} from "../context";
import recipe from "./recipe";

//----For definitions for the Recipe, RecipeFromAPI, RecipeContext, and Comment types, see index.d.ts in the types folder----

//When this page is loaded, the getServerSideProps function (further down) runs first, and returns a prop object to the Results component.
//props is an array of Recipe objects.

type CommentsProps = {commentList: UserComment[], id: string}
const Comments: React.FC<CommentsProps>= (props) => {
  //Import the current user.
//  const { currentUser, setCurrentUser } = useGlobalContext();
  const [commentText, setCommentText] = useState("initial comment");
  const [userComment, setUserComment] = useState({uid:"", username: "", text: "",date:"" });

  const [currentUser, setCurrentUser] = useState({uid:"",displayName:"", photoURL:"", savedRecipes:[""], uploadedRecipes:[""]});

  useEffect(() => {
    //eslint-disable-next-line
    const user:customUser = JSON.parse(localStorage.getItem('user')+"");
    console.log("Calling useEffect "+JSON.stringify(user))
    if (user) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      setCurrentUser(user);
    }
  }, []);

  console.log("comment props "+JSON.stringify(props))
  console.log("UID in main page "+currentUser.uid)
  const commentArray: UserComment[] = []

  props.commentList.forEach((c) => {
    if (c !== undefined && c !== null)
      commentArray.push(c);
  })
  console.log("uid:"+currentUser.uid)

  return (
      <div>
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
        <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto text-left">
            <h1 className="text-2xl font-bold sm:text-3xl">See what others have to say!</h1>
          </div>
          <div className="mt-6 w-full bg-white rounded-lg shadow-lg lg:w">
            <div>
              {commentArray.map((comment) =>
                  <div key={comment.username+comment.date}>

                    <div className="mt-6 w-full bg-white rounded-lg shadow-lg lg:w">
                      <ul className="divide-y-2 divide-gray-100">
                        <li className="p-3 hover:bg-red-600 hover:text-red-200">
                                            <pre className="italic font-bold text-red-500">{
                                              comment.username}</pre>
                          {
                            comment.text.length>0 ? (
                                <pre className="italic ">
                        {comment.text}</pre>):(<div></div>)
                          }
                        </li>
                      </ul>

                    </div>
                    <div className="mt-0 font-bold">
                      {
                        comment.uid===currentUser.uid ? (
                            <button onClick={() => {deleteComment(comment, props.id).catch((e)=>console.log(e))}}> Delete </button>
                        ):(
                            <div></div>
                        )
                      }
                    </div>
                  </div>)}
            </div>
          </div>
          <Link href="/main">
            <button
                className="my-8 block w-full mt-6 rounded bg-red-600 px-12 py-3 text-sm font-medium text-white shadow hover:bg-red-700 focus:outline-none focus:ring active:bg-red-500 sm:w-auto"
            >
              Back
            </button>
          </Link>
          <Link href={{ pathname: '/leave_comment', query: { id: props.id } }}>
            <button
                className="my-8 block w-full mt-0 rounded bg-red-600 px-12 py-3 text-sm font-medium text-white shadow hover:bg-red-700 focus:outline-none focus:ring active:bg-red-500 sm:w-auto"
            >
              Leave Comment
            </button>
          </Link>
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

      </div>
  );
  async function deleteComment(comment: UserComment, id:string) {
    console.log("username on comment, current user", comment.username, currentUser.displayName)
    console.log("comment uid: "+comment.uid)
    console.log(currentUser.uid)
    if (comment.uid === currentUser.uid) {
      try {
        const comments:UserComment[]=[]
        props.commentList.forEach((f)=>{
          if (f !== comment) {
            comments.push(f)
          }
        })
        const updates={};
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        updates["recipes/" + id + "/" + "comments/"] = comments;
        console.log("about to update")
        await update(ref(db), updates).catch(e=>(console.log(e)));
        console.log("after update")
      }
      catch (e) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        console.log(e.stack);
      }
    }
    window.location.reload()
  }
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/require-await
export async function getServerSideProps(context) {
  const commentList: UserComment[] = []
  // eslint-disable-next-line
  const recipeID = context.query.id

  //This try/catch block pulls in the recipes from the database
  try {
    // eslint-disable-next-line
    const recipeRef = ref(getDatabase(app), "recipes/" + recipeID)

    await get(recipeRef).then((snapshot) => {

      if (snapshot.exists()) {
        // eslint-disable-next-line
        const comments = snapshot.val().comments

        console.log("comments:" + JSON.stringify(comments))
        // eslint-disable-next-line
        comments.forEach((c: UserComment | null | undefined) => {
          if (c !== undefined && c !== null)
            commentList.push(c);
        })
      }
    });

    return {
      // eslint-disable-next-line
      props: { commentList:commentList, id: recipeID}}
  } catch (e) {
    console.log(e)
  }
  return {
    // eslint-disable-next-line
    props: { commentList:commentList, id: recipeID }
  }
}
export default Comments;