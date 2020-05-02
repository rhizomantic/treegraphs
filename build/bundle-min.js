var seed,density,render,canvas,editor,area,tickers=new Set,t=0,go=!0,tweenable=["step","turn","size","weight"],backCol="#000000",graphs=[],def0={props:{render:"curves",renderConfig:{type:"petals",levels:[["#FFCC0088",8],["rgba(255, 0, 0, 0.1)",4]]}},net:{type:"fan",num:35,pos:[500,400],ang:0,step:{ease:"sine",pow:-3,terms:"noise*0.8+t*0.2",min:30,max:480,dur:200},turn:6.28/35,children:[]}},def={props:{render:{levels:[{type:"tree",stroke:"#00000088",fill:"#00000033",weightMult:0,weightAdd:1}]}},net:[{num:4,type:"fan",mirror:!0,size:72,weight:1,step:300,turn:{min:0,dif:3.14,terms:"ix"},children:[{num:12,type:"fan",mirror:!0,size:36,weight:1,step:{min:30,dif:150,terms:"tix",ease:"none",pow:3,dur:200},turn:{min:0,dif:3.14,var:1.04,terms:"ix",pow:2,dur:200},children:[]}],pos:[702.5,479]}]};function setup(){(canvas=createCanvas(1080,1080)).parent("container"),background(backCol),stroke(0,128),strokeWeight(3),noFill(),smooth(),editor=select("#editor"),area=select("#editor-area"),select("#update").mouseClicked(function(){reset(!0)}),select("#generate").mouseClicked(function(){reset(!1)}),editor.hide(),reset(!1),console.log("setup")}function reset(e){let o;o=e?JSON.parse(area.value()):generateSimple(),background(backCol),t=0,seed=int(random(999999)),randomSeed(seed),noiseSeed(seed),graphs=[];var r=new Graph(o);graphs.push(r),area.value(JSON.stringify(o,replacer,2)),render=new RenderCurves(o)}function replacer(e,t){return"number"==typeof t?Math.floor(100*t)/100:t}function draw(){if(go){background(backCol);for(let e of graphs)e.root.update(),moveNode(e.root),render.render(e.root);t++}}function makeGroup(e,t,o){let r=[];for(let s=0;s<e.num;s++){let i=new Node;if(r.push(i),i.ix=s,i.nrm=1==e.num?0:1/e.num*s,i.parent=t,i.depth=t.depth+1,i.graph=o,o.count++,o.depth=Math.max(o.depth,i.depth),"chain"==e.type&&s>0?i.anchor=r[s-1]:i.anchor=t,i.type=e.type,i.rot=0,i.turn=e.turn,i.step=e.step,i.mirror=e.mirror,i.size=e.size,i.weight=e.weight,i.fill=e.fill,i.stroke=e.stroke,i.init(),e.children)for(let t=0;t<e.children.length;t++)makeGroup(e.children[t],i,o)}t.groups.push(r)}class Graph{constructor(e={}){this.ix=graphs.length,this.count=0,this.depth=0,this.root=new Node({pos:e.net[0].pos});for(let t=0;t<e.net.length;t++)makeGroup(e.net[t],this.root,this);this.root.init(),console.log("graph",this)}}class Node{constructor(e={}){this.ix=e.ix||0,this.nrm=e.nrm||0,this.rnd=e.rnd||Math.random(),this.pos=e.pos||[windowWidth/2,windowHeight/2],this.step=e.step||30,this.turn=e.turn||0,this.rot=e.rot||0,this.mirror=e.mirror||!1,this.size=e.size||20,this.weight=e.weight||1,this.depth=e.depth||0,this.fill=e.fill||"#888888",this.stroke=e.stroke||0,this.graph=e.graph||null,this.parent=e.parent||null,this.anchor=e.anchor||null,this.groups=e.groups||[],this.curves={}}init(){for(let e of tweenable)isNaN(this[e])&&(this.curves[e]=parseCurve(this[e],this));for(let e of this.groups)for(let t of e)t.init()}update(){for(let[e,o]of Object.entries(this.curves)){let r=o.base;if(o.dur>0&&o.time>0){let e=floor(t/(o.dur+1))%2==0?t%(o.dur+1):o.dur+1-t%(o.dur+1);r+=1/o.dur*e+o.time}r>1&&(r=0==floor(r%2)?r%1:1-r%1),this[e]=o.min+ease(o.ease,r,o.pow)*o.dif}for(let e of this.groups)for(let t of e)t.update()}}function ease(e,t,o){return"simple"==e?o<0?1-Math.pow(1-t,Math.abs(o)):Math.pow(t,Math.abs(o)):"IO"==e?t<.5?.5*(o<0?1-Math.pow(1-2*t,Math.abs(o)):Math.pow(2*t,Math.abs(o))):.5*(1-(o<0?1-Math.pow(1-(1-2*(t-.5)),Math.abs(o)):Math.pow(1-2*(t-.5),Math.abs(o))))+.5:"hill"==e?(t=t<.5?2*t:1-2*(t-.5),o<0?1-Math.pow(1-t,Math.abs(o)):Math.pow(t,Math.abs(o))):"sine"==e?.5*Math.sin(t*o*Math.PI*2)+.5:"noise"==e?noise(16*t):t}function pick(...e){return e[floor(random(e.length))]}function mousePressed(){}function keyTyped(){if(document.activeElement!==document.getElementById("editor-area"))if(" "===key)go=!go,console.log("go",go);else if("r"===key)reset(!1);else if("s"===key){let e=getTime();saveCanvas("TG-"+e+".jpg")}else"g"===key?generate():"e"===key&&("block"==editor.style("display")?editor.hide():editor.show())}function contrast(e,t){return constrain(t*(e-.5)+.5,0,1)}function getTime(){let e=new Date;return e.getFullYear().toString().substring(2,4)+(e.getMonth()+1).toString().padStart(2,"0")+e.getDate().toString().padStart(2,"0")+"-"+e.getHours().toString().padStart(2,"0")+e.getMinutes().toString().padStart(2,"0")+e.getSeconds().toString().padStart(2,"0")}function generateWithBudget(){let e=0,t=[PI/2,PI,2*PI],o={props:{render:{levels:[{type:"tree",stroke:"#999999",weightMult:0,weightAdd:1},{type:"bezier",stroke:"#00000088",weightAdd:4},{type:"bezier",stroke:"#FFFFFF88",weight:0}]}},net:[]},r=o.net,s=1;for(;e<160;){let o=Math.floor(10*Math.pow(Math.random(),2))+2;for(;e+s*o>200&&o>1;)o--;let i={num:o,type:Math.random()<.6?"fan":"chain",step:{min:120*Math.random()+30,dif:0},turn:{min:PI/2,dif:t[Math.floor(random(t.length))]},mirror:o%2==0,weight:{min:2,dif:2,terms:"depth"},size:{min:10,dif:40,terms:"depth"},children:[]};r.push(i),e+=s*o,Math.random()<.7&&(r=i.children,s*=o)}return o.net[0].pos=[windowWidth/2,windowHeight/2],o}function generateSimple(){let e=random(.1,PI/2),t=int(random(2,6)),o={props:{render:{levels:[{type:"petals",close:!0,stroke:"#FFFFFFCC",fill:"#33333388",weightMult:0,weightAdd:2},{type:"circles",stroke:"#FFFFFF88",fill:"#66666688"}]}},net:[{num:t,type:"fan",mirror:!0,size:72,weight:0,step:120,turn:{min:0,dif:TWO_PI,terms:"ix"},children:[{num:t,type:"fan",mirror:t%2==0&&random(1)<.5,size:36,weight:8,step:{min:180,dif:0,terms:"ix",ease:"none",pow:1},turn:{min:0,dif:random(2,TWO_PI),terms:"ix",ease:"none",pow:2},children:[{num:int(24/t),type:"fan",mirror:!1,size:6,weight:4,step:{min:60,dif:180,terms:"ix*"+pick(1,2,3,4),ease:"hill",pow:random(-4,4)},turn:{min:0,dif:pick(1.78,3.14,6.28,8),terms:"ix"},children:[]},{num:int(18/t),type:"fan",mirror:!1,size:6,weight:4,step:{min:60,dif:0,terms:"ix*"+pick(1,2,3,4),ease:"hill",pow:random(-4,4)},turn:{min:0,dif:pick(1.78,3.14,6.28,8),terms:"ix"},children:[]}]}]}]};return console.log("GEN",e,PI/2+e,4*-e),o.net[0].pos=[width/2,height/2],console.log(width,height),o}function parseCurve(e,t){e.terms=e.terms||"ix";let o={};o.ease=e.ease||"none",o.pow=e.pow||2,o.min=e.min||0,o.dif=e.dif||0,o.dur=e.dur||0,o.base=0,o.time=0;let r=e.terms.split("+");for(let e of r){let r=e.split("*");if("t"==r[0]||"time"==r[0])o.time=r.length>1?parseFloat(r[1]):1;else if("tix"==r[0])o.time=r.length>1?t.nrm*parseFloat(r[1]):t.nrm;else{let e=1;for(let o of r)e*="ix"==o?t.nrm:"rnd"==o?t.rnd:"noise"==o?noise(t.parent.nrm,t.nrm):"dix"==o?t.parent.nrm:"drnd"==o?t.parent.rnd:"depth"==o?t.depth:"idepth"==o?t.graph.depth-t.depth:"depth-nrm"==o?1/t.graph.depth*t.depth:"idepth-nrm"==o?1-1/t.graph.depth*t.depth:parseFloat(o);o.base+=e}}return o}function moveNode(e){if(null!==e.anchor){let t=(null!=e.parent.anchor&&e.parent.mirror&&e.parent.anchor.ix%2==0)^(e.mirror&&e.parent.ix%2==0);e.rot=t?e.parent.rot-e.turn:e.parent.rot+e.turn,e.pos=[e.anchor.pos[0]+e.step*cos(e.rot),e.anchor.pos[1]+e.step*sin(e.rot)]}for(let t of e.groups)for(let e of t)moveNode(e)}function drawNode(e){null!=e.anchor&&line(e.anchor.pos[0],e.anchor.pos[1],e.pos[0],e.pos[1]),ellipse(e.pos[0],e.pos[1],10,10);for(let t of e.kids)drawNode(t)}class RenderCurves{constructor(e={}){let t=e.props.render||{};this.type=t.type||"tree",this.levels=t.levels||[{stroke:0,weight:1}];for(let e of this.levels)e.hasOwnProperty("type")||(e.type=this.type),e.hasOwnProperty("close")||(e.close=!1),e.hasOwnProperty("stroke")||(e.stroke=0),e.hasOwnProperty("fill")||(e.fill="#888888"),e.hasOwnProperty("weightAdd")||(e.weightAdd=0),e.hasOwnProperty("weightMult")||(e.weightMult=1),e.hasOwnProperty("sizeAdd")||(e.sizeAdd=0),e.hasOwnProperty("sizeMult")||(e.sizeMult=1)}render(e){for(let t of this.levels)this.renderNode(e,t)}renderNode(e,t){if(noFill(),noStroke(),"bezier"==t.type&&0==t.close){for(let o of e.groups)if(o.length>2)for(let e=1;e<o.length-1;e++){let r=[o[e-1].pos[0]+(o[e].pos[0]-o[e-1].pos[0])/2,o[e-1].pos[1]+(o[e].pos[1]-o[e-1].pos[1])/2,o[e].pos[0],o[e].pos[1],o[e].pos[0]+(o[e+1].pos[0]-o[e].pos[0])/2,o[e].pos[1]+(o[e+1].pos[1]-o[e].pos[1])/2];stroke("node"==t.stroke?o[e].stroke:t.stroke),strokeWeight(o[e].weight*t.weightMult+t.weightAdd),bezier(r[0],r[1],r[2],r[3],r[2],r[3],r[4],r[5])}}else if("bezier"==t.type&&1==t.close){for(let o of e.groups)if(o.length>2){fill(t.fill),beginShape();let e=[o[0].pos[0]+(o[o.length-1].pos[0]-o[0].pos[0])/2,o[0].pos[1]+(o[o.length-1].pos[1]-o[0].pos[1])/2];vertex(e[0],e[1]);for(let e=0;e<o.length;e++){let r=e==o.length-1?0:e+1,s=[o[e].pos[0]+(o[r].pos[0]-o[e].pos[0])/2,o[e].pos[1]+(o[r].pos[1]-o[e].pos[1])/2];fill("node"==t.fill?o[e].fill:t.fill),stroke("node"==t.stroke?o[e].stroke:t.stroke),strokeWeight(o[e].weight*t.weightMult+t.weightAdd),bezierVertex(o[e].pos[0],o[e].pos[1],o[e].pos[0],o[e].pos[1],s[0],s[1])}endShape()}}else if("polygon"==t.type){for(let o of e.groups)if(o.length>1){fill(t.fill),beginShape();for(let e=0;e<o.length;e++)stroke("node"==t.stroke?o[e].stroke:t.stroke),strokeWeight(o[e].weight*t.weightMult+t.weightAdd),vertex(o[e].pos[0],o[e].pos[1]);t.close?endShape(CLOSE):endShape()}}else if("tree"==t.type)for(let o of e.groups)for(let e=0;e<o.length;e++)stroke("node"==t.stroke?o[e].stroke:t.stroke),strokeWeight(o[e].weight*t.weightMult+t.weightAdd),line(o[e].anchor.pos[0],o[e].anchor.pos[1],o[e].pos[0],o[e].pos[1]);else if("circles"==t.type)for(let o of e.groups)for(let e=0;e<o.length;e++){let r=o[e].size*t.sizeMult+t.sizeAdd;fill("node"==t.fill?o[e].fill:t.fill),stroke("node"==t.stroke?o[e].stroke:t.stroke),strokeWeight(o[e].weight*t.weightMult+t.weightAdd),ellipse(o[e].pos[0],o[e].pos[1],r,r)}else if("star"==t.type){for(let o of e.groups)if(o.length>1){fill("node"==t.fill?o[k].fill:t.fill),beginShape(),vertex(o[0].pos[0],o[0].pos[1]);for(let r=1;r<(t.close?o.length+1:o.length);r++){let s=o[r%o.length];stroke("node"==t.stroke?s.stroke:t.stroke),strokeWeight(s.weight*t.weightMult+t.weightAdd),bezierVertex(e.pos[0],e.pos[1],e.pos[0],e.pos[1],s.pos[0],s.pos[1])}endShape()}}else if("umbrella"==t.type){for(let o of e.groups)if(o.length>1){fill("node"==t.fill?o[k].fill:t.fill),beginShape(),vertex(o[0].pos[0],o[0].pos[1]);for(let e=0;e<(t.close?o.length:o.length-1);e++){let r=o[(e+1)%o.length],s=[(r.pos[0]-o[e].pos[0])/2,(r.pos[1]-o[e].pos[1])/2],i=[o[e].pos[0]+s[0]-s[1],o[e].pos[1]+s[1]+s[0]];stroke("node"==t.stroke?o[e].stroke:t.stroke),strokeWeight(o[e].weight*t.weightMult+t.weightAdd),bezierVertex(i[0],i[1],i[0],i[1],r.pos[0],r.pos[1])}endShape()}}else if("snake"==t.type){for(let o of e.groups)if(o.length>1){fill("node"==t.fill?o[k].fill:t.fill),beginShape(),vertex(o[0].pos[0],o[0].pos[1]);for(let e=0;e<(t.close?o.length:o.length-1);e++){let r=o[(e+1)%o.length],s=[(r.pos[0]-o[e].pos[0])/2,(r.pos[1]-o[e].pos[1])/2],i=[o[e].pos[0]+s[0]-s[1],o[e].pos[1]+s[1]+s[0],o[e].pos[0]+s[0]+s[1],o[e].pos[1]+s[1]-s[0]];stroke("node"==t.stroke?o[e].stroke:t.stroke),strokeWeight(o[e].weight*t.weightMult+t.weightAdd),bezierVertex(i[0],i[1],i[2],i[3],r.pos[0],r.pos[1])}endShape()}}else if("petals"==t.type){for(let o of e.groups)if(o.length>2)for(let e=t.close?0:1;e<o.length;e++){let r=o[0==e?o.length-1:e-1],s=[(r.pos[0]-o[e].pos[0])/2,(r.pos[1]-o[e].pos[1])/2],i=[o[e].pos[0]+s[0]-s[1],o[e].pos[1]+s[1]+s[0],o[e].pos[0]+s[0]+s[1],o[e].pos[1]+s[1]-s[0]];stroke("node"==t.stroke?o[e].stroke:t.stroke),strokeWeight(o[e].weight*t.weightMult+t.weightAdd),fill("node"==t.fill?o[e].fill:t.fill),beginShape(),vertex(o[e].pos[0],o[e].pos[1]),vertex(i[0],i[1]),vertex(r.pos[0],r.pos[1]),vertex(i[2],i[3]),vertex(o[e].pos[0],o[e].pos[1]),endShape()}}else if("petal-chain"==t.type){for(let o of e.groups)if(o.length>2)for(let e=t.close?0:1;e<o.length;e++){let r=o[0==e?o.length-1:e-1],s=[(r.pos[0]-o[e].pos[0])/2,(r.pos[1]-o[e].pos[1])/2],i=[o[e].pos[0]+s[0]-s[1],o[e].pos[1]+s[1]+s[0],o[e].pos[0]+s[0]+s[1],o[e].pos[1]+s[1]-s[0]];stroke("node"==t.stroke?o[e].stroke:t.stroke),strokeWeight(o[e].weight*t.weightMult+t.weightAdd),fill("node"==t.fill?o[e].fill:t.fill),bezier(r.pos[0],r.pos[1],i[0],i[1],i[0],i[1],o[e].pos[0],o[e].pos[1]),bezier(o[e].pos[0],o[e].pos[1],i[2],i[3],i[2],i[3],r.pos[0],r.pos[1])}}else if("daisy"==t.type)for(let o of e.groups)if(o.length>2)for(let r=t.close?0:1;r<(t.close?o.length:o.length-1);r++){let s=o[0==r?o.length-1:r-1],i=o[(r+1)%o.length],n=[o[r].pos[0]+(s.pos[0]-o[r].pos[0])/2,o[r].pos[1]+(s.pos[1]-o[r].pos[1])/2,o[r].pos[0]+(i.pos[0]-o[r].pos[0])/2,o[r].pos[1]+(i.pos[1]-o[r].pos[1])/2];stroke("node"==t.stroke?o[r].stroke:t.stroke),strokeWeight(o[r].weight*t.weightMult+t.weightAdd),fill("node"==t.fill?o[r].fill:t.fill),bezier(e.pos[0],e.pos[1],n[0],n[1],n[0],n[1],o[r].pos[0],o[r].pos[1]),bezier(e.pos[0],e.pos[1],n[2],n[3],n[2],n[3],o[r].pos[0],o[r].pos[1])}for(let o of e.groups)for(let e of o)this.renderNode(e,t)}}
//# sourceMappingURL=maps/bundle-min.js.map
