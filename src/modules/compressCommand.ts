import fs from "fs";
import { Client, Message, MessageMedia } from "whatsapp-web.js";
import { generateAlphanum } from "../utils";
import ffmpeg from "fluent-ffmpeg";
import { schedule } from "../index";

module.exports.cmd = async (client : Client, msg : Message, cmd : string) => {
    var msgChat = await msg.getChat();
    var msgContact = await msg.getContact();
    var args = msg.body.split(" ");
    args.shift();

    var quoted_msg = undefined;
    if(msg.hasQuotedMsg) {
        quoted_msg = await msg.getQuotedMessage();
    } else {
        await msg.reply("Tenés que usar este comando respondiendo a un audio! B-O-B-O");
        return;
    }

    const filepath = `${__dirname}\\..\\..\\generated\\audcomp_${cmd.toLocaleLowerCase()}_${generateAlphanum(6)}.mp3`;


    var media : MessageMedia = await quoted_msg.downloadMedia();
    console.log(media.mimetype);
    var mime =  media.mimetype.split("/");
    if(mime[0]!="audio") {
        await msg.reply("Pero vos que sos? Estúpido? Retrasado? Será que vos masticás el agua pedazo de idiota? Eso no es un audio!");
        return;
    }
    
    (async ()=>{
        var extension = media.mimetype.split("/")[1];
    
        const originalFilepath = `${__dirname}\\..\\..\\generated\\o_audcomp_${generateAlphanum(6)}.${extension}`;
        console.log(originalFilepath);
    
        fs.writeFileSync(originalFilepath, Buffer.from(media.data.replace('data:audio/mpeg; codecs=opus;base64,', ''), 'base64'));
        switch(cmd.toLowerCase()) {
            case "audcomp":
                ffmpeg(originalFilepath)
                .audioBitrate(13000)
                .audioChannels(1)
                .audioFrequency(11025)
                .output(filepath)
                .on('end', function() {                    
                    console.log('conversion ended');
                    schedule(async ()=>await msg.reply(MessageMedia.fromFilePath(filepath)));
                }).on('error', function(err){
                    console.log('error: ', err);
                    schedule(async ()=>await msg.reply("FFMPEG Error: " + err));
                }).run();
                break;
            case "earrape":
                ffmpeg(originalFilepath)
                .audioFilter("acrusher=.1:1:64:0:log")
                .output(filepath)
                .on('end', function() {                    
                    console.log('conversion ended');
                    schedule(async ()=>await msg.reply(MessageMedia.fromFilePath(filepath)));
                }).on('error', function(err){
                    console.log('error: ', err);
                    schedule(async ()=>await msg.reply("FFMPEG Error: " + err));
                }).run();
                break;
            case "eco":
                ffmpeg(originalFilepath)
                //.audioFilter(`aecho="0.6:0.3:150|300:0.3|0.25"`)
                .audioFilter(`aecho="0.6:0.3:150:0.25"`)
                .output(filepath)
                .on('end', function() {                    
                    console.log('conversion ended');
                    schedule(async ()=>await msg.reply(MessageMedia.fromFilePath(filepath)));
                }).on('error', function(err){
                    console.log('error: ', err);
                    schedule(async ()=>await msg.reply("FFMPEG Error: " + err));
                }).run();
                break;
        }
    })();
   
}


module.exports.info = {
	name: "audcomp",
    aliases: ["earrape", "eco"]
}