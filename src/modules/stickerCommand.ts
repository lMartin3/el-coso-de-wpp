import fs from "fs";
import { Client, Message } from "whatsapp-web.js";
import { schedule } from "../index";

module.exports.cmd = async (client : Client, msg : Message, cmd : string) => {
    var msgChat = await msg.getChat();
    var msgContact = await msg.getContact();

    var target_message = msg;
    var quoted_msg = undefined;
    if(msg.hasQuotedMsg) {
        quoted_msg = await msg.getQuotedMessage();
    }

    if(!msg.hasMedia) {
        if(quoted_msg&&quoted_msg.hasMedia) {
            target_message = quoted_msg;
        } else {
            await msg.reply("❌ No me pasaste la imagen para convertir en sticker genio!");
            return;
        }
    }

    target_message.downloadMedia().then(media=>{
        schedule(async ()=> await client.sendMessage(msg.from, media, {sendMediaAsSticker: true}))
    }).catch(err=>{
        if(err) schedule(async ()=>msg.reply("hubo un error: " + err));
        console.error(err);
    });
}


module.exports.info = {
	name: "sticker"
}