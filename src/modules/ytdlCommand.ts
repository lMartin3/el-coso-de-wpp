import fs from "fs";
import { Client, Message, MessageMedia } from "whatsapp-web.js";
import ytdl from "ytdl-core";
import { Video } from "ytsr";
import { downloadAudioVideo, VideoDownloadResult } from "../utils";
import { schedule } from "../index";

module.exports.cmd = async (client : Client, msg : Message, cmd : string) => {
    var msgChat = await msg.getChat();
    var msgContact = await msg.getContact();
    var args = msg.body.split(" ");
    args.shift();

    const isVideo : boolean = cmd == "ytdlv";

    if(args.length<1) {
        await msg.reply("Pero la concha de tu hermana decime el nombre del video. 😡😡");
        return;
    }
    
    var video_name = args.join(" ");
    if(ytdl.validateURL(args[1])) {
        video_name = args[1];
    }

    var downloadResult : VideoDownloadResult = await downloadAudioVideo(video_name, !isVideo);
    if(!downloadResult.success) {
        schedule(async()=> await msg.reply(`❌ Error: ${downloadResult.error}`));
    } else {
        schedule(async()=> await msg.reply(`⏳ Descargando... (Aguantame un toque que esto puede tardar)`));
        if(!downloadResult.promise||!downloadResult.video) { schedule(async()=> await msg.reply("Error")); return; }
        var video : Video = downloadResult.video;

        downloadResult.promise.then(async filepath=>{
            var auvid_result = MessageMedia.fromFilePath(filepath);
            var auvid_message = undefined;
            var contact = await msg.getContact();
            schedule(async()=> {
                auvid_message = await client.sendMessage(msg.from, "Here you go", {media: auvid_result, sendAudioAsVoice: !isVideo});
                await client.sendMessage(msg.from, `‼️ Che @${contact.number}, acá está lo que me pediste`, {mentions:[contact]}).catch(err=>{console.error(err);});
            })
        }).catch(err=>{
            console.error(err);
            schedule(async()=> await msg.reply("Error: " + err));
        })
    }

}


module.exports.info = {
	name: "ytdl",
    aliases: ["ytdlv"]
}