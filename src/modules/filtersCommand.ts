import fs from "fs";
import { applyFilter, filters } from "../filters"
import { Client, Message, MessageMedia } from "whatsapp-web.js";
import { schedule } from "../index";

module.exports.cmd = async (client : Client, msg : Message, cmd : string) => {
    var msgChat = await msg.getChat();
    var msgContact = await msg.getContact();

    var filter = filters.gay;
    switch(cmd.toLowerCase()) {
        case "camarada":
            filter = filters.communism;
            break;
        case "israel":
            filter = filters.israel;
            break;
        case "palestina":
            filter = filters.palestine;
            break;
        case "boquita":
            filter = filters.boquita;
            break;
        case "river":
            filter = filters.river;
            break;
        case "newells":
            filter = filters.newells;
            break;
        case "carc":
            filter = filters.carc;
            break;
    }

    var mentions = await msg.getMentions()
    var media = {} as MessageMedia;

    if(mentions.length==0) {
        if(msg.hasMedia) {
            media = await msg.downloadMedia();
        } else {
            await msg.reply("❌ No mencionaste a nadie ni adjuntaste una foto capo ._. XD");
            return;
        }
    }
    
    var pfp = undefined;
    if(!media) {
        pfp = await mentions[0].getProfilePicUrl();
        if(!pfp) {
            await msg.reply("❌ No puedo ver la foto de esa persona, no me la container.");
            return;
        }
    }

    (async()=>{
        var filename = `${__dirname}\\..\\..\\generated\\${mentions[0].id._serialized.split("@")[0]}_${cmd.toLowerCase()}.png`;
        try {
            if(fs.existsSync(filename)) { fs.unlinkSync(filename); }
            var gay = await applyFilter(pfp||(`data:${media.mimetype};base64,${media.data}`), filter);
            fs.writeFileSync(filename, gay.toBuffer());
            var stickerMedia = MessageMedia.fromFilePath(filename);
            schedule(async()=> await client.sendMessage(msg.from, stickerMedia, {sendMediaAsSticker: true}));
        } catch(err) {
            console.log(err);
        }
    })();
}


module.exports.info = {
	name: "gay",
    aliases: ["camarada", "israel", "palestina", "boquita", "river", "newells", "carc"]
}