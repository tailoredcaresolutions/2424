import {useState,useCallback} from 'react';
export default function useTextToSpeech(){
  const[speaking,setSpeaking]=useState(false);
  const speak=useCallback((text,lang="en-CA")=>{
    if(!window.speechSynthesis)return;
    const ut=new SpeechSynthesisUtterance(text);ut.lang=lang;
    ut.onstart=()=>setSpeaking(true);ut.onend=()=>setSpeaking(false);
    window.speechSynthesis.speak(ut);
  },[]);
  const stop=()=>window.speechSynthesis&&window.speechSynthesis.cancel();
  return{speak,stop,speaking};
}
