import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const app = initializeApp();
const auth = getAuth();
const db = getFirestore();

export const createNewAccount = (accountData) => {
  return new Promise(async (resolve, reject) => {
    const { account, business, addresses } = accountData;
    const accountDoc = db.doc(`accounts/${account}`);
    await accountDoc
      .set(
        {
          ...(business && { business: business }),
          ...(addresses && { addresses: addresses }),
          updated_at: FieldValue.serverTimestamp(),
        },
        { merge: true }
      )
      .then(async (accountSnap) => {
        resolve(accountSnap);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const createAuthUser = (userData) => {
  return new Promise(async (resolve, reject) => {
    const { email, name, account, role, verified } = userData;
    const isMarathon = account === "marathon";
    const tmpPass = isMarathon
      ? "marathon1897"
      : Math.random().toString(36).substring(2, 8);
    await auth
      .createUser({
        displayName: name,
        email: email,
        disabled: false,
        password: tmpPass,
      })
      .then(async (userRecord) => {
        // add role and account to custom claims
        if (verified !== true) {
          await auth.setCustomUserClaims(userRecord.uid, {
            role: role,
            account: account,
          });
        }
        resolve(userRecord.uid);
      })
      .catch((error) => {
        console.error("user error", error);
        reject(error);
      });
  });
};

export const createFirestoreUser = (userData) => {
  return new Promise(async (resolve, reject) => {
    const { email, name, account, role, uid, new_user } = userData;
    const accountCollection = new_user
      ? "_new_users"
      : `accounts/${account}/users`;
    // create a user doc under the account with the same uid as auth
    const userDoc = db.doc(`${accountCollection}/${uid}`);
    await userDoc
      .set({
        name: name,
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
        email: email,
        ...(role && { role: role }),
        account: account,
        uid: uid,
      })
      .then(async (userSnap) => {
        resolve(userSnap);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

/**
 * Create an email verification link to mail out.
 * @param {*} email
 * @returns emailVerificationLink
 */
export const createNewEmailVerificationLink = async (email) => {
  return new Promise(async (resolve, reject) => {
    const actionCodeSettings = {
      url: process.env.URL_AFTER_PASSWORD_RESET,
      handleCodeInApp: false,
    };
    await auth
      .generateEmailVerificationLink(email, actionCodeSettings)
      .then(async (link) => {
        resolve(link);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

/**
 * Create a password reset link to mail out.
 * @param {*} email
 * @returns passwordResetLink
 */
export const createNewPasswordLink = async (email) => {
  return new Promise(async (resolve, reject) => {
    const actionCodeSettings = {
      url: process.env.URL_AFTER_PASSWORD_RESET,
      handleCodeInApp: false,
    };
    await auth
      .generatePasswordResetLink(email, actionCodeSettings)
      .then(async (link) => {
        resolve(link);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const setUserClaims = async (uid, role, account) => {
  return new Promise(async (resolve, reject) => {
    await auth
      .setCustomUserClaims(uid, {
        ...(role && { role: role }),
        ...(account && { account: account }),
      })
      .then(() => {
        resolve();
      })
      .catch((error) => reject(error));
  });
};

/**
 * delete auth user and store a record of deleted users.
 *
 * @param {*} uid
 * @return Promise
 */
export const deleteUserAuth = async (data) => {
  return new Promise(async (resolve, reject) => {
    const { uid } = data;
    await auth
      .deleteUser(uid)
      .then(async (userRecord) => {
        await db
          .doc("_users_deleted/users")
          .set({ [uid]: { ...data } }, { merge: true });
        resolve(true);
      })
      .catch((error) => {
        reject(error);
      });
  });
};
