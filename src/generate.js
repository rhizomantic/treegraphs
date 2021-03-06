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
    let baseNum = int(random(4,8));
    let def = {
    props:{
        capture: false,
        captureTime: 300,
        render: { levels: [
            //{type:"cousins", close:true, stroke: '#FFCC0099', fill: '#33333388', weightMult:0, weightAdd:1 },
            {type:"bezier", stroke: '#000000BB', fill: '#FFFFFFFF', close:true}
        ] }
    },
    net:[
            {
                num: 60,
                type:"fan",
                mirror:true,
                size: 90,
                weight: 1,
                step: 2,
                //turn:{ min:PI/2+a1, dif:-a1*4, terms:"ix" },
                turn:{ min:0, dif:0, terms:"ix" },
                show: false,
                children:[
                    {
                        num:36,
                        type:"fan",
                        size: 60,
                        weight: 1,
                        step: { min:"40+dix*120", dif:40, terms:"t+dix", ease:"noise", dur:300, pow:1, noiseRad:1.5, noiseZ:"ix*4", noiseDetail:4, bounce:false },
                        turn: { min:0, dif:TWO_PI, terms:"ix" },
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

    console.log("GEN", a1, PI/2+a1, -a1*4 );

    def.net[0].pos = [width/2, height/2];
    console.log(width, height);
    return def;

}
