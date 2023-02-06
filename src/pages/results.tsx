import { type NextPage } from "next";
import Link from "next/link";
import { useRouter } from 'next/router'
import { useSearchParams } from 'next/navigation'
import { GetServerSideProps } from 'next'
import { useState } from 'react';

import { useEffect } from "react";
import { useGlobalContext } from "../context";


const Results: NextPage = () => {
  const { ingredientsList } = useGlobalContext();
  const [recipeText, setRecipeText] = useState("");
  {
    void query({ "inputs": ingredientsList }).then((response) => {
      console.log(JSON.stringify(response));
      setRecipeText(JSON.stringify(response));
    });
    return (
      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-lg text-center">
          <h1 className="text-2xl font-bold sm:text-3xl">{ingredientsList}</h1>
          <h3 className="text-2xl font-bold sm:text-3xl">{recipeText}</h3>
        </div>
      </div>
    );
  }
}
  async function query(data: object) {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/flax-community/t5-recipe-generation",
      {
        headers: { Authorization: "Bearer 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" },
        method: "POST",
        body: JSON.stringify(data),
      }
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await response.json();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-member-access
    return result;
  }

export default Results;
