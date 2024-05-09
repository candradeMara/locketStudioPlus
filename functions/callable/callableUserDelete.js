import {deleteUserAuth} from "../helpers/users.js";

/**
 * Delete user in auth and set firestore doc under  account/{accountID}/users/${userId} to inactive
 */

export default async (request) => {
  return new Promise(async (resolve, reject) => {
    try {
      const {data} = request;
      // TODO: need to make sure account has permissions to do this.
      await deleteUserAuth(data);
      resolve("deleted");
    } catch (error) {
      reject(error);
    }
  });
};
