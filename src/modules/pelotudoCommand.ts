import fs from "fs";
import { applyFilter, applyTemplate, filters, templates } from "../filters"
import { Client, Message, MessageMedia } from "whatsapp-web.js";
import { schedule } from "../index";

module.exports.cmd = async (client : Client, msg : Message, cmd : string) => {
    var pelotuda : boolean = cmd=="pltda";
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
    var template : string = templates.pelotudo;
    switch(cmd) {
        case "pltdo":
            template = templates.pelotudo;
            break;
        case "pltda":
            template = templates.pelotuda;
            break;
        case "fc":
            template = templates.fc;
            break;
        case "romudom":
            template = templates.megavirgen;
            break;
    }


    var pelotudo = cmd.startsWith("pltd");
    
    var filename = `${__dirname}\\..\\..\\generated\\${cmd}_${mentions[0].id._serialized.split("@")[0]}.png`;
    try {
        if(fs.existsSync(filename)) { fs.unlinkSync(filename); }
        var gay = await applyTemplate(pfp||(`data:${media.mimetype};base64,${media.data}`), template);
        fs.writeFileSync(filename, gay.toBuffer());
        var generatedMedia = MessageMedia.fromFilePath(filename);
        schedule(async ()=> {
            await client.sendMessage(msg.from, generatedMedia);
            if(pelotudo) await msgChat.sendMessage(MessageMedia.fromFilePath(`${__dirname}\\..\\resources\\pelotudo.mp3`), {sendAudioAsVoice: true});
        })
    } catch(err) {

    }
}


module.exports.info = {
	name: "pltdo",
    aliases: ["pltda", "fc", "romudom"]
}