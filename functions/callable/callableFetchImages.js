import ImageKit from "imagekit";

export default async (request) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { data } = request;
      const imagekit = new ImageKit({
        publicKey: process.env.IMAGEKIT_PUBLIC,
        privateKey: process.env.IMAGEKIT_PRIVATE,
        urlEndpoint: process.env.IMAGEKIT_URL,
      });

      const overlayImage = "watermark.png"; // This is the overlay image's name on ImageKit
      const limit = 100;
      let skip = 0;
      let allFiles = [];
      let hasMore = true;
      while (hasMore) {
        try {
          await imagekit
            .listFiles({
              path: data,
              limit: limit,
              skip: skip,
            })
            .then((response) => {
              if (Array.isArray(response) && response.length > 0) {
                const transformedFiles = response.map(file => ({
                  ...file,
                  url: `${file.url}?tr=l-image_${overlayImage},l-end` // Appends the overlay/watermark transformation
                }));
                allFiles = [...allFiles, ...transformedFiles];
                skip += limit;
              } else {
                hasMore = false;
              }
            })
            .catch((error) => {
              hasMore = false;
            });
        } catch (error) {
          hasMore = false;
        }
      }
      resolve(allFiles);
    } catch (error) {
      reject(error);
    }
  });
};
