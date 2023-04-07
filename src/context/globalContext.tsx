import React, { useState } from 'react';
import firebase from "firebase/compat";

interface IGlobalContextProps {
  ingredientsList: string;
  setIngredientsList: (i: string) => void;
  currentUser: customUser;
  setCurrentUser: (u:customUser)=>void;

}

export const GlobalContext = React.createContext<IGlobalContextProps>({
    ingredientsList: "strawberry",
    setIngredientsList: (i) => {
        console.log(i)
    },
    currentUser: {uid: '', displayName: '', photoURL:'', savedRecipes: [], uploadedRecipes: []},
    setCurrentUser: (u: customUser) => {
        console.log(u)
    }
} as IGlobalContextProps);

export const GlobalContextProvider = (props: { children: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined; }) => {
  const [currentIngredientsList, setCurrentIngredientsList] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser]=useState({uid:"",displayName:"",photoURL:"", savedRecipes:[""],uploadedRecipes:[""]})

    return (
    <GlobalContext.Provider
      value={{
        ingredientsList: currentIngredientsList,
        setIngredientsList: setCurrentIngredientsList,
          currentUser:currentUser,
          setCurrentUser:setCurrentUser
      }}>
      {props.children}
    </GlobalContext.Provider>
  );
};