import fs from "fs";
import { Client, Message, MessageMedia } from "whatsapp-web.js";
import { getChatCount } from "../utils";
import config from "../config.json";
import { schedule } from "..";

const dice = ["dice1.png", "dice2.png", "dice3.png", "dice4.png", "dice5.png", "dice6.png"];

module.exports.cmd = async (client : Client, msg : Message, cmd : string) => {
    var msgChat = await msg.getChat();
    var msgContact = await msg.getContact();
    var diceImg = MessageMedia.fromFilePath(`${__dirname}\\..\\resources\\dice\\${dice[Math.floor(Math.random() * dice.length)]}`)
    schedule(async()=> await msg.reply(diceImg, msg.from, {sendMediaAsSticker: true}));
}

module.exports.info = {
	name: "dado"
}