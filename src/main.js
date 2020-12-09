var tickers = new Set();
var t = 0;
var seed;
var density;
var go = true;
var capture = false;
var captureTime = 0;
var capturer;
var render;
var canvas, editor, area;
var tweenable = ["step", "turn", "rot", "fan", "size", "weight"];
var backCol = "#FFFFFF";

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

var noiseFlower = {
    props:{
        capture: false,
        captureTime: 300,
        render: { levels: [
            //{type:"cousins", close:true, stroke: '#FFCC0099', fill: '#33333388', weightMult:0, weightAdd:1 },
            {type:"tree", stroke: '#000000BB', fill: '#FFFFFFFF', close:true}
        ] }
    },
    net:[
            {
                pos: [540, 540],
                num: 6,
                type:"fan",
                mirror:true,
                size: 90,
                weight: 1,
                step: { min:200, dif:40, terms:"t", ease:"IO", dur:1000, pow:1, noiseRad:1.5, noiseZ:1, noiseDetail:4, bounce:false },
                turn:{ min:0, dif:1, terms:"ix" },
                fan: Math.PI*2,
                rot: { min:0, dif:6.28, terms:"t", ease:"none", dur:1000, bounce:false },
                show: false,
                children:[
                    {
                        num:9,
                        type:"fan",
                        mirror: true,
                        size: 60,
                        weight: 1,
                        step: { min:20, dif:200, terms:"t", ease:"noise", dur:1000, pow:1, noiseRad:1.5, noiseZ:1, noiseDetail:4, bounce:false },
                        //turn: { min:-Math.PI/2, dif:Math.PI, terms:"tix", ease:"hill", dur:500, pow:1, noiseRad:1.5, noiseZ:1, noiseDetail:4, bounce:false },
                        turn: { min:0, dif:1, terms:"ix", ease:"none", dur:500, pow:1, noiseRad:1.5, noiseZ:1, noiseDetail:4, bounce:false },
                        fan: { min:0, dif:4, terms:"t", ease:"none", dur:500,bounce:true },
                        show: true,
                        //turn:{ min:0, dif:TWO_PI, terms:"ix" },
                        children:[
                            /*{
                                num:6,
                                type:"fan",
                                mirror:false,
                                size: 30,
                                weight: 1,
                                step:{ min:60, dif:180, terms:"t", ease:"noise", pow:random(-4, 4), dur:900, noiseRad:1, noiseZ:"dix", bounce:false},
                                turn: { min:-2, dif:4, terms:"t+ix", ease:"noise", pow:2, dur:900, noiseRad:1, noiseZ:1, bounce:false },
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
                            }*/
                        ]
                    }
            ]
        }
    ]
};


var shape = {
    props:{
        capture: false,
        captureTime: 300,
        render: { levels: [
            //{type:"cousins", close:true, stroke: '#FFCC0099', fill: '#33333388', weightMult:0, weightAdd:1 },
            {type:"tree", stroke: '#000000BB', fill: '#FFFFFFFF', close:true},
            {type:"bezier", stroke: '#000000BB', fill: '#FFFFFFFF', close:true}
        ] }
    },
    net:[
            {
                pos: [540, 540],
                num: 180,
                type:"fan",
                mirror:true,
                size: 90,
                weight: 1,
                step: { min:200, dif:40, terms:"ix", ease:"noise", dur:1000, pow:1, noiseRad:1.5, noiseZ:1, noiseDetail:4, bounce:false },
                show: true,
                children:[
                ]
            }
    ]
};



function setup() {
    canvas = createCanvas(1080, 1080);//(windowWidth, windowHeight);
    canvas.parent('container');
    background(backCol);
    frameRate(30);
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
      _def = noiseFlower; //generateSimple();
  }
  //tickers.clear();
  background(backCol);
  t = 0;
  seed = Math.random(); //int(random(999999));
  randomSeed(int(seed*999999));
  noiseSeed(int(seed*999999));

  graphs = [];
  //let _def = generate();
  var k = new Graph( _def );
  graphs.push(k);

  area.value( JSON.stringify(_def, replacer, 2) );

  if('capture' in _def.props && _def.props.capture) {
      captureTime = _def.props.captureTime || 0;
      capture = true;
      capturer = new CCapture( {
          format: 'webm',
          framerate:30,
          name:"vid",
          verbose: false,
          display: true,
          quality: 95
       } );
      //capturer.start();
  } else {
      capture = false;
  }

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

      if(capture) {
          if(t == 0) capturer.start();

          capturer.capture(document.getElementById('defaultCanvas0'));

          if(t == captureTime) {
              capture = false;
              capturer.stop();
              capturer.save();
              capturer = null;
          }
      }

      t++;
      //console.log(capture, t);
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
        n.type = "type" in g ? g.type : 'fan';
        // n.turn = "turn" in g ? g.turn : 0;
        // n.rot = "rot" in g ? g.rot : 0;
        // n.fan = "fan" in g ? g.fan : TWO_PI;
        // n.step = "step" in g ? g.step : 30;
        if('turn' in g) n.turn = g.turn;
        if('rot' in g) n.rot = g.rot;
        if('fan' in g) n.fan = g.fan;
        if('step' in g) n.step = g.step;
        n.mirror = g.mirror;
        n.size = g.size;
        n.weight = g.weight;
        n.fill = g.fill;
        n.stroke = g.stroke;
        n.show = 'show' in g ? g.show : true;

        console.log("makeGroup init", n);

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
    return false;
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
