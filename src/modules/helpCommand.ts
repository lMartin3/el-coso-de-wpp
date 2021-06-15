import fs from "fs";
import { Client, Message } from "whatsapp-web.js";


module.exports.cmd = async (client : Client, msg : Message, cmd : string) => {
    var msgChat = await msg.getChat();
    var msgContact = await msg.getContact();
    var helpFile = fs.readFileSync(`${__dirname}\\..\\resources\\help_message.txt`, 'utf-8');
    await msgChat.sendMessage(helpFile)
}

module.exports.info = {
	name: "ayuda"
}