import fs from "fs";
import { applyFilter, filters } from "../filters"
import { Client, Message, MessageMedia } from "whatsapp-web.js";
import Canvas from "canvas";
import { schedule } from "../index";

module.exports.cmd = async (client : Client, msg : Message, cmd : string) => {
    var msgChat = await msg.getChat();
    var msgContact = await msg.getContact();

    var mentions = await msg.getMentions()
    if(mentions.length==0) {
        await msg.reply("No mencionaste a nadie ._. XD");
        return;
    }

    var pfp = await mentions[0].getProfilePicUrl();
    if(!pfp) {
        await msg.reply("No puedo ver la foto de esa persona, no me la container.");
        return;
    }

    var filename = `${__dirname}\\..\\..\\generated\\pfp_${msgContact.id._serialized.split("@")[0]}.png`;
    try {
        if(fs.existsSync(filename)) { fs.unlinkSync(filename); }
        let img = await Canvas.loadImage(pfp);
        const canvas = Canvas.createCanvas(img.width, img.height);
        const ctx = canvas.getContext(`2d`);
        ctx.drawImage(img, 0, 0, img.width, img.height);
        fs.writeFileSync(filename, canvas.toBuffer());
        var stickerMedia = MessageMedia.fromFilePath(filename);
        schedule(async ()=> await client.sendMessage(msg.from, stickerMedia, {sendMediaAsSticker: cmd=="pfps"}));
    } catch(err) {

    }
}


module.exports.info = {
	name: "pfp",
    aliases: ["pfps"]
}