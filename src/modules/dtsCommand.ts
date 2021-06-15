import fs from "fs";
import { applyFilter, filters } from "../filters"
import { Client, Message, MessageMedia } from "whatsapp-web.js";
import Canvas from "canvas";
import { schedule } from "../index";

module.exports.cmd = async (client : Client, msg : Message, cmd : string) => {
    var msgChat = await msg.getChat();
    var msgContact = await msg.getContact();

    var media = {} as MessageMedia;
    var mentions = await msg.getMentions()
    if(mentions.length==0) {
        if(msg.hasMedia) {
            media = await msg.downloadMedia();
        } else {
            await msg.reply("No mencionaste a nadie ._. XD");
            return;
        }
    }

    var pfp = undefined;
    if(!media) {
        pfp = await mentions[0].getProfilePicUrl();
        if(!pfp) {
            await msg.reply("No puedo ver la foto de esa persona, no me la container.");
            return;
        }
    }

    var filename = `${__dirname}\\..\\..\\generated\\dts_${mentions[0].id._serialized.split("@")[0]}.png`;
    try {
        if(fs.existsSync(filename)) { fs.unlinkSync(filename); }

        let template = await Canvas.loadImage(`${__dirname}\\..\\resources\\templates\\dondetesentaste.png`);
        let pfpImg = await Canvas.loadImage(pfp||(`data:${media.mimetype};base64,${media.data}`));
    
        const canvas = Canvas.createCanvas(template.width, template.height);
        const ctx = canvas.getContext(`2d`);
        ctx.drawImage(template, 0, 0, template.width, template.height);
        ctx.textAlign = "center";
    
        ctx.font = `40px "Comic Sans MS"`;
        ctx.drawImage(pfpImg, 230, 62, 190, 190);
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, template.width, 45);
        ctx.fillRect(0, template.height-45, template.width, 45);
        ctx.fillStyle = "black";
        ctx.fillText(`Noooooo ${mentions[0].pushname || ""}`, template.width/2, 40);
        ctx.fillText(`donde te sentaste?!?!?!?!`, template.width/2, template.height-7);
    

        fs.writeFileSync(filename, canvas.toBuffer());
        var stickerMedia = MessageMedia.fromFilePath(filename);
        schedule(async ()=> await client.sendMessage(msg.from, stickerMedia, {sendMediaAsSticker: false}));
    } catch(err) {

    }
}


module.exports.info = {
	name: "dts"
}