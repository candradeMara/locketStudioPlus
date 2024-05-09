import {
  createFirestoreUser,
  createAuthUser,
  createNewPasswordLink,
  // createNewEmailVerificationLink,
} from "../helpers/users.js";
import { sendEmailVerified, sendEmailWelcome } from "../helpers/emails.js";

/**
 * Attempt to create a new auth user.
 * Also create a matching firestore doc under the correct account
 * Also send the "welcome" email with a password reset link
 */

export default async (request) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { data } = request;
      const { email, name, account, business, role, silent, verified } = data;
      await createAuthUser({
        email,
        name,
        account,
        role,
      })
        .then(async (uid) => {
          await createFirestoreUser({
            uid,
            email,
            name,
            account,
            ...(role && { role: role }),
            business,
            ...(verified && { verified: true }),
            ...(!verified && { new_user: true }),
          }).then(async () => {
            if (!silent) {
              const resetLink = await createNewPasswordLink(email);
              if (verified) {
                await sendEmailVerified({
                  email,
                  name,
                  account,
                  role,
                  resetLink,
                });
              } else {
                await sendEmailWelcome({
                  email,
                  name,
                  account,
                  role,
                  resetLink,
                });
              }
            }
            resolve();
          });
        })
        .catch(async (error) => {
          // write error to doc
          const errorObject = {
            error: true,
            ...(error.code && { code: error.code }),
            ...(error.message && { message: error.message }),
            ...(error.name && { message: error.name }),
          };
          reject(error);
          throw new Error(error);
        });
    } catch (error) {
      reject(error);
      throw new Error(error);
    }
  });
};
