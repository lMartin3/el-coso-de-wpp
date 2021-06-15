import fs from "fs";
import { Client, Message, MessageMedia } from "whatsapp-web.js";
import { schedule } from "../index";

module.exports.cmd = async (client : Client, msg : Message, cmd : string) => {
    var msgChat = await msg.getChat();
    var msgContact = await msg.getContact();

    const oniiauds = ["oni01.mp3", "oni02.mp3", "oni03.ogg", "oni04.ogg", "oni05.ogg", "oni06.ogg"];

    switch (cmd) {
        case "peron":
            await msgChat.sendMessage(MessageMedia.fromFilePath(`${__dirname}\\..\\resources\\eastereggs\\marchaperonista.mp3`), {sendAudioAsVoice: true});
            await msgChat.sendMessage(fs.readFileSync(`${__dirname}\\..\\resources\\eastereggs\\marchaperonista.txt`, "utf-8"));
            break;
        case "milei":
            await msgChat.sendMessage(MessageMedia.fromFilePath(`${__dirname}\\..\\resources\\eastereggs\\milei_zurdo.mp4`));
            await msgChat.sendMessage(MessageMedia.fromFilePath(`${__dirname}\\..\\resources\\eastereggs\\gadsen.png`));
            break;
        case "anime":
            await msg.reply(MessageMedia.fromFilePath(`${__dirname}\\..\\resources\\eastereggs\\anime.mp4`));
            break;    
        case "atalanta":
            await msgChat.sendMessage(MessageMedia.fromFilePath(`${__dirname}\\..\\resources\\eastereggs\\atlanta.mp3`));
            await msgChat.sendMessage(MessageMedia.fromFilePath(`${__dirname}\\..\\resources\\eastereggs\\atlanta.webp`), {sendMediaAsSticker: true});
            await msgChat.sendMessage(MessageMedia.fromFilePath(`${__dirname}\\..\\resources\\eastereggs\\atlanta.png`));
            break;
        case "nashe":
            await msgChat.sendMessage(MessageMedia.fromFilePath(`${__dirname}\\..\\resources\\eastereggs\\nashe.jpg`));
            break;
        case "amongass":
            await msgChat.sendMessage(MessageMedia.fromFilePath(`${__dirname}\\..\\resources\\eastereggs\\amongass.gif`), {sendMediaAsSticker: true});
            break;
        case "pltde":
            await msg.reply(`Pero que mierda digoooooo, pelotude? El pelotude sos vos! Andá a consumir flan!!!`);
            break;
        case "nosotres":
            await msg.reply(`Juro que escucho una estupiez más salir de tu boca y salgo del grupo, la concha de la lora`);
            break;
        case "moyano":
            await msg.reply(`Gordo puto ladrón de mierda, a ver si algún dia se consigue trabajo el discapacitado mental.`);
            break;
        case "dripcar":
            await msg.reply(MessageMedia.fromFilePath(`${__dirname}\\..\\resources\\eastereggs\\dripcar.png`));
            await msgChat.sendMessage(MessageMedia.fromFilePath(`${__dirname}\\..\\resources\\eastereggs\\wppdripcar.mp3`), {sendAudioAsVoice: true});
            break;
        case "oniichan":
            var audio = oniiauds[Math.floor(Math.random() * oniiauds.length)];
            await msg.reply(MessageMedia.fromFilePath(`${__dirname}\\..\\resources\\oniichan\\${audio}`), msg.from, {sendAudioAsVoice: true});
            break;
        case "tiananmen":
            var text = fs.readFileSync(`${__dirname}\\..\\resources\\eastereggs\\tiananmen.txt`, "utf-8");
            await msg.reply(text);
            break;
        case "barcelona":
            await msg.reply(MessageMedia.fromFilePath(`${__dirname}\\..\\resources\\eastereggs\\barcelona.png`), msg.from, {sendMediaAsSticker:true});
            break;
        case "lel":
            await msg.reply(MessageMedia.fromFilePath(`${__dirname}\\..\\resources\\eastereggs\\lel.mp3`), msg.from, {sendAudioAsVoice: true});
            break;
    }
}

module.exports.info = {
	name: "peron",
    aliases: ["milei", "anime", "atalanta", "nashe", "amongass", "pltde", "nosotres", "moyano", "dripcar", "oniichan", "tiananmen", "barcelona", "lel"]
}