const fs = require("fs/promises");

const cache = new Map();

let result = {};
let blockPosition = 0;
let blockName = "";
let blockData = "";

let gameSave;
let splitSave;

const jsonResult = {};

function handleBlockName(text) {
    return text.replace(" {", "");
}

function handleBlock(line, blockName = "Unknown") {
    let data = {};

    for (let i = line; i < splitSave.length; i++) {

        const text = splitSave[i].trim();

        if(text.endsWith("}")) return {ends: i, data, blockName};

        if(text.endsWith("{")) {
            console.log("Entering block inside of block");
            const res = handleBlock(i + 1, handleBlockName(text));

            // console.log(res);

            i = res.ends + 1;

            data[res.blockName] = res.data;
        }

        const splitText = text.split(": ");
        if(splitText[0].endsWith("]")) {
            const split = text.split("[");

            if(typeof(data[split[0]]) !== "object") data[split[0]] = [];

            data[split[0]].push(split[1].split("]:")[1].trim());
        }else {
            data[splitText[0]] = splitText[1];
        }
    }
}

async function main() {
    gameSave = await fs.readFile("game.sii", "utf8");

    splitSave = gameSave.split("\n");

    const data = [];

    for (let i = 0; i < splitSave.length; i++) {
        const line = splitSave[i].trim();
        
        if(line.endsWith("{")) {
            console.log("Entering block");
            const res = handleBlock(i + 1, handleBlockName(line));

            jsonResult[res.blockName] = res.data;

            i = res.ends;
        }
    }

    await fs.writeFile("game.json", JSON.stringify(jsonResult, null, 4));
    // for (let i in splitSave) {
    //     const line = splitSave[i].trim();

    //     if(line.endsWith("{")) {
    //         blockName = line.replace("{", "").trim();
    //         blockPosition++;
    //     }else if(line.endsWith("}")) {
    //         blockName = "";
    //         blockPosition--;
    //     }

        

    //     blockData+= line;

    //     console.log(result);
    // }

    // let isInsideBlock = false;
    // let currentBlock = "";

    // let result = {};

    // for (let i in splitSave) {
    //     const line = splitSave[i].trim();

    //     if(line.includes("{")) {
    //         isInsideBlock = true;
    //         console.log("Moving into block");
    //     }else if(line.includes("}")) {
    //         isInsideBlock = false;
    //         console.log("Moving out of block");
    //     }

    //     if(isInsideBlock) {currentBlock += line + "\n";}

    //     console.log(currentBlock);
    // }

    // console.log(result);
}

main();