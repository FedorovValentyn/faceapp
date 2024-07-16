// Define our labelmap
 const labelMap = {
    1:{name:'Student', color:'#7FFFD4'},
    2:{name:'pyroh', color:'#FFE4C4'},
    3:{name:'Good', color:'#0000FF'},
    4:{name:'Ok', color:'#8A2BE2'},
    5:{name:'Salute', color:'#D2691E'},
    6:{name:'Fuck', color:'#5F9EA0'},
    7:{name:'Bad', color:'#FF7F50'},
    8:{name:'Uwu', color:'#FF1493'},
    9:{name:'Freedom', color:'#DC143C'},
    10:{name:'Victory', color:'#FFF8DC'},
    11:{name:'Hi', color:'#8FBC8F'},
    12:{name:'Heart', color:'#B22222'},
    13:{name:'Please', color:'#008000'}
}

// Define a drawing function
export const drawRect = (boxes, classes, scores, threshold, imgWidth, imgHeight, ctx)=>{
    for(let i=0; i<=boxes.length; i++){
        if(boxes[i] && classes[i] && scores[i]>threshold){
            // Extract variables
            const [y,x,height,width] = boxes[i]
            const text = classes[i]

            // Set styling
            ctx.strokeStyle = labelMap[text]['color']
            ctx.lineWidth = 10
            ctx.fillStyle = 'black'
            ctx.font = '30px Arial'

            // DRAW!!
            ctx.beginPath()
            ctx.fillText(labelMap[text]['name'] + ' - ' + Math.round(scores[i]*100)/100, x*imgWidth, y*imgHeight-10)
            ctx.rect(x*imgWidth, y*imgHeight, width*imgWidth/2, height*imgHeight/2);
            ctx.stroke()
        }
    }
}
