import fs from "fs";
import { Client, GroupChat, Message } from "whatsapp-web.js";
import { schedule } from "../index";

module.exports.cmd = async (client : Client, msg : Message, cmd : string) => {
    var msgChat = await msg.getChat();
    var msgContact = await msg.getContact();

    if(cmd=="id") {
        msg.reply("ID: " + msg.from);
        return;
    }

    if(!msgChat.isGroup) {
        msg.reply("Esto... no es un grupo XD");
        return;
    }
    if(["5493412668691-1622067865@g.us"].includes(msg.from)) {
        msg.reply("Pero vos que sos? Chistoso? Te considerás una persona graciosa? No, no lo sos, sos un pelotudo de mierda y nadie te quiere pedazo de escoria humana. No hay diferencia alguna entre una bolsa llena de mierda de perro y vos. Pedazo de ser disfuncional, a ver si alguna vez hacés algo productivo en tu vida y dejás de ser un gordo lolero del culo.");
        return;
    }
    var groupChat = msgChat as GroupChat;
    groupChat.sendMessage("Hasta la proximaaaaaaaaaaaaaaa").then(msg=>{
        setTimeout(()=>{
            schedule(async ()=>{await groupChat.leave();})
        }, 1000*3);
    })
}

module.exports.info = {
	name: "bye",
    aliases: ["id"]
}