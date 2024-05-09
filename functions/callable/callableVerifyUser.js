import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const app = initializeApp();
const auth = getAuth();
const db = getFirestore();

export default async (request) => {
  console.log("callableverifyuser functions started");
  return new Promise(async (resolve, reject) => {
    try {
      const { context } = request;
      const uid = context.auth.uid;
      const docRef = db.doc(`_new_registrations/${uid}`);
      const doc = await docRef.get();
      if (doc.exists) {
        const data = doc.data();
        await auth.setCustomUserClaims(uid, { role: "verified" });
        await db
          .doc(`_new_verifications/${uid}`)
          .create({ ...data, status: "verified", role: "verified" })
          .then(() => {
            docRef.delete();
          })
          .catch((error) => {
            console.error(error);
            reject(error);
          });
      } else {
        reject("No document found");
      }
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
};
