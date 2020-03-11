var tickers = new Set();
var t = 0;
var seed;
var density;
var go = true;
var render;
var canvas, editor, area;

// pi/2 = 1.5707
// pi/3 = 1.047
// pi/4 = 0.7853
var graphs = [];

var def = {
    "props": {
        "render": "curves",
        "renderConfig": { "type": "petals", "levels": [['#FFCC0088', 8], ['rgba(255, 0, 0, 0.1)', 4]] }
    },
    "net": {
        "type": "fan", "num": 35, "pos": [ 500, 400 ], "ang": 0, "step": {"ease":"sine", "pow": -3, "terms": "noise*0.8+t*0.2", "min": 30, "max": 480, "dur": 200}, "turn": 6.28/35, "children": [
            //{ "type": "chain", "num": 3,  "step": 40, "turn": 0.5 }
        ]
    }
};



function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('container');
    background("#FFFFFF");
    //frameRate(30);
    stroke(0, 128);
    strokeWeight(3);
    //fill(0, 32);
    noFill();
    smooth();



    editor = select("#editor");
    area = select("#editor-area");
    let update = select("#update");
    update.mouseClicked( function(){ reset(true) } );
    let generate = select("#generate");
    generate.mouseClicked( function(){ reset(false) } );

    reset( false );

    console.log("setup");
}

function reset(fromEditor) {
  //let area = select("#editor-area");
  let _def;
  if(fromEditor) {
      _def = JSON.parse(area.value());
  } else {
      _def = generate();
  }
  //tickers.clear();
  background("#FFFFFF");
  t = 0;
  seed = int(random(999999));
  randomSeed(seed);
  noiseSeed(seed);

  graphs = [];
  //let _def = generate();
  var k = new Graph( _def );
  graphs.push(k);

  render = new RenderCurves(_def);

  //editor = select("#editor");

  area.value( JSON.stringify(_def, replacer, 2) );

  //text(defString, 20, 20);
}

function replacer(key, val) {
    if(typeof(val) == "number") return Math.floor(val*100)/100;
    return val;
}

function generate() {
    let budget = 200;
    let total = 0;
    let def = {
        props:{
            render: { type: "tree", levels: [ {stroke: 0, weight:16 }, {stroke:'#FFFFFF', weight:12}, {stroke: 0, weight:8 }, {stroke:'#FFFFFF', weight:4} ] }
            //"renderConfig": { "type": "tree", "levels": [[0, 8], ['#FFFFFF', 4]] }
        },
        net:[]
    };
    let dad = def.net;
    let dn = 1;

    while(total < budget*0.8) {
        let num = Math.floor( Math.pow(Math.random(), 2) * 10 ) + 2;
        while(total + dn*num > budget && num > 1) {
            num --;
            console.log(num, dn, total);
        }
        let neo = {
            num: num,
            type: Math.random() < 0.6 ? "fan" : "chain",
            step: { min:Math.random() * 120 + 30, dif:0 },
            turn: { min:PI/2, dif:(TWO_PI) },
            mirror: num % 2 == 0,
            children:[]
        };
        dad.push(neo);
        total += dn * num;

        if(Math.random() < 0.7) {
            console.log("child", num, dn, total);
            dad = neo.children;
            dn *= num;

        } else {
            console.log("sibling", num, dn, total);
        }
    }

    def.net[0].pos = [windowWidth/2, windowHeight/2];

    console.log(total, def);
    return def;
}

function draw() {
  if(go) {
      background("#FFFFFF");
      for(let g of graphs) {
          moveNode(g.root);
          //drawNode(g.root);
          render.render(g.root);
      }

      t++;
  }
}

