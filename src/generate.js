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

    let def = {
    props:{
        render: { levels: [
            {type:"petals", stroke: '#00000000', fill: '#00000033', weightMult:0, weightAdd:1 },
            //{type:"circles", stroke: '#00000088', fill: '#00000011'}
        ] }
    },
    net:[
            {
                num:2,
                type:"fan",
                mirror:true,
                size: 72,
                weight: 1,
                step: 30,
                turn:{ min:PI/2+a1, dif:-a1*4, terms:"ix" },
                children:[
                    {
                        num:6,
                        type:"fan",
                        mirror:true,
                        size: 36,
                        weight: 1,
                        step:{ min:100, dif:0, terms:"ix*2", ease:"hill", pow:3 },
                        turn:{ min:0, var:TWO_PI/6, terms:"t", pow:2, dur:200 },
                        //turn:{ min:0, dif:TWO_PI, terms:"ix" },
                        children:[
                            {
                                num:24,
                                type:"fan",
                                mirror:true,
                                size: 6,
                                weight: 1,
                                step:{ min:100, dif:200, terms:"t*0.5+ix*0.5", ease:"hill", pow:3, dur:200 },
                                turn:{ min:0, dif:random(1, TWO_PI), terms:"ix" },
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

    def.net[0].pos = [windowWidth/2, windowHeight/2];
    return def;

}
