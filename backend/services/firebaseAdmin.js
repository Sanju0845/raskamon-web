
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();


const initializeFirebaseAdmin = () => {
    if (admin.apps.length === 0) {

        if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {

            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        } else if (
            process.env.FIREBASE_PROJECT_ID &&
            process.env.FIREBASE_PRIVATE_KEY &&
            process.env.FIREBASE_CLIENT_EMAIL
        ) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                }),
            });
        } else {
            console.warn(
                "Firebase Admin SDK not initialized: Missing credentials. Phone login will not work."
            );
            return null;
        }
    }
    return admin;
};

const firebaseAdmin = initializeFirebaseAdmin();


export const verifyFirebaseToken = async (idToken) => {
    if (!firebaseAdmin) {
        throw new Error("Firebase Admin not initialized");
    }
    return await admin.auth().verifyIdToken(idToken);
};

export default firebaseAdmin;
