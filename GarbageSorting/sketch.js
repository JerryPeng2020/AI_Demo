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



/* Serial Port */
let serial; // variable to hold an instance of the serialport library
let menu;
let inData; // for incoming serial data
let inByte;
let byteCount = 0;
let options = {
  baudRate: 115200
};


let featureExtractor;
let classifier;
let video;
let loss;
let bgImages = 0;
let recycleImages = 0;
let noxiousImages = 0;
let wetImages = 0;
let dryImages = 0;

let detectResult = 'NULL';
let detectConfidence = '0%';

var canvas;

// detection filter
let class_id_list = [];

// hardware control 
let motionFlag = false;
let motionFlag_pre = false;
let detectTime = 0;
let motionTime = 0; // Unit:ms
let sortingID = 0;

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


  // Serial Port
  serial = new p5.SerialPort(); // make a new instance of the serialport 
  serial.list();
  serial.on('data', serialEvent); // callback for when new data arrives
  serial.on('list', printList);
  serial.on('error', serialError); // callback for errors
  serial.on('open', gotOpen);   // When our serial port is opened and ready for read/write
  serial.clear();

  // filter init
  for(let i=0; i<20; i++) {
    class_id_list.push('0');
  }
  
}




function draw() {
    image(video, 0, 0, width, height);
    
    /*
    textSize(25);
    fill(0, 255, 0);
    text('检测结果：'+ detectResult, 10,  30);
    text('确认度：'+ detectConfidence, 250,  30);
    */

    // sorting begin
    if(motionFlag && !motionFlag_pre) {
        // hardware motion control
        serial.write('r');  //
        if(sortingID==1) serial.write('1');
        if(sortingID==2) serial.write('2');
        if(sortingID==3) serial.write('3');
        if(sortingID==4) serial.write('4');
    }

    // sorting end
    if(motionFlag && int(millis()) - detectTime > motionTime) {
        motionFlag = false;
        serial.write('s');
        serial.write('0');
        sortingID=0;

    }

    motionFlag_pre = motionFlag;

}



/* Serial Port */
function printList(serialList) {
    menu = createSelect();
    let title = createElement('option', 'Choose a port:');
    menu.child(title);
    menu.position(700, 20);
    menu.changed(openPort);
    for (let i = 0; i < serialList.length; i++) {
      let thisOption = createElement('option', serialList[i]);
      thisOption.value = serialList[i];
      menu.child(thisOption);
      print(i + " " + serialList[i]);
    }
}


function openPort() {
    portName = menu.elt.value;
    serial.open(portName, options);
}
  
function keyPressed() {
    serial.write(key);
    print("key:", key);
}
  

function serialEvent() {
    // read a byte from the serial port:
    inByte = int(serial.read());
    byteCount++;
}
  
function serialError(err) {
    print('Something went wrong with the serial port. ' + err);
}
  
  
// Connected to our serial device
function gotOpen() {
    print("Serial Port is Open");
    serial.write('s');
    serial.write('0');
}


/* Image recognition */

// A function to be called when the model has been loaded
function modelReady() {
    select('#modelStatus').html('MobileNet网络已加载成功！');
    // If you want to load a pre-trained model at the start
    

  //  select('#modelStatus').html('Load Custom Model fail!');
	
  //  classifier.load('./model20200612/model.json', function() {
  //  select('#modelStatus').html('Custom Model Loaded!');
  }

  
  // Classify the current frame.
  function classify() {
    classifier.classify(gotResults);
  }
  
  // A util function to create UI buttons
  function setupButtons() {
    // When the background button is pressed, add the current frame
    // from the video with a label of "无" to the classifier
    buttonA = select('#bgButton');
    buttonA.mousePressed(function() {
      classifier.addImage('无');
      select('#amountOfBgImages').html(bgImages++);
    });
  
    // When the button is pressed, add the current frame
    // from the video with a label of "可回收物" to the classifier
    buttonB = select('#recycleButton');
    buttonB.mousePressed(function() {
      classifier.addImage('可回收物');
      select('#amountOfRecycleImages').html(recycleImages++);
    });
  
    // When the button is pressed, add the current frame
    // from the video with a label of "有害垃圾" to the classifier
    buttonC = select('#noxiousButton');
    buttonC.mousePressed(function() {
      classifier.addImage('有害垃圾');
      select('#amountOfNoxiousImages').html(noxiousImages++);
    });
  
  // When the button is pressed, add the current frame
    // from the video with a label of "餐厨垃圾" to the classifier
    buttonC = select('#wetButton');
    buttonC.mousePressed(function() {
      classifier.addImage('餐厨垃圾');
      select('#amountOfWetImages').html(wetImages++);
    });

     // When the button is pressed, add the current frame
    // from the video with a label of "其它垃圾" to the classifier
    buttonC = select('#dryButton');
    buttonC.mousePressed(function() {
      classifier.addImage('其它垃圾');
      select('#amountOfDryImages').html(dryImages++);
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

        // detection filter
        if(detectionFlag < 3) detectionFlag++;  // sample every 3 detection
        else {
            if(!motionFlag) {
                detectionFlag = 0;
                class_id_list.splice(0, 1);
                class_id_list.push(detectResult);
            }
        //    print(list_compare(class_id_list, detectResult));
            if( !motionFlag && results[0].confidence.toFixed(2) > 0.85 && list_compare(class_id_list, detectResult) > 18 )
            {
                // 3- sorting ID
                if(detectResult == '可回收物') {
                    motionFlag = true;
                    detectTime = int(millis());
                    sortingID = 1;
                    motionTime = 8000;
                }
                else if(detectResult == '有害垃圾') {
                    motionFlag = true;
                    detectTime = int(millis());
                    sortingID = 2;
                    motionTime = 10000;
                }
                else if(detectResult == '餐厨垃圾') {
                    motionFlag = true;
                    detectTime = int(millis());
                    sortingID = 3;
                    motionTime = 12000;
                }
                else if(detectResult == '其它垃圾') {
                    motionFlag = true;
                    detectTime = int(millis());
                    sortingID = 4;
                    motionTime = 14000;
                }

            }
        }
  
        classify();
    }
  }


  function list_compare(List, compareor) {
    let sum = 0;
	for(let i=0; i<20; i++) {
        if(List[i] == compareor)
		    sum = sum + 1;
    }
	return sum;
  }