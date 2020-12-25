const tf = require('@tensorflow/tfjs-node');
const {getTestTensor} = require('./infer-sharp');
const Jimp = require('jimp');

async function runAndVisualizeInference(model) {

    const {imageTensors, targetTensors, originalImageData} = await getTestTensor(tf);
    const t0 = tf.util.now();
    // Runs inference with the model.
    const modelOut = await model.predict(imageTensors).data();
    // inferenceTimeMs.textContent = `${(tf.util.now() - t0).toFixed(1)}`;

    // Visualize the true and predicted bounding boxes.
    const targetsArray = Array.from(await targetTensors.data());
    const predictedBoundingBox = modelOut;

    console.log('Expected', targetsArray);
    console.log('Predicted', predictedBoundingBox);



    // Tensor memory cleanup.
    tf.dispose([imageTensors, targetTensors]);
}

const drawResult = (imageData, targetBoundingBox, predictedBoundingBox) => {

    new Jimp({ data: imageData.data, width: imageData.width, height:imageData.height }, (err, image) => {
        image.write('2.png');
    });
}

async function init() {
    // const LOCAL_MODEL_PATH = 'file://./object_detection_model/model.json';

    let model = await tf.loadLayersModel('file://dist/object_detection_model/model.json');
    model.summary();
    await runAndVisualizeInference(model);
}

init();
