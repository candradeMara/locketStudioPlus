import { firestore, https } from "firebase-functions/v1";
// import { onCall } from "firebase-functions/v2/https";

// //// Auth //////
// export const authUserOnCreate = functions.auth
//   .user()
//   .onCreate(async (user, context) => {
//     await (await import("./auth/authUserOnCreate.js")).default(user, context);
//   });

// export const authUserOnDelete = functions.auth
//   .user()
//   .onDelete(async (user, context) => {
//     await (await import("./auth/authUserOnDelete.js")).default(user, context);
//   });

// //// Callable v1 //////

// export const c = https.onCall(async (data, context) => {
//   return (await import("./callable/callableEmailMessage.js")).default({
//     data: data,
//     context: context,
//   });
// });

export const callablefetchimages = https.onCall(async (data, context) => {
  return (await import("./callable/callableFetchImages.js")).default({
    data: data,
    context: context,
  });
});
export const callableusercreate = https.onCall(async (data, context) => {
  return (await import("./callable/callableUserCreate.js")).default({
    data: data,
    context: context,
  });
});
export const callableuserupdate = https.onCall(async (data, context) => {
  return (await import("./callable/callableUserUpdate.js")).default({
    data: data,
    context: context,
  });
});
export const callablesendcontact = https.onCall(async (data, context) => {
  return (await import("./callable/callableSendContact.js")).default({
    data: data,
    context: context,
  });
});
export const callableverifyuser = https.onCall(async (data, context) => {
  return (await import("./callable/callableVerifyUser.js")).default({
    data: data,
    context: context,
  });
});
// export const callablezipimages = https.onCall(async (data, context) => {
//   return (await import("./callable/callableZipImages.js")).default({
//     data: data,
//     context: context,
//   });
// });

// //// Callable v2 //////

// export const callableemailmessage = onCall(async (request) => {
//   return (await import("./callable/callableEmailMessage.js")).default(request);
// });

// export const callablefetchimages = onCall(async (request) => {
//   return (await import("./callable/callableFetchImages.js")).default(request);
// });

// export const callableusercreate = onCall(async (request) => {
//   return (await import("./callable/callableUserCreate.js")).default(request);
// });

// export const callableuserdelete = onCall(async (request) => {
//   return (await import("./callable/callableUserDelete.js")).default(request);
// });

////// TODO: fix these 2
// export const callableuserupdate = onCall(async (request) => {
//   return (await import("./callable/callableUserUpdate.js")).default(request);
// });
// export const callablezipimages = onCall(async (request) => {
//   return (await import("./callable/callableZipImages.js")).default(request);
// });
//////// TODO:

// ////// Firestore v1 //////

// /// _new_users ///

export const firestorenewusersonwrite = firestore
  .document("_new_users/{userId}")
  .onWrite(async (change, context) => {
    await (
      await import("./firestore/_new_users/firestoreNewUsersOnWrite.js")
    ).default(change, context);
  });

// /// Accounts //////

// TODO: if address is changed, check users to see if preferred_address needs changed too...

// //// Users //////

// TODO:
export const firestoreusersondelete = firestore
  .document("accounts/{accountId}/users/{userId}")
  .onDelete(async (snap, context) => {
    await (
      await import("./firestore/users/firestoreUsersOnDelete.js")
    ).default(snap, context);
  });

// //// Orders //////

export const firestoreOrdersOnWrite = firestore
  .document("accounts/{accountId}/orders/{orderId}")
  .onWrite(async (change, context) => {
    await (
      await import("./firestore/orders/firestoreOrdersOnWrite.js")
    ).default(change, context);
  });

// /// Products ///

// export const firestoreProductOnWrite = firestore
//   .document("products/{productId}")
//   .onUpdate(async (change, context) => {
//     await (
//       await import("./firestore/products/firestoreProductOnWrite.js")
//     ).default(change, context);
//   });

// ////// http requests //////

// // export const sampleRequest = https.onRequest(
// //   async (request, response) => {
// //     await (
// //       await import("./request/sampleRequest.js")
// //     ).default(request, response);
// //   }
// // );
