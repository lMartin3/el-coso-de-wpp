import fs from "fs";
import { Client, Message } from "whatsapp-web.js";
import { getChatCount } from "../utils";
import config from "../config.json";


module.exports.cmd = async (client : Client, msg : Message, cmd : string) => {
    var msgChat = await msg.getChat();
    var msgContact = await msg.getContact();
    var cc = await getChatCount(client);
    await msg.reply(`------- INFORMACIÓN -------
Este es un bot de Whatsapp que realiza diferentes funciones de forma automática.
Para obtener una lista de las funciones enviá .ayuda por este chat.
Para hacer que el bot deje este grupo enviá .bye

Estadísticas:
Grupos en los que está el bot: ${cc.groups}
Conversaciones en las que está el bot: ${cc.chats}
Grupo del bot (para sugerencias y problemas): ${config.groupInviteLink}

Bot creado por @luraschimartin [ig]
---------------------------`)
}

module.exports.info = {
	name: "info"
}