import fs from "fs";
import { Client, Message } from "whatsapp-web.js";
import { getChatCount } from "../utils";
import config from "../config.json";
import fetch from "node-fetch";

export interface DolarData {
    buyPrice: number,
    sellPrice: number
}

module.exports.cmd = async (client : Client, msg : Message, cmd : string) => {
    var msgChat = await msg.getChat();
    var msgContact = await msg.getContact();
    var args = msg.body.split(" ");
    args.shift();

    if(cmd=="dolartarjeta"&&args.length<1) {
        await msg.reply("Flaco... si no me das el valor COMO MIERDA SE SUPONE QEU LO CALCULE. USÁ .dolartarjeta [monto en dólares] LA RECALCULADA CONCHA DE TU HERMANA");
        return;
    }

    var res = await fetch("https://dolarapi.martinl.dev/api/?type=resumed");
    var json = await res.json();
    console.log(json);
    var dolarBlue : DolarData = json["Dolar Blue"];
    var dolarOficial : DolarData = json["Dolar Oficial"];
    if(cmd=="dolar") {
        await msg.reply(`💸 VALOR DEL DOLAR 💸 
💵 Dolar Blue:
    📤 Venta: $${dolarBlue.sellPrice}
    📥 Compra: $${dolarBlue.buyPrice}
    
💵 Dolar Oficial:
    📤 Venta: $${dolarOficial.sellPrice}
    📥 Compra: $${dolarOficial.buyPrice}
    
✉️ Mensaje de el coso de whatsapp
💲 Datos de dolarsi.com`)
    } else if(cmd=="dolartarjeta") {
        var dol = dolarOficial.sellPrice;
        if(!parseFloat(args[0])) {
            msg.reply("Número inválido");
            return;
        }
        var input = parseFloat(args[0].replace(",", "."));
        var impuestoPais = input*0.3;        
        var retencion = input*0.35;
        var total = input + impuestoPais + retencion;
        
        await msg.reply(`CALCULADORA DE DOLAR TARJETA / DOLAR "SOLIDARIO"

💰 Costo en pesos (Dólar Oficial): $${(input*dol).toFixed(2)}
💵 Precio de venta del Dolar Oficial: $${(dolarOficial.sellPrice).toFixed(2)} ARS

💲 Impuesto País (30%): +$${(impuestoPais*dol).toFixed(2)} ARS
💲 Impueto país en Dólares: $${impuestoPais.toFixed(2)} USD

💲 Retención del 35%: +$${(retencion*dol).toFixed(2)} ARS
💲 Retención en Dólares: $${retencion.toFixed(2)} USD

📉 Total de Impuestos: $${((retencion+impuestoPais)*dol).toFixed(2)} ARS
📉 Total de Impuestos (en Dólares): $${(retencion+impuestoPais).toFixed(2)} USD

💰 Precio total: $${(total*dol).toFixed(2)} ARS o $${total.toFixed(2)} USD

✌️ Gracias Alberto por jodernos a TOD☀️S
✉️ Mensaje de el coso de whatsapp`);

    }

}

module.exports.info = {
	name: "dolar",
    aliases: ["dolartarjeta"]
}