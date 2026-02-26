
import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";


const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


auth.languageCode = navigator.language || "en";


export const setupRecaptcha = (buttonId) => {
    if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
    }

    window.recaptchaVerifier = new RecaptchaVerifier(auth, buttonId, {
        size: "invisible",
        callback: () => {
            n
        },
        "expired-callback": () => {

            console.log("reCAPTCHA expired");
        },
    });

    return window.recaptchaVerifier;
};

export const sendPhoneOTP = async (phoneNumber) => {
    const appVerifier = window.recaptchaVerifier;
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    window.confirmationResult = confirmationResult;
    return confirmationResult;
};


export const verifyPhoneOTP = async (otp) => {
    if (!window.confirmationResult) {
        throw new Error("No confirmation result found. Please request OTP first.");
    }
    const result = await window.confirmationResult.confirm(otp);
    return result;
};


export const getFirebaseIdToken = async () => {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("No user is signed in");
    }
    return await user.getIdToken();
};


export const signOutFirebase = async () => {
    await auth.signOut();
};

export { auth };
