import React, { useState } from 'react';

interface IGlobalContextProps {
  ingredientsList: string;
  setIngredientsList: (i: string) => void;

}

export const GlobalContext = React.createContext<IGlobalContextProps>({
  ingredientsList: "strawberry",
  setIngredientsList: (i) => {console.log(i)},
});

export const GlobalContextProvider = (props: { children: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined; }) => {
  const [currentIngredientsList, setCurrentIngredientsList] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  return (
    <GlobalContext.Provider
      value={{
        ingredientsList: currentIngredientsList,
        setIngredientsList: setCurrentIngredientsList,
      }}
    >
      {props.children}
    </GlobalContext.Provider>
  );
};