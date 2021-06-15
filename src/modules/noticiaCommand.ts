import fs from "fs";
import { applyFilter, filters } from "../filters"
import { Client, Message, MessageMedia } from "whatsapp-web.js";
import { generateAlphanum } from "../utils";
import Canvas  from "canvas";
import { text } from "figlet";
import { schedule } from "../index";


function adjustText(ctx : CanvasRenderingContext2D, text : string, width : number) {
    text = text.replace("\n", "\n ");
    var split = text.replace("\nasdasdasda", "\\n").split(" ");
    var breaklineMessage = "";
    var linePixelLength = 0;
    for(var s in split) {
        var str = split[s];
        var sl = ctx.measureText(str).width;

        if(linePixelLength+sl<width) {
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
    ctx.font = `${fontsize}px "Metropolis"`
    while(ctx.measureText(text).width>maxWidth) {
        fontsize-=0.5;
        ctx.font = `${fontsize}px "Metropolis"`
    }
    return fontsize;
}


module.exports.cmd = async (client : Client, msg : Message, cmd : string) => {
    var msgChat = await msg.getChat();
    var msgContact = await msg.getContact();
    var args = msg.body.split(" ");
    args.shift();

    var target_message = msg;
    var quoted_msg = undefined;
    if(msg.hasQuotedMsg) {
        quoted_msg = await msg.getQuotedMessage();
    }

    if(!msg.hasMedia) {
        if(quoted_msg&&quoted_msg.hasMedia) {
            target_message = quoted_msg;
        } else {
            await msg.reply("❌ Tenés que adjuntar una imagen capo!");
            return;
        }
    }

    var filepath = `${__dirname}\\..\\..\\generated\\noticia_${generateAlphanum(6)}.png`;

    var text = args.join(" ");

    target_message.downloadMedia().then(async (media : MessageMedia)=>{
        console.log(`Mimetype: ${media.mimetype}`)
        let image = await Canvas.loadImage(`data:${media.mimetype};base64,${media.data}`);
        let wnlogo = await Canvas.loadImage(`${__dirname}\\..\\resources\\wnlogo.png`);
        const canvas = Canvas.createCanvas(image.width, image.height);
        const ctx = canvas.getContext(`2d`);


        ctx.drawImage(image, 0, 0,image.width, image.height);
        //32,5 37,5
        
        ctx.fillStyle = "#C52748";
        var barWidth = image.width*0.9;
        var wSpacing = (image.width-barWidth)/2;
        var barHeight = 80;
        var hSpacing = 10;
        console.log(image.width);
        console.log(barWidth);
        console.log(wSpacing);
        ctx.fillRect(wSpacing, image.height-barHeight, barWidth, barHeight-hSpacing);
        
        var textPadding = 15;
    
        ctx.fillStyle = 'white';
        ctx.textAlign = 'left';
    
        ctx.font = `25px "Metropolis"`
        var fontsize = adjustFontSize(25, ctx, text, (barWidth-textPadding*2)*2);
        ctx.font = `${fontsize}px "Metropolis"`
    
        console.log(ctx.measureText(text).width);
        var adjustedText = adjustText(ctx, text, (barWidth-textPadding*2));
        var lines = adjustedText.split("\n").length
    
        var textY = (lines<2) ? (image.height-barHeight/2.25) : (image.height-barHeight+fontsize*1.2);
    
        ctx.fillText(adjustedText, wSpacing+textPadding, textY);
        ctx.drawImage(wnlogo, image.width-50-10, 0, 50, 50);
        
    
            
        fs.writeFileSync(filepath, canvas.toBuffer());
        schedule(async ()=> await msg.reply(MessageMedia.fromFilePath(filepath)));
    }).catch(err=>{
        if(err) schedule(async ()=> await msg.reply("hubo un error: " + err))
        console.error(err);
    });
}    


module.exports.info = {
	name: "noticia"
}