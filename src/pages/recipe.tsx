import Image from 'next/image'
import { MdOutlineFavorite } from "react-icons/md";
import {useEffect, useState} from 'react';
import placeholder_image from './placeholder_image.jpg'

type Recipe={title:string, text:string}
type RecipeContext={query:Recipe}
let favorited=false;
const Recipe: React.FC<Recipe>=(props)=>{
    const ratingChanged = (newRating:number) => {
        console.log(newRating)
    }

    const [heartColor,setHeartColor]=useState("808080")
    const [value, setValue]=useState(0)
    console.log(props.text)
    return(
        <div>
        <div className={"flow-root px-40"}>
           <div> <p className={"flex justify-center text-3xl font-bold py-2"}>{props.title}</p></div>
               <div id="id" className={"float-left"}>
                   <StarIcons/>
               </div>
            <div className={"float-right"}>
                    <MdOutlineFavorite
                        color={heartColor}
                        size={48}
                        onClick={()=>{
                            //Clicking the heart will toggle the "favorited" property
                            favorited=!favorited
                            if(favorited){
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
            <Image className={"flex justify-center"} src={placeholder_image} width={500} height={500} alt="placeholder image"></Image>
            <pre className={"flex justify-center"}>{props.text}</pre>
            </div>
        </div>
        </div>
    )
}
function StarIcons(){
    const [star1color,setStar1Color]=useState("FF0000")
    const [star2color,setStar2Color]=useState("7E7E7E")
    const [star3color,setStar3Color]=useState("7E7E7E")
    const [star4color,setStar4Color]=useState("7E7E7E")
    const [star5color,setStar5Color]=useState("7E7E7E")

    return(
        <div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={star1color} className="w-8 h-8 inline">
                <path fill-rule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                      clip-rule="evenodd"
                        />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="grey" className="w-8 h-8 inline">
                <path fill-rule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                      clip-rule="evenodd"/>
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="grey" className="w-8 h-8 inline">
                <path fill-rule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                      clip-rule="evenodd"/>
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="grey" className="w-8 h-8 inline">
                <path fill-rule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                      clip-rule="evenodd"/>
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="grey" className="w-8 h-8 inline">
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