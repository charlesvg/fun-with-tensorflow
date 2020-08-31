const path = require('path');
const fs = require('fs');
// const tf = require('@tensorflow/tfjs-node');

const sharp = require('sharp');
const dataDirectory = path.resolve(__dirname, './data/vott/target/vott-json-export/');

const CANVAS_SIZE = 224;  // Matches the input size of MobileNet.

const getTensorForImage = async (tf, imageData, regionBoundingBox)  => {
    return tf.tidy(() => {
        const imageTensor = tf.browser.fromPixels(imageData);
        const targetTensor = tf.tensor1d(Object.values(regionBoundingBox));
        return {image: imageTensor, target: targetTensor};
    });
}

const getInputTensors = async (tf) => {
    const imageMetadata = JSON.parse(fs.readFileSync(path.resolve(dataDirectory, './Balls-export.json'), 'utf8'));
    const imageTensors = [];
    const targetTensors = [];

    const assetKeys = Object.keys(imageMetadata.assets);
    for (let k = 0; k < assetKeys.length; k++) {
        const entry = imageMetadata.assets[assetKeys[k]];
        const filename = entry.asset.name;
        const size = entry.asset.size;
        const region = entry.regions[0].boundingBox;

        const { data, info } = await sharp(path.resolve(dataDirectory, filename))
            .resize(CANVAS_SIZE, CANVAS_SIZE, {
                fit: 'fill',
            })
            .raw()
            .toBuffer({ resolveWithObject: true });

        const imageData = {data: data, width: info.width, height: info.height};

        const {image, target} = await getTensorForImage(tf, imageData, region);
        imageTensors.push(image);
        targetTensors.push(target);
    }

    const images = tf.stack(imageTensors);
    const targets = tf.stack(targetTensors);
    tf.dispose([imageTensors, targetTensors]);
    return {images, targets};
}





exports.getInputTensors = getInputTensors;