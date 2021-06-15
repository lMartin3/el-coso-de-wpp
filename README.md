# El Coso de Wpp
Un bot de whatsapp con múltiples funciones, escrito en TypeScript.<br>
⚠️ El código está desorganizado, necesita un refactoring, por ahora lo dejé así porque es un prototipo.

## Importante ❗
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

Este bot fue posible gracias a [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) (la librería utilizada).
