import Image from 'next/image'
import { MdOutlineFavorite } from "react-icons/md";
import {useState} from 'react';
import placeholder_image from './placeholder_image.jpg'
import Link from "next/link";

type Recipe={title:string, text:string}
type RecipeContext={query:Recipe}
let saved=false;    //Variable to keep track of whether the recipe is saved
const Recipe: React.FC<Recipe>=(props)=>{
    const [heartColor,setHeartColor]=useState("808080")
    return(
        <div>
        <div className={"flow-root px-40"}>
           <div> <p className={"flex justify-center text-3xl font-bold py-2"}>{props.title}</p></div>
               <div id="id" className={"float-left"}>
                   <StarIcons/>
               </div>
            <div className={"float-right"}>
                {/*Heart button*/}
                    <MdOutlineFavorite
                        color={heartColor}
                        size={48}
                        onClick={()=>{
                            //Clicking the heart will toggle the "saved" property, and the color
                            saved=!saved
                            if(saved){
                                setHeartColor("FF0000")
                            }else{
                                setHeartColor("808080")
                            }
                        }}
                        />
                </div>
                </div>
        <div className={"flex justify-center"}>
            <div>
                {/*This is a placeholder image*/}
            <Image className={"flex justify-center"} src={placeholder_image} width={500} height={500} alt="placeholder image"></Image>
            <pre className={"flex justify-center"}>{props.text}</pre>
                <Link href="/results">
                    <button
                        className=" block w-full rounded bg-red-600 px-12 py-3 text-sm font-medium text-white shadow hover:bg-red-700 focus:outline-none focus:ring active:bg-red-500 sm:w-auto">
                        Back
                    </button>
                </Link>
            </div>
        </div>
        </div>
    )
}

function StarIcons(){
    const [rating, setRating]=useState(0)

    const [star1color,setStar1Color]=useState("grey")
    const [star2color,setStar2Color]=useState("grey")
    const [star3color,setStar3Color]=useState("grey")
    const [star4color,setStar4Color]=useState("grey")
    const [star5color,setStar5Color]=useState("grey")
    return(
        <div>
            {/*The fill color for each star icon is grey by default. When the star is clicked, set the rating to the corresponding number, and
            set the color of the other stars to match the rating (if the rating was 5 and star 3 is clicked, change stars 4 and 5 to grey. Or if the rating is
            1 and star 4 is clicked, set stars 2, 3, and 4 to yellow)*/}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={star1color} className="w-8 h-8 inline" onClick={()=>
            {
                if(rating===0){
                    setStar1Color("yellow")
                    setRating(1)
                }
                else if(rating===1){
                    setStar1Color("grey")
                    setRating(0)
                }
                else{
                    setStar2Color("grey")
                    setStar3Color("grey")
                    setStar4Color("grey")
                    setStar5Color("grey")
                    setRating(1)
                }
            }
            }>
                <path fill-rule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                      clip-rule="evenodd"
                        />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={star2color} className="w-8 h-8 inline" onClick={()=>
            {
                if(rating<2){
                    setStar1Color("yellow")
                    setStar2Color("yellow")
                    setRating(2)
                }
                else if(rating>2){
                    setStar3Color("grey")
                    setStar4Color("grey")
                    setStar5Color("grey")
                    setRating(2)
                }
            }}>
                <path fill-rule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                      clip-rule="evenodd"/>
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={star3color} className="w-8 h-8 inline" onClick={()=>
            {
                if(rating<3){
                    setStar1Color("yellow")
                    setStar2Color("yellow")
                    setStar3Color("yellow")
                    setRating(3)
                }
                else if(rating>3){
                    setStar4Color("grey")
                    setStar5Color("grey")
                    setRating(3)
                }
            }}>
                <path fill-rule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                      clip-rule="evenodd"/>
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={star4color} className="w-8 h-8 inline" onClick={()=>
            {
                if(rating<4){
                    setStar1Color("yellow")
                    setStar2Color("yellow")
                    setStar3Color("yellow")
                    setStar4Color("yellow")
                    setRating(4)
                }
                else if(rating>4){
                    setStar5Color("grey")
                    setRating(4)
                }
            }}>
                <path fill-rule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                      clip-rule="evenodd"/>
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={star5color} className="w-8 h-8 inline" onClick={()=>
            {
                if(rating<5){
                    setStar1Color("yellow")
                    setStar2Color("yellow")
                    setStar3Color("yellow")
                    setStar4Color("yellow")
                    setStar5Color("yellow")
                    setRating(5)
                }
            }}>
                <path fill-rule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                      clip-rule="evenodd"/>
            </svg>

        </div>
    )
}
//When this page is loaded, it is passed the recipe text from the results screen
export function getServerSideProps(context:RecipeContext){
    return{
        props:{
            title:context.query.title,
            text:context.query.text
        }
    }

}
export default Recipe;