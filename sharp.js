const path = require('path');
const fs = require('fs');
const Jimp = require('jimp');

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

const getImageData =  async (filename) => {
    const { data, info } = await sharp(path.resolve(dataDirectory, filename))
        .resize(CANVAS_SIZE, CANVAS_SIZE, {
            fit: 'fill',
        })
        .raw()
        .toBuffer({ resolveWithObject: true });

    return {data: data, width: info.width, height: info.height};
}

const getImageDataJ =  async (filename) => {
    const img = await Jimp.read(path.resolve(dataDirectory, filename));
    img.resize(CANVAS_SIZE, CANVAS_SIZE);

    return {data: img.bitmap.data, width: CANVAS_SIZE, height: CANVAS_SIZE};
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

        const imageData = await getImageData(filename);

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

// Run if called directly (as opposed as to being require'd)
if (require.main === module) {
    (async () => {
        // const tf = require('@tensorflow/tfjs-node');
        let data = await getImageDataJ('test-0.jpeg');
        new Jimp({ data: data.data, width: CANVAS_SIZE, height: CANVAS_SIZE }, (err, image) => {
            image.write('1.png');
        });

        data = await getImageData('test-0.jpeg');
        new Jimp({ data: data.data, width: CANVAS_SIZE, height: CANVAS_SIZE }, (err, image) => {
            image.write('2.png');
        });

        console.log('done');
    })();
}


