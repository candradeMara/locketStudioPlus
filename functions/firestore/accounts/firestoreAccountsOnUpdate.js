export default async (snapshot, context) => {
  return new Promise((resolve, reject) => {
    try {
      resolve("TODO");
      // If addresses has changed, check all user accounts for address_preferred and update
    } catch (error) {
      reject(error);
    }
  });
};
