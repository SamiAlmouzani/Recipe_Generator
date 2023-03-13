import { type NextPage } from "next";
import Link from "next/link";
import React, {useEffect, useState} from 'react';
import { child, get, getDatabase, push, query, ref, update } from "firebase/database";
import {db, auth, app} from "../context/firebaseSetup";
import {useGlobalContext} from "../context";

//----For definitions for the Recipe, RecipeFromAPI, RecipeContext, and Comment types, see index.d.ts in the types folder----

//When this page is loaded, the getServerSideProps function (further down) runs first, and returns a prop object to the Results component.
//props is an array of Recipe objects.

type CommentsProps = {commentList: Comment[], id: string}
const Comments: React.FC<CommentsProps>= (props) => {
  //Import the current user.
  const { currentUser, setCurrentUser } = useGlobalContext();
  const [commentText, setCommentText] = useState("");
  const [userComment, setUserComment] = useState({ username: "", text: "" });

  console.log("current user: (accessed from main screen)" + currentUser.displayName)
  console.log("recipes from props\n")
  console.log(props.commentList)
  // @ts-ignore
  // @ts-ignore


  let commentArray: Comment[] = []

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
              </div>)}
          </div>
        </div>
      </div>
      <div className="flex px-8 py-8">
        <div className="max-w-lg rounded-lg shadow-md shadow-red-600/50">
          <form action="" className="w-full p-4 my-8">
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
              <button onClick={saveComment} className="px-3 py-2 text-sm text-white bg-red-600 rounded">
                Comment
              </button>
              <button
                className="px-3 py-2 text-sm text-white-600 border border-red-500 rounded">
                Cancel
              </button>
            </div>
          </form>
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

  function saveComment() {
    console.log(userComment);

    try {
      if (commentText.length != 0) {

        // save comment to list of comments in recipe

        setUserComment({ username: currentUser.displayName, text: commentText });
        let comments = props.commentList
        let comment = userComment
        // @ts-ignore
        comments.push(comment)
        const recipeRef = query(ref(db, 'recipes/' + props.id + '/comments'))
        get(recipeRef).then((snapshot) => {

          if (snapshot.exists()) {

            update(ref(db, 'recipes/' + props.id + '/comments'), comments);
          }
        })
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
    let recipeID = {string: context.query.id}
    //This try/catch block pulls in the recipes from the database
    try {
      let recipeRef = ref(getDatabase(app), 'recipes/' + context.query.id)

      console.log("recipe ref " + JSON.stringify(recipeRef))

      await get(recipeRef).then((snapshot) => {

        if (snapshot.exists()) {

          snapshot.val().comments.forEach((c: Comment) => {

            const commentRef = query(ref(getDatabase(app), 'recipes/' + context.query.id + 'comments/' + c));
            get(commentRef).then((s) => {
              comments.push(s.val());
            })

            return {
              props: { comments, recipeID: JSON.parse(JSON.stringify(recipeID)) }
            }
          });
        }
      });
    } catch (e) {
      console.log(e)
    }
    return {
      props: { comments, recipeID: JSON.parse(JSON.stringify(recipeID)) }
    }
  }




export default Comments;