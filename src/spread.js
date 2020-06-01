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
