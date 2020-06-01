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
