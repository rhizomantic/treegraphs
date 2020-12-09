function moveNode(n) {
    if(n.anchor !== null) {
        //let trn = n.parent.rot + n.turn;

        let _mirror = (n.parent.anchor != null && n.parent.mirror && n.parent.anchor.ix%2 == 0) ^ ( n.mirror && n.parent.ix%2 == 0);

        //n.rot = _mirror? n.parent.rot - n.turn : n.parent.rot + n.turn;
        let a = n.parent.rot + n.fan * (n.turn - 0.5);
        //n._trn = n.parent._trn + n.parent.rot + (_mirror ? n.fan * (n.turn - 0.5) : n.fan * (1 - (n.turn - 0.5)));
        n._trn = _mirror? n.parent._trn - a : n.parent._trn + a;

        n.pos = [
            n.anchor.pos[0] + n.step * cos(n._trn),
            n.anchor.pos[1] + n.step * sin(n._trn)
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
