/**
 * Copyright 2021 Pinecone.AI(松果机器人). All Rights Reserved.
 *
 * Project: 小红军过草地 Tensorflow (JS version)
 * Author:  Jerry Peng
 * Date:    April. 6th, 2021
 *
 * =============================================================================
 */


// the link to your model provided by Teachable Machine export panel
const URL = "https://teachablemachine.withgoogle.com/models/G55HJLGQR/";

// Chrome 中可使用此插件解决 http 的 blocked by CORS policy 问题  https://chrome.google.com/webstore/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf
// const URL = "http://localhost:8080/model/";



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*  Background Animation  */

/* Parameters */
// document elements
let mine = null;
let mine2 = null;
let bullet = null;
let bullet2 = null;
let grass = null;
let lHill = null;
let mHill = null;
let hHill = null;
let 小红军 = null;
let 小红军1 = null;
let 小红军2 = null;
let 小红军3 = null;
let 小红军跳 = null;
let 小红军蹲 = null;
let 小红军蹲2 = null;
// elements' position
let soldier_x = 300 + 100; // 300: soldier x position, 100: image center offset
let river_x = 3760;
let river2_x = 10160;
let mine_x = 2500;
let mine2_x = 8000;
let bullet_x = 6500;
let bullet2_x = 11500;
// animation parameters
let runCnt = 0; // every 3 frames to change soldier images
let FSM = 0; // soldier images' FSM
let high = 100; // 300: soldier y position
// background images' position
let grass_x = 0;
let lHill_x = 0;
let mHill_x = 0;
let hHill_x = 0;


// animation events
let gameAnimate;
let timeAnimate;
let time = 0;



/////////
/* Game Begin(开场) */
async function gameBegin() {
    // init 
    initBackground();
}


/* init background */
function initBackground() {

    clearTimeout(gameAnimate);
    clearTimeout(timeAnimate);
    // get document elements
    mine = document.getElementById('雷');
    mine2 = document.getElementById('雷2');
    bullet = document.getElementById('弹');
    bullet2 = document.getElementById('弹2');
    grass = document.getElementById('grass');
    lHill = document.getElementById('山前');
    mHill = document.getElementById('山中');
    hHill = document.getElementById('山后');
    小红军 = document.getElementById('小红军');
    小红军1 = document.getElementById('小红军1');
    小红军2 = document.getElementById('小红军2');
    小红军3 = document.getElementById('小红军3');
    小红军跳 = document.getElementById('小红军跳');
    小红军蹲 = document.getElementById('小红军蹲');
    小红军蹲2 = document.getElementById('小红军蹲2');

    /* init game parameters when init */
    runCnt = 0; // every 3 frames
    FSM = 0;
    high = 100;
    soldier_x = 300 + 100; // 100 image offset
    river_x = 3760;
    river2_x = 10160;
    mine_x = 2500;
    mine2_x = 8000;
    bullet_x = 6500;
    bullet2_x = 11500;
    grass_x = 0;
    lHill_x = 0;
    mHill_x = 0;
    hHill_x = 0;
    document.getElementById('gameover').style.visibility = 'hidden';
    document.getElementById('gameEnd').style.visibility = 'hidden';
    document.getElementById('again').style.visibility = 'hidden';

    // start game
    time = 0;
    gameRun();
    displayTime();
}



function displayTime() {
    document.getElementById('time').innerText = time++;
    timeAnimate = setTimeout(displayTime, 1000);
}

// Function: change soldier image
function changeImage(a) {
    document.getElementById("小红军").src = a.src;
}

// fullscreen button
let isFullscreen = false;
const fullscreenButton = document.getElementById('fullscreen');
fullscreenButton.addEventListener('mousedown', () => {
    if (!isFullscreen)
        document.documentElement.requestFullscreen();
    else
        document.exitFullscreen();
    isFullscreen = !isFullscreen;
});


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/* command functions */
let isCmdMoving = false;
let frame = 0;
/*  command Jump */
let H = 400; //jumpHeight, Unit: Pixel
let L = 50; //jumpLength, Unit: frame, 30ms per frame
let a = -4 * H / (L * L);
let b = 4 * H / L;

const jump = document.getElementById('jump');
jump.addEventListener('mousedown', () => {
    exeJump();
});

function exeJump() {
    isCmdMoving = true;
    changeImage(小红军跳);
    frame = 0;
    cmdJump();
}

