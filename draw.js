const {createCanvas, loadImage} = require('canvas')


const drawImage = () => {
    const w = 200;
    const h = 200;
    const canvas = createCanvas(200, 200);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const radius = 20;
    const rangeOffset = (radius * 2 + 2);
    const rangeX = (w - rangeOffset);
    const rangeY = (h - rangeOffset);

    const rX = Math.random() * rangeX + radius;
    const rY = Math.random() * rangeY + radius;

    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(rX, rY, radius, 0, 2 * Math.PI);
    ctx.fill();

    return canvas;

}

const saveImage = (canvas) => {
    const fs = require('fs')
    const out = fs.createWriteStream(__dirname + '/test.jpeg')
    const stream = canvas.createJPEGStream()
    stream.pipe(out)
    out.on('finish', () => console.log('The JPEG file was created.'))
}


let c = drawImage();
saveImage(c);