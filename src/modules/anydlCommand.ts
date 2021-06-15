import fs from "fs";
import { Client, Message, MessageMedia } from "whatsapp-web.js";
import ytdl from "ytdl-core";
import { URL_REGEX } from "../utils";
import { schedule } from "../index";
import chalk from "chalk";
import Ffmpeg from "fluent-ffmpeg";

module.exports.cmd = async (client : Client, msg : Message, cmd : string) => {
    var msgChat = await msg.getChat();
    var msgContact = await msg.getContact();
    var args = msg.body.split(" ");
    args.shift();

    if(args.length<1) {
        await msg.reply("Necesito el link mogólico! 😡😡");
        return;
    }

    if(!args[0].match(URL_REGEX)) {
        await msg.reply("Link inválido como tu vieja y tu familia");
        return;
    }
    
    await msg.reply("⏳ Descargando... (Aguantame un toque que esto puede tardar)");

    let stream = ytdl(args[0], {
        quality: "highest"
    });
      
    var filepath = `${__dirname}\\..\\video\\${args[0].replace("https://", "").replace("http://", "")}.mp4`;
    let start = Date.now();
        Ffmpeg(stream)
        .audioBitrate(128)
        .save(filepath)
        .on('end', async () => {
            var time = (Date.now() - start) / 1000;
            console.log(chalk.cyan(`Finished downloading: ${args[0]} in ${time}s`));
            var videoFile = MessageMedia.fromFilePath(filepath);
            schedule(async ()=>await client.sendMessage(msg.from, "Here you go", {media: videoFile}));

        }).on('error', async(err : any)=>{
            schedule(async ()=>await msg.reply(`❌ Error: ${err}`));
        });
}


module.exports.info = {
	name: "vdl"
}