let jumpAnimate;

function cmdJump() {
    frame++;
    high = a * frame * frame + b * frame + 100;
    // console.log(high);
    if (high > 100) {
        小红军.style.bottom = high + "px";
        jumpAnimate = setTimeout(cmdJump, 30); // call moveRight in 100msec
    } else {
        clearTimeout(jumpAnimate);
        isCmdMoving = false;
    }
}

/*  command Squat */
let isCmdSquat = false;
let H2 = -100; //SQUATHeight, Unit: Pixel
let L2 = 50; //jumpLength, Unit: frame, 30ms per frame
let a2 = -4 * H2 / (L2 * L2);
let b2 = 4 * H2 / L2;

const squat = document.getElementById('squat');
squat.addEventListener('mousedown', () => {
    exeSquat();
});

function exeSquat() {
    isCmdMoving = true;
    isCmdSquat = true;
    changeImage(小红军蹲);
    frame = 0;
    cmdSquat();
}

let squatAnimate;

function cmdSquat() {

    frame++;
    high = a2 * frame * frame + b2 * frame + 100;
    // console.log(high);
    if (high < 100) {
        小红军.style.bottom = high + "px";
        squatAnimate = setTimeout(cmdSquat, 30); // call moveRight in 100msec
    } else {
        clearTimeout(squatAnimate);
        isCmdMoving = false;
        isCmdSquat = false;
    }
}







///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/* Run App */
initVoiceRecg();
setTimeout(gameBegin, 2000); // wait model loading
// gameBegin();


// console.log(stations.find(x => x.id === 2).position);




////////////////////////////////////////////////////////////////////////
/* Game Functons */
// runing the game, 30 fps
function gameRun() {
    if (grass_x > 1920 - grass.width
        // && lHill_x > 1920 - lHill.width && mHill_x > 1920 - mHill.width && hHill_x > 1920 - hHill.width
    ) {
        // console.log(grass_x);

        /* Background elements moving */
        //
        river_x = river_x - 15;
        river2_x = river2_x - 15;
        //
        mine.style.left = mine_x + "px";
        mine_x = mine_x - 15;
        mine2.style.left = mine2_x + "px";
        mine2_x = mine2_x - 15;
        //
        bullet.style.left = bullet_x + "px";
        bullet_x = bullet_x - 15;
        bullet2.style.left = bullet2_x + "px";
        bullet2_x = bullet2_x - 15;
        //
        grass.style.left = grass_x + "px";
        grass_x = grass_x - 15;
        //
        lHill.style.left = lHill_x + "px";
        lHill_x = lHill_x - 6;
        //
        mHill.style.left = mHill_x + "px";
        mHill_x = mHill_x - 3;
        //
        hHill.style.left = hHill_x + "px";
        hHill_x = hHill_x - 1;
        ///////////////////////////////////////////////////////////////////////// 
        // soldier animate
        if (runCnt > 2) {
            runCnt = 0;
            if (!isCmdMoving) {
                if (FSM == 0) FSM = 1;
                else if (FSM == 1) FSM = 2;
                else if (FSM == 2) FSM = 3;
                else if (FSM == 3) FSM = 1;
                //
                if (FSM == 1) changeImage(小红军1);
                else if (FSM == 2) changeImage(小红军2);
                else if (FSM == 3) changeImage(小红军3);
            } else {
                if (isCmdSquat) {
                    if (小红军.src == 小红军蹲.src) changeImage(小红军蹲2);
                    else changeImage(小红军蹲);
                }
            }
        } else runCnt++;

        gameAnimate = setTimeout(gameRun, 30); // call moveRight in 100msec

        ///////////////////////////////////////////////////////////////////////  
        // game over detection
        // Jump obstacle
        if (Math.abs(soldier_x - river_x) < 20 ||
            Math.abs(soldier_x - river2_x) < 20 ||
            Math.abs(soldier_x - mine_x) < 20 ||
            Math.abs(soldier_x - mine2_x) < 20
        ) {
            if (high < 200) gameover();
        }
        // Squat obstacle
        else if (Math.abs(soldier_x - bullet_x) < 20 ||
            Math.abs(soldier_x - bullet2_x) < 20
        ) {
            if (high > 50) gameover();
        }

    } else {
        gameEnd();
    }

}

