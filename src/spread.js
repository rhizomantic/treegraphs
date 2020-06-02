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
