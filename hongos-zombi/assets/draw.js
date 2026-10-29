/* Deterministic procedural specimens: all motion depends only on local seconds. */
window.Hongos = (() => {
 const C = window.HONGOS_CONFIG, P=C.palette;
 const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));
 function draw(canvas, scene, t) {
  const ctx=canvas.getContext('2d'); const W=720,H=1280;
  ctx.clearRect(0,0,W,H); ctx.fillStyle=P.background; ctx.fillRect(0,0,W,H);
  const halo=ctx.createRadialGradient(360,620,40,360,620,480); halo.addColorStop(0,'#0d2632'); halo.addColorStop(1,P.background);ctx.fillStyle=halo;ctx.fillRect(0,250,W,850);
  function line(points,color=P.lime,width=2,alpha=1){ctx.save();ctx.strokeStyle=color;ctx.lineWidth=width;ctx.globalAlpha=alpha;ctx.shadowColor=color;ctx.shadowBlur=width>2?9:3;ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke();ctx.restore();}
  function ellipse(x,y,rx,ry,color=P.lime,rot=0){
   ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.strokeStyle=color;ctx.lineWidth=1.6;ctx.shadowColor=color;ctx.shadowBlur=5;
   ctx.fillStyle='#06141e';ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2);ctx.fill();ctx.stroke();
   for(let i=-3;i<=3;i++){let u=i/4;ctx.beginPath();ctx.ellipse(0,u*ry,rx*Math.sqrt(1-u*u),ry*.12,0,0,Math.PI*2);ctx.stroke();}
   for(let i=-2;i<=2;i++){ctx.beginPath();ctx.ellipse(i*rx*.23,0,rx*.17,ry*.98,0,0,Math.PI*2);ctx.stroke();}ctx.restore();
  }
  function label(text,x,y,color=P.lime,size=24){ctx.save();ctx.font=`700 ${size}px Arial`;ctx.fillStyle=color;ctx.fillText(text,x,y);ctx.restore();}
  function dot(x,y,r,color){ctx.save();ctx.fillStyle=color;ctx.shadowColor=color;ctx.shadowBlur=14;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.restore();}
  // A physical perspective floor, below the specimen.
  for(let i=-9;i<=9;i++)line([[360+i*30,785],[360+i*170,1280]],P.grid,1,.8);
  for(let i=0;i<10;i++){const y=785+Math.pow(i/9,1.8)*495;line([[0,y],[720,y]],P.grid,1,.8);}
  ctx.strokeStyle='#31505d';ctx.lineWidth=1;ctx.strokeRect(38,300,644,600);
  for(const [x,y,sx,sy] of [[38,300,1,1],[682,300,-1,1],[38,900,1,-1],[682,900,-1,-1]])line([[x,y+sy*22],[x,y],[x+sx*22,y]],P.lime,2);
  function ant(x,y,scale=1,angle=0,walk=true,cut=false){
   ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(scale,scale);
   // Jointed legs attach to thorax; the two sides have opposite gait.
   for(let side of [-1,1]) for(let i=0;i<3;i++){
    let g=walk?Math.sin(t*9+i*2+side)*13:0;
    line([[-10+i*20,side*20],[-48+i*34+g,side*(65+i*7)],[-78+i*53-g,side*118]],P.lime,2.4);
    dot(-48+i*34+g,side*(65+i*7),3,P.amber);
   }
   line([[-85,0],[118,0]],P.lime,4);
   ellipse(-115,0,80,59);ellipse(-15,0,48,36);ellipse(70,0,47,43);ellipse(125,-1,40,34);
   line([[140,-21],[173,-56],[202,-67]],P.lime,2.2);line([[143,19],[177,45],[202,39]],P.lime,2.2);
   line([[154,-12],[181,-5],[167,5]],P.amber,3);line([[153,12],[180,19],[166,22]],P.amber,3);
   dot(138,-18,4,P.white);
   if(cut){
    ctx.save();ctx.globalAlpha=.9;
    for(let j=0;j<9;j++){let yy=-35+j*8;line([[-168,yy],[-110,yy+8*Math.sin(j)],[-58,yy],[-12,yy*.6],[35,yy*.4]],P.amber,3,.6);}
    const growth=clamp(t/4);
    for(let j=0;j<25;j++){
     let x0=-170+j*8;let points=[];
     for(let k=0;k<=25*growth;k++)points.push([x0+k*4,Math.sin(k*.5+j)*22+Math.cos(j)*20]);
     if(points.length)line(points,P.pink,1.8,.9);
    }
    ctx.restore();
   }
   ctx.restore();
  }
  function spores(local, count=28, released=false){
   for(let i=0;i<count;i++){
    let x=100+(i*83)%520+Math.sin(local+i)*20;
    let y=released?400+((local*55+i*31)%400):310+((local*75+i*73)%390);
    if(released){const age=(local+i*.31)%3;x=454+Math.sin(i*2.4)*(age*35);y=309+age*83;}
    ellipse(x,y,3+(i%3),5,P.amber,i); line([[x,y-18],[x,y-8]],P.amber,1,.4);
   }
  }
  function plant(){
   line([[305,910],[343,720],[380,500],[420,337]],P.lime,11,.8);
   for(let i=0;i<11;i++)line([[300+i*1.4,910],[337+i*1.1,720],[374+i*.8,500],[418+i*.5,337]],P.lime,1,.6);
   ctx.save();ctx.translate(408,417);ctx.rotate(-.32);
   ellipse(65,0,130,42,P.lime,-.23);line([[-57,26],[189,-26]],P.lime,2);
   for(let i=0;i<8;i++)line([[-30+i*27,20-i*5],[-7+i*25,-26]],P.lime,1,.8);ctx.restore();
  }
  const id=scene.id;
  if(id==='objetivo'||id==='esporas'){
   const x=340+Math.sin(t*.75)*30;
   ant(x,650+Math.sin(t*9)*2,1.18,0,true);
   if(id==='esporas'){spores(t); if(t>2)for(let i=0;i<7;i++)dot(270+i*23,625+Math.sin(i)*20,4,P.pink);}
   label(id==='objetivo'?C.hud.target:C.hud.spores,80,365,P.amber);
   line([[235,372],[275,430],[330,570]],P.amber,1.5);
   label(C.scientificName,80,851,P.white,25);
  } else if(id==='interior'){
   ant(365,620,1.42,-.1,false,true);
   label(C.hud.muscle,78,366,P.amber,25);line([[285,380],[290,476],[310,565]],P.amber,1.5);
   label(C.hud.truth,78,847,P.pink,26);
  } else if(id==='cerebro'){
   ant(295,640,1.26,0,false,true);
   // Intact brain is physically inside the head; fungi stop before it.
   ellipse(454,630,26,18,P.amber);line([[432,631],[442,621],[447,637],[455,621],[463,637],[474,628]],P.amber,2);
   label(C.hud.brain,78,366,P.amber,27);line([[302,375],[450,445],[454,602]],P.amber,1.5);
   label(C.hud.myth,78,806,P.pink,27);
   if(t>2.8)line([[72,795],[625,810]],P.pink,4);
   if(t>5.2)label(C.hud.truth,78,855,P.lime,27);
  } else {
   plant();
   if(id==='ascenso'){
    const k=clamp(t/7);ant(283+k*81,761-k*176,.82,-1.37,true);
    label(C.hud.climb,78,365,P.amber,28);
    line([[151,475],[151,400],[139,417]],P.amber,2);
   } else {
    const close=id==='pregunta';
    ctx.save(); if(close){ctx.translate(-73,-85);ctx.scale(1.17,1.17);}
    ant(372,579,1,-1.04,t<1&&id==='ciclo');
    let growth=close?1:clamp((t-2)/2.5);
    const pts=[];for(let i=0;i<=45;i++){const a=i/45*growth;pts.push([450+22*Math.sin(a*3),450-a*140]);}
    for(let z=-2;z<=2;z++)line(pts.map(([x,y])=>[x+z*3,y]),P.pink,z===0?3:1.3);
    if(growth>.9){ellipse(454,309,16,33,P.pink,.15);spores(t-4,16,true);}
    ctx.restore();
    label(close?C.hud.end:(t<3?C.hud.bite:C.hud.release),78,850,P.pink,25);
   }
  }
  // Scan cursor gives the anatomical view motion without obscuring it.
  const sy=395+(t*36)%390;line([[55,sy],[665,sy]],P.lime,1,.13);
 }
 return {draw};
})();
