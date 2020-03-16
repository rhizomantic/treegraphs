var tickers = new Set();
var t = 0;
var seed;
var density;
var go = true;
var render;
var canvas, editor, area;
var tweenable = ["step", "turn", "size", "weight"];

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
      "type": "tree",
      "levels": [
        {
          "type": "circles",
          "size": 1.2,
          "fill": "#666666",
          "stroke": 0,
          "weight": 1
        },
        {
          "type": "circles",
          "size": 1,
          "fill": "#FFFFFF",
          "stroke": 0,
          "weight": 1
        },
        {
          "stroke": 0,
          "weight": 1.5,
          "type": "tree",
          "fill": "#888888",
          "size": 1
        },
        {
          "stroke": "#FFFFFF",
          "weight": 1,
          "type": "tree",
          "fill": "#888888",
          "size": 1
        }
      ]
    }
  },
  "net": [
    {
      "num": 2,
      "type": "fan",
      "step": {
        "min": 124.75,
        "dif": 0,
        "terms": "ix"
      },
      "turn": {
        "min": 1.57,
        "dif": 6.28,
        "terms": "ix"
      },
      "mirror": false,
      "weight": 2,
      "size": {
        "min": 10,
        "dif": 40,
        "terms": "depth"
      },
      "children": [
        {
          "num": 3,
          "type": "fan",
          "step": {
            "min": 142.94,
            "dif": 0,
            "terms": "ix"
          },
          "turn": {
            "min": 1.57,
            "dif": 6.28,
            "terms": "ix"
          },
          "mirror": false,
          "weight": 2,
          "size": {
            "min": 10,
            "dif": 40,
            "terms": "depth"
          },
          "children": [
            {
              "num": 4,
              "type": "fan",
              "step": {
                "min": 51.87,
                "dif": 0,
                "terms": "ix"
              },
              "turn": {
                "min": 1.57,
                "dif": 6.28,
                "terms": "ix"
              },
              "mirror": false,
              "weight": 2,
              "size": {
                "min": 10,
                "dif": 40,
                "terms": "depth"
              },
              "children": []
            }
          ]
        }
      ],
      "pos": [
        702.5,
        503.5
      ]
    }
  ]
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
      _def = def;// generate();
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

}

function replacer(key, val) {
    if(typeof(val) == "number") return Math.floor(val*100)/100;
    return val;
}

function generate() {
    let budget = 20;
    let total = 0;
    let def = {
        props:{
            render: { type: "tree", levels: [ {type: "circles", size: 1.2, fill:"#666666" }, {type: "circles", size: 1, fill:"#FFFFFF" }, {stroke: 0, weight:1.5 }, {stroke:'#FFFFFF', weight:1} ] }
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
            //console.log(num, dn, total);
        }
        let neo = {
            num: num,
            type: Math.random() < 0.6 ? "fan" : "chain",
            step: { min:Math.random() * 120 + 30, dif:0 },
            turn: { min:PI/2, dif:(TWO_PI) },
            mirror: num % 2 == 0,
            weight: 2,
            size: { min:10, dif:40, terms:"depth"},
            children:[]
        };
        dad.push(neo);
        total += dn * num;

        if(Math.random() < 0.7) {
            //console.log("child", num, dn, total);
            dad = neo.children;
            dn *= num;

        } else {
            //console.log("sibling", num, dn, total);
        }
    }

    def.net[0].pos = [windowWidth/2, windowHeight/2];

    //console.log(total, def);
    return def;
}

