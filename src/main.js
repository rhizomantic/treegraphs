var tickers = new Set();
var t = 0;
var seed;
var density;
var go = true;
var render;
var canvas, editor, area;
var tweenable = ["step", "turn", "size", "weight"];
var backCol = "#000000";

// pi/2 = 1.5707
// pi/3 = 1.047
// pi/4 = 0.7853
var graphs = [];

var def0 = {
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

var def = {
  "props": {
    "render": {
      "levels": [
        {
          "type": "tree",
          "stroke": "#00000088",
          "fill": "#00000033",
          "weightMult": 0,
          "weightAdd": 1
        }
      ]
    }
  },
  "net": [
    {
      "num": 4,
      "type": "fan",
      "mirror": true,
      "size": 72,
      "weight": 1,
      "step": 300,
      "turn": {
        "min": 0,
        "dif": 3.14,
        "terms": "ix"
      },
      "children": [
        {
          "num": 12,
          "type": "fan",
          "mirror": true,
          "size": 36,
          "weight": 1,
          "step": {
            "min": 30,
            "dif": 150,
            "terms": "tix",
            "ease": "none",
            "pow": 3,
            "dur": 200
          },
          "turn": {
            "min": 0,
            "dif": 3.14,
            "var": 1.04,
            "terms": "ix",
            "pow": 2,
            "dur": 200
          },
          "children": [
            /*{
              "num": 24,
              "type": "fan",
              "mirror": true,
              "size": 6,
              "weight": 1,
              "step": {
                "min": 100,
                "dif": 200,
                "terms": "t*0.5+ix*0.5",
                "ease": "hill",
                "pow": 3,
                "dur": 200
              },
              "turn": {
                "min": 0,
                "dif": 4.85,
                "terms": "ix"
              },
              "children": []
          }*/
          ]
        }
      ],
      "pos": [
        702.5,
        479
      ]
    }
  ]
};



function setup() {
    canvas = createCanvas(1080, 1080);//(windowWidth, windowHeight);
    canvas.parent('container');
    background(backCol);
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

    editor.hide();

    reset( false );

    console.log("setup");
}

function reset(fromEditor) {
  //let area = select("#editor-area");
  let _def;
  if(fromEditor) {
      _def = JSON.parse(area.value());
  } else {
      _def = generateSimple();
  }
  //tickers.clear();
  background(backCol);
  t = 0;
  seed = int(random(999999));
  randomSeed(seed);
  noiseSeed(seed);

  graphs = [];
  //let _def = generate();
  var k = new Graph( _def );
  graphs.push(k);

  area.value( JSON.stringify(_def, replacer, 2) );

  render = new RenderCurves(_def);

}

function replacer(key, val) {
    if(typeof(val) == "number") return Math.floor(val*100)/100;
    return val;
}



function draw() {
  if(go) {
      background(backCol);
      for(let g of graphs) {
          g.root.update();
          moveNode(g.root);
          render.render(g.root);
      }

      t++;

      //if(t == 200) reset();
  }
}

function makeGroup(gix, g, dad, graph) {
    //console.log("makeGroup", g);
    let group = [];
    for(let i=0; i<g.num; i++) {
        let n = new Node();
        group.push(n);
        n.ix = i;
        n.gix = gix;
        n.nrm = g.num == 1 ? 0 : (1 / (g.num)) * i;
        n.parent = dad;
        //n.parent.kids.push(n);
        n.depth = dad.depth+1;
        n.graph = graph;

        graph.count ++;
        graph.depth = Math.max(graph.depth, n.depth);
        //console.log(n);

        if(g.type == "chain" && i > 0) {
            n.anchor = group[i-1];// dad.kids[i-1];
        } else {
            n.anchor = dad;
        }

        //n.turn = isNaN(g.turn) ? parseCurve(g.turn, n) : g.turn;// n.parent.turn + g.turn * n.ix;
        //n.step = isNaN(g.step) ? parseCurve(g.step, n) : g.step;
        n.type = g.type;
        n.rot = 0;
        n.turn = g.turn;
        n.step = g.step;
        n.mirror = g.mirror;
        n.size = g.size;
        n.weight = g.weight;
        n.fill = g.fill;
        n.stroke = g.stroke;

        n.init();

        if(g.children) {
            for(let j=0; j<g.children.length; j++) {
                makeGroup(j, g.children[j], n, graph);
            }
        }
    }

    dad.groups.push(group);

}


/***** GRAPH *****/
class Graph {
  constructor(args = {}) {
    this.ix = graphs.length;
    this.count = 0;
    this.depth = 0;

    this.root = new Node( {pos: args.net[0].pos} );
    for(let i=0; i<args.net.length; i++){
        makeGroup(i, args.net[i], this.root, this);
    }
    this.root.init();

    console.log("graph", this);
  }
}

/***** NODE *****/
class Node {
    constructor(args = {}) {
        //properties
        this.ix = args.ix || 0;
        this.gix = args.gix || 0;
        this.nrm = args.nrm || 0;
        this.rnd = args.rnd || Math.random();
        this.pos = args.pos || [windowWidth / 2, windowHeight / 2];
        this.step = args.step || 30;
        this.turn = args.turn || 0;
        this.rot = args.rot || 0;
        this.mirror = args.mirror || false;
        this.size = args.size || 20;
        this.weight = args.weight || 1;
        this.depth = args.depth || 0;
        this.fill = args.fill || "#888888";
        this.stroke = args.stroke || 0;

        // Node references
        this.graph = args.graph || null;
        this.parent = args.parent || null;
        this.anchor = args.anchor || null;
        //this.kids = args.kids || [];
        this.groups = args.groups || [];

        this.curves = {};

    }

    init() {
        for (let tw of tweenable) {
            if (isNaN(this[tw])) {
                this.curves[tw] = parseCurve(this[tw], this);
            }
        }

        /*for(let k of this.kids) {
            k.init();
        }*/
        for(let g of this.groups) {
            for(let k of g) {
                k.init();
            }
        }
    }

    update() {
        for(let [prop, val] of Object.entries(this.curves)) {
            let x = val.base;
            //if(val.dur > 0) x += (1 / val.dur) * (t % (val.dur+1)) * val.time;
            if(val.dur > 0 && val.time > 0) { // come and go
                let ti = floor(t / (val.dur+1)) % 2 == 0 ? t % (val.dur+1) : (val.dur+1) - (t % (val.dur+1));
                x += (1 / val.dur) * ti + val.time;
            }
            //if(x > 1) x %= 1;
            if(x > 1) x = floor(x%2) == 0 ? x%1 : 1 - (x%1);
            //if(prop == "turn") console.log(this.ix, x);


            this[prop] = val.min + ease(val.ease, x, val.pow) * val.dif;
            //this[prop] = val.min + ease(val.ease, x, val.pow) * val.var * this.ix;
        }

        /*for(let k of this.kids) {
            k.update();
        }*/
        for(let g of this.groups) {
            for(let k of g) {
                k.update();
            }
        }
    }
}


function ease(type, x, p) {
    if(type == "simple") {
        return p < 0 ? 1 - Math.pow(1-x, Math.abs(p)) : Math.pow(x, Math.abs(p));
    } else if (type == "IO") {
        //if(t < 0.5) return easeSimple(t*2, p) * 0.5;
        //else return (1 - easeSimple(1-(t-0.5)*2, p)) * 0.5 + 0.5;
        if(x < 0.5) return (p < 0 ? 1 - Math.pow(1-x*2, Math.abs(p)) : Math.pow(x*2, Math.abs(p))) * 0.5;
        else return (1 - (p < 0 ? 1 - Math.pow(1-(1-(x-0.5)*2), Math.abs(p)) : Math.pow(1-(x-0.5)*2, Math.abs(p)))) * 0.5 + 0.5;
    } else if (type == "hill") {
        x = x < 0.5 ? x * 2 : 1 - (x-0.5)*2;
        return p < 0 ? 1 - Math.pow(1-x, Math.abs(p)) : Math.pow(x, Math.abs(p));
    } else if (type == "sine") {
        return Math.sin(x*p*Math.PI*2) * 0.5 + 0.5;
    } else if (type == "noise") {
        return noise(x*16);
    } else {
        return x;
    }

}

function pick(...opts) {
    return opts[floor(random(opts.length))];
}


function mousePressed() {
  //pen.set(mouseX, mouseY);
}

function keyTyped() {
    if (document.activeElement === document.getElementById('editor-area')) return;

    if (key === ' ') {
        go = !go;
        console.log("go", go);
    } else if (key === 'r') {
        reset(false);
    } else if (key === 's') {
        let gt = getTime();
        saveCanvas("TG-" + gt + ".jpg");
        //saveJSON(defs, "TG-" + gt + ".jpg", false);
    } else if (key === 'g') {
        generate();
    } else if (key === 'e') {
        if (editor.style("display") == "block") editor.hide();
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

/*function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  canvas.parent('container');
  background("#FFFFFF");
}*/
