import Canvas from "canvas";
import fs from "fs";
import { Client, GroupChat, Message, MessageMedia } from "whatsapp-web.js";
import { generateAlphanum } from "../utils";
import { schedule } from "../index";

module.exports.cmd = async (client : Client, msg : Message, cmd : string) => {
    var msgChat = await msg.getChat();
    var msgContact = await msg.getContact();
    var args = msg.body.split(" ");
    args.shift();

    if(args.length<1) {
        await msg.reply("Me tenés que escribir lo que querés que ponga flaco!!11!1!! 😡😡😡😠😤😤");
        return;
    }

    var tweet = args.join(" ");
    var filepath = `${__dirname}\\..\\..\\generated\\af_${generateAlphanum(6)}.png`;

    (async ()=>{
        let bg = await Canvas.loadImage(`${__dirname}\\..\\resources\\templates\\aftemplate.png`);
        const canvas = Canvas.createCanvas(bg.width, bg.height);
        const ctx = canvas.getContext(`2d`);
        ctx.drawImage(bg, 0, 0, bg.width, bg.height);
        ctx.textAlign = "left";
        ctx.fillStyle = 'black';
        ctx.font = '23px "Segoe WP"'
        tweet = tweet.replace("\n", "\n ");
        var split = tweet.replace("\nasdasdasda", "\\n").split(" ");
        var breaklineMessage = "";
        var linePixelLength = 0;
        for(var s in split) {
            var str : string = split[s];
            var sl = str.length * 11;
            for (var i = 0; i < str.length; i++) {
                var char = str.charAt(i);
                if(char==char.toUpperCase()) {
                    sl+=3; // this is the difference between UPPERCASE and lowercase, uppercase has bigger letters in this font
                }
            }
    
            if(linePixelLength+sl<570) {
                linePixelLength += sl + 10;
            } else {
                breaklineMessage += "\n";
                linePixelLength = sl + 10; //clear and set to 0 + this line length
            }
            
            if(str.endsWith("\n")) {
                linePixelLength = 0;
            }
    
            breaklineMessage += str + " ";
        }+
        ctx.fillText(breaklineMessage, 15, 90);
        
        fs.writeFileSync(filepath, canvas.toBuffer());
        schedule(async ()=>{ await msg.reply(MessageMedia.fromFilePath(filepath))});
    })();
}

module.exports.info = {
	name: "alverso"
}