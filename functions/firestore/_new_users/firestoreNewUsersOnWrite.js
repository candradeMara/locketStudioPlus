import {
  createFirestoreUser,
  createAuthUser,
  createNewAccount,
  createNewPasswordLink,
  deleteUserAuth,
  setUserClaims,
} from "../../helpers/users.js";
import { sendEmailWelcome, sendEmailVerified } from "../../helpers/emails.js";

export default async (change, context) => {
  return new Promise(async (resolve, reject) => {
    try {
      // const oldUserData = change.before?.data();
      const newUserData = change.after?.data();
      if (!newUserData || newUserData.error) {
        // this doc was deleted or there is an error
        resolve("done");
      } else {
        let uid = newUserData.uid;
        let role = newUserData.role;

        const { email, phone, name, account, business, addresses, silent } =
          newUserData;

        if (newUserData.delete == true && uid) {
          // delete the auth user
          await deleteUserAuth(uid);
          // delete this doc
          await change.after.ref.delete();
          resolve("deleted");
        }

        if (!uid) {
          // auth user has not been created.
          // also create/update the account doc
          // createNewAccount({ account, business, addresses });
          // create the auth user
          uid = await createAuthUser({
            email,
            phone,
            name,
            account,
            role,
          });
          if (!silent) {
            // send out password reset email
            const resetLink = await createNewPasswordLink(email);
            console.log("sending WELCOME email");
            await sendEmailWelcome({ email, name, account, role, resetLink });
          }
        }

        if (newUserData.verified == true) {
          createNewAccount({ account, business, addresses });
          console.log("updating VERIFIED", newUserData);
          // upgrade the user claims and create/update the doc under /accounts/account/users/user
          await setUserClaims(uid, role, account)
            .then(async () => {
              console.log("userClaims Set");
              await createFirestoreUser({
                email,
                phone,
                name,
                account,
                role,
                business,
                uid,
              })
                .then(async () => {
                  if (!silent) {
                    // send out welcome email
                    const resetLink = await createNewPasswordLink(email);
                    console.log("sending VERIFIED email");
                    await sendEmailVerified({
                      email,
                      name,
                      account,
                      role,
                      resetLink,
                    });
                    // delete this doc
                  }
                  await change.after.ref.delete();
                })
                .catch(async (error) => {
                  console.error(error);
                  change.after.ref.set({ error: error });
                  reject(error);
                });
            })
            .catch(async (error) => {
              console.error(error);
              change.after.ref.set({ error: error });
              reject(error);
            });
        }
        resolve("completed");
      }
    } catch (error) {
      console.error(error);
      change.after.ref.set({ error: error });
      reject(error);
    }
  });
};
