import { initializeApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import ImageKit from "imagekit";
import JSZip from "jszip";
import * as stream from "stream";
import { promisify } from "util";
import * as path from "path";
import * as os from "os";
import * as https from "https";
import * as http from "http";
import * as fs from "fs";

const app = initializeApp();

const bucket = getStorage(app).bucket("default-bucket");
const pipeline = promisify(stream.pipeline);

const request = (url) =>
  new Promise((resolve, reject) => {
    const protocol = url.startsWith("https://") ? https : http;
    const req = protocol.get(url, resolve);
    req.on("error", reject);
    req.end();
  });

export default async (requestData) => {
  return new Promise(async (resolve, reject) => {
    const { data } = requestData;
    try {
      const imagekit = new ImageKit({
        publicKey: process.env.IMAGEKIT_PUBLIC,
        privateKey: process.env.IMAGEKIT_PRIVATE,
        urlEndpoint: process.env.IMAGEKIT_URL,
      });
      if (!Array.isArray(data) || data.length === 0) {
        reject("data must be an array");
      }

      let images = await Promise.all(
        data.map(async (sku) => {
          // fetch folder
          return await imagekit
            .listFiles({
              path: `products/${sku}`,
            })
            .then((response) => {
              return [...response];
            });
        })
      );
      images = images.flatMap((file) => file);
      const zip = new JSZip();
      await Promise.all(
        images.map(async (image) => {
          const { url, name } = image;
          const imageFile = await request(url);
          zip.file(`${name}`, imageFile);
        })
      );
      const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
      const tempFilePath = path.join(os.tmpdir(), `${Date.now()}.zip`);
      await fs.promises.writeFile(tempFilePath, zipBuffer);

      const zipFileName = `images_${Date.now()}.zip`;
      const file = bucket.file(zipFileName);
      await pipeline(
        fs.createReadStream(tempFilePath),
        file.createWriteStream()
      );
      file
        .makePublic()
        .then(([data]) => {
          // {kind, object, id, selfLink, bucket, entity, role, etag, generation} = data
          resolve(data);
        })
        .catch((error) => reject(error));
    } catch (error) {
      reject(error);
    }
  });
};
