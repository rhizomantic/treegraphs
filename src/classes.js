/***** GRAPH *****/
class Graph {
  constructor(args = {}) {
    this.ix = graphs.length;
    this.count = 0;
    this.depth = 0;

    this.root = new Node();
    this.root.pos = args.net[0].pos;
    for(let i=0; i<args.net.length; i++){
        makeGroup(i, args.net[i], this.root, this);
    }
    console.log("Graph init", this.root);
    this.root.init();

    console.log("graph", this);
  }
}

/***** NODE *****/
class Node {
    constructor(args = {}) {

        //properties
        /*this.ix = args.ix || 0;
        this.gix = args.gix || 0;
        this.nrm = args.nrm || 0;
        this.rnd = args.rnd || Math.random();
        this.pos = args.pos || [windowWidth / 2, windowHeight / 2];
        this.step = args.step || 30;
        this.turn = args.turn || 0;
        this.rot = args.rot == undefined ? 0 : args.rot; //'rot' in args ? args.rot : 0; //args.rot || 0;
        this.fan = 'fan' in args ? args.fan : 0; //args.fan || TWO_PI;
        this.mirror = args.mirror || false;
        this.size = args.size || 20;
        this.weight = args.weight || 1;
        this.depth = args.depth || 0;
        this.fill = args.fill || "#888888";
        this.stroke = args.stroke || 0;
        this.show = 'show' in args ? args.show : true;

        // Node references
        this.graph = args.graph || null;
        this.parent = args.parent || null;
        this.anchor = args.anchor || null;
        //this.kids = args.kids || [];
        this.groups = args.groups || [];*/

        this.ix = 0;
        this.gix = 0;
        this.nrm = 0;
        this.rnd = Math.random();
        this.pos = [windowWidth / 2, windowHeight / 2];
        this.step = 30;
        this.turn = { min:0, dif:1 };
        this.rot = 0;
        this.fan = TWO_PI;
        this.mirror = false;
        this.size = 20;
        this.weight = 1;
        this.depth = 0;
        this.fill = "#888888";
        this.stroke = 0;
        this.show = true;

        // Node references
        this.graph = null;
        this.parent = null;
        this.anchor = null;
        this.groups = [];

        this._trn = 0;
        this.curves = {};

        //console.log("args:", args, "this:", this);

    }

    init() {
        for (let tw of tweenable) {
            if (isNaN(this[tw])) {
                console.log(tw, this[tw]);
                if(typeof this[tw] === 'string') this[tw] = this.readTerms(this[tw]);
                else this.curves[tw] = this.parseCurve(this[tw]);
            }
        }


        for(let g of this.groups) {
            for(let k of g) {
                //console.log("init init", k);
                k.init();
            }
        }
    }

    parseCurve(c) {
        c.terms = c.terms || "ix";

        let out = {};
        out.ease = c.ease || "none";
        out.pow = 'pow' in c ? this.readTerms(c.pow) : 1;;
        out.min = 'min' in c ? this.readTerms(c.min) : 0;
        //out.max = c.max || 1;
        out.dif = 'dif' in c ? this.readTerms(c.dif) : 1;
        //out.var = c.var || c.dif / n.parent.kids.length;
        out.dur = 'dur' in c ? this.readTerms(c.dur) : 0;
        out.bounce = 'bounce' in c ? c.bounce : true;

        if(out.ease == "noise") {
            out.noiseRad = 'noiseRad' in c ? this.readTerms(c.noiseRad) : 2;
            out.noiseZ = 'noiseZ' in c ? this.readTerms(c.noiseZ) : 1;
            out.noiseDetail = 'noiseDetail' in c ? c.noiseDetail : 4;
            noiseDetail(out.noiseDetail, 0.5);
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
                out.base += this.readTerm(t);
            }
        }
        //console.log("curve", n.graph.depth, n.depth, (n.graph.depth == 1 ? 0 : 1/n.graph.depth * n.depth) );

        return out;
    }

    readTerms(terms) {
        if(! isNaN(terms)) return terms;

        let o = 0;
        let ts = terms.split('+')
        for(let t of ts) {
            o += Number( this.readTerm(t) );
        }

        return o;
    }

    readTerm(term) {
        if(! isNaN(term)) return term;

        let ps = term.split('*');
        let o = 1;
        for(let p of ps) {
            if(p == "ix") o *= this.nrm;
            else if(p == "rnd") o *= this.rnd;
            else if(p == "dix") o *= this.parent.nrm;
            else if(p == "drnd") o *= this.parent.rnd;
            else if(p == "seed") o *= seed;
            else if(p == "pi") o *= PI;
            else if(p == "2pi") o *= TWO_PI;
            else if(p == "depth") o *= this.depth;
            else if(p == "idepth") o *= this.graph.depth - this.depth;
            else if(p == "depth-nrm") o *= 1/this.graph.depth * this.depth;
            else if(p == "idepth-nrm") o *= 1 - 1/this.graph.depth * this.depth;
            else o *= Number(p);
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
                x += (1 / val.dur) * ti * val.time;
                //if(ti == 20) console.log(val.bounce);
            }
            //if(x > 1) x %= 1;
            if(x > 1) x = floor(x%2) == 1 && val.bounce ? 1 - (x%1) : x % 1;

            if(val.ease == "noise") {

                //this[prop] = val.min + noise(8 + contrast(val.noiseRad*cos(TWO_PI*x), 8 + val.noiseRad*sin(TWO_PI*x), val.noiseZ ), val.pow) * val.dif;
                let ns = noise(8 + val.noiseRad*cos(TWO_PI*x), 8 + val.noiseRad*sin(TWO_PI*x), val.noiseZ );
                this[prop] = val.min + contrast(ns, val.pow)  * val.dif;
                //if(this.ix == 12 && this.parent.ix == 12) console.log(t, x, "h" );
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
    } else {
        return x;
    }

}

function pick(...opts) {
    return opts[floor(random(opts.length))];
}

function contrast(n, f) {
  return constrain(f*(n-0.5) + 0.5, 0, 1);
}
