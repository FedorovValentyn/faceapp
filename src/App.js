import React, { useRef, useState, useEffect, useCallback } from "react";
import * as tf from "@tensorflow/tfjs";
import Webcam from "react-webcam";
import "./App.css";
import { drawRect } from "./utilities";

function App() {
  const lastSpokenLabel = useRef(null);
  const [continuousSpeech, setContinuousSpeech] = useState(false);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [showLabel, setShowLabel] = useState('');
  const [showImage, setShowImage] = useState(false);
  const [playMusic, setPlayMusic] = useState(false);
  let timeoutId = useRef(null);

  const labelMap = {
    1: {name: 'Student', color: '#7FFFD4'},
    2: {name: 'Pyroh', color: '#FFE4C4'},
    3: {name: 'Good', color: '#0000FF'},
    4: {name: 'Ok', color: '#8A2BE2'},
    5: {name: 'Salute', color: '#D2691E'},
    6: {name: 'Fuck', color: '#5F9EA0'},
    7: {name: 'Bad', color: '#FF7F50'},
    8: {name: 'Uwu', color: '#FF1493'},
    9: {name: 'Freedom', color: '#DC143C'},
    10: {name: 'Victory', color: '#FFF8DC'},
    11: {name: 'Hi', color: '#8FBC8F'},
    12: {name: 'Heart', color: '#B22222'},
    13: {name: 'Please', color: '#008000'}
  };

  const detect = useCallback(async (net) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      const img = tf.browser.fromPixels(video);
      const resized = tf.image.resizeBilinear(img, [640, 480]);
      const casted = resized.cast('int32');
      const expanded = casted.expandDims(0);
      const obj = await net.executeAsync(expanded);

      console.log(obj[2].array())

      const boxes = await obj[4].array();
      const classes = await obj[2].array();
      const scores = await obj[6].array();

      const ctx = canvasRef.current.getContext("2d");
      requestAnimationFrame(() => { drawRect(boxes[0], classes[0], scores[0], 0.8, videoWidth, videoHeight, ctx); });

      const detectionCode = generateDetectionCode(classes[0], scores[0]);
      let label = labelMap[detectionCode] ? `${labelMap[detectionCode].name} detected!` : 'No detection';
      console.log(label);
      setShowLabel(label);

      clearTimeout(timeoutId.current);
      if (labelMap[detectionCode]?.name === 'Salute' && labelMap[detectionCode]?.name === 'pyroh') {
        if (!playMusic) {
          setShowImage(true);
          setPlayMusic(true);

          timeoutId.current = setTimeout(() => {
            setShowImage(false);
            setPlayMusic(false);
          }, 3000);
        }
      }

      tf.dispose([img, resized, casted, expanded, obj]);
    }
  }, []);

  const runCoco = useCallback(async () => {
    const net = await tf.loadGraphModel('https://faceappdetection.s3.eu-de.cloud-object-storage.appdomain.cloud/model.json');
    const interval = setInterval(() => {
      detect(net);
    }, 16.7);
    return () => clearInterval(interval);
  }, [detect]);

  useEffect(() => {
    const clear = runCoco();
    return () => {
      clear();
      clearTimeout(timeoutId.current);
      speechSynthesis.cancel(); // Ensure to cancel any ongoing speech synthesis
    };
  }, [runCoco]);

  const generateDetectionCode = (classes, scores) => {
    return classes.find(cls => scores[classes.indexOf(cls)] > 0.85);
  };

  const handleMusicEnd = () => {
    setShowImage(false);
    setPlayMusic(false);
  };

  useEffect(() => {
    if (showLabel && continuousSpeech) {
        const speak = () => {
            const utterance = new SpeechSynthesisUtterance(showLabel);
            const voices = speechSynthesis.getVoices();
            utterance.voice = voices[0];
            speechSynthesis.speak(utterance);
        };
        speak();
    }
  }, [showLabel, continuousSpeech]);

  function toggleSpeech() {
    setContinuousSpeech(!continuousSpeech);

    if (!continuousSpeech) {
        const speak = () => {
            if (showLabel === 'No detection' || showLabel === lastSpokenLabel.current) {
                return;
            }
            const utterance = new SpeechSynthesisUtterance(showLabel);
            const voices = speechSynthesis.getVoices();
            utterance.voice = voices[0];
            speechSynthesis.speak(utterance);
            lastSpokenLabel.current = showLabel;
            utterance.onend = speak;
        };
        speak();
    } else {
        speechSynthesis.cancel();
    }
}


  return (
   <div className="App">
       <header className="App-header">
           <Webcam
               ref={webcamRef}
               muted={true}
               style={{
                   position: "absolute",
                   marginLeft: "auto",
                   marginRight: "auto",
                   left: 0,
                   right: 500,
                   textAlign: "center",
                   zindex: 9,
                   width: 640,
                   height: 480,
               }}
           />

           <canvas
               ref={canvasRef}
               style={{
                   position: "absolute",
                   marginLeft: "auto",
                   marginRight: "auto",
                   left: 0,
                   right: 500,
                   textAlign: "center",
                   zindex: 8,
                   width: 640,
                   height: 480,
               }}
           />
           {showLabel && <div style={{
               position: "fixed",
               top: "10%",
               left: "40%",
               transform: "translateX(-50%)",
               color: "white",
               fontSize: "30px"
           }}>{showLabel}</div>}
           {showImage && <img src="Skorop.png" alt="Salute"
                              style={{position: "absolute", right: "15%", top: "50%", transform: "translateY(-50%)"}}/>}
           {playMusic && <audio src="march1.mp3" autoPlay onEnded={handleMusicEnd}/>}
           <button onClick={toggleSpeech}
                   style={{
                       position: "absolute",
                       right: "20%",
                       top: "10%",
                       transform: "translateY(-50%)",
                       backgroundColor: continuousSpeech ? "#f44336" : "#4CAF50",
                       color: "white",
                       border: "none",
                       padding: "30px 60px",
                       fontSize: "16px",
                       borderRadius: "5px",
                       cursor: "pointer",
                       transition: "background-color 0.3s ease"
                   }}>
               {continuousSpeech ? 'Turn Off' : 'Voice Up'}
           </button>
           <div style={{

               position: "fixed",
               right: "15%",
               top: "30%",
               fontSize: "18px",
               height: "100px",
               width: "400px",
               display: playMusic ? 'none' : 'block'
           }}>
               <h3> This app detects some motions :
                   "Hi", "Please","Good", "Bad", "Uwu", "Ok", "Heart", "Victory", "Freedom".
                   Also you can voice up the labels by triggering the button above
               </h3>
           </div>
       </header>
   </div>
  );
}

export default App;
