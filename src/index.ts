import fs from "fs";
import {Client, MessageMedia, GroupNotification, Chat, GroupChat, GroupParticipant, Contact, Message, GroupNotificationTypes} from "whatsapp-web.js";
import chalk from "chalk";
import qrcode from "qrcode";
import cprocess from "child_process";
import readline from "readline";
import figlet from "figlet";
import * as configFile from "./config.json";
import { cocks as amonguscocks, sans} from "./resources/amonguscocks.json";
import { getChatCount, archiveUnusedChats, ChatCountResult, alertToOwner, broadcast, alertToGroup, finale } from "./utils";
import { asSequence } from "sequency";

var config = configFile;
/*
import { config } from "dotenv";
config(); //load config from dotenv file
const self_id : string = process.env.ECDWPP_SELF_ID ?? "idk_lol";
*/
const rl = readline.createInterface({
    input: process.stdin,
    output: undefined
});

var moduleMap : Map<String, WHAPPBotModule> = new Map();


const SESSION_FILE_PATH = `${__dirname}\\..\\session.json`;
let sessionCfg;
if (fs.existsSync(SESSION_FILE_PATH)) {
    chalk.yellowBright(`Session file exists | Trying to authenticate using stored session data...`)
    sessionCfg = require(SESSION_FILE_PATH);
} else {
    chalk.redBright(`Session file not found, falling back to QR authentication.`)
}

const client = new Client({
    puppeteer: {
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: true
    },
    session: sessionCfg
});


const titleScreen = figlet.textSync('ECDWPP', {
    font: '3D-ASCII',
    horizontalLayout: 'default',
    verticalLayout: 'default',
    width: 80,
    whitespaceBreak: true
});

interface QueuedAction {
    act: ()=>{}
}

var welcomeMessage : string = fs.readFileSync(`${__dirname}\\resources\\join_message.txt`, 'utf-8');

const debug = false;
var groupCount= 0;
var chatCount = 0;

enum FunctionMode {
    SAFE="safe",
    FAST="fast"
}

const commandLimit = 15;
var currentCommands = 0

var mode : FunctionMode = FunctionMode.SAFE;
var actionQueue : QueuedAction[]= [];
var loggingQueue : QueuedAction[]= [];

var cooldown : Map<string, number> = new Map();


console.log(titleScreen);


const announcementCachePath = `${__dirname}\\..\\announcement_cache.txt`;
console.log(chalk.yellow("Reading dynamic announcement info..."));
var announcedTo : string[] = [];
if(fs.existsSync(announcementCachePath)) {
    fs.readFileSync(announcementCachePath, 'utf-8').split("\n").forEach(anto=>{announcedTo.push(anto);});
}
console.log(chalk.yellow(`Loaded ${chalk.white(announcedTo.length+"")} chats from the announcement info file.`));

var announcement : string = fs.readFileSync(`${__dirname}\\resources\\announcement.txt`, "utf-8");
console.log(chalk.yellow(`Loaded announcement [${announcement.length}]:\n${chalk.white(announcement)}`))


const blacklistPath : string = `${__dirname}\\..\\blacklist.txt`;
export var blacklist : string[] = fs.readFileSync(blacklistPath, "utf-8").split("\n");
console.log(chalk.red(`Loaded ${chalk.white(blacklist.length+"")} users from blacklist.txt`));


