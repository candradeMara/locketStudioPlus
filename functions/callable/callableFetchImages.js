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
              console.log("Hunter Test");
              if (Array.isArray(response) && response.length > 0) {
                const transformedFiles = response.map(file => ({
                  ...file,
                  // Update the URL to include the watermark with additional transformations
                  url: `${file.url}?tr=l-image,i-watermark@@watermark.png,w-iw,h-ih,c-at_max,ar-iar,x-10,y-10,l-end`
                }));
                allFiles = [...allFiles, ...response];
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
