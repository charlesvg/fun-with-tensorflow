const path = require('path');
const fs = require('fs');
const Jimp = require('jimp');

const dataDirectory = path.resolve(__dirname, './data/vott/target/vott-json-export/');

const CANVAS_SIZE = 224;  // Matches the input size of MobileNet.

const getTensorForImage = async (tf, imageData, regionBoundingBox) => {
    return tf.tidy(() => {
        const imageTensor = tf.browser.fromPixels(imageData);
        const targetTensor = tf.tensor1d(Object.values(regionBoundingBox));
        return {image: imageTensor, target: targetTensor};
    });
}

const getImageData = async (filename) => {
    const img = await Jimp.read(path.resolve(dataDirectory, filename));
    img.resize(CANVAS_SIZE, CANVAS_SIZE);

    return {data: img.bitmap.data, width: CANVAS_SIZE, height: CANVAS_SIZE};
}

const getTestTensor = async (tf) => {
    const imageMetadata = JSON.parse(fs.readFileSync(path.resolve(dataDirectory, './Balls-export.json'), 'utf8'));
    const imageTensors = [];
    const targetTensors = [];

    const assetKeys = Object.keys(imageMetadata.assets);
    const k = Math.floor(Math.random() * assetKeys.length);

    const entry = imageMetadata.assets[assetKeys[k]];
    const filename = entry.asset.name;
    const size = entry.asset.size;
    const region = entry.regions[0].boundingBox;

    const imageData = await getImageData(filename);

    const {image, target} = await getTensorForImage(tf, imageData, region);
    imageTensors.push(image);
    targetTensors.push(target);

    const images = tf.stack(imageTensors);
    const targets = tf.stack(targetTensors);
    tf.dispose([imageTensors, targetTensors]);
    return {imageTensors: images, targetTensors: targets, originalImageData: imageData};
}


exports.getTestTensor = getTestTensor;

