/**
 * Handles router guards and basic app, account, and user hydration.
 */
import { boot } from "quasar/wrappers";
import { useAppStore } from "stores/app";
import { useUserStore } from "stores/user";
import { useAccountStore } from "stores/account";
import { auth, db } from "boot/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "@firebase/functions";

export default boot(async ({ redirect, router, store }) => {
  const appStore = useAppStore(store);
  const setupAppDocListener = async () => {
    if (appStore.appData && appStore.appDocListenerUnsubscribe) {
      return appStore.appData;
    } else {
      return await new Promise((resolve, reject) => {
        if (typeof appStore.appDocListenerUnsubscribe === "function") {
          appStore.appDocListenerUnsubscribe();
        }
        const appDocRef = doc(db, `app/default`);
        appStore.appDocListenerUnsubscribe = onSnapshot(
          appDocRef,
          { includeMetadataChanges: true },
          (doc) => {
            const docData = { ...doc.data() };
            appStore.appData = docData;
            resolve(docData);
          }
        );
      });
    }
  };

  const accountStore = useAccountStore(store);
  const setupAccountDocListener = async (account) => {
    console.log("trying to listen to account");
    try {
      if (
        accountStore.accountData &&
        accountStore.accountDocListenerUnsubscribe
      ) {
        return accountStore.accountData;
      } else {
        return await new Promise((resolve, reject) => {
          if (
            typeof accountStore.accountDocListenerUnsubscribe === "function"
          ) {
            accountStore.accountDocListenerUnsubscribe();
          }
          const accountDocRef = doc(db, `accounts/${account}`);
          accountStore.accountDocListenerUnsubscribe = onSnapshot(
            accountDocRef,
            { includeMetadataChanges: true },
            (doc) => {
              console.log("got account doc");
              accountStore.accountData = doc.data();
              resolve(doc.data());
            }
          );
        });
      }
    } catch {
      console.error("error setting up accountDocListener");
    }
  };

  const userStore = useUserStore(store);
  const setupUserDocListener = async (uid, account) => {
    console.log("trying to listen to user doc");
    try {
      if (typeof userStore.userDocListenerUnsubscribe === "function") {
        userStore.userDocListenerUnsubscribe();
      }
      const userDocRef = doc(db, `accounts/${account}/users/${uid}`);
      userStore.userDocListenerUnsubscribe = onSnapshot(
        userDocRef,
        { includeMetadataChanges: true },
        (doc) => {
          console.log("got user doc");
          userStore.userData = doc.data();
          // change status to 'verified' if it isn't.
          if (doc.data().status !== "verified") {
            updateDoc(userDocRef, { status: "verified" });
          }
        }
      );
    } catch {
      console.error("error setting up userDocListener");
    }
  };

  /**
   * sets up account, user, and auth listeners
   * hydrates account and user stores
   * @returns authUser
   */
  const fetchCurrentUser = async () => {
    if (
      userStore.authUser &&
      userStore.userDocListenerUnsubscribe &&
      accountStore.accountDocListenerUnsubscribe
    ) {
      return userStore.authUser;
    } else {
      return await new Promise((resolve, reject) => {
        // check to see if we have a listener already...
        if (typeof userStore.authListenerUnsubscribe === "function") {
          userStore.authListenerUnsubscribe();
        }
        userStore.authListenerUnsubscribe = onAuthStateChanged(
          auth,
          async (user) => {
            if (user) {
              // User is signed in
              const token = await user.getIdTokenResult();
              const claims = token.claims;
              console.log("claims", claims);
              // TODO: need to allow user access to their profile and show a dialog about waiting for Marathon
              if (claims.role && claims.account && user.uid) {
                userStore.authUser = user;
                await setupUserDocListener(user.uid, claims.account);
                await setupAccountDocListener(claims.account);
                resolve(user);
              }
            } else {
              // User is signed out
              if (accountStore.accountDocListenerUnsubscribe) {
                accountStore.accountDocListenerUnsubscribe();
                accountStore.accountDocListenerUnsubscribe = null;
              }
              accountStore.accountData = null;
              if (userStore.userDocListenerUnsubscribe) {
                userStore.userDocListenerUnsubscribe();
                userStore.userDocListenerUnsubscribe = null;
              }
              userStore.userData = null;
              userStore.authUser = null;
              const currentRoute = router.currentRoute;
              const { meta } = currentRoute.value;
              if (meta.requiresAuth || meta.requiresAdmin) {
                redirect("/");
              }
              resolve(null);
            }
          }
        );
      });
    }
  };

  router.beforeEach(async (to, from, next) => {
    await setupAppDocListener();
    const currentUser = await fetchCurrentUser();
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
    const requiresAdmin = to.matched.some(
      (record) => record.meta.requiresAdmin
    );

    if ((requiresAuth || requiresAdmin) && !currentUser) {
      next("/");
      return;
    }
    if (requiresAdmin) {
      const token = await currentUser.getIdTokenResult();
      const claims = token.claims;
      if (
        (claims.role !== "marathon_admin")
      ) {
        next("/");
        return;
      }
    }
    next();
  });
});
