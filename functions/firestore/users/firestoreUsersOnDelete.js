import { deleteUserAuth } from "../../helpers/users.js";

export default async (snapshot, context) => {
  return new Promise(async (resolve, reject) => {
    try {
      // pass firestore doc to helper... it must have account and uid
      const { account, uid } = snapshot.data();
      await deleteUserAuth({ account: account, uid: uid });
      resolve("done");
    } catch (error) {
      reject(error);
    }
  });
};
