
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

        this.type = args.type || "star";
        this.levels = args.levels || [{stroke:0, weight:1}];

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
        stroke(level.stroke);
        strokeWeight( level.weight );

        if(this.type == "bezier") {
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
                    bezier(ps[0], ps[1], ps[2], ps[3], ps[2], ps[3], ps[4], ps[5]);
                }
            }
        } else if(this.type == "bezier-closed") {
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
                    bezier(ps[0], ps[1], ps[2], ps[3], ps[2], ps[3], ps[4], ps[5]);
                }
            }
        } else if(this.type == "polygon") {
            if(n.kids.length > 1) {
                for(let k=1; k<n.kids.length; k++) {
                    line(n.kids[k-1].pos[0], n.kids[k-1].pos[1], n.kids[k].pos[0], n.kids[k].pos[1]);
                }
            }
        } else if(this.type == "tree") {
            for(let k=0; k<n.kids.length; k++) {
                line(n.pos[0], n.pos[1], n.kids[k].pos[0], n.kids[k].pos[1]);
            }
        } else if(this.type == "circles") {
            for(let k=0; k<n.kids.length; k++) {
                ellipse( n.kids[k].pos[0], n.kids[k].pos[1], n.kids[k].size, n.kids[k].size);
            }
        }  else if(this.type == "star") {
            if(n.kids.length > 1) {
                for(let k=1; k<n.kids.length; k++) {
                    bezier(n.kids[k-1].pos[0], n.kids[k-1].pos[1], n.pos[0], n.pos[1], n.pos[0], n.pos[1], n.kids[k].pos[0], n.kids[k].pos[1]);
                }
            }
        } else if(this.type == "umbrella") {
            if(n.kids.length > 1) {
                for(let k=1; k<n.kids.length; k++) {
                    let hlf = [ (n.kids[k-1].pos[0] - n.kids[k].pos[0]) / 2, (n.kids[k-1].pos[1] - n.kids[k].pos[1]) / 2 ];
                    let anc = [ (n.kids[k].pos[0] + hlf[0]) - hlf[1], (n.kids[k].pos[1] + hlf[1]) + hlf[0] ];
                    bezier(n.kids[k].pos[0], n.kids[k].pos[1], anc[0], anc[1], anc[0], anc[1], n.kids[k-1].pos[0], n.kids[k-1].pos[1]);
                }
            }
        } else if(this.type == "snake") {
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
        }  else if(this.type == "petals") {
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
