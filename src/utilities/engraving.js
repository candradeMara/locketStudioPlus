import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  uploadString,
} from "firebase/storage";

const savePreview = async (dataURL, folder, fileName) => {
  const storage = getStorage();
  return new Promise((resolve, reject) => {
    try {
      const previewRef = ref(storage, `${folder}/${fileName}.png`);
      uploadString(previewRef, dataURL, "data_url").then(async (snapshot) => {
        await getDownloadURL(snapshot.ref).then((downloadURL) => {
          console.log("preview Saved", downloadURL);
          resolve(downloadURL);
        });
      });
    } catch (error) {
      reject(error);
    }
  });
};

const saveSVG = async (svgBlob, folder, fileName) => {
  return new Promise((resolve, reject) => {
    const storage = getStorage();
    try {
      const svgRef = ref(storage, `${folder}/${fileName}.svg`);
      uploadBytes(svgRef, svgBlob).then(async (snapshot) => {
        await getDownloadURL(snapshot.ref).then((downloadURL) => {
          console.log("svg saved", downloadURL);
          resolve(downloadURL);
        });
      });
    } catch (error) {
      reject(error);
    }
  });
};

export const saveEngraving = async (engraveData, account) => {
  return await new Promise(async (resolve, reject) => {
    // engraveData should have svgBlob, and previewDataURL.
    // save them now...
    const dt = new Date();
    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, "0"); // add 1 to get 1-based month, pad with 0
    const date = String(dt.getDate()).padStart(2, "0"); // pad with 0
    const hours = String(dt.getHours()).padStart(2, "0"); // pad with 0
    const minutes = String(dt.getMinutes()).padStart(2, "0"); // pad with 0
    const formattedDate = `${year}-${month}-${date}-${hours}${minutes}`;
    const folderName = `${formattedDate}-${account}-${engraveData.sku}`;
    const engraveFolder = `engravings/${folderName}`;

    const previewURL = await savePreview(
      engraveData.preview,
      engraveFolder,
      "preview"
    );
    const svgURL = await saveSVG(engraveData.svg, engraveFolder, "engraving");
    resolve({
      text: engraveData.text,
      previewURL: previewURL,
      svgURL: svgURL,
    });
  });
};
