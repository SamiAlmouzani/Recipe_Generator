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

type CommentsProps = {commentList: Comment[], id: string}
const leave_comment: React.FC<CommentsProps>= (props) => {
  //Import the current user.
  const { currentUser, setCurrentUser } = useGlobalContext();
  const [commentText, setCommentText] = useState("initial comment");
  const [userComment, setUserComment] = useState({ username: "", text: "" });

  // @ts-ignore
  // @ts-ignore
  console.log("comment props "+JSON.stringify(props))


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
            <button
              className="px-3 py-2 text-sm text-white-600 border border-red-500 rounded">
              Cancel
            </button>
          </div>
          {/* </form>*/}
        </div>
      </div>

      <Link href="/main">
        <button
          className="mx-8 my-8 block w-full mt-6 rounded bg-red-600 px-12 py-3 text-sm font-medium text-white shadow hover:bg-red-700 focus:outline-none focus:ring active:bg-red-500 sm:w-auto"
        >
          Back
        </button>
      </Link>

    </div>
  );

  async function saveComment() {
    console.log("calling saveComment")
    console.log("comment text from saveComment", commentText);

    try {
      let comments:Comment[]=[]
      if (commentText.length != 0) {

        // save comment to list of comments in recipe
        setUserComment({ username: currentUser.displayName, text: commentText });
        console.log("user comment "+JSON.stringify(userComment))
        props.commentList.forEach((f)=>{
          comments.push(f)
        })
        let comment=userComment
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

  let comments: Comment[] = []
  let commentIds: string[] = []
  let index = 0
  let recipeID = context.query.id
  let tempComments:Comment[]=[]

  //This try/catch block pulls in the recipes from the database
  try {
    let recipeRef = query(ref(getDatabase(app), 'recipes/'+recipeID))

    return {
      props: { commentList:comments, id: recipeID}}
  } catch (e) {
    console.log(e)
  }
  return {
    props: { commentList:comments, id: recipeID }
  }
}
export default leave_comment;