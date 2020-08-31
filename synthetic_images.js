const fs = require('fs');
const path = require('path');

let tf;  // tensorflowjs module passed in for browser/node compatibility.


class ObjectDetectionImageSynthesizer {

    constructor(canvas, tensorFlow) {
        this.canvas = canvas;
        tf = tensorFlow;
    }

    async getTrainImage(cnt) {

        let img = await this.canvas.loadImage(`./data/train/test-${cnt}.png`);

        return tf.tidy(() => {
            const imageTensor = tf.browser.fromPixels(img);
            const isRectangle = true;
            const shapeClassIndicator = isRectangle ? 1 : 0;
            const targetTensor = tf.tensor1d([shapeClassIndicator].concat(boundingBox));
            return {image: imageTensor, target: targetTensor};
        });
    }

    async getTensorForImage(imageData, regionBoundingBox) {
        return tf.tidy(() => {
            const imageTensor = tf.browser.fromPixels({height: imageData.height, width: imageData.width, data: new Uint8Array(imageData.data.buffer)});
            const targetTensor = tf.tensor1d(Object.values(regionBoundingBox));
            return {image: imageTensor, target: targetTensor};
        });
    }

    async bla() {
        const baseDir = path.resolve(__dirname, './data/vott/target/vott-json-export/');
        const imageMetadata = JSON.parse(fs.readFileSync(path.resolve(baseDir, './Balls-export.json'), 'utf8'));
        const imageTensors = [];
        const targetTensors = [];

        const assetKeys = Object.keys(imageMetadata.assets);
        for (let k = 0; k < assetKeys.length; k++) {
            const entry = imageMetadata.assets[assetKeys[k]];
            const filename = entry.asset.name;
            const size = entry.asset.size;
            const region = entry.regions[0].boundingBox;
            console.log(filename, size, region);

            const cImage = await this.canvas.loadImage(path.resolve(baseDir, filename));
            const c = this.canvas.createCanvas(size.width, size.height);
            const ctx = c.getContext('2d');
            ctx.drawImage(cImage, 0, 0, size.width, size.height);
            const imageData = ctx.getImageData(0, 0, size.width, size.height);
            const {image, target} = await this.getTensorForImage(imageData, region);
            imageTensors.push(image);
            targetTensors.push(target);
        }

        const images = tf.stack(imageTensors);
        const targets = tf.stack(targetTensors);
        tf.dispose([imageTensors, targetTensors]);
        return {images, targets};
    }


    async generateExampleBatch() {

        const imageTensors = [];
        const targetTensors = [];
        for (let i = 0; i < 20; ++i) {
            const {image, target} = await this.getTrainImage(i);
            imageTensors.push(image);
            targetTensors.push(target);
        }
        const images = tf.stack(imageTensors);
        const targets = tf.stack(targetTensors);
        tf.dispose([imageTensors, targetTensors]);
        return {images, targets};
    }
}

module.exports = {ObjectDetectionImageSynthesizer};


(function () {
    const tf = require('@tensorflow/tfjs-node');
    const canvas = require('canvas');
    new ObjectDetectionImageSynthesizer(canvas, tf).bla();
})();