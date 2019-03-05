// In the renderer process.
const {desktopCapturer} = require('electron')
const fs = require('fs')
const { ipcRenderer } = require('electron')

desktopCapturer.getSources({types: ['window', 'screen']}, (error, sources) => {
  if (error) throw error
  var options = ""
  for (let i = 0; i < sources.length; ++i) {
    console.log(sources[i].name);
    options += '<option value="' + sources[i].id + '">' + sources[i].name + '</option>';
  }

  var dropdown = document.getElementById("windows");
  dropdown.innerHTML=options;


  document.getElementById("stream").addEventListener("click",()=>{
    var dropdown = document.getElementById("windows");
    var sourceId = dropdown.options[dropdown.selectedIndex].value;
    navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: sourceId
            }
          }
        })
        .then((stream) => handleStream(stream))
        .catch((e) => handleError(e))
  })
})

function handleStream (stream) {
  const video = document.querySelector('video')
  video.srcObject = stream
  video.onloadedmetadata = (e) => video.play()
  
  setInterval(()=>{
    var recorder = new MediaRecorder(stream,{
      'videoBitsPerSecond': 8*1024*1024
    });
    var blobs = [];
    recorder.ondataavailable = function(event){
        blobs.push(event.data);
    }
    recorder.onerror = function(event){
        console.log("error", event);
    }
    recorder.onstart = function(event){
        console.log("started");
    }
    recorder.onstop = function(){
      toArrayBuffer(new Blob(blobs, {type: 'video/webm'})).then((arrayBuffer)=>{
        console.log(arrayBuffer);
        str = ab2str(arrayBuffer);
        // buffer = toBuffer(arrayBuffer);
        ipcRenderer.send('buffer', str);
      });
    }
    recorder.start(10);
    setTimeout(() => {
          recorder.stop();
      }, 500);
    },500);
}

function handleError (e) {
  console.log(e)
}

function toArrayBuffer(blob){
  var pro = new Promise((resolve,reject)=>{
    var arrayBuffer;
    var fileReader = new FileReader();
    fileReader.onload = function(event) {
        arrayBuffer = event.target.result;
        resolve(arrayBuffer);
    };
    fileReader.readAsArrayBuffer(blob);
  })
  return pro;
}

function toBuffer(ab) {
  let buffer = new Buffer(ab.byteLength);
  let arr = new Uint8Array(ab);
  for (let i = 0; i < arr.byteLength; i++) {
      buffer[i] = arr[i];
  }
  return buffer;
}

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}

