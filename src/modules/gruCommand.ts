import Canvas, { CanvasRenderingContext2D } from "canvas";
import fs from "fs";
import { Client, GroupChat, Message, MessageMedia } from "whatsapp-web.js";
import { generateAlphanum } from "../utils";
import { schedule } from "../index";

const coords = [
    {x: 215, y: 75},
    {x: 562, y: 81},
    {x: 216, y: 300},
    {x: 559, y: 300}
]

function adjustText(ctx : CanvasRenderingContext2D, text : string) {
    text = text.replace("\n", "\n ");
    var split = text.replace("\nasdasdasda", "\\n").split(" ");
    var breaklineMessage = "";
    var linePixelLength = 0;
    for(var s in split) {
        var str = split[s];
        var sl = ctx.measureText(str).width;

        if(linePixelLength+sl<135) {
            linePixelLength += sl + 10;
        } else {
            breaklineMessage += "\n";
            linePixelLength = sl + 10; //clear and set to 0 + this line length
        }
        
        if(str.endsWith("\n")) {
            linePixelLength = 0;
        }

        breaklineMessage += str + " ";
    }
    return breaklineMessage;
}

function adjustFontSize(initialFontsize : number, ctx : CanvasRenderingContext2D, text : string, maxWidth : number) {
    var fontsize = initialFontsize;
    ctx.font = `${fontsize}px "Segoe WP"`
    while(ctx.measureText(text).width>maxWidth) {
        fontsize-=0.5;
        ctx.font = `${fontsize}px "Segoe WP"`
    }
    return fontsize;
}

module.exports.cmd = async (client : Client, msg : Message, cmd : string) => {
    var msgChat = await msg.getChat();
    var msgContact = await msg.getContact();
    var args = msg.body.split(" ");
    args.shift();

    var memeText = args.join(" ");
    var texts = memeText.split("/");
    if(texts.length<4) {
        await msg.reply(`❌ El uso correcto es ${cmd} texto1/texto2/texto3/texto4. Las barras son para separar el texto de cada viñeta.`);
        return;
    }


    (async ()=>{
        var filepath = `${__dirname}\\..\\..\\generated\\gru_${generateAlphanum(6)}.png`;

        let bg = await Canvas.loadImage(`${__dirname}\\..\\resources\\templates\\gru_template.png`);
        const canvas = Canvas.createCanvas(bg.width, bg.height);
        const ctx = canvas.getContext(`2d`);
    
        ctx.drawImage(bg, 0, 0, bg.width, bg.height);
        ctx.textAlign = "left";
        ctx.fillStyle = 'black';
    
        //MAX per cuadrant: 625
        for(var i=0; i<4; i++) {
            ctx.font = `25px "Segoe WP"`
            var fontsize = adjustFontSize(25,  ctx, texts[i], 620);
            ctx.font = `${fontsize}px "Segoe WP"`
    
            console.log(ctx.measureText(texts[i]).width);
            var xy = coords[i];
            ctx.fillText(adjustText(ctx, texts[i]), xy.x, xy.y);
        }
      
        fs.writeFileSync(filepath, canvas.toBuffer());
        schedule(async ()=> await msg.reply(MessageMedia.fromFilePath(filepath)));
    })();
}

module.exports.info = {
	name: "gru"
}