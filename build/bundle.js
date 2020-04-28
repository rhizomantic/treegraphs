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

    this.root = new Node( {pos: args.net[0].pos} );
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

function generateWithBudget() {
    let budget = 200;
    let total = 0;
    let angles = [PI/2, PI, PI*2];
    let def = {
        props:{
            render: { levels: [
                {type:"tree", stroke: '#999999', weightMult:0, weightAdd:1 },
                {type:"bezier", stroke: '#00000088', weightAdd:4 },
                {type:"bezier", stroke:'#FFFFFF88', weight:0} ]
            }
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
            turn: { min:PI/2, dif:angles[Math.floor(random(angles.length))] },
            mirror: num % 2 == 0,
            weight: { min:2, dif:2, terms:"depth" },
            size: { min:10, dif:40, terms:"depth" },
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

function generateSimple() {
    let a1 = random(0.1, PI/2);//PI/2;
    let baseNum = int(random(4,8));
    let def = {
    props:{
        render: { levels: [
            {type:"daisy", stroke: '#FFFFFFCC', fill: '#000000FF', weightMult:0, weightAdd:2 },
            //{type:"circles", stroke: '#00000088', fill: '#00000011'}
        ] }
    },
    net:[
            {
                num:baseNum,
                type:"fan",
                mirror:true,
                size: 72,
                weight: 0,
                step: 120,
                //turn:{ min:PI/2+a1, dif:-a1*4, terms:"ix" },
                turn:{ min:0, dif:TWO_PI, terms:"ix" },
                children:[
                    {
                        num:baseNum,
                        type:"fan",
                        mirror:baseNum%2 == 0 ? random(1) < 0.5 : false,
                        size: 36,
                        weight: 8,
                        step:{ min:180, dif:0, terms:"ix", ease:"none", pow:1 },
                        turn:{ min:0, dif:random(2, TWO_PI), terms:"ix", ease:"none", pow:2 },
                        //turn:{ min:0, dif:TWO_PI, terms:"ix" },
                        children:[
                            {
                                num:int(32/baseNum),
                                type:"fan",
                                mirror:false,
                                size: 6,
                                weight: 4,
                                step:{ min:60, dif:180, terms:"ix*"+pick(1,2,3,4), ease:"hill", pow:random(-4, 4)},
                                turn:{ min:0, dif:pick(1.78, 3.14, 6.28, 8), terms:"ix" },
                                //turn:{ min:0, dif:TWO_PI, terms:"ix" },
                                children:[

                                ]
                            },
                            {
                                num:int(16/baseNum),
                                type:"fan",
                                mirror:false,
                                size: 6,
                                weight: 4,
                                step:{ min:60, dif:0, terms:"ix*"+pick(1,2,3,4), ease:"hill", pow:random(-4, 4)},
                                turn:{ min:0, dif:pick(1.78, 3.14, 6.28, 8), terms:"ix" },
                                //turn:{ min:0, dif:TWO_PI, terms:"ix" },
                                children:[

                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    };

    console.log("GEN", a1, PI/2+a1, -a1*4 );

    def.net[0].pos = [width/2, height/2];
    console.log(width, height);
    return def;

}

function parseCurve(c, n) {
    c.terms = c.terms || "ix";

    let out = {};
    out.ease = c.ease || "none";
    out.pow = c.pow || 2;
    out.min = c.min || 0;
    //out.max = c.max || 1;
    out.dif = c.dif || 0;
    //out.var = c.var || c.dif / n.parent.kids.length;
    out.dur = c.dur || 0;

    out.base = 0;
    out.time = 0;

    let ts = c.terms.split('+')
    for(let t of ts) {
        let ps = t.split('*');
        if(ps[0] == 't' || ps[0] == 'time') {
            out.time = ps.length > 1 ? parseFloat(ps[1]) : 1;
        } else if(ps[0] == 'tix') {
            out.time = ps.length > 1 ? n.nrm * parseFloat(ps[1]) : n.nrm;
        } else {
            let trm = 1;
            for(let p of ps) {
                if(p == "ix") trm *= n.nrm;
                else if(p == "rnd") trm *= n.rnd;
                else if(p == "noise") trm *= noise(n.parent.nrm, n.nrm);
                else if(p == "dix") trm *= n.parent.nrm;
                else if(p == "drnd") trm *= n.parent.rnd;
                else if(p == "depth") trm *= n.depth;
                else if(p == "idepth") trm *= n.graph.depth - n.depth;
                else if(p == "depth-nrm") trm *= 1/n.graph.depth * n.depth;
                else if(p == "idepth-nrm") trm *= 1 - 1/n.graph.depth * n.depth;
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
            if(! lv.hasOwnProperty("weightAdd")) lv.weightAdd = 0;
            if(! lv.hasOwnProperty("weightMult")) lv.weightMult = 1;
            if(! lv.hasOwnProperty("sizeAdd")) lv.sizeAdd = 0;
            if(! lv.hasOwnProperty("sizeMult")) lv.sizeMult = 1;
        }

        console.log("render type", this.type);
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

        noFill();
        noStroke();

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
                    strokeWeight( n.kids[k].weight * level.weightMult + level.weightAdd );
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
                    strokeWeight( n.kids[k].weight * level.weightMult + level.weightAdd );
                    bezier(ps[0], ps[1], ps[2], ps[3], ps[2], ps[3], ps[4], ps[5]);
                }
            }
        } else if(level.type== "polygon") {
            if(n.kids.length > 1) {
                for(let k=1; k<n.kids.length; k++) {
                    stroke(level.stroke == "node" ? n.kids[k].stroke : level.stroke);
                    strokeWeight( n.kids[k].weight * level.weightMult + level.weightAdd );
                    line(n.kids[k-1].pos[0], n.kids[k-1].pos[1], n.kids[k].pos[0], n.kids[k].pos[1]);
                }
            }
        } else if(level.type== "tree") {
            for(let k=0; k<n.kids.length; k++) {
                stroke(level.stroke == "node" ? n.kids[k].stroke : level.stroke);
                strokeWeight( n.kids[k].weight * level.weightMult + level.weightAdd );
                line(n.kids[k].anchor.pos[0], n.kids[k].anchor.pos[1], n.kids[k].pos[0], n.kids[k].pos[1]);
                //if(t == 6) console.log(k, n.pos[0], n.pos[1], n.kids[k].pos[0], n.kids[k].pos[1]);
            }
        } else if(level.type== "circles") {
            for(let k=0; k<n.kids.length; k++) {
                let sz = n.kids[k].size * level.sizeMult + level.sizeAdd;
                fill(level.fill == "node" ? n.kids[k].fill : level.fill);
                stroke(level.stroke == "node" ? n.kids[k].stroke : level.stroke);
                strokeWeight( n.kids[k].weight * level.weightMult + level.weightAdd );
                ellipse( n.kids[k].pos[0], n.kids[k].pos[1], sz, sz);
            }
        }  else if(level.type== "star") {
            if(n.kids.length > 1) {
                for(let k=1; k<n.kids.length; k++) {
                    stroke(level.stroke == "node" ? n.kids[k].stroke : level.stroke);
                    strokeWeight( n.kids[k].weight * level.weightMult + level.weightAdd );
                    bezier(n.kids[k-1].pos[0], n.kids[k-1].pos[1], n.pos[0], n.pos[1], n.pos[0], n.pos[1], n.kids[k].pos[0], n.kids[k].pos[1]);
                }
            }
        } else if(level.type== "umbrella") {
            if(n.kids.length > 1) {
                for(let k=1; k<n.kids.length; k++) {
                    let hlf = [ (n.kids[k-1].pos[0] - n.kids[k].pos[0]) / 2, (n.kids[k-1].pos[1] - n.kids[k].pos[1]) / 2 ];
                    let anc = [ (n.kids[k].pos[0] + hlf[0]) - hlf[1], (n.kids[k].pos[1] + hlf[1]) + hlf[0] ];
                    stroke(level.stroke == "node" ? n.kids[k].stroke : level.stroke);
                    strokeWeight( n.kids[k].weight * level.weightMult + level.weightAdd );
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
                    stroke(level.stroke == "node" ? n.kids[k].stroke : level.stroke);
                    strokeWeight( n.kids[k].weight * level.weightMult + level.weightAdd );
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
                    stroke(level.stroke == "node" ? n.kids[k].stroke : level.stroke);
                    strokeWeight( n.kids[k].weight * level.weightMult + level.weightAdd );
                    fill(level.fill == "node" ? n.kids[k].fill : level.fill);
                    bezier(pts[0], pts[1], n.kids[k-1].pos[0], n.kids[k-1].pos[1], n.kids[k-1].pos[0], n.kids[k-1].pos[1], pts[2], pts[3]);
                    bezier(pts[0], pts[1], n.kids[k].pos[0], n.kids[k].pos[1], n.kids[k].pos[0], n.kids[k].pos[1], pts[2], pts[3]);

                }
            }
        }  else if(level.type== "daisy") {
            if(n.kids.length > 2) {
                for(let k=1; k<n.kids.length-1; k++) {
                    let pts = [
                        n.kids[k].pos[0] + (n.kids[k-1].pos[0] - n.kids[k].pos[0]) / 2, n.kids[k].pos[1] + (n.kids[k-1].pos[1] - n.kids[k].pos[1]) / 2,
                        n.kids[k].pos[0] + (n.kids[k+1].pos[0] - n.kids[k].pos[0]) / 2, n.kids[k].pos[1] + (n.kids[k+1].pos[1] - n.kids[k].pos[1]) / 2
                    ];
                    stroke(level.stroke == "node" ? n.kids[k].stroke : level.stroke);
                    strokeWeight( n.kids[k].weight * level.weightMult + level.weightAdd );
                    fill(level.fill == "node" ? n.kids[k].fill : level.fill);
                    bezier(n.pos[0], n.pos[1], pts[0], pts[1], pts[0], pts[1], n.kids[k].pos[0], n.kids[k].pos[1]);
                    bezier(n.pos[0], n.pos[1], pts[2], pts[3], pts[2], pts[3], n.kids[k].pos[0], n.kids[k].pos[1]);

                }
            }
        }


        for(let k of n.kids) {
            this.renderNode(k, level);
        }
    }
}

//# sourceMappingURL=maps/bundle.js.map
