import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import {
  sendEmailNewOrder,
  sendEmailShippedOrder,
} from "../../helpers/emails.js";

const app = initializeApp();
const db = getFirestore();

// TODO: change to just storing ordered items under accounts... ordered_items: [{sku: 'sku', recent_order_time: TIMESTAMP}] and shipped_items: [{sku: 'sku', recent_order_time: TIMESTAMP}]
// TODO: if an order gets deleted make sure to reduce total_orders under account and user.
// TODO: also might need image address incase fallback or parent images are needed... GRRR...
/**
 * Send emails about changes if relevant
 * Add/update ordered items to `accounts/${accountId}/ordered/items`
 * Add/update shipped items at `accounts/${accountId}.shipped_items`
 *
 * @param {*} change
 * @returns Promise
 */

export default async (change, context) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { accountId, orderId } = context.params;
      const oldOrder = change.before.data();
      const orderData = change.after.data();
      // const userId = orderData.buyer.uid || oldOrder.buyer.uid;
      let updateData = {};
      let shippedItems = [];
      if (orderData.status.toLowerCase() === "shipped" && oldOrder.status.toLowerCase() !== "shipped") {
        // This order has now been shipped
        for (const item of orderData.items) {
          shippedItems.push(item.sku);
          updateData[item.sku] = {
            ...updateData[item.sku],
            shipped: true,
          };
        }
        await db
          .doc(`accounts/${accountId}`)
          .update(
            { shipped_items: FieldValue.arrayUnion(...shippedItems) },
            { merge: true }
          );
        await db
          .doc(`accounts/${accountId}/ordered/items`)
          .set(updateData, { merge: true });
        if (!orderData.silent && orderData.method === "web") {
          await sendEmailShippedOrder({ ...orderData });
        }
        resolve("done");
      } else if (!oldOrder) {
        // This is a new order
        if (orderData.method === "web") {
          // create a duplicate under _new_orders for internal synchrony.
          await db.doc(`_new_orders/${orderId}`).set(orderData);
        }
        for (const item of orderData.items) {
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
        if (!orderData.silent) {
          // TODO: convert orderData.created_at to prettyDate, also make price "pretty"
          const orderDate = "";
          const id = context.params.orderId;
          await sendEmailNewOrder({
            ...orderData,
            id: id,
            order_date: orderDate,
            order_id: orderId,
          });
        }
        resolve("done");
      } else if (!orderData) {
        // This order has been deleted
      }
    } catch (error) {
      reject(error);
    }
  });
};
