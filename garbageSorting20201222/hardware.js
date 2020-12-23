/**
* Copyright 2020 Pinecone.AI(松果机器人). All Rights Reserved.
 *
 * Project: Tensorflow Garbage Sorting (JS version)
 * Author:  Jerry Peng
 * Date:    Dec. 10th, 2020
 *
 * 
 * This file implements Serial Events & Hardware Ctrl Strategy
 *  Compatible with V1.0 simple serial command: 'r', 's', '1', '2', '3', '4'
 * =============================================================================
 */


/* Processing elements */


/* Serial Port */
let serial; // variable to hold an instance of the serialport library
let menu;
let inData; // for incoming serial data
let inByte;
let byteCount = 0;
let options = {
  baudRate: 115200
};

/* Serial Port */
function printList(serialList) {
  for (let i = 0; i < serialList.length; i++) {
    var x = document.getElementById("device-port");
    var option = document.createElement("option");
    option.text = serialList[i];
    x.add(option);
  }
}

document.getElementById("device-port").addEventListener("change", function() {
  portName = this.value;
  console.log(portName);
  serial.open(portName, options);
  //alert( "打开串口：" + portName );
});

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
  alart('Something went wrong with the serial port. ' + err);
}

// Connected to serial device
function gotOpen() {
  print("Serial Port is Open");
  serial.write('s');
  serial.write('0');
}


// detection filter
let class_id_list = [];

function setup() {
  // Processing JS to init its UI element
 
  // Serial Port
  serial = new p5.SerialPort(); // make a new instance of the serialport 
  serial.list();
  serial.on('data', serialEvent); // callback for when new data arrives
  serial.on('list', printList);
  serial.on('error', serialError); // callback for errors
  serial.on('open', gotOpen);   // When our serial port is opened and ready for read/write
  serial.clear();
  //

  // filter init
  for(let i=0; i<20; i++) {
    class_id_list.push('0');
  }

 }




/////////////////////////////////////////////////////////////////////////////////////////////
/*  hardware control   */



let motionFlag = false;         // in motion process or not flag
let motionFlag_pre = false;     // 
let detectTime = 0;
let motionTime = 0; // Unit:ms
let sortingID = 0;

 let detectionFlag = 0;


 function sorting(classId, probability) {

    // detection filter
    if(detectionFlag < 3) detectionFlag++;  // sample every 3 detection
    else 
    {
        if(!motionFlag) {
            detectionFlag = 0;
            class_id_list.splice(0, 1);
            class_id_list.push(classId);
            
        }    

        if(!motionFlag && (probability > 85) && (list_compare(class_id_list, classId) > 18) )
        {
            console.log(classId);
            // 3- sorting ID
            if(classId == 1) {   //'可回收物'
                motionFlag = true;
                detectTime = int(millis());
                sortingID = 1;
                motionTime = 8000;
            }
            else if(classId == 2) { //'有害垃圾'
                motionFlag = true;
                detectTime = int(millis());
                sortingID = 2;
                motionTime = 10000;
            }
            else if(classId == 3) { //'厨余垃圾'
                motionFlag = true;
                detectTime = int(millis());
                sortingID = 3;
                motionTime = 12000;
            }
            else if(classId == 4) { //'其它垃圾'
                motionFlag = true;
                detectTime = int(millis());
                sortingID = 4;
                motionTime = 14000;
            }
        }
    }


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


 function list_compare(List, compareor) {
    let sum = 0;
	for(let i=0; i<20; i++) {
        if(List[i] == compareor)
		    sum = sum + 1;
    }
	return sum;
  }
