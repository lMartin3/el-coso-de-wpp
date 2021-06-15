import fs from "fs";
import { Chat, Client, Contact, GroupChat, Message } from "whatsapp-web.js";
import { getChatCount } from "../utils";
import config from "../config.json";
import chalk from "chalk";
import { asSequence } from "sequency";
import { blacklist } from "..";


// 👍 👌 ❌ 🖼️ ⏳
module.exports.cmd = async (client : Client, msg : Message, cmd : string) => {
    var msgChat = await msg.getChat();
    var msgContact = await msg.getContact();
    var args = msg.body.split(" ");
    args.shift();

    if(msgContact.id._serialized!=config.ownerId) {
        msg.reply(`Error: No tenés permisos para usar este comando`);
        console.log(chalk.red(`! Admin permission denied for ${chalk.white(msgContact.pushname)} [${msgContact.id._serialized}] !`));
        return;
    }
    switch(cmd) {
        case "locate":
            if(args.length<1) {
                await msg.reply("❌ Argumentos insuficientes");
                return;
            }
            await msg.reply("Buscando, por favor esperá...");


            var chats = await client.getChats();
            var output = "Chats:\n";
            chats.forEach((chat : Chat)=>{
                if(!chat.isGroup) {
                    if(!chat.id._serialized.includes(args[0])) return;
                    output+=`- *CHAT PRIVADO*\n`;
                } else {
                    var gc = chat as GroupChat;
                    var participantIds : string[] = asSequence(gc.participants).map(pa=>pa.id._serialized).toList();
                    participantIds.forEach(pid=>{
                    if(pid.includes(args[0])) {
                        output += `- ${gc.name}\n`;
                        console.log(`Found: ${gc.name}`);
                    }
                    });
                }
                return;
            });
            await msg.reply(output);
            break;
        case "contacts":
        
            var contacts = await client.getContacts();
            var output = "Chats:\n";
            contacts.forEach(contact=>{
                if(contact.isGroup) return;
                if(contact.isBusiness) return;
                output+=`- ${contact.name} | ${contact.number}`
            })
            await msg.reply(output);
            break;
        case "find":
            if(args.length<1) {
                await msg.reply("Argumentos insuficientes");
                return;
            }
            var contact : Contact = await client.getContactById(args[0]);
            if(!contact) {msg.reply("Contacto no encontrado."); return;}
            await msg.reply(contact.pushname);
            await console.log(`FOUDN CONTACTTTT`);
            await console.log(contact);
            break;
        case "deletethis":
            if(!msg.hasQuotedMsg) {
                await msg.reply("❌ Boludo.");
                return;
            }
            var quoted = await msg.getQuotedMessage();
            if(!quoted.fromMe) {
                await msg.reply("❌ Pelotudo.");
                return;
            }
            await quoted.delete(true)
            await msg.reply("Hecho 👌");
            
            break;
        case "blacklist":
            var mentions = await msg.getMentions();
            if(mentions.length<1) {
                await msg.reply("❌ Pelotudo.")
                return;
            }
            var id = mentions[0].id._serialized;
            if(blacklist.includes(id)) {
                await msg.reply("❌ Ya está.");
                return;
            }
            blacklist.push(id);
            await msg.reply("Hecho 👌");
            return;
        case "unblacklist":
            var mentions = await msg.getMentions();
            if(mentions.length<1) {
                await msg.reply("❌ Pelotudo.")
                return;
            }
            var id = mentions[0].id._serialized;
            if(blacklist.indexOf(id)>=0) {
                blacklist.splice(blacklist.indexOf(id), 1);
                await msg.reply("Hecho 👌");
            } else {
                await msg.reply("No estaba pero ok 👌");
            }
            return;
        case "join":
            if(args.length<1) {
                await msg.reply("Ehhh... el link XD");
                return;
            }
            try {
                await client.acceptInvite(args[0]);
                await msg.reply('Oka 👌');
            } catch (e) {
                await msg.reply('❌ O el código es inválido o vos lo sos.');
            }
            break;
        }
}

module.exports.info = {
	name: "locate",
    aliases: ["groups", "contacts", "find", "deletethis", "blacklist", "unblacklist", "join"]
}