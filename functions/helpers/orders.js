import { FieldValue, getFirestore } from "firebase-admin/firestore";

const db = getFirestore();

/**
 * 1. Add order items to `accounts/${accountId}/ordered`
 * 2. Create a duplicate order at `_new_orders/${orderId}
 * 3. Increase total_orders for user and account
 *
 * @param {*} orderData
 * @return Promise
 */
// TODO: is materials coming in as a string?
export const createNewOrder = async (orderData, context) => {
  return new Promise(async (resolve, reject) => {
    const { buyer, items } = orderData;
    const { accountId, orderId } = context.params;
    const updateData = {};
    for (const item of items) {
      updateData[item.sku] = {
        quantity: FieldValue.increment(item.quantity),
        recent_order_time: FieldValue.serverTimestamp(),
        name: item.name,
        path: item.path,
        sku: item.sku,
        collection: item.collection,
        category: item.category,
        materials: item.materials,
        price: item.price,
      };
    }
    await db
      .doc(`accounts/${accountId}/ordered/items`)
      .set(updateData, { merge: true });
    await db.doc(`_new_orders/${orderId}`).set(orderData);
    await db
      .doc(`accounts/${accountId}`)
      .set({ total_orders: FieldValue.increment(1) }, { merge: true });
    await db
      .doc(`accounts/${accountId}/users/${buyer.uid}`)
      .set({ total_orders: FieldValue.increment(1) }, { merge: true });
    resolve("done");
  });
};
