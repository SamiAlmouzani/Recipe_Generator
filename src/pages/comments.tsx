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
  const [userComment, setUserComment] = useState({ username: "", text: "" });

  // @ts-ignore
  // @ts-ignore
  console.log("comment props "+JSON.stringify(props))

  let commentArray: UserComment[] = []

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
              <div>

                <div className="mt-6 w-full bg-white rounded-lg shadow-lg lg:w">
                  <ul className="divide-y-2 divide-gray-100">
                    <li className="p-3 hover:bg-red-600 hover:text-red-200">
                                            <pre className="italic">{                                        //@ts-ignore
                                              comment.username}</pre>
                      <pre className="italic">{                                        //@ts-ignore
                        comment.text}</pre>

                    </li>
                  </ul>

                </div>
                <button onClick={() => {deleteComment(comment)}}> Delete </button>
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


  async function deleteComment(comment: UserComment) {

      if (comment.username === currentUser.displayName) {

          try {
            let comments:UserComment[]=[]
            props.commentList.forEach((f)=>{
              if (f != comment) {
                comments.push(f)
              }
            })
            const updates = {};
            // @ts-ignore
            updates["recipes/" + props.id + "/" + "comments/"] = comments;

            update(ref(db), updates)
          }
          catch (e) {
            // @ts-ignore
            console.log(e.stack);
          }
      }

  }


  function saveComment() {
    console.log("calling saveComment")


    let commentBody = commentText
    try {
      let comments:UserComment[]=[]
      if (commentBody.length != 0) {
        console.log("comment text from saveComment", commentText);
        // save comment to list of comments in recipe
        setUserComment({ username: currentUser.displayName, text: commentBody });
        console.log("user comment "+JSON.stringify(userComment))
        props.commentList.forEach((f)=>{
          comments.push(f)
        })
        let comment = {username: currentUser.displayName, text: commentText};
        // @ts-ignore
        comments.push(comment)
        console.log("comments props 2"+JSON.stringify(comments))

        // const recipeRef = query(ref(db, "recipes/"))

        // update(ref(db, 'recipes/' + props.id + '/comments/'), comments);          // @ts-ignore

        const updates = {};
        // @ts-ignore
        updates["recipes/" + props.id + "/" + "comments/"] = comments;

        update(ref(db), updates)



        /* await get(recipeRef).then((snapshot) => {
           if (snapshot.exists()) {
             update(ref(db, 'recipes/' + JSON.stringify(props.id) + '/comments'), {comments:comments});
           }
         });*/
      }
    } catch (e) {
      // @ts-ignore
      console.log(e.stack);
    }
  }
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/require-await
export async function getServerSideProps(context) {

  let commentList: UserComment[] = []
  let recipeID = context.query.id

  //This try/catch block pulls in the recipes from the database
  try {
      let recipeRef = ref(getDatabase(app), "recipes/" + recipeID)

      await get(recipeRef).then((snapshot) => {

        if (snapshot.exists()) {

          let comments = snapshot.val().comments

          console.log("comments:" + JSON.stringify(comments))

          comments.forEach((c: UserComment | null | undefined) => {
            if (c !== undefined && c !== null)
              commentList.push(c);
          })
        }
      });

    return {
      props: { commentList:commentList, id: recipeID}}
  } catch (e) {
    console.log(e)
  }
  return {
    props: { commentList:commentList, id: recipeID }
  }
}






export default Comments;