import { useAppStore } from "stores/app";
import { useUserStore } from "stores/user";
import { auth } from "boot/firebase";
import { signOut } from "firebase/auth";

export const logout = async (route) => {
  const userStore = useUserStore();
  const appStore = useAppStore();
  return await new Promise(async (resolve, reject) => {
    signOut(auth)
      .then(() => {
        if (userStore.userDocListenerUnsubscribe) {
          userStore.userDocListenerUnsubscribe();
        }
        appStore.$reset;
        // appStore.hydrateApp();
        userStore.$reset;
        userStore.userData = null;

        resolve("logged out");
      })
      .catch((error) => {
        console.error(error);
        reject(error);
      });
  });
};
