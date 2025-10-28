import {useState} from 'react';
export default function useDraft(){const[pairs,set]=useState([]);return{pairs,add:(q,a)=>set(p=>[...p,{q,a}]),reset:()=>set([])};}
