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
                this.curves[tw] = this.parseCurve(this[tw]);
            }
        }


        for(let g of this.groups) {
            for(let k of g) {
                k.init();
            }
        }
    }

    parseCurve(c) {
        c.terms = c.terms || "ix";

        let out = {};
        out.ease = c.ease || "none";
        out.pow = c.pow || 2;
        out.min = c.min || 0;
        //out.max = c.max || 1;
        out.dif = c.dif || 0;
        //out.var = c.var || c.dif / n.parent.kids.length;
        out.dur = c.dur || 0;
        out.bounce = c.hasOwnProperty("bounce") ? c.bounce : false;

        if(out.ease == "noise") {
            out.noiseRad = c.noiseRad || 6;
            out.noiseZ = 'noiseZ' in c ? this.readTerm(c.noiseZ) : 1;
        }

        out.base = 0;
        out.time = 0;

        let ts = c.terms.split('+')
        for(let t of ts) {
            let ps = t.split('*');
            if(ps[0] == 't' || ps[0] == 'time') {
                out.time = ps.length > 1 ? parseFloat(ps[1]) : 1;
            } else if(ps[0] == 'tix') {
                out.time = ps.length > 1 ? this.nrm * parseFloat(ps[1]) : this.nrm;
            } else {
                /*let trm = 1;
                for(let p of ps) {
                    trm *= this.readTerm(p);
                }
                out.base += trm;*/
                out.base += this.readTerm(t);
            }
        }
        //console.log("curve", n.graph.depth, n.depth, (n.graph.depth == 1 ? 0 : 1/n.graph.depth * n.depth) );

        return out;
    }

    readTerm(term) {
        let ps = term.split('*');
        let o = 1;
        for(let p of ps) {
            if(p == "ix") o *= this.nrm;
            else if(p == "rnd") o *= this.rnd;
            else if(p == "dix") o *= this.parent.nrm;
            else if(p == "drnd") o *= this.parent.rnd;
            else if(p == "depth") o *= this.depth;
            else if(p == "idepth") o *= this.graph.depth - this.depth;
            else if(p == "depth-nrm") o *= 1/this.graph.depth * this.depth;
            else if(p == "idepth-nrm") o *= 1 - 1/this.graph.depth * this.depth;
            else o *= parseFloat(p);
        }

        return o;
    }

    update() {
        for(let [prop, val] of Object.entries(this.curves)) {
            let x = val.base;
            //if(val.dur > 0) x += (1 / val.dur) * (t % (val.dur+1)) * val.time;
            if(val.dur > 0 && val.time > 0) {
                let ti;
                if(val.bounce) ti = floor(t / (val.dur+1)) % 2 == 0 ? t % (val.dur+1) : (val.dur+1) - (t % (val.dur+1));
                else ti = t % (val.dur+1);
                x += (1 / val.dur) * ti + val.time;
                //if(ti == 20) console.log(val.bounce);
            }
            //if(x > 1) x %= 1;
            if(x > 1) x = floor(x%2) == 0 ? x%1 : 1 - (x%1);

            if(val.ease == "noise") {
                this[prop] = val.min + noise(val.noiseRad*cos(TWO_PI*x), val.noiseRad*sin(TWO_PI*x), val.noiseZ ) * val.dif;
            } else {
                this[prop] = val.min + ease(val.ease, x, val.pow) * val.dif;
            }

            //this[prop] = val.min + ease(val.ease, x, val.pow) * val.var * this.ix;
        }

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
    let baseNum = int(random(2,6));
    let def = {
    props:{
        render: { levels: [
            {type:"cousins", close:true, stroke: '#FFCC0099', fill: '#33333388', weightMult:0, weightAdd:1 },
            {type:"circles", stroke: '#FFFFFF88', fill: '#66666688'}
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
                                num:int(24/baseNum),
                                type:"fan",
                                mirror:false,
                                size: 26,
                                weight: 4,
                                step:{ min:60, dif:180, terms:"t", ease:"noise", pow:random(-4, 4), dur:2000, noiseRad:1, noiseZ:"dix"},
                                turn:{ min:0, dif:pick(1.78, 3.14, 6.28, 8), terms:"ix" },
                                //turn:{ min:0, dif:TWO_PI, terms:"ix" },
                                children:[

                                ]
                            },
                            {
                                num:int(18/baseNum),
                                type:"fan",
                                mirror:false,
                                size: 16,
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

/*function parseCurve(c, n) {
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
}*/

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

    /*for(let k of n.kids) {
        moveNode(k);
    }*/
    for(let g of n.groups) {
        for(let k of g) {
            moveNode(k);
        }
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
            if(! lv.hasOwnProperty("close")) lv.close = false;
            if(! lv.hasOwnProperty("stroke")) lv.stroke = 0;
            if(! lv.hasOwnProperty("fill")) lv.fill = "#888888";
            if(! lv.hasOwnProperty("weightAdd")) lv.weightAdd = 0;
            if(! lv.hasOwnProperty("weightMult")) lv.weightMult = 1;
            if(! lv.hasOwnProperty("sizeAdd")) lv.sizeAdd = 0;
            if(! lv.hasOwnProperty("sizeMult")) lv.sizeMult = 1;
        }

        //console.log("render type", this.type);
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

        if(level.type== "bezier" && level.close == false) {
            for(let g of n.groups) {
                if(g.length > 2) {
                    for(let k=1; k<g.length-1; k++) {
                        let ps = [
                            g[k-1].pos[0] + (g[k].pos[0] - g[k-1].pos[0]) / 2,
                            g[k-1].pos[1] + (g[k].pos[1] - g[k-1].pos[1]) / 2,
                            g[k].pos[0],
                            g[k].pos[1],
                            g[k].pos[0] + (g[k+1].pos[0] - g[k].pos[0]) / 2,
                            g[k].pos[1] + (g[k+1].pos[1] - g[k].pos[1]) / 2
                        ];
                        stroke(level.stroke == "node" ? g[k].stroke : level.stroke);
                        strokeWeight( g[k].weight * level.weightMult + level.weightAdd );
                        bezier(ps[0], ps[1], ps[2], ps[3], ps[2], ps[3], ps[4], ps[5]);
                    }
                }
            }
        } else if(level.type== "bezier" && level.close == true) {

            for(let g of n.groups) {
                if(g.length > 2) {
                    fill(level.fill);
                    beginShape();
                    let a = [ g[0].pos[0] + (g[g.length-1].pos[0] - g[0].pos[0]) / 2, g[0].pos[1] + (g[g.length-1].pos[1] - g[0].pos[1]) / 2 ];
                    vertex( a[0], a[1] );
                    for(let k=0; k<g.length; k++) {
                        let nxt = k==g.length-1 ? 0 : k+1;
                        let ps = [ g[k].pos[0] + (g[nxt].pos[0] - g[k].pos[0]) / 2, g[k].pos[1] + (g[nxt].pos[1] - g[k].pos[1]) / 2 ];
                        fill(level.fill == "node" ? g[k].fill : level.fill);
                        stroke(level.stroke == "node" ? g[k].stroke : level.stroke);
                        strokeWeight( g[k].weight * level.weightMult + level.weightAdd );
                        bezierVertex(g[k].pos[0], g[k].pos[1], g[k].pos[0], g[k].pos[1], ps[0], ps[1]);
                    }
                    //bezierVertex(g[g.length-1].pos[0], g[g.length-1].pos[1], g[g.length-1].pos[0], g[g.length-1].pos[1], a[0], a[1]);
                    endShape();
                }
            }
        } else if(level.type== "polygon") {
            // for(let g of n.groups) {
            //     fill(level.fill);
            //     if(g.length > 1) {
            //         for(let k=1; k<g.length; k++) {
            //             stroke(level.stroke == "node" ? g[k].stroke : level.stroke);
            //             strokeWeight( g[k].weight * level.weightMult + level.weightAdd );
            //             line(g[k-1].pos[0], g[k-1].pos[1], g[k].pos[0], g[k].pos[1]);
            //         }
            //     }
            // }
            for(let g of n.groups) {
                if(g.length > 1) {
                    fill(level.fill);
                    beginShape();
                    for(let k=0; k<g.length; k++) {
                        stroke(level.stroke == "node" ? g[k].stroke : level.stroke);
                        strokeWeight( g[k].weight * level.weightMult + level.weightAdd );
                        vertex(g[k].pos[0], g[k].pos[1]);
                    }
                    if(level.close) endShape(CLOSE);
                    else endShape();
                    //endShape();
                }
            }
        } else if(level.type== "tree") {
            for(let g of n.groups) {
                for(let k=0; k<g.length; k++) {
                    stroke(level.stroke == "node" ? g[k].stroke : level.stroke);
                    strokeWeight( g[k].weight * level.weightMult + level.weightAdd );
                    line(g[k].anchor.pos[0], g[k].anchor.pos[1], g[k].pos[0], g[k].pos[1]);
                    //if(t == 6) console.log(k, n.pos[0], n.pos[1], n.kids[k].pos[0], n.kids[k].pos[1]);
                }
            }
        } else if(level.type== "circles") {
            for(let g of n.groups) {
                for(let k=0; k<g.length; k++) {
                    let sz = g[k].size * level.sizeMult + level.sizeAdd;
                    fill(level.fill == "node" ? g[k].fill : level.fill);
                    stroke(level.stroke == "node" ? g[k].stroke : level.stroke);
                    strokeWeight( g[k].weight * level.weightMult + level.weightAdd );
                    ellipse( g[k].pos[0], g[k].pos[1], sz, sz);
                }
            }
        }  else if(level.type== "star") {
            for(let g of n.groups) {
                if(g.length > 1) {
                    fill(level.fill == "node" ? g[k].fill : level.fill);
                    beginShape();
                    vertex(g[0].pos[0], g[0].pos[1]);
                    for(let k=1; k<(level.close?g.length+1:g.length); k++) {
                        let nd = g[k%g.length];
                        stroke(level.stroke == "node" ? nd.stroke : level.stroke);
                        strokeWeight( nd.weight * level.weightMult + level.weightAdd );
                        bezierVertex(n.pos[0], n.pos[1], n.pos[0], n.pos[1], nd.pos[0], nd.pos[1]);
                    }
                    endShape();
                }
            }
        } else if(level.type== "umbrella") {
            for(let g of n.groups) {
                if(g.length > 1) {
                    fill(level.fill == "node" ? g[k].fill : level.fill);
                    beginShape();
                    vertex(g[0].pos[0], g[0].pos[1]);
                    for(let k=0; k<(level.close?g.length:g.length-1); k++) {
                        let nxt = g[(k+1) % g.length];
                        let hlf = [ (nxt.pos[0] - g[k].pos[0]) / 2, (nxt.pos[1] - g[k].pos[1]) / 2 ];
                        let anc = [ (g[k].pos[0] + hlf[0]) - hlf[1], (g[k].pos[1] + hlf[1]) + hlf[0] ];
                        stroke(level.stroke == "node" ? g[k].stroke : level.stroke);
                        strokeWeight( g[k].weight * level.weightMult + level.weightAdd );
                        bezierVertex(anc[0], anc[1], anc[0], anc[1], nxt.pos[0], nxt.pos[1]);
                    }
                    endShape();
                }
            }
        } else if(level.type== "snake") {
            for(let g of n.groups) {
                if(g.length > 1) {
                    fill(level.fill == "node" ? g[k].fill : level.fill);
                    beginShape();
                    vertex(g[0].pos[0], g[0].pos[1]);
                    for(let k=0; k<(level.close?g.length:g.length-1); k++) {
                        let nxt = g[(k+1) % g.length];
                        let hlf = [ (nxt.pos[0] - g[k].pos[0]) / 2, (nxt.pos[1] - g[k].pos[1]) / 2 ];
                        let anc = [
                            (g[k].pos[0] + hlf[0]) - hlf[1], (g[k].pos[1] + hlf[1]) + hlf[0],
                            (g[k].pos[0] + hlf[0]) + hlf[1], (g[k].pos[1] + hlf[1]) - hlf[0]
                        ];
                        stroke(level.stroke == "node" ? g[k].stroke : level.stroke);
                        strokeWeight( g[k].weight * level.weightMult + level.weightAdd );
                        bezierVertex(anc[0], anc[1], anc[2], anc[3], nxt.pos[0], nxt.pos[1]);
                    }
                    endShape();
                }
            }
        }  else if(level.type== "petals") {
            for(let g of n.groups) {
                if(g.length > 2) {
                    for(let k=(level.close?0:1); k<g.length; k++) {
                        let prv = g[k==0 ? g.length-1 : k-1];
                        let hlf = [ (prv.pos[0] - g[k].pos[0]) / 2, (prv.pos[1] - g[k].pos[1]) / 2 ];
                        let pts = [
                            (g[k].pos[0] + hlf[0]) - hlf[1], (g[k].pos[1] + hlf[1]) + hlf[0],
                            (g[k].pos[0] + hlf[0]) + hlf[1], (g[k].pos[1] + hlf[1]) - hlf[0]
                        ];
                        stroke(level.stroke == "node" ? g[k].stroke : level.stroke);
                        strokeWeight( g[k].weight * level.weightMult + level.weightAdd );
                        fill(level.fill == "node" ? g[k].fill : level.fill);
                        // bezier(pts[0], pts[1], prv.pos[0], prv.pos[1], prv.pos[0], prv.pos[1], pts[2], pts[3]);
                        // bezier(pts[0], pts[1], g[k].pos[0], g[k].pos[1], g[k].pos[0], g[k].pos[1], pts[2], pts[3]);
                        beginShape();
                        vertex(g[k].pos[0], g[k].pos[1]);
                        vertex(pts[0], pts[1]);
                        vertex(prv.pos[0], prv.pos[1]);
                        vertex(pts[2], pts[3]);
                        vertex(g[k].pos[0], g[k].pos[1]);
                        endShape();
                    }
                }
            }
        }  else if(level.type== "petal-chain") {
            for(let g of n.groups) {
                if(g.length > 2) {
                    for(let k=(level.close?0:1); k<g.length; k++) {
                        let prv = g[k==0 ? g.length-1 : k-1];
                        let hlf = [ (prv.pos[0] - g[k].pos[0]) / 2, (prv.pos[1] - g[k].pos[1]) / 2 ];
                        let pts = [
                            (g[k].pos[0] + hlf[0]) - hlf[1], (g[k].pos[1] + hlf[1]) + hlf[0],
                            (g[k].pos[0] + hlf[0]) + hlf[1], (g[k].pos[1] + hlf[1]) - hlf[0]
                        ];
                        stroke(level.stroke == "node" ? g[k].stroke : level.stroke);
                        strokeWeight( g[k].weight * level.weightMult + level.weightAdd );
                        fill(level.fill == "node" ? g[k].fill : level.fill);
                        bezier(prv.pos[0], prv.pos[1], pts[0], pts[1], pts[0], pts[1], g[k].pos[0], g[k].pos[1]);
                        bezier(g[k].pos[0], g[k].pos[1], pts[2], pts[3], pts[2], pts[3], prv.pos[0], prv.pos[1]);
                    }
                }
            }
        }  else if(level.type== "square-chain") {
            for(let g of n.groups) {
                if(g.length > 2) {
                    for(let k=(level.close?0:1); k<g.length; k++) {
                        let prv = g[k==0 ? g.length-1 : k-1];
                        let hlf = [ (prv.pos[0] - g[k].pos[0]) / 2, (prv.pos[1] - g[k].pos[1]) / 2 ];
                        let pts = [
                            (g[k].pos[0] + hlf[0]) - hlf[1], (g[k].pos[1] + hlf[1]) + hlf[0],
                            (g[k].pos[0] + hlf[0]) + hlf[1], (g[k].pos[1] + hlf[1]) - hlf[0]
                        ];
                        stroke(level.stroke == "node" ? g[k].stroke : level.stroke);
                        strokeWeight( g[k].weight * level.weightMult + level.weightAdd );
                        fill(level.fill == "node" ? g[k].fill : level.fill);
                        beginShape();
                        vertex(g[k].pos[0], g[k].pos[1]);
                        vertex(pts[0], pts[1]);
                        vertex(prv.pos[0], prv.pos[1]);
                        vertex(pts[2], pts[3]);
                        vertex(g[k].pos[0], g[k].pos[1]);
                        endShape();
                    }
                }
            }
        }  else if(level.type== "daisy") {
            for(let g of n.groups) {
                if(g.length > 2) {
                    for(let k=(level.close?0:1); k<(level.close?g.length:g.length-1); k++) {
                        let prv = g[k==0 ? g.length-1 : k-1];
                        let nxt = g[(k+1) % g.length];
                        let pts = [
                            g[k].pos[0] + (prv.pos[0] - g[k].pos[0]) / 2, g[k].pos[1] + (prv.pos[1] - g[k].pos[1]) / 2,
                            g[k].pos[0] + (nxt.pos[0] - g[k].pos[0]) / 2, g[k].pos[1] + (nxt.pos[1] - g[k].pos[1]) / 2
                        ];
                        stroke(level.stroke == "node" ? g[k].stroke : level.stroke);
                        strokeWeight( g[k].weight * level.weightMult + level.weightAdd );
                        fill(level.fill == "node" ? g[k].fill : level.fill);
                        bezier(n.pos[0], n.pos[1], pts[0], pts[1], pts[0], pts[1], g[k].pos[0], g[k].pos[1]);
                        bezier(n.pos[0], n.pos[1], pts[2], pts[3], pts[2], pts[3], g[k].pos[0], g[k].pos[1]);

                    }
                }
            }
        } else if(level.type== "cousins") {
            if(n.depth > 1){
                for(let g of n.groups) {
                    for(let k=0; k<g.length; k++) {
                        let siblings = n.parent.groups[n.gix];
                        //console.log(siblings);
                        let bro = siblings[(n.ix+1)%siblings.length];
                        let cou = bro.groups[g[k].gix][g[k].ix];

                        stroke(level.stroke == "node" ? g[k].stroke : level.stroke);
                        strokeWeight( g[k].weight * level.weightMult + level.weightAdd );
                        //line(g[k].pos[0], g[k].pos[1], cou.pos[0], cou.pos[1]);
                        //bezier(g[k].pos[0], g[k].pos[1], g[k].anchor.pos[0], g[k].anchor.pos[1], cou.anchor.pos[0], cou.anchor.pos[1], cou.pos[0], cou.pos[1]);
                        bezier(g[k].anchor.pos[0], g[k].anchor.pos[1], g[k].pos[0], g[k].pos[1], cou.pos[0], cou.pos[1], cou.anchor.pos[0], cou.anchor.pos[1]);

                    }
                }
            }
        } else if(level.type== "squares") {
            for(let g of n.groups) {
                for(let k=0; k<g.length; k++) {
                    let sz = g[k].size * level.sizeMult + level.sizeAdd;
                    let cs = cos(g[k].rot), sn = sin(g[k].rot);
                    let pts = [
                        g[k].pos[0]+sz*cs, g[k].pos[1]+sz*sn,
                        g[k].pos[0]-sz*sn, g[k].pos[1]+sz*cs,
                        g[k].pos[0]-sz*cs, g[k].pos[1]-sz*sn,
                        g[k].pos[0]+sz*sn, g[k].pos[1]-sz*cs


                    ]
                    fill(level.fill == "node" ? g[k].fill : level.fill);
                    stroke(level.stroke == "node" ? g[k].stroke : level.stroke);
                    strokeWeight( g[k].weight * level.weightMult + level.weightAdd );
                    beginShape();
                    //vertex(g[k].pos[0], g[k].pos[1]);
                    vertex(pts[0], pts[1]);
                    vertex(pts[2], pts[3]);
                    vertex(pts[4], pts[5]);
                    vertex(pts[6], pts[7]);
                    vertex(pts[0], pts[1]);
                    endShape();
                }
            }
        } else if(level.type== "debug") {
            for(let g of n.groups) {
                for(let k=0; k<g.length; k++) {
                    fill(level.fill == "node" ? g[k].fill : level.fill);
                    text("ix"+g[k].ix+" gid"+g[k].gix, g[k].pos[0], g[k].pos[1]);

                }
            }

        }



        /*for(let k of n.kids) {
            this.renderNode(k, level);
        }*/
        for(let g of n.groups) {
            for(let k of g) {
                this.renderNode(k, level);
            }
        }
    }
}

//# sourceMappingURL=maps/bundle.js.map
