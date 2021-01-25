/**
* Copyright 2020 Pinecone.AI(松果机器人). All Rights Reserved.
 *
 * Project: Tensorflow Garbage Sorting (JS version)
 * Author:  Jerry Peng
 * Date:    Dec. 10th, 2020
 *
 * =============================================================================
 */

// big buttons
document.getElementById('train').addEventListener('click', async () => {
  ui.trainStatus('Training...');
  await tf.nextFrame();  // in order to display 'Training...' for a while 
  await tf.nextFrame();
  isPredicting = false;
  train();
});

document.getElementById('predict').addEventListener('click', () => {
  isPredicting = true;
  predict();
});

document.getElementById('load-model').addEventListener('click', () => {
  loadLocalModel();
});

document.getElementById('save-model').addEventListener('click', () => {
  saveModel();
});

const trainStatusElement = document.getElementById('train-status');



/* UI class */
class UI {

  constructor() {
    // UI parameters
    this.mouseDown = false;
    this.addExampleHandler;
    this.CONTROLS = ['background', 'recycle', 'noxious', 'wet', 'dry'];
    this.CONTROLS_CN = ['无', '可回收物', '有害垃圾', '餐厨残余', '其它垃圾'];
    this.totals = [0, 0, 0, 0, 0];
    this.thumbDisplayed = {};

    // direction button
    const backgroundButton = document.getElementById('background');
    const recycleButton = document.getElementById('recycle');
    const noxiousButton = document.getElementById('noxious');
    const wetButton = document.getElementById('wet');
    const dryButton = document.getElementById('dry');
    //
    backgroundButton.addEventListener('mousedown', () => ui.handler(0));
    backgroundButton.addEventListener('mouseup', () => this.mouseDown = false);
    //
    recycleButton.addEventListener('mousedown', () => ui.handler(1));
    recycleButton.addEventListener('mouseup', () => this.mouseDown = false);
    //
    noxiousButton.addEventListener('mousedown', () => ui.handler(2));
    noxiousButton.addEventListener('mouseup', () => this.mouseDown = false);
    //
    wetButton.addEventListener('mousedown', () => ui.handler(3));
    wetButton.addEventListener('mouseup', () => this.mouseDown = false);
    //
    dryButton.addEventListener('mousedown', () => ui.handler(4));
    dryButton.addEventListener('mouseup', () => this.mouseDown = false);

    // Set hyper params from UI values.
    this.learningRateElement = document.getElementById('learningRate');
    this.getLearningRate = () => +this.learningRateElement.value;
    //
    this.batchSizeFractionElement = document.getElementById('batchSizeFraction');
    this.getBatchSizeFraction = () => +this.batchSizeFractionElement.value;
    //
    this.epochsElement = document.getElementById('epochs');
    this.getEpochs = () => +this.epochsElement.value;
    //
    this.denseUnitsElement = document.getElementById('dense-units');
    this.getDenseUnits = () => +this.denseUnitsElement.value;
    this.statusElement = document.getElementById('status');
    
  }

  init(){
    document.getElementById('controller').style.display = '';
    this.statusElement.style.display = 'none';

    // When the UI buttons are pressed, read a frame from the webcam and associate
    // it with the class label given by the button. up, down, left, right are
    // labels 0, 1, 2, 3 respectively.
    this.setExampleHandler(async label => {
      let img = await getImage();
      controllerDataset.addExample(truncatedMobileNet.predict(img), label);
      // Draw the preview thumbnail.
      this.drawThumb(img, label);
      img.dispose();
    })
  }

  predictClass(classId) {
    //
    document.body.setAttribute('data-active', this.CONTROLS[classId]);
  }

  donePredicting() {
    this.statusElement.style.visibility = 'hidden';
  }
  trainStatus(status) {
    trainStatusElement.innerText = status;
  }
  
  setExampleHandler(handler) {
    this.addExampleHandler = handler;
  }
  
  async handler(label) {
    this.mouseDown = true;
    const className = this.CONTROLS[label];
    const total = document.getElementById(className + '-total');
    while (this.mouseDown) {
      this.addExampleHandler(label);
      document.body.setAttribute('data-active', this.CONTROLS[label]);
      total.innerText = ++this.totals[label];
      await tf.nextFrame();
    }
    document.body.removeAttribute('data-active');
  }
  
  // draw captured image in button area
  drawThumb(img, label) {
    if (this.thumbDisplayed[label] == null) {
      const thumbCanvas = document.getElementById(this.CONTROLS[label] + '-thumb');
      this.draw(img, thumbCanvas);
    }
  }

  draw(image, canvas) {
    const [width, height] = [224, 224];
    const ctx = canvas.getContext('2d');
    const imageData = new ImageData(width, height);
    const data = image.dataSync();
    for (let i = 0; i < height * width; ++i) {
      const j = i * 4;
      imageData.data[j + 0] = (data[i * 3 + 0] + 1) * 127;
      imageData.data[j + 1] = (data[i * 3 + 1] + 1) * 127;
      imageData.data[j + 2] = (data[i * 3 + 2] + 1) * 127;
      imageData.data[j + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
  }

}