import {useState} from 'react';
export default function useSpeechRecognition({lang="en-CA"}={}){
  const [transcript,setTranscript]=useState("");
  const [listening,setListening]=useState(false);
  const [error,setError]=useState(null);
  let recognition;
  if(typeof window!=="undefined"){
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(SR) recognition=new SR();
  }
  const start=()=>{if(!recognition){setError("No SpeechRecognition");return;}recognition.lang=lang;setTranscript("");recognition.onresult=e=>setTranscript(e.results[0][0].transcript);recognition.onerror=e=>setError(e.error);recognition.onend=()=>setListening(false);recognition.start();setListening(true);}
  const stop=()=>{recognition&&recognition.stop();}
  return{transcript,listening,start,stop,error};
}
