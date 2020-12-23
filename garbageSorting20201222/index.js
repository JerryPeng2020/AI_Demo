/**
 * Copyright 2020 Pinecone.AI(松果机器人). All Rights Reserved.
 *
 * Project: Tensorflow Garbage Sorting (JS version)
 * Author:  Jerry Peng
 * Date:    Dec. 10th, 2020
 *
 * =============================================================================
 */

// A webcam iterator that generates Tensors from the images from the webcam.
let webcam;
// The number of classes we want to predict. In this example, we will be
// predicting 4 classes for up, down, left, and right.
const NUM_CLASSES = 5;
// The dataset object where we will store activations.
const controllerDataset = new ControllerDataset(NUM_CLASSES);
// UI
const ui = new UI();
//
let truncatedMobileNet;
let model;

// Loads mobilenet and returns a model that returns the internal activation
// we'll use as input to our classifier model.
async function loadTruncatedMobileNet() {
  const mobilenet = await tf.loadLayersModel(
    'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json'
    //'localstorage://my-model'  // 从浏览器本地存储加载之前已经预存储的模型
    );
    
  // Return a model that outputs an internal activation.
  const layer = mobilenet.getLayer('conv_pw_13_relu');
  return tf.model({inputs: mobilenet.inputs, outputs: layer.output});
}


async function loadLocalModel() {
  const uploadJSONInput = document.getElementById('upload-json');
  const uploadWeightsInput = document.getElementById('upload-weights');

  console.log(uploadJSONInput.value);
  if(uploadJSONInput.value.includes(".json") && uploadWeightsInput.value.includes(".bin")) {
    model = await tf.loadLayersModel(tf.io.browserFiles(
      [uploadJSONInput.files[0], uploadWeightsInput.files[0]]));
    isPredicting = true;
    alert ("模型加载成功!");
  }
  else {
    alert ("请正确添加【模型文件】和【权重文件】!");
  }
}

async function saveModel() {
  model.save('downloads://垃圾分类');
  //alert ("模型加载成功!");
}

/**
 * Sets up and trains the classifier.
 */
async function train() {
  if (controllerDataset.xs == null) {
    throw new Error('Add some examples before training!');
  }

  // Creates a 2-layer fully connected model. By creating a separate model,
  // rather than adding layers to the mobilenet model, we "freeze" the weights
  // of the mobilenet model, and only train weights from the new model.
  model = tf.sequential({
    layers: [
      // Flattens the input to a vector so we can use it in a dense layer. While
      // technically a layer, this only performs a reshape (and has no training
      // parameters).
      tf.layers.flatten(
          {inputShape: truncatedMobileNet.outputs[0].shape.slice(1)}),
      // Layer 1.
      tf.layers.dense({
        units:ui.getDenseUnits(),
        activation: 'relu',
        kernelInitializer: 'varianceScaling',
        useBias: true
      }),
      // Layer 2. The number of units of the last layer should correspond
      // to the number of classes we want to predict.
      tf.layers.dense({
        units: NUM_CLASSES,
        kernelInitializer: 'varianceScaling',
        useBias: false,
        activation: 'softmax'
      })
    ]
  });

  // Creates the optimizers which drives training of the model.
  const optimizer = tf.train.adam(ui.getLearningRate());
  // We use categoricalCrossentropy which is the loss function we use for
  // categorical classification which measures the error between our predicted
  // probability distribution over classes (probability that an input is of each
  // class), versus the label (100% probability in the true class)>
  model.compile({optimizer: optimizer, loss: 'categoricalCrossentropy'});

  // We parameterize batch size as a fraction of the entire dataset because the
  // number of examples that are collected depends on how many examples the user
  // collects. This allows us to have a flexible batch size.
  const batchSize = Math.floor(controllerDataset.xs.shape[0] * ui.getBatchSizeFraction());
  if (!(batchSize > 0)) {
    throw new Error(`Batch size is 0 or NaN. Please choose a non-zero fraction.`);
  }

  // Train the model! Model.fit() will shuffle xs & ys so we don't have to.
  model.fit(controllerDataset.xs, controllerDataset.ys, {
    batchSize,
    epochs: ui.getEpochs(),
    callbacks: {
      onBatchEnd: async (batch, logs) => {
        ui.trainStatus('Loss: ' + logs.loss.toFixed(5));
      }
    }
  });

  // model download testing OK!
  //await model.save('downloads://my-model');
}


async function predict() {
  
  while (isPredicting) {
    // Capture the frame from the webcam.
    const img = await getImage();

    // Make a prediction through mobilenet, getting the internal activation of
    // the mobilenet model, i.e., "embeddings" of the input images.
    const embeddings = truncatedMobileNet.predict(img);

    // Make a prediction through our newly-trained model using the embeddings
    // from mobilenet as input.
    const predictions = model.predict(embeddings);
    
    // Returns the index with the maximum probability. This number corresponds
    // to the class the model thinks is the most probable given the input.
    const predictedClass = predictions.as1D().argMax();
    const classId = (await predictedClass.data())[0];

    const predicted = predictions.as1D();
    const probability = parseInt((await predicted.data())[classId]*100);
    //console.log(probability);

    img.dispose();
    //console.log(classId);
    //UIpredictClass(classId);

    // ouput result in HTML page
    const result = document.getElementById('result');
    const result_probability = document.getElementById('result-probability');
    result.innerText = ui.CONTROLS_CN[classId];
    result_probability.innerText = probability;

    // sample button shadow 
    ui.predictClass(classId);


    // UART TEST 
    /*
    if(classId == 1) 
      serial.write('r');
    else
    serial.write('s');
    */

    // sorting process
    //console.log(classId, probability);
    sorting(classId, probability);

    await tf.nextFrame();
  }
  ui.donePredicting();
}


/**
 * Captures a frame from the webcam and normalizes it between -1 and 1.
 * Returns a batched image (1-element batch) of shape [1, w, h, c].
 */
async function getImage() {
  const img = await webcam.capture();
  const processedImg =
      tf.tidy(() => img.expandDims(0).toFloat().div(127).sub(1));
  img.dispose();
  return processedImg;
}

async function init() {

  try {
    webcam = await tf.data.webcam(document.getElementById('webcam'));
  } catch (e) {
    console.log(e);
    document.getElementById('no-webcam').style.display = 'block';
  }
  // load model
  truncatedMobileNet = await loadTruncatedMobileNet();
  // ui init
  ui.init();

  // Warm up the model. This uploads weights to the GPU and compiles the WebGL
  // programs so the first time we collect data from the webcam it will be
  // quick.
  const screenShot = await webcam.capture();
  truncatedMobileNet.predict(screenShot.expandDims(0));
  screenShot.dispose();
}

// Initialize the application.
init();
