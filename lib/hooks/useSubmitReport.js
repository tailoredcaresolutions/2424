export default function useSubmitReport(){
  const submitReport=async(payload)=>{
    const base=process.env.REACT_APP_SUPABASE_EDGE_URL;
    if(!base) throw new Error("Missing env var");
    const res=await fetch(base+"/submit-report",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
    if(!res.ok){throw new Error("submit-report failed "+res.status);}
    return (await res.json()).id;
  };
  return {submitReport};
}
