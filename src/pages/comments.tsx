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
  const { currentUser, setCurrentUser } = useGlobalContext();
  const [commentText, setCommentText] = useState("initial comment");
  const [userComment, setUserComment] = useState({ username: "", text: "",date:"" });

  console.log("comment props "+JSON.stringify(props))

  const commentArray: UserComment[] = []

  props.commentList.forEach((c) => {
    if (c !== undefined && c !== null)
      commentArray.push(c);
  })

  return (
    <div>
      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto text-left">
          <h1 className="text-2xl font-bold sm:text-3xl">Comments</h1>
        </div>
        <div className="mt-6 w-full bg-white rounded-lg shadow-lg lg:w">
          <div>
            {commentArray.map((comment) =>
              <div key={comment.username+comment.date}>

                <div className="mt-6 w-full bg-white rounded-lg shadow-lg lg:w">
                  <ul className="divide-y-2 divide-gray-100">
                    <li className="p-3 hover:bg-red-600 hover:text-red-200">
                                            <pre className="italic">{
                                              comment.username}</pre>
                      <pre className="italic">{
                        comment.text}</pre>

                    </li>
                  </ul>

                </div>
                <button onClick={() => {deleteComment(comment, props.id)}}> Delete </button>
              </div>)}
          </div>
        </div>
      </div>

      <Link href="/main">
        <button
          className="mx-8 my-8 block w-full mt-6 rounded bg-red-600 px-12 py-3 text-sm font-medium text-white shadow hover:bg-red-700 focus:outline-none focus:ring active:bg-red-500 sm:w-auto"
        >
          Back
        </button>
      </Link>

      <Link href={{ pathname: '/leave_comment', query: { id: props.id } }}>
        <button
          className="mx-8 my-8 block w-full mt-6 rounded bg-red-600 px-12 py-3 text-sm font-medium text-white shadow hover:bg-red-700 focus:outline-none focus:ring active:bg-red-500 sm:w-auto"
        >
          Leave Comment
        </button>
      </Link>


    </div>
  );
   function deleteComment(comment: UserComment, id:string) {
       console.log("username on comment, current user", comment.username, currentUser.displayName)
     console.log(comment.username)
     console.log(currentUser.displayName)
      if (comment.username === currentUser.displayName) {
          try {
            const comments:UserComment[]=[]
            props.commentList.forEach((f)=>{
              if (f != comment) {
                comments.push(f)
              }
            })
            const updates={};
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            updates["recipes/" + id + "/" + "comments/"] = comments;
            console.log("about to update")
            update(ref(db), updates).catch(e=>(console.log(e)));
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