"use client";

export function createVisemeDriver(host: HTMLElement) {
  const mouth = () => host.querySelector<SVGGElement>("#mouth");
  const show = (v: string) => {
    const m = mouth(); if (!m) return;
    for (const g of Array.from(m.children) as SVGGElement[]) g.style.display = "none";
    (m.querySelector<SVGGElement>(`#viseme-${v}`) || m.querySelector<SVGGElement>("#viseme-rest"))!.style.display = "inline";
  };
  let bt:any, jt:any;
  const idleStart = () => {
    const blink = ()=>{ (host as any).style.filter="brightness(.98)"; setTimeout(()=> (host as any).style.filter="",120); bt=setTimeout(blink,2000+Math.random()*2000); };
    const jitter= ()=>{ (host as any).style.transform=`translate(${(Math.random()-.5)*2}px,${(Math.random()-.5)*1}px)`; jt=setTimeout(jitter,1200+Math.random()*1200); };
    blink(); jitter();
  };
  const idleStop = ()=>{ clearTimeout(bt); clearTimeout(jt); (host as any).style.transform=""; (host as any).style.filter=""; };
  return { show, idleStart, idleStop };
}