function makeGroup(g, dad, graph) {
    //console.log("makeGroup", g);
    for(let i=0; i<g.num; i++) {
        let n = new Node();
        n.ix = i;
        n.nrm = g.num == 1 ? 0 : (1 / (g.num)) * i;
        n.parent = dad;
        n.parent.kids.push(n);
        n.depth = dad.depth+1;
        n.graph = graph;

        graph.count ++;
        graph.depth = Math.max(graph.depth, n.depth);
        //console.log(n);

        if(g.type == "chain" && i > 0) {
            n.anchor = n.parent.kids[i-1];
        } else {
            n.anchor = dad;
        }

        n.turn = isNaN(g.turn) ? parseCurve(g.turn, n) : g.turn;// n.parent.turn + g.turn * n.ix;
        n.rot = 0;
        n.step = isNaN(g.step) ? parseCurve(g.step, n) : g.step;

        if(g.children) {
            for(let j=0; j<g.children.length; j++) {
                makeGroup(g.children[j], n, graph);
            }
        }
    }
}


/***** GRAPH *****/
class Graph {
  constructor(args = {}) {
    this.ix = graphs.length;
    this.count = 0;
    this.depth = 0;

    this.root = new Node();
    for(let i=0; i<args.net.length; i++){
        makeGroup(args.net[i], this.root, this);
    }

    console.log("graph", this);
  }
}

/***** NODE *****/
class Node {
  constructor(args = {}) {
      //properties
      this.ix = args.ix || 0;
      this.nrm = args.nrm || 0;
      this.rnd = args.rnd || Math.random();
      this.pos = args.pos || [windowWidth/2, windowHeight/2];
      this.step = args.step || 30;
      this.turn = args.turn || 0;
      this.rot = args.rot || 0;
      this.mirrot = args.mirror || false;
      this.size = args.size || 20;
      this.weight = args.weight || 1;
      this.depth = args.depth || 0;

      // Node references
      this.graph = args.graph || null;
      this.parent = args.parent || null;
      this.anchor = args.anchor || null;
      this.kids = args.kids || [];
      
  }
}


function ease(type, t, p) {
    if(type == "simple") {
        return p < 0 ? 1 - Math.pow(1-t, Math.abs(p)) : Math.pow(t, Math.abs(p));
    } else if (type == "IO") {
        //if(t < 0.5) return easeSimple(t*2, p) * 0.5;
        //else return (1 - easeSimple(1-(t-0.5)*2, p)) * 0.5 + 0.5;
        if(t < 0.5) return (p < 0 ? 1 - Math.pow(1-t*2, Math.abs(p)) : Math.pow(t*2, Math.abs(p))) * 0.5;
        else return (1 - (p < 0 ? 1 - Math.pow(1-(1-(t-0.5)*2), Math.abs(p)) : Math.pow(1-(t-0.5)*2, Math.abs(p)))) * 0.5 + 0.5;
    } else if (type == "hill") {
        t = t < 0.5 ? t * 2 : 1 - (t-0.5)*2;
        return p < 0 ? 1 - Math.pow(1-t, Math.abs(p)) : Math.pow(t, Math.abs(p));
    } else if (type == "sine") {
        return Math.sin(t*p*Math.PI*2) * 0.5 + 0.5;
    } else if (type == "noise") {
        return noise(t*16);
    } else {
        return t;
    }

}


function mousePressed() {
  //pen.set(mouseX, mouseY);
}

function keyTyped() {
  if (document.activeElement === document.getElementById('editor-area')) return;

  if (key === ' ') {
    go = !go;
    console.log("go", go);
  } else if(key === 'r') {
    reset(false);
  } else if(key === 's') {
      let gt = getTime();
    saveCanvas("collider-"+ gt +".jpg");
    saveJSON(defs, "collider-"+ gt +".jpg", false);
  } else if(key === 'g') {
    generate();
  }  else if(key === 'e') {
      if(editor.style("display") == "block") editor.hide();
      else editor.show();
  }
  // uncomment to prevent any default behavior
  //return false;
}

function contrast(n, f) {
  return constrain(f*(n-0.5) + 0.5, 0, 1);
}

function getTime() {
  let now = new Date();
  return now.getFullYear().toString().substring(2,4) +
        (now.getMonth() + 1).toString().padStart(2, "0") +
        (now.getDate()).toString().padStart(2, "0") + "-" +
        (now.getHours()).toString().padStart(2, "0") +
        (now.getMinutes()).toString().padStart(2, "0") +
        (now.getSeconds()).toString().padStart(2, "0");
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  canvas.parent('container');
  background("#FFFFFF");
}
