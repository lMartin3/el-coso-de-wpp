import Canvas from "canvas";

export const filters = {
    gay: "gay.png",
    communism: "communism.png",
    palestine: "palestine.png",
    israel: "israel.png",
    boquita: "boquita.png",
    river: "river.png",
    newells: "newells.png",
    carc: "carc.png"
}

export const templates = {
    pelotudo: "pltdo.png",
    pelotuda: "pltda.png",
    fc: "fc.png",
    megavirgen: "megavirgen.png"
}

export async function applyFilter(image : string, filterFile : string) {
    let bg = await Canvas.loadImage(`${__dirname}\\resources\\filters\\${filterFile}`);
    let img = await Canvas.loadImage(image);
    const canvas = Canvas.createCanvas(480, 480);
    const ctx = canvas.getContext(`2d`);
    ctx.drawImage(img, 0, 0, 480, 480);
    ctx.drawImage(bg, 0, 0, 480, 480);
    return canvas;
}

export async function applyTemplate(image : string, filterFile : string) {
    let template = await Canvas.loadImage(`${__dirname}\\resources\\templates\\${filterFile}`);
    let pfp = await Canvas.loadImage(image);
    const canvas = Canvas.createCanvas(600, 600);
    const ctx = canvas.getContext(`2d`);
    ctx.drawImage(template, 0, 0, 600, 600);
    ctx.drawImage(pfp, 125, 125, 350, 350);
    return canvas;
}