/*
	COMMAND MANAGEMENT
*/
rl.on('line', async (input) => {
	let command = input.split(" ")[0];
	let args = input.split(" ");
	args.shift();
	
	switch(command) {
		case "end":
            fs.writeFileSync(announcementCachePath, announcedTo.join("\n"));
            fs.writeFileSync(blacklistPath, blacklist.join("\n"));
            await alertToGroup(client, "Bot en reinicio...");
			console.log(chalk.bgRedBright("Process Terminated - Manual exit"));
			process.exit(0);
			break;
        case "reload":
            console.log(chalk.bgMagenta("Rebuilding and Reloading modules manually..."));
            cprocess.exec("npm run build");
            setTimeout(reloadModules, 1000*3)
            break;
        case "count":
            console.log(chalk.blue("Recounting groups and chats..."));
            schedule(async()=> {
                let cc = await  getChatCount(client);
                groupCount = cc.groups;
                chatCount = cc.chats;
                console.log(chalk.bgBlue(`The bot is in ${groupCount} groups and ${chatCount} chats | Total user count: ${cc.totalUsers}`));
            });
            break;
        case "reloadmsg":
            welcomeMessage = fs.readFileSync(`${__dirname}\\resources\\join_message.txt`, 'utf-8');
            console.log(chalk.magentaBright(`Welcome message reloaded:`));
            console.log(chalk.white(welcomeMessage));
            break;
        case "blacklist":
            if(args.length<1) {
                console.log(chalk.red(`Error: not enough arguments`));
                return;
            }
            if(blacklist.includes(args[0])) {
                console.log(chalk.red(`Error: already in blacklist`));
                console.log(chalk.yellow(blacklist.toString()));
                return;
            }
            blacklist.push(args[0]);
            console.log(chalk.green(`Done!`));
            break;
        case "unblacklist":
            if(args.length<1) {
                console.log(chalk.red(`Error: not enough arguments`));
                return;
            }
            var index = blacklist.indexOf(args[0]);
            if(index<0) {
                console.log(chalk.red(`Error: not in blacklist`));
                console.log(chalk.yellow(blacklist.toString()));
                return;
            }
            blacklist.splice(index, 1);
            console.log(chalk.green(`Done!`));
            break;
        case "swmod":
            var opposite = (mode==FunctionMode.FAST ? FunctionMode.SAFE : FunctionMode.FAST);
            console.log(chalk.blackBright.bgWhite(`Switching from ${mode} to ${opposite}`));
            mode = opposite;
            console.log(chalk.blackBright.bgGreen(`Done! Now using ${mode} mode.`));
            break;
        case "relcfg":
            config = require("./config.json");
            console.log(config);
	}
});

/*
	MODULE MANAGEMENT
*/

interface WHAPPBotModule {
	cmd: (client : Client, message : Message, cmd : string)=>{}
}

async function reloadModules() {
    moduleMap.clear();
	fs.readdir(`${__dirname}\\modules\\`, (err, files) => {
		if(err) console.error(err);

		let jsfiles = files.filter(f => f.split(".").pop() === "js");

		jsfiles.forEach((f, i) => {
			let props = require(`./modules/${f}`);
			console.log(chalk.bgGreen(`Module loaded > ${chalk.white(f)}`));
			moduleMap.set(props.info.name, props);
            console.log(chalk.green(`Command > ${props.info.name}`));
            if(props.info.aliases) {
                (props.info.aliases as string[]).forEach(alias=>{
                    console.log(chalk.green(`Command > ${alias}`));
                    moduleMap.set(alias, props);
                });
            }
			
		});
		
		console.log(chalk.bgGreen(`Loaded a total of ${jsfiles.length} modules`));
	});
}

reloadModules();

/*
	CLIENT MANAGEMENT
*/

interface NotificationID {
	remote: string
}

client.on('authenticated', async (session) => {
    console.log('AUTHENTICATED', session);
    sessionCfg=session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
        if (err) {
            console.error(err);
        }
    });
});

client.on('qr', (qr) => {
    // Generate and scan this code with your phone
    console.log(chalk.magentaBright(`Authentication QR received: ${qr}`));
    qrcode.toDataURL(qr, function (err, url) {
        if(err) return console.log('error occured')
        var base64Data = url.replace(/^data:image\/png;base64,/, '');
        fs.writeFile('code.png', base64Data, 'base64', function(err) {
            if(err) console.log(err);
        });
        cprocess.exec('start ./code.png', (error, stdout, stderr) => {});
    });
    
});


client.on('ready', async () => {
    console.log(chalk.green('Client logged in successfully and ready to go.'));
    finale(client);
});


