import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { sendContactEmail } from "../helpers/emails.js";

const app = initializeApp();
const db = getFirestore();

/**
 * Attempt to create a new auth user.
 * Also create a matching firestore doc under the correct account
 * Also send the "welcome" email with a password reset link
 */
export default async (request) => {
  return new Promise(async (resolve, reject) => {
    try {
      let promises = [];
      const { data } = request;
      promises.push(await sendContactEmail({ ...data }));
      promises.push(await db.collection("contact_messages").add({ ...data }));
      resolve(Promise.all(promises));
    } catch (error) {
      reject(error);
      throw new Error(error);
    }
  });
};
