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

    if(!msg.hasQuotedMsg) {
        await msg.reply("Tenés que usar este comando respondiendo a un audio! B-O-B-O");
        return;
    }
    

    var audios : MessageMedia[] = [];
    var quoted_msg = msg;
    while(quoted_msg.hasQuotedMsg) {
        quoted_msg = await quoted_msg.getQuotedMessage();
        if(!quoted_msg.hasMedia) break;
        var media = await quoted_msg.downloadMedia();
        if( media.mimetype.split("/")[0]!="audio") break;
        console.log("ADDED " + quoted_msg.id._serialized);
        audios.push(media);
    }
    console.log("Final audio length: " + audios.length);

    var files : string[] = [];
    const opId = generateAlphanum(6);

    audios.forEach((aud, index)=>{
        var filepath = `${__dirname}\\..\\..\\generated\\audmerge_original_${cmd.toLocaleLowerCase()}_${opId}_${index}.${aud.mimetype.split("/")[1].split(";")[0]}`;
        fs.writeFileSync(filepath, Buffer.from(aud.data.replace('data:audio/mpeg; codecs=opus;base64,', ''), 'base64'));
        files.push(filepath);
        console.log("SAVED " + filepath)
    });

    const filepath = `${__dirname}\\..\\..\\generated\\audmerge_result_${cmd.toLocaleLowerCase()}_${opId}.mp3`;

    (async ()=>{
        var ff = ffmpeg();
        console.log("LIST INPUT: " + files)
        files.forEach(fl=>ff.mergeAdd(fl));
        console.log("FFMPEG INPUT: " + ff.input.length)
        console.log("\n\n"+files.join("|")+"\n\n");
        ffmpeg(`concat:${files.reverse().join("|")}`)
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
    })();
   
}


module.exports.info = {
	name: "combinar"
}