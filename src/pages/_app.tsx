import { type AppType } from "next/dist/shared/lib/utils";

import "../styles/globals.css";
import { GlobalContextProvider } from '../context/globalContext';

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <GlobalContextProvider>
      <Component {...pageProps} />
    </GlobalContextProvider>
  );
};

export default MyApp;