import fs from "fs";
import { Client, Message, MessageMedia } from "whatsapp-web.js";
import instagramGetUrl from "instagram-url-direct";
import fetch from "node-fetch";
import { schedule } from "../index";

module.exports.cmd = async (client : Client, msg : Message, cmd : string) => {
    var msgChat = await msg.getChat();
    var msgContact = await msg.getContact();
    var args = msg.body.split(" ");
    args.shift();

    if(args.length<1) {
        msg.reply("Pero poné el link también che.");
        return;
    }
    // https://www.instagram.com/reel/COJo9QAAfGL/?igshid=8vustvocg6uq
    var instagram = /https:\/\/www\.instagram\.com\/p\/[A-z0-9]{3,20}/.test(args[0]);
    var instagram_reel = /https:\/\/www\.instagram\.com\/reel\/[A-z0-9]{3,20}/.test(args[0]);
    if(!instagram&&!instagram_reel) {
        msg.reply("❌ Ese no es un link válido de instagram");
        return;
    }
    instagramGetUrl(args[0]).then((insta_links: { url_list: string[]; })=>{
        if(insta_links.url_list.length<1) {
            schedule(async ()=> await msg.reply("❌ Perdón, pero no pude extraer las fotos de ese post."));
            return;
        } else {
            insta_links.url_list.forEach(async (url: string)=>{
                try {
                    
                    const response = await fetch(url);
                    const buffer = await response.buffer();
                    var firstsplit = url.split("/");
                    console.log(firstsplit)
                    var filepath = `${__dirname}\\..\\..\\insta\\${firstsplit[firstsplit.length-1].split("?")[0]}`
                    console.log(filepath);
                    
                    fs.writeFile(filepath, buffer, () => {
                        var msg_media = MessageMedia.fromFilePath(filepath);
                        schedule(async ()=>client.sendMessage(msg.from, msg_media));
                    });   
                } catch(err) {
                    schedule(async ()=> await msg.reply(`❌ Error! ${err}`));
                }
            })
        }
    }).catch((err: string)=>{schedule(async()=> await msg.reply("❌ ubo un error: " + err)); console.error(err); });
}

module.exports.info = {
	name: "insta"
}