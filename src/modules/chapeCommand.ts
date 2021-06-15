import fs from "fs";
import { applyFilter, filters, templates } from "../filters"
import { Client, Message, MessageMedia } from "whatsapp-web.js";
import Canvas from "canvas";
import { schedule } from "../index";

module.exports.cmd = async (client : Client, msg : Message, cmd : string) => {
    var msgChat = await msg.getChat();
    var msgContact = await msg.getContact();

    var mentions = await msg.getMentions();

    if(mentions.length<1) {
        await msg.reply("Pero menciona a 2 personas estúpido!!!");
        return;
    }

    if(mentions.length<2) {
        await msg.reply("Que mierda no entendiste de 2 personas? 2 PERSONAS NO 1 NI 0 NI -64, que se supone que es esto? un autochape? vos vas a estar solo el resto de tu vida pero no significa que el resto también!!");
        return;
    }

    if(mentions.length!=2) {
        await msg.reply("Pero cuantas personas mencionaste??!?!? esto es un chape no una relación poliamorosa");
        return;
    }

    var pfp1 = await mentions[0].getProfilePicUrl();
    var pfp2 = await mentions[1].getProfilePicUrl();

    if(!pfp1||!pfp2) {
        await msg.reply("Alguna de las 2 fotos de perfil no es visible.");
        return;
    }

    let shortId1 = mentions[0].id._serialized.split("@")[0];
    let shortId2 = mentions[1].id._serialized.split("@")[0];

    var filename = `${__dirname}\\..\\..\\generated\\${cmd.toLowerCase()}_${shortId1}_${shortId2}.png`;

    (async ()=>{
        try {
            if(fs.existsSync(filename)) { fs.unlinkSync(filename); }
            let template = await Canvas.loadImage(`${__dirname}\\..\\resources\\templates\\kiss1.png`);
            let img1 = await Canvas.loadImage(pfp1); // 300 x 300 193, 150
            let img2 = await Canvas.loadImage(pfp2); // 200 x 200 663, 230
    
            const canvas = Canvas.createCanvas(template.width, template.height);
            const ctx = canvas.getContext(`2d`);
        
            ctx.drawImage(template, 0, 0, template.width, template.height);
            ctx.drawImage(img1, 193, 150, 300, 300);
            ctx.drawImage(img2, 663, 230, 200, 200);
            
            fs.writeFileSync(filename, canvas.toBuffer());
            var stickerMedia = MessageMedia.fromFilePath(filename);
            schedule(async ()=> await client.sendMessage(msg.from, stickerMedia, {sendMediaAsSticker: false}));
        } catch(err) {
            schedule(async ()=> await msg.reply("Error: " + err));
            console.error(err);
        }
    })();
}


module.exports.info = {
	name: "chape"
}