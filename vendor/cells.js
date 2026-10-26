/* Original clean-room reaction-diffusion toy. MIT, ypaaaaaaaaaaaaa. */
(() => {
'use strict';
const canvas=document.querySelector('canvas'),ctx=canvas.getContext('2d',{alpha:false});
const small=document.createElement('canvas'),ink=small.getContext('2d');
const panel=document.querySelector('#controls'),toggle=document.querySelector('#toggle');
let w=128,h=0,a,b,na,nb,pixels,paused=false,erase=false,palette=0,ready=false,last=0,seed=0;
const pointers=new Map();
function reset(){
 seed+=1; a.fill(1);b.fill(0);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const u=(x-w*.5)/w,v=(y-h*.5)/h;
  const angle=Math.atan2(v,u),r=Math.hypot(u,v);
  const boundary=.39+.055*Math.sin(angle*5+seed)+.025*Math.cos(angle*9);
  const wave=Math.sin(x*.35+Math.sin(y*.12)*2)+Math.cos(y*.31+Math.cos(x*.15)*2);
  if(r<boundary && wave>.0){const i=x+y*w;b[i]=.34+.08*Math.sin(x*.7+y);a[i]=.5;}
 }
}
function resize(){
 const rect=canvas.getBoundingClientRect(),newH=Math.round(w*rect.height/rect.width);
 canvas.width=Math.round(rect.width*Math.min(devicePixelRatio||1,2));canvas.height=Math.round(rect.height*Math.min(devicePixelRatio||1,2));
 if(newH!==h){h=newH;small.width=w;small.height=h;a=new Float32Array(w*h);b=new Float32Array(w*h);na=new Float32Array(w*h);nb=new Float32Array(w*h);pixels=ink.createImageData(w,h);reset();}
 draw();
}
function step(){
 for(let y=0;y<h;y++){
  const up=(y?y-1:h-1)*w,down=(y+1<h?y+1:0)*w,row=y*w;
  for(let x=0;x<w;x++){
   const l=x?x-1:w-1,r=x+1<w?x+1:0,i=row+x,A=a[i],B=b[i];
   const la=-A+.2*(a[row+l]+a[row+r]+a[up+x]+a[down+x])+.05*(a[up+l]+a[up+r]+a[down+l]+a[down+r]);
   const lb=-B+.2*(b[row+l]+b[row+r]+b[up+x]+b[down+x])+.05*(b[up+l]+b[up+r]+b[down+l]+b[down+r]);
   const react=A*B*B;na[i]=Math.max(0,Math.min(1,A+la-react+.036*(1-A)));nb[i]=Math.max(0,Math.min(1,B+.5*lb+react-.096*B));
  }
 }
 [a,na]=[na,a];[b,nb]=[nb,b];
}
function draw(){
 const p=pixels.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=y*w+x,v=b[i],t=Math.min(1,v*3.1),edge=Math.max(0,1-Math.abs(v-.19)*15),f=(Math.sin(x*.025+y*.018+palette*2)+1)*.5;
  const glow=.22*t+.78*edge,k=i*4;
  p[k]=7+glow*(30+195*f)+edge*28;
  p[k+1]=17+glow*(211-115*f)+edge*25;
  p[k+2]=26+glow*(178-107*f)+edge*27;p[k+3]=255;
 }
 ink.putImageData(pixels,0,0);ctx.imageSmoothingEnabled=false;ctx.drawImage(small,0,0,canvas.width,canvas.height);
}
function dab(x,y){
 const radius=erase?8:4;
 for(let yy=Math.max(0,Math.floor(y-radius));yy<Math.min(h,y+radius);yy++)for(let xx=Math.max(0,Math.floor(x-radius));xx<Math.min(w,x+radius);xx++){
  if((xx-x)**2+(yy-y)**2>radius*radius)continue;
  const i=yy*w+xx;b[i]=erase?0:.65;a[i]=erase?1:.35;
 }
}
function position(e){const r=canvas.getBoundingClientRect();return [(e.clientX-r.left)/r.width*w,(e.clientY-r.top)/r.height*h];}
canvas.addEventListener('pointerdown',e=>{e.preventDefault();canvas.setPointerCapture(e.pointerId);const p=position(e);pointers.set(e.pointerId,p);dab(...p);draw();});
canvas.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;e.preventDefault();const p=position(e),old=pointers.get(e.pointerId),n=Math.ceil(Math.hypot(p[0]-old[0],p[1]-old[1]));for(let j=1;j<=n;j++)dab(old[0]+(p[0]-old[0])*j/n,old[1]+(p[1]-old[1])*j/n);pointers.set(e.pointerId,p);draw();});
for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,e=>pointers.delete(e.pointerId));
toggle.addEventListener('click',()=>{panel.hidden=!panel.hidden;toggle.setAttribute('aria-expanded',String(!panel.hidden));toggle.textContent=panel.hidden?'+':'−';});
for(const el of [toggle,panel])for(const name of ['pointerdown','pointermove','pointerup','touchstart','touchmove','touchend'])el.addEventListener(name,e=>e.stopPropagation());
document.querySelector('#brush').onclick=e=>{erase=!erase;e.currentTarget.textContent=erase?'Erase':'Seed';e.currentTarget.setAttribute('aria-pressed',String(erase));canvas.style.cursor=erase?'crosshair':'cell';};
document.querySelector('#pause').onclick=e=>{paused=!paused;e.currentTarget.textContent=paused?'Resume':'Pause';};
document.querySelector('#reset').onclick=()=>{reset();draw();};
document.querySelector('#color').onclick=()=>{palette++;draw();};
function frame(now){
 if(!document.hidden && now-last>32){if(!paused){for(const p of pointers.values())dab(...p);for(let i=0;i<4;i++)step();}draw();last=now;}
 if(!ready && window.__gbSandbox){window.__gbSandbox.ready();ready=true;}
 requestAnimationFrame(frame);
}
resize();window.addEventListener('resize',resize);requestAnimationFrame(frame);
})();