function gameover() {
    clearTimeout(gameAnimate);
    document.getElementById('gameover').style.visibility = 'visible';
    document.getElementById('again').style.visibility = 'visible';
    setTimeout(() => document.getElementById('again').innerText = "重新开始游戏... 5", 100);
    setTimeout(() => document.getElementById('again').innerText = "重新开始游戏... 4", 1000);
    setTimeout(() => document.getElementById('again').innerText = "重新开始游戏... 3", 2000);
    setTimeout(() => document.getElementById('again').innerText = "重新开始游戏... 2", 3000);
    setTimeout(() => document.getElementById('again').innerText = "重新开始游戏... 1", 4000);
    setTimeout(() => document.getElementById('again').innerText = "重新开始游戏", 5000);
    setTimeout(gameBegin, 5000);
}

function gameEnd() {
    clearTimeout(gameAnimate);
    document.getElementById('gameEnd').style.visibility = 'visible';
    document.getElementById('again').style.visibility = 'visible';
    setTimeout(() => document.getElementById('again').innerText = "重新开始游戏... 8", 100);
    setTimeout(() => document.getElementById('again').innerText = "重新开始游戏... 7", 1000);
    setTimeout(() => document.getElementById('again').innerText = "重新开始游戏... 6", 2000);
    setTimeout(() => document.getElementById('again').innerText = "重新开始游戏... 5", 3000);
    setTimeout(() => document.getElementById('again').innerText = "重新开始游戏... 4", 4000);
    setTimeout(() => document.getElementById('again').innerText = "重新开始游戏... 3", 5000);
    setTimeout(() => document.getElementById('again').innerText = "重新开始游戏... 2", 6000);
    setTimeout(() => document.getElementById('again').innerText = "重新开始游戏... 1", 7000);
    setTimeout(() => document.getElementById('again').innerText = "重新开始游戏", 8000);
    setTimeout(gameBegin, 8000);
}

// game again button: reload page
const againButton = document.getElementById('again');
againButton.addEventListener('mousedown', () => {
    // console.log("game again");
    // gameBegin();
    location.reload();
});




///////////////////////////////////////////////////////////////////////////////
/* Voice Recognition */

let cmdLabel = ['无', '跳', '蹲'];

async function createModel() {
    const checkpointURL = URL + "model.json"; // model topology
    const metadataURL = URL + "metadata.json"; // model metadata

    const recognizer = speechCommands.create(
        "BROWSER_FFT", // fourier transform type, not useful to change
        undefined, // speech commands vocabulary feature, not useful for your models
        checkpointURL,
        metadataURL);

    // check that model and metadata are loaded via HTTPS requests.
    await recognizer.ensureModelLoaded();

    return recognizer;
}


async function initVoiceRecg() {
    const recognizer = await createModel();
    const classLabels = recognizer.wordLabels(); // get class labels
    const labelContainer = document.getElementById("label-container");
    // for (let i = 0; i < classLabels.length; i++) {
    //     labelContainer.appendChild(document.createElement("div"));
    // }

    // listen() takes two arguments:
    // 1. A callback function that is invoked anytime a word is recognized.
    // 2. A configuration object with adjustable fields
    recognizer.listen(result => {
        const scores = result.scores; // probability of prediction for each class
        // render the probability scores per class
        let cmdID;
        let score = 0;
        for (let i = 0; i < classLabels.length; i++) {
            const classPrediction = classLabels[i] + ": " + result.scores[i].toFixed(2);
            // console.log(classPrediction);
            if (result.scores[i].toFixed(2) > score) {
                cmdID = i;
                score = scores[i].toFixed(2);
            }
        }
        document.getElementById('result').innerText = cmdLabel[cmdID];
        document.getElementById('result-probability').innerText = score * 100;
        //////////////////////////////////////////////////////////////////////
        if (cmdLabel[cmdID] == '跳' && score > 0.75 && !isCmdMoving) {
            exeJump();
        } else if (cmdLabel[cmdID] == '蹲' && score > 0.75 && !isCmdMoving) {
            exeSquat();
        }
    }, {
        includeSpectrogram: true, // in case listen should return result.spectrogram
        probabilityThreshold: 0.75,
        invokeCallbackOnNoiseAndUnknown: true,
        overlapFactor: 0.50 // probably want between 0.5 and 0.75. More info in README
    });

    // Stop the recognition in 5 seconds.
    // setTimeout(() => recognizer.stopListening(), 5000);
}