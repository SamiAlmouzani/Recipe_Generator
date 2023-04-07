// Import the functions you need from the SDKs you need
import firebase, { getApps } from "firebase/app";
import "firebase/auth";
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import {Database, DatabaseReference, getDatabase} from "firebase/database";
import { FirebaseDatabase } from "@firebase/database-types";



// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
   /* apiKey:process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId:process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
    databaseURL: process.env.REACT_APP_DATABASE_URL*/

    apiKey:"AIzaSyDJQ911w4jyDOPfYQzIQXmm9Nm3RTsHLq0",
    authDomain:"superchef-df411.firebaseapp.com",
    projectId:"superchef-df411",
    storageBucket:"superchef-df411.appspot.com",
    messagingSenderId:"920620604946",
    appId:"superchef-df411",
    measurementId:"G-7W09BPCPY6",
    databaseURL:"https://superchef-df411-default-rtdb.firebaseio.com/",
};

//firebase.initializeApp(firebaseConfig);

let app: firebase.FirebaseApp
let db : Database;
let analytics
let auth
// if database does not exist, do stuff
if (getApps().length == 0) {
    app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);
    auth = getAuth(app);
}
// otherwise just return the reference to the database
export {db as db, auth as auth, app as app}

//export default firebase;





