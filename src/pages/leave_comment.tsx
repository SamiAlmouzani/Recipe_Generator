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
const leave_comment: React.FC<CommentsProps>= (props) => {
  //Import the current user.
  const { currentUser, setCurrentUser } = useGlobalContext();
  const [commentText, setCommentText] = useState("initial comment");
  const [userComment, setUserComment] = useState({ username: "", text: "" });

  // @ts-ignore
  // @ts-ignore
  console.log("comment props "+JSON.stringify(props))
  console.log("user display name: " + currentUser.displayName)

  return (
    <div>

      <div className="flex px-8 py-8">
        <div className="max-w-lg rounded-lg shadow-md shadow-red-600/50">

          {/*  <form action="" className="w-full p-4 my-8">*/}

          <div className="mb-2">
            <label htmlFor="comment" className="text-lg text-gray-600">Add a comment</label>
            <textarea
              className="w-full h-20 p-2 border rounded focus:outline-none focus:ring-gray-300 focus:ring-1"
              name="comment"
              onChange={(event) => {
                setCommentText(event.target.value);
              }
              }
              placeholder=""></textarea>
          </div>
          <div>
            <button className="px-3 py-2 text-sm text-white bg-red-600 rounded" onClick={()=>{saveComment()}}
            >
              Comment
            </button>

          </div>
          {/* </form>*/}
        </div>
      </div>

      <Link href={{ pathname: '/comments', query: { id: props.id } }}>
        <button
          className="mx-8 my-8 block w-full mt-4 rounded bg-red-600 px-12 py-3 text-sm font-medium text-white shadow hover:bg-red-700 focus:outline-none focus:ring active:bg-red-500 sm:w-auto"
        >
          Back
        </button>
      </Link>

    </div>
  );

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
    window.location.reload();
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
export default leave_comment;