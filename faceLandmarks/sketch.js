let faceapi;
let video;
let detections;

let isVideo = true;

// by default all options are set to true
const detection_options = {
    withLandmarks: true,
    withDescriptors: false,
}


function setup() {
    createCanvas(720, 540).parent('canvasContainer');

    // load up your video
    video = createCapture(VIDEO);
    video.size(width, height);
    video.hide(); // Hide the video element, and just show the canvas
    faceapi = ml5.faceApi(video, detection_options, modelReady)
    textAlign(RIGHT);
  
    // The button to start and stop the transfer process
    select('#startStop').mousePressed(startStop);
}



function startStop() {
  if (isVideo) {
    select('#startStop').html('视频');
  } else {
    select('#startStop').html('漫画');
  }
  isVideo = !isVideo;
}


function modelReady() {
    console.log('ready!')
    console.log(faceapi)
    faceapi.detect(gotResults)

}

function gotResults(err, result) {
    if (err) {
        console.log(err)
        return
    }
    // console.log(result)
    detections = result;

    // background(220);
    background(255, 255, 0);
    if(isVideo) {
      image(video, 0, 0, width, height)
      noFill();
      stroke(0, 255, 0)
      strokeWeight(4)
    } else {
      stroke(0)
    }
      
    if (detections) {
        if (detections.length > 0) {
            // console.log(detections)
            // drawBox(detections)
            drawLandmarks(detections)
        }

    }
    faceapi.detect(gotResults)
}

function drawBox(detections){
    for(let i = 0; i < detections.length; i++){
        const alignedRect = detections[i].alignedRect;
        const x = alignedRect._box._x
        const y = alignedRect._box._y
        const boxWidth = alignedRect._box._width
        const boxHeight  = alignedRect._box._height
        
        noFill();
        stroke(161, 95, 251);
        strokeWeight(4);
//        rect(x, y, boxWidth, boxHeight);
    }
    
}

function drawLandmarks(detections){
    

    for(let i = 0; i < detections.length; i++){
        const mouth = detections[i].parts.mouth; 
        const nose = detections[i].parts.nose;
        const leftEye = detections[i].parts.leftEye;
        const rightEye = detections[i].parts.rightEye;
        const rightEyeBrow = detections[i].parts.rightEyeBrow;
        const leftEyeBrow = detections[i].parts.leftEyeBrow;
        const jawOutline = detections[i].parts.jawOutline;

        drawPart(mouth, true);
        drawPart(nose, false);
        drawPart(leftEye, true);
        drawPart(leftEyeBrow, false);
        drawPart(rightEye, true);
        drawPart(rightEyeBrow, false);
        drawPart(jawOutline, false);

    }

}

function drawPart(feature, closed){
    
    beginShape();
    for(let i = 0; i < feature.length; i++){
        const x = feature[i]._x
        const y = feature[i]._y
        vertex(x, y)
    }
    
    if(closed === true){
        endShape(CLOSE);
    } else {
        endShape();
    }
    
}