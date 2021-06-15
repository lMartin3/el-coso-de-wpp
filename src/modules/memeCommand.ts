import fs from "fs";
import { applyFilter, filters } from "../filters"
import { Client, Message, MessageMedia } from "whatsapp-web.js";
import { generateAlphanum } from "../utils";
import Canvas  from "canvas";
import { text } from "figlet";
import { schedule } from "../index";


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

    var filepath = `${__dirname}\\..\\..\\generated\\meme_${generateAlphanum(6)}.png`;

    var textSplit = args.join(" ").split(",");
    var text1 = textSplit[0];
    var text2 = (textSplit.length>=2 ? textSplit[1] : "");

    target_message.downloadMedia().then(async (media : MessageMedia)=>{
        console.log(`Mimetype: ${media.mimetype}`)
        let bg = await Canvas.loadImage(`data:${media.mimetype};base64,${media.data}`);
        const canvas = Canvas.createCanvas(bg.width, bg.height);
        const ctx = canvas.getContext(`2d`);
        ctx.drawImage(bg, 0, 0,bg.width, bg.height);

        //32,5 37,5
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        
        var fontSize = Math.floor(bg.width/7);

        ctx.textAlign = "center";
        var textX = bg.width / 2;
        var text1Y = fontSize + 2;
        var text2Y = bg.height - 10;
        
        ctx.font = `${fontSize}px "Impact"`;

        while(ctx.measureText(text1).width>bg.width-40) {
            fontSize = fontSize - 0.5;
            ctx.font = `${fontSize}px "Impact"`;
        }

        ctx.fillText(text1, textX, text1Y);
        ctx.strokeText(text1, textX, text1Y);


        var fontSize = Math.floor(bg.width/7);
        ctx.font = `${fontSize}px "Impact"`;
        
        while(ctx.measureText(text2).width>bg.width-40) {
            fontSize = fontSize - 0.5;
            ctx.font = `${fontSize}px "Impact"`;
        }

        ctx.fillText(text2, textX, text2Y);
        ctx.strokeText(text2, textX, text2Y);
        
        fs.writeFileSync(filepath, canvas.toBuffer());
        schedule(async ()=> await msg.reply(MessageMedia.fromFilePath(filepath)));
    }).catch(err=>{
        if(err) schedule(async ()=> await msg.reply("hubo un error: " + err))
        console.error(err);
    });
}


module.exports.info = {
	name: "meme"
}