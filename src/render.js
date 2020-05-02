
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
