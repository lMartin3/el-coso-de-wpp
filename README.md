# El Coso de Wpp
Un bot de whatsapp con múltiples funciones, escrito en TypeScript.<br>
⚠️ El código está desorganizado, necesita un refactoring, por ahora lo dejé así porque es un prototipo.

## ❗ Importante
---
En `package.json` hay algunos scripts de NPM para compilar el código en typescript, son estos:
```json
  "scripts": {
    "build": "rmdir /s /q dist&&tsc&&npm run copyfiles",
    "start": "node dist/index.js",
    "dev": "nodemon -e ts --exec \"npm run build && npm start\"",
    "copyfiles": "xcopy /Y /E /I .\\src\\resources\\ .\\dist\\resources"
  }
```
`build` borra la carpeta donde se genera el JS (dist), compila con `tsc` y copia los recursos con `copyfiles`<br>
`copyfiles` copia la carpeta `resources` desde 
`src` a `dist`<br>
`start` inicia el bot<br>
`dev` inicia el bot en modo desarrollo, cada vez que modifiques y guardes un archivo dentro de `src` se va a reiniciar el proceso<br>

Si estás usando Linux o MacOS es necesario cambiar los scripts para que utilizen comandos del sistema operativo correspondiente (los actuales son de Windows).

<br>

## Como hostear el bot
---
### ⚠️ Aviso:
Aunque este metodo funcionó para mí, WhatsApp **no permite bots no oficiales en su plataforma**. Eso sisgnifica que el numero que utilices para el bot podría ser bloqueado de WhatsApp. No me hago responsable por ningún daño causado a quien hostee este bot o sus usuarios.
<br>

### ☑️ Requisitos:
1. Una cuenta de WhatsApp (preferiblemente una que no utilice tu número principal)
2. Un teléfono celular o emulador capaz de correr WhatsApp con una conexión a internet estable.
3. Un servidor o PC (Linux / Windows / MacOS) capaz de correr nodejs con una conexión a internet estable.

### 📔 Pasos:
1. Clonar el repositorio
2. Copiar `config_template.json` a `config.json`
3. Configurar el bot según el template.
4. De estar usando Linux o MacOS, arreglar los scripts de `package.json`
5. Ejecutar `npm run build`
6. Ejecutar `npm run start`
7. Si estás usando un entorno gráfico, se va a abrir tu visualizador de imágenes con un código QR, si no, el código QR se va a mostrar en forma de base64 por la consola, convertilo a imagen. Una vez obtenido el código, escanealo con el celular.


### 📝 Notas:
* WhatsApp tiene un límite práctico de grupos, dependiendo de que teléfono y host estés utilizando, una vez alcanzado dicho límite el bot va a empezar a fallar, porque la librería no es capaz de procesar tana información de forma simultanea.
* A WhatsappWeb le encanta desconectarse arbitrariamente.
* El bot guarda los datos de autentificación en un archivo llamado `sessions.json` en la carpeta principal para que no sea necesario escanear el QR cada vez que se reinicia el bot.
* Si no inicia sesión el bot, eliminá el archivo `session.json`, y reinicialo.

<br>

## 📧 Contacto
---
E-Mail: dev.martin@protonmail.com<br>
Discord: lMartin3#1975

<br>

# Disclaimer

Este proyecto no está afiliado, asociado, autorizado o recomendado por, ni en ninguna forma oficial conectado con Whatsapp ni ninguno de sus subsidiarios o sus afiliados. El sitio web de WhatsApp puede encontrarse en https://whatsapp.com. "WhatsApp" así como nombres relacionados, marcas, emblemas e imágenes son marcas registradas de sus dueños respectivos.

This project is not affiliated, associated, authorized, endorsed by, or in any way officially connected with WhatsApp or any of its subsidiaries or its affiliates. The official WhatsApp website can be found at https://whatsapp.com. "WhatsApp" as well as related names, marks, emblems and images are registered trademarks of their respective owners.


<br>

### Este bot fue posible gracias a [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js).

<br>