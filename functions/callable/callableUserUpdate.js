import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const app = initializeApp();
const auth = getAuth();
const db = getFirestore();

/**
 * Update a user's doc and optionall the user role as well.
 * {data} should only include the data that is changing.
 */

export default async (request) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { data } = request;
      const {
        addresses,
        address_preferred,
        email,
        phone,
        name,
        account,
        role,
      } = data;
      if (role || account) {
        // TODO: make this a new promise then await all promises being resolved
        // in order to also update the userdoc without repeat code.
        await auth
          .updateUser(data.uid, {
            email: data.email,
            ...(data.phone && { phoneNumber: `+1${data.phone}` }),
            displayName: data.name,
            disabled: false,
          })
          .then((userRecord) => {
            // set claims role for user
            const role = data.role === "account_admin";
            auth.setCustomUserClaims(userRecord.uid, {
              role: role ? "account_admin" : "buyer",
              account: data.account,
            });
            db.doc(`accounts/${data.account}/users/${data.uid}`).set(data, {
              merge: true,
            });
            resolve(true);
          })
          .catch((error) => {
            reject(error);
          });
      }
    } catch (error) {
      reject(error);
    }
  });
};
