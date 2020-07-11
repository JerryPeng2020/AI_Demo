/****************************************************
  /* General Sorting Demo 
  /*
  /*
  /* Author: Jerry Peng
  /* Date: May 10th, 2020
  /*
  /* www.pinecone.ai
  /*
  /* Description: This is a demo project for general items training and sorting.
  /*
  /*
  /***************************************************/






let featureExtractor;
let classifier;
let video;
let loss;
let bgImages = 0;
let n95Images = 0;
let n90Images = 0;
let surgicalImages = 0;
let dustImages = 0;

let detectResult = 'NULL';
let detectConfidence = '0%';

var canvas;

// detection filter
let class_id_list = [];



function setup() {
  canvas = createCanvas(640, 480);
  canvas.position(10, 70);
  // Create a video element
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  select('#result').style('font-size: 20px;');
  select('#confidence').style('font-size: 20px;');

  // Extract the already learned features from MobileNet
  featureExtractor = ml5.featureExtractor('MobileNet', modelReady);

  // Create a new classifier using those features and give the video we want to use
  const options = { numLabels: 5 };
  classifier = featureExtractor.classification(video, options);
  // Set up the UI buttons
  setupButtons();



  
}




function draw() {
    image(video, 0, 0, width, height);
    
    /*
    textSize(25);
    fill(0, 255, 0);
    text('检测结果：'+ detectResult, 10,  30);
    text('确认度：'+ detectConfidence, 250,  30);
    */

    

}



  




/* Image recognition */

// A function to be called when the model has been loaded
function modelReady() {
    select('#modelStatus').html('MobileNet加载成功!');
    // If you want to load a pre-trained model at the start
    // classifier.load('./model/model.json', function() {
    //   select('#modelStatus').html('Custom Model Loaded!');
    // });
  }
  
  // Classify the current frame.
  function classify() {
    classifier.classify(gotResults);
  }
  
  // A util function to create UI buttons
  function setupButtons() {
    // When the background button is pressed, add the current frame
    // from the video with a label of "背景" to the classifier
    buttonA = select('#bgButton');
    buttonA.mousePressed(function() {
      classifier.addImage('无');
      select('#amountOfBgImages').html(bgImages++);
    });
  
    // When the N95 button is pressed, add the current frame
    // from the video with a label of "N95" to the classifier
    buttonB = select('#n95Button');
    buttonB.mousePressed(function() {
      classifier.addImage('类别1');
      select('#amountOfN95Images').html(n95Images++);
    });
  
    // When the N90 button is pressed, add the current frame
    // from the video with a label of "N90" to the classifier
    buttonC = select('#n90Button');
    buttonC.mousePressed(function() {
      classifier.addImage('类别2');
      select('#amountOfN90Images').html(n90Images++);
    });
  
  // When the surgical button is pressed, add the current frame
    // from the video with a label of "医用口罩" to the classifier
    buttonC = select('#surgicalButton');
    buttonC.mousePressed(function() {
      classifier.addImage('类别3');
      select('#amountOfSurgicalImages').html(surgicalImages++);
    });

     // When the dust button is pressed, add the current frame
    // from the video with a label of "防尘口罩" to the classifier
    buttonC = select('#dustButton');
    buttonC.mousePressed(function() {
      classifier.addImage('类别4');
      select('#amountOfDustImages').html(dustImages++);
    });
  
    // Train Button
    train = select('#train');
    train.mousePressed(function() {
      classifier.train(function(lossValue) {
        if (lossValue) {
          loss = lossValue;
          select('#loss').html('错误率: ' + loss);
        } else {
          select('#loss').html('训练完成! 错误率: ' + loss);
        }
      });
    });
  
    // Predict Button
    buttonPredict = select('#buttonPredict');
    buttonPredict.mousePressed(classify);
  
    // Save model
    saveBtn = select('#save');
    saveBtn.mousePressed(function() {
      classifier.save();
    });
  
    // Load model
    loadBtn = select('#load');
    loadBtn.changed(function() {
      classifier.load(loadBtn.elt.files, function() {
        select('#modelStatus').html('Custom Model Loaded!');
      });
    });
  }
  

  let detectionFlag = 0;
  // Show the results
  function gotResults(err, results) {
    // Display any error
    if (err) {
      console.error(err);
    }
    if (results && results[0]) {
        select('#result').html(results[0].label);
        select('#confidence').html(results[0].confidence.toFixed(2) * 100 + '%');
  
        detectResult = results[0].label;
        detectConfidence = results[0].confidence.toFixed(2) * 100 + '%';
        textSize(25);
        fill(0, 255, 0);
        text('检测结果：'+ detectResult, 10,  30);
        text('确认度：'+ detectConfidence, 250,  30);

       
  
        classify();
    }
  }

