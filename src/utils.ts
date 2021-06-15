import {Client, MessageMedia, GroupNotification, Chat, GroupChat, GroupParticipant, Contact, PrivateChat, Message} from "whatsapp-web.js";
import {asSequence, sequenceOf, emptySequence, range, generateSequence, extendSequence} from 'sequency';
import config from "./config.json";
import ytdl from "ytdl-core";
import ytsr, { Result, Video } from "ytsr";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import chalk from "chalk";
import { schedule } from ".";

export const URL_REGEX = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

export interface VideoDownloadResult {
	success : boolean,
	error? : string,
	video?: Video,
	promise?: Promise<string>
}

export interface ChatCountResult {
	chats: number,
	groups: number,
	groupUsers: number,
	totalUsers: number
}

export async function archiveUnusedChats(client : Client) {
	let chats = await client.getChats()
	asSequence(chats).filter(chat=>chat.isGroup).filterNot(chat=>
		asSequence((chat as GroupChat).participants)
		.map(pa=>pa.id._serialized).toList().includes(config.selfId))
		.forEach(chat=>(chat as GroupChat).archive);
}

export async function getChatCount(client : Client) {
	let chats = await client.getChats()
	let groupUsers = 0;
	
	let group_count = asSequence(chats).filter(chat=>chat.isGroup)
	.filter(chat=>{
		let gc = chat as GroupChat;
		groupUsers+=gc.participants.length;
		return asSequence(gc.participants)
		.map(pa=>pa.id._serialized).toList()
		.includes(config.selfId);
	}
	).count();
	
	var chat_count = asSequence(chats).filter(chat=>!chat.isGroup).count();

	return { chats: chat_count, groups: group_count, groupUsers: groupUsers, totalUsers: groupUsers+chat_count} as ChatCountResult
}

export async function finale(client : Client) {
	schedule(async ()=>{
		let chats = await client.getChats();
		await chats.forEach(async chat=>{
			if(!chat.isGroup) return;
			if(config.whitelist.includes(chat.id._serialized)) return;
			await chat.sendMessage("=============== AVISO ==============="+
			"Por favor leer entero.\nEste es un mensaje automático.\n\n"+
			"Actualmente, el bot se encuentra en un periodo de inactividad, que es más que nada porque se volvió muy complicado, "+
			"por no decir imposible, hacer que el bot funcione en tantos grupos (para referencia, actualmente se encuentra en ~1000 grupos).\n"+
			"Whatsapp tiene ciertas limitaciones, y, siendo un estudiante de secundaria, "+
			"no cuento con los recursos ni el conocimiento ni el tiempo para poder arreglarlo.\n\n"+
			"Al final, como no puedo resolver esto, voy a dejar el bot para usarlo solo en algunos grupos."+
			"Algunos de esos grupos van a ser públicos, y voy a mandar invitaciones por " + config.groupInviteLink + "\n\n"+
			"También voy a subir el bot a GitHub, para el que quiera ver el código fuente, va a estar acá https://github.com/lMartin3/el-coso-de-wpp."+
			"Además pienso a hacer una guía para hacer un bot, probablemente la deje en ese link.\n\n"+
			"El bot procederá a dejar este grupo automáticamente, si no, por favor quitenlo.");
			await (chat as GroupChat).leave();
			console.log(`Sent to ${chat.name}`)
		});
	})
}

export async function alertToOwner(client : Client, message : string) {
	schedule(async ()=> {
		let owner : Contact = await client.getContactById(config.ownerId);
		let ownerChat : PrivateChat = await owner.getChat();
		await ownerChat.sendMessage(message);
	});
}

export async function alertToGroup(client : Client, message : string) {
	let chat : GroupChat = ((await client.getChatById(config.announcementGroupId)) as GroupChat);
	await chat.sendMessage(message);
}

export async function broadcast(client: Client, message : string) {
	let chats = await client.getChats()
	asSequence(chats).filter(chat=>chat.isGroup).filter(chat=>
		asSequence((chat as GroupChat).participants)
		.map(pa=>pa.id._serialized).toList().includes(config.selfId))
		.forEach(chat=>chat.sendMessage(message));
}


export async function downloadAudioVideo(video_name : string, audio_only : boolean) {
	var video : Video = {} as Video;
	var found : boolean =  false;
	var isUrl : boolean = video_name.match(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/) ? true : false;
	console.log(chalk.cyan(`Downloading: ${video_name} | isUrl: ${isUrl}`));
	
    const search : Result = await ytsr(video_name, { pages: 1 }).catch(err=>{
		return {
			success: false,
			error: "Hubo un problema buscando el video, probá de nuevo"
		} as VideoDownloadResult;
	}) as Result;

    search.items.forEach(item=>{
        if(item.type=='video'&&!found) {
            video = item;
			found = true;
		}
    });

    if(!found||video.duration==null) {
        //msg.reply("No encontré el video... F");
        return {
			success: false,
			error: "Video no encontrado"
		} as VideoDownloadResult;
    }

    var duration = video.duration.split(":");
    var hours = (duration.length>2 ? duration[0] : 0);
    var minutes = duration[duration.length - 2];
    var seconds = duration[duration.length - 1];

    var max = audio_only ? config.maxAudioMinutes : config.maxVideoMinutes;

    if(hours>0||Number(minutes)>max) {
        //msg.reply(`Máximo ${max} minutos para ${audio_only ? 'audios' : 'videos'}.`)
        return {
			success: false,
			error: `El video es muy largo (supera los ${max} minutos)`
		} as VideoDownloadResult;
    }

	return {
		success: true,
		error: "",
		video: video,
		promise: new Promise<string>((resolve, reject)=>{
			let stream = ytdl(video.id, {
				quality: audio_only ? "highestaudio" : "highest",
			});
			  
			var filepath = `${__dirname}\\..\\youtube\\${video.id}.${audio_only ? "mp3" : "mp4"}`;
			let start = Date.now();
				ffmpeg(stream)
				.audioBitrate(128)
				.save(filepath)
				.on('end', async () => {
					var time = (Date.now() - start) / 1000;
					console.log(chalk.cyan(`Finished downloading: ${video.title} in ${time}s`));
					resolve(filepath);
					//msg.reply(`Se descargó [${video.title}] en ${time} segundos (ahora t lo envío)`);

				}).on('error', async(err)=>{
					reject(err);
				});
		})
	} as VideoDownloadResult;
}

export function generateAlphanum(length : number) {
	var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	var result = '';
	for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
	return result;

}