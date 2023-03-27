import { type AppType } from "next/dist/shared/lib/utils";

import "../styles/globals.css";
import { GlobalContextProvider } from '../context/globalContext';

import React, {useState} from "react";

const MyApp: AppType = ({ Component, pageProps }) => {
    const [loading, setLoading] = useState(false); //spinner

    return (
    <GlobalContextProvider>
      <Component {...pageProps} />
    </GlobalContextProvider>
  );
};


export default MyApp;