function draw() {
  if(go) {
      background("#FFFFFF");
      for(let g of graphs) {
          g.root.update();
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
            n.anchor = dad.kids[i-1];
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
    this.root.init();

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
        this.kids = args.kids || [];

        this.curves = {};

    }

    init() {
        for (let tw of tweenable) {
            if (isNaN(this[tw])) {
                this.curves[tw] = parseCurve(this[tw], this);
            }
        }

        for(let k of this.kids) {
            k.init();
        }
    }

    update() {
        for(let [prop, val] of Object.entries(this.curves)) {
            let x = val.base;
            if(val.dur > 0) x += (1 / val.dur) * (t % (val.dur+1)) * val.time;
            if(x > 1) x %= 1;
            this[prop] = val.min + ease(val.ease, x, val.pow) * val.dif;
        }

        for(let k of this.kids) {
            k.update();
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
        saveCanvas("collider-" + gt + ".jpg");
        saveJSON(defs, "collider-" + gt + ".jpg", false);
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

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  canvas.parent('container');
  background("#FFFFFF");
}

function parseCurve(c, n) {
    c.terms = c.terms || "ix";

    let out = {};
    out.ease = c.ease || "none";
    out.pow = c.pow || 2;
    out.min = c.min || 0;
    //out.max = c.max || 1;
    out.dif = c.dif || 0;
    out.dur = c.dur || 0;

    out.base = 0;
    out.time = 0;

    let ts = c.terms.split('+')
    for(let t of ts) {
        let ps = t.split('*');
        if(ps[0] == 't' || ps[0] == 'time') {
            out.time = ps.length > 1 ? parseFloat(ps[1]) : 1;
        } else {
            let trm = 1;
            for(let p of ps) {
                if(p == "ix") trm *= n.nrm;
                else if(p == "rnd") trm *= n.rnd;
                else if(p == "noise") trm *= noise(n.parent.nrm, n.nrm);
                else if(p == "dix") trm *= n.parent.nrm;
                else if(p == "drnd") trm *= n.parent.rnd;
                else if(p == "depth") trm *= n.graph.depth == 1 ? 0 : 1/n.graph.depth * n.depth;
                else if(p == "idepth") trm *= n.graph.depth == 1 ? 1 : 1 - 1/n.graph.depth * n.depth;
                else trm *= parseFloat(p);
            }
            out.base += trm;
        }
    }
    //console.log("curve", n.graph.depth, n.depth, (n.graph.depth == 1 ? 0 : 1/n.graph.depth * n.depth) );

    return out;
}

function moveNode(n) {
    if(n.anchor !== null) {
        //let trn = n.parent.rot + n.turn;

        let _mirror = (n.parent.anchor != null && n.parent.mirror && n.parent.anchor.ix%2 == 0) ^ ( n.mirror && n.parent.ix%2 == 0);

        n.rot = _mirror? n.parent.rot - n.turn : n.parent.rot + n.turn;

        n.pos = [
            n.anchor.pos[0] + n.step * cos(n.rot),
            n.anchor.pos[1] + n.step * sin(n.rot)
        ]

        //if(t == 5) console.log(n.depth, n.ix, n.step, n.rot);
    }

    for(let k of n.kids) {
        moveNode(k);
    }
}

/*function moveNode(n) {
    if(n.anchor !== null) {
        let trn;
        if(isNaN(n.turn)) {
            let x = n.turn.base;
            if(n.turn.dur > 0) x += (1 / n.turn.dur) * (t % (n.turn.dur+1)) * n.turn.time;
            x %= 1;
            trn = n.parent.rot + (n.turn.min + ease(n.turn.ease, x, n.turn.pow) * n.turn.dif);
            //if(n.parent.ix == 1) console.log(n.ix, n.parent.rot, n.turn.min, n.turn.ease, n.turn.pow, n.turn.dif);
        } else {
            trn = n.parent.rot + n.turn * n.ix;
        }
        let _mirror = int(n.parent.anchor != null && n.parent.mirror && n.parent.anchor.ix%2 == 0) ^ int( n.mirror && n.parent.ix%2 == 0);

        n.rot = _mirror? n.parent.rot - trn : n.parent.rot + trn;
        //n.rot %= (Math.PI*2);

        let stp;
        if(isNaN(n.step)) {
            let x = n.step.base;
            if(n.step.dur > 0) x += (1 / n.step.dur) * (t % (n.step.dur+1)) * n.step.time;
            x %= 1;
            stp = n.step.min + ease(n.step.ease, x, n.step.pow) * n.step.dif;
            //if(n.parent.ix == 1) console.log(n.ix, stp, n.step.dif);
        } else {
            stp = n.step;
        }
        //console.log(n.ix, (0.999 / n.step.dur) * (t % (n.step.dur+1)) * n.step.time);

        n.pos = [
            n.anchor.pos[0] + stp * cos(n.rot),
            n.anchor.pos[1] + stp * sin(n.rot)
        ]
    }

    for(let k of n.kids) {
        moveNode(k);
    }
}*/


function drawNode(n) {
    if(n.anchor != null) line(n.anchor.pos[0], n.anchor.pos[1], n.pos[0], n.pos[1]);
    ellipse(n.pos[0], n.pos[1], 10, 10);

    for(let k of n.kids) {
        drawNode(k);
    }
}

class RenderCurves {
    constructor(df = {}) {
        let args = df.props.render || {};

        this.type= args.type || "tree";
        this.levels = args.levels || [{stroke:0, weight:1}];
        for(let lv of this.levels) {
            if(! lv.hasOwnProperty("type")) lv.type = this.type;
            if(! lv.hasOwnProperty("stroke")) lv.stroke = 0;
            if(! lv.hasOwnProperty("fill")) lv.fill = "#888888";
            if(! lv.hasOwnProperty("weight")) lv.weight = 1;
            if(! lv.hasOwnProperty("size")) lv.size = 1;
        }

        //console.log("levels", this.levels)
    }

    render(n) {
        for(let lv of this.levels) {
            //stroke( lv[0] );
            //strokeWeight( lv[1] || 1 );
            //strokeWeight( (n.depth) * lv[1]);
            //console.log(n.depth, lv[1]);
            //fill(192);
            this.renderNode(n, lv);
        }
    }

    renderNode(n, level) {


        if(level.type== "bezier") {
            if(n.kids.length > 2) {
                for(let k=1; k<n.kids.length-1; k++) {
                    let ps = [
                        n.kids[k-1].pos[0] + (n.kids[k].pos[0] - n.kids[k-1].pos[0]) / 2,
                        n.kids[k-1].pos[1] + (n.kids[k].pos[1] - n.kids[k-1].pos[1]) / 2,
                        n.kids[k].pos[0],
                        n.kids[k].pos[1],
                        n.kids[k].pos[0] + (n.kids[k+1].pos[0] - n.kids[k].pos[0]) / 2,
                        n.kids[k].pos[1] + (n.kids[k+1].pos[1] - n.kids[k].pos[1]) / 2
                    ];
                    stroke(level.stroke == "node" ? n.kids[k].stroke : level.stroke);
                    strokeWeight( n.kids[k].weight * level.weight );
                    bezier(ps[0], ps[1], ps[2], ps[3], ps[2], ps[3], ps[4], ps[5]);
                }
            }
        } else if(level.type== "bezier-closed") {
            if(n.kids.length > 2) {
                for(let k=0; k<n.kids.length; k++) {
                    let prv = k==0 ? n.kids.length-1 : k-1;
                    let nxt = k==n.kids.length-1 ? 0 : k+1;
                    let ps = [
                        n.kids[prv].pos[0] + (n.kids[k].pos[0] - n.kids[prv].pos[0]) / 2,
                        n.kids[prv].pos[1] + (n.kids[k].pos[1] - n.kids[prv].pos[1]) / 2,
                        n.kids[k].pos[0],
                        n.kids[k].pos[1],
                        n.kids[k].pos[0] + (n.kids[nxt].pos[0] - n.kids[k].pos[0]) / 2,
                        n.kids[k].pos[1] + (n.kids[nxt].pos[1] - n.kids[k].pos[1]) / 2
                    ];
                    stroke(level.stroke == "node" ? n.kids[k].stroke : level.stroke);
                    strokeWeight( n.kids[k].weight * level.weight );
                    bezier(ps[0], ps[1], ps[2], ps[3], ps[2], ps[3], ps[4], ps[5]);
                }
            }
        } else if(level.type== "polygon") {
            if(n.kids.length > 1) {
                for(let k=1; k<n.kids.length; k++) {
                    stroke(level.stroke == "node" ? n.kids[k].stroke : level.stroke);
                    strokeWeight( n.kids[k].weight * level.weight );
                    line(n.kids[k-1].pos[0], n.kids[k-1].pos[1], n.kids[k].pos[0], n.kids[k].pos[1]);
                }
            }
        } else if(level.type== "tree") {
            for(let k=0; k<n.kids.length; k++) {
                stroke(level.stroke == "node" ? n.kids[k].stroke : level.stroke);
                strokeWeight( n.kids[k].weight * level.weight );
                line(n.kids[k].anchor.pos[0], n.kids[k].anchor.pos[1], n.kids[k].pos[0], n.kids[k].pos[1]);
                //if(t == 6) console.log(k, n.pos[0], n.pos[1], n.kids[k].pos[0], n.kids[k].pos[1]);
            }
        } else if(level.type== "circles") {
            for(let k=0; k<n.kids.length; k++) {
                let sz = n.kids[k].size * level.size;
                fill(level.fill == "node" ? n.kids[k].fill : level.fill);
                noStroke();
                ellipse( n.kids[k].pos[0], n.kids[k].pos[1], sz, sz);
            }
        }  else if(level.type== "star") {
            if(n.kids.length > 1) {
                for(let k=1; k<n.kids.length; k++) {
                    bezier(n.kids[k-1].pos[0], n.kids[k-1].pos[1], n.pos[0], n.pos[1], n.pos[0], n.pos[1], n.kids[k].pos[0], n.kids[k].pos[1]);
                }
            }
        } else if(level.type== "umbrella") {
            if(n.kids.length > 1) {
                for(let k=1; k<n.kids.length; k++) {
                    let hlf = [ (n.kids[k-1].pos[0] - n.kids[k].pos[0]) / 2, (n.kids[k-1].pos[1] - n.kids[k].pos[1]) / 2 ];
                    let anc = [ (n.kids[k].pos[0] + hlf[0]) - hlf[1], (n.kids[k].pos[1] + hlf[1]) + hlf[0] ];
                    bezier(n.kids[k].pos[0], n.kids[k].pos[1], anc[0], anc[1], anc[0], anc[1], n.kids[k-1].pos[0], n.kids[k-1].pos[1]);
                }
            }
        } else if(level.type== "snake") {
            if(n.kids.length > 1) {
                for(let k=1; k<n.kids.length; k++) {
                    let hlf = [ (n.kids[k-1].pos[0] - n.kids[k].pos[0]) / 2, (n.kids[k-1].pos[1] - n.kids[k].pos[1]) / 2 ];
                    let anc = [
                        (n.kids[k].pos[0] + hlf[0]) - hlf[1], (n.kids[k].pos[1] + hlf[1]) + hlf[0],
                        (n.kids[k].pos[0] + hlf[0]) + hlf[1], (n.kids[k].pos[1] + hlf[1]) - hlf[0]
                    ];
                    bezier(n.kids[k].pos[0], n.kids[k].pos[1], anc[0], anc[1], anc[2], anc[3], n.kids[k-1].pos[0], n.kids[k-1].pos[1]);
                }
            }
        }  else if(level.type== "petals") {
            if(n.kids.length > 1) {
                for(let k=1; k<n.kids.length; k++) {
                    let hlf = [ (n.kids[k-1].pos[0] - n.kids[k].pos[0]) / 2, (n.kids[k-1].pos[1] - n.kids[k].pos[1]) / 2 ];
                    let pts = [
                        (n.kids[k].pos[0] + hlf[0]) - hlf[1], (n.kids[k].pos[1] + hlf[1]) + hlf[0],
                        (n.kids[k].pos[0] + hlf[0]) + hlf[1], (n.kids[k].pos[1] + hlf[1]) - hlf[0]
                    ];
                    bezier(pts[0], pts[1], n.kids[k-1].pos[0], n.kids[k-1].pos[1], n.kids[k-1].pos[0], n.kids[k-1].pos[1], pts[2], pts[3]);
                    bezier(pts[0], pts[1], n.kids[k].pos[0], n.kids[k].pos[1], n.kids[k].pos[0], n.kids[k].pos[1], pts[2], pts[3]);

                }
            }
        }


        for(let k of n.kids) {
            this.renderNode(k, level);
        }
    }
}

//# sourceMappingURL=maps/bundle.js.map