client.on('group_join', async (notification)=>{
    if(notification.type!=GroupNotificationTypes.ADD&&notification.type!=GroupNotificationTypes.INVITE) return;
	let nfid = notification.id as NotificationID;
    if(nfid.remote==configFile.announcementGroupId) {
        console.log("Welcoming...");
        var groupChat = await client.getChatById(nfid.remote);
        notification.recipientIds.forEach(async (id : string)=>{
            var contact = await client.getContactById(id);
            groupChat.sendMessage(`Bienvenido/a ${contact.pushname || contact.number}!
Este grupo es para atender sugerencias, dudas y problemas del bot.
Cosas que deberías saber:
• En este grupo no está activado el bot.
• No se puede enviar contenido +18.
• Para agregar al bot a un grupo agendalo como contacto y añadilo.
https://chat.whatsapp.com/ENzb7y9FJvwKwvzfwFTAZ2`);
})
        return;
    }

    if(!notification.recipientIds.includes(configFile.selfId)) return;
    
    var botGroupAmount = (await getChatCount(client)).groups;
    var groupChat = await client.getChatById(nfid.remote);

    console.log(chalk.yellow(`The bot joined a new group: ${groupChat.name}`));
    
    if(botGroupAmount>=configFile.groupLimit) {
        alertToOwner(client, `El bot entró a ${groupChat.name} pero había demasiados grupos.`);
        console.log(chalk.redBright(`Leaving group, limit reached (${botGroupAmount}/${configFile.groupLimit})`));

        schedule(async ()=> {
            await groupChat.sendMessage(`Este bot está en demasiados grupos, por el momento no es posible agregarlo.\nEste problema se va a arreglar dentro de unos días.`);
            await groupChat.archive();
            setTimeout(()=>schedule(async ()=> await (groupChat as GroupChat).leave()), 1000*2);
        });

        return;
    }

    console.log(chalk.whiteBright(`Joined ${nfid.remote}`));
    client.sendMessage(nfid.remote, welcomeMessage);
    alertToOwner(client, `El bot entró a ${groupChat.name}`);
});

async function executorService() {
    setInterval(async ()=>{
        var fn = actionQueue.shift();
        if(!fn) { return; }
        await fn?.act.call(globalThis);
        //console.log(`\nExecuting: ${fn.act.toString()}\n\n`)
    }, 50);
}

export function schedule(fn : ()=>void) {
    actionQueue.push(({act: fn} as QueuedAction));
}


client.on('message', async (msg : Message)=> {
    var chat = await msg.getChat();
    if(!chat.isGroup) return;
    if(config.whitelist.includes(chat.id._serialized)) return;

    var id = msg.author || msg.from;

    if(!configFile.whitelist.includes(id)&&debug) return;
    
    if(msg.from&&configFile.blacklist.includes(msg.from)&&msg.author!=configFile.ownerId) return; 
    
    /*
        EASTER EGGS
    */
    if(!msg.body||msg.body=="") return;

    if(msg.body.replace(" ", "").includes("amongus")||msg.body.includes("amogus")) {
        var randomlySelectedCock = amonguscocks[Math.floor(Math.random() * amonguscocks.length)];
        msg.reply(randomlySelectedCock);
        var amogus = MessageMedia.fromFilePath(`${__dirname}\\resources\\amogus.mp3`);
        client.sendMessage(msg.from, amogus, {sendAudioAsVoice: true});   
    }
    if(msg.body.includes("sans")) {
        msg.reply(sans+"\nsans undertal");
    }


    /*
        COMMANDS
    */
    if(!msg.body.startsWith(configFile.commandPrefix)) return;

    var blacklisted : boolean = asSequence(blacklist).filter(bl=>msg.from.includes(bl)).count() > 0;
    //blacklist
    if(blacklisted) {
        msg.reply("❌ No tenés permitido usar el bot porque no sos copado 😤😤");
        return;
    }

    //PREVENT OVERLOAD
    var cd = cooldown.get(id);
    if(cd&&id!=config.ownerId&&!config.cooldownWhitelist.includes(id)) {
        var difference = Date.now() - cd;
        if(difference<config.defaultCooldown) {
            schedule(async ()=> await msg.reply(`Tenés que esperar ${Math.floor((config.defaultCooldown-difference)/1000)} segundos antes de usar otro comando!`));
            return;
        }
    }

    //lil announcement code
    if(announcement.length>0) {
        msg.getChat().then(chat=>{
            if(!announcedTo.includes(chat.id._serialized)) {
                console.log(chalk.yellow(`Announcing to ${chalk.white(chat.name)} [${chat.id._serialized}]`));
                schedule(async ()=> await chat.sendMessage(announcement));
                announcedTo.push(chat.id._serialized);
            }
        })
    }


    let split = msg.body.split(" ");
    let command = split[0].replace(".", "");
    let args = split;
    args.shift();

    moduleMap.forEach((value, key)=>{
        if(command == key) {
            var date = new Date();
            console.log(`${chalk.yellowBright(`[${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}]`)} Executing command: ${key}`);
            try {
                schedule(async ()=> await value.cmd.call(this, client, msg, command));
            } catch(err) {
                msg.reply(`---- ERROR ----\n${err}`);
                if(err) console.error(err);
            }
            cooldown.set(id, Date.now());
        }
    })
});


client.initialize().catch(ex => {console.error(ex)});
executorService();