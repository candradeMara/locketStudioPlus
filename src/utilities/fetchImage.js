export const fetchImage = async (sku, size, alternate) => {
  return await new Promise(async (resolve, reject) => {
    const overlayImage = "watermark@@watermark.png"; // Specify the overlay image name
    const overlayWidth = 200; // Width of the overlay
    const overlayHeight = 200; // Height of the overlay
    const overlayX = 100; // X position of the overlay
    const overlayY = 100; // Y position of the overlay

    // Build the transformation string
    const baseTransformation = size ? `n-${size},` : "";
    const overlayTransformation = `l-image,i-${overlayImage},w-${overlayWidth},h-${overlayHeight},x-${overlayX},y-${overlayY},l-end`;
    const namedTransformation = "n-thumb"; // This applies a named transformation at the end

    // Construct the full image URL
    const transformation = `?tr=${baseTransformation}${overlayTransformation},${namedTransformation}`;
    const imageURL = `${process.env.IMAGEKIT_URL}/products/${sku}/${sku}.png${transformation}`;

    //console.log(imageURL);

    //const transformation = size ? `?tr=n-${size}` : ``;
    //const imageURL = `${process.env.IMAGEKIT_URL}/products/${sku}/${sku}.png${transformation}`;
    await fetch(imageURL)
      .then(async (response) => {
        if (response.status === 200 && response.url) {
          resolve(response.url);
        }
      })
      .catch(async (error) => {
        // check for alternate...
        // then check if sku ends with `n` and try without `n`
        if (alternate) {
          resolve(await fetchImage(alternate, size));
        } else if (sku.endsWith("n")) {
          resolve(await fetchImage(sku.slice(0, -1), size));
        } else {
          resolve("https://ik.imagekit.io/marathonco/placeholder.jpg");
          // reject("no image");
        }
      });
    // reject("no image");
    resolve("https://ik.imagekit.io/marathonco/placeholder.jpg");
  });
};
