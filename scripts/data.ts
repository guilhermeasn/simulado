import {
    lstat,
    mkdir,
    readFile,
    readdir,
    rm,
    writeFile
} from "fs/promises";

type Category = string;
type Subcategory = string;
type file = string;

type Quiz = {
    question : string;
    options : string[];
    answer : number;
}

type Data = Record<Category, Record<Subcategory, file>>;

function getQuiz(txt : string) : Quiz {

    const question = txt.match(/.+?(?=([a-z]\).+?){2,}|RESPOSTA)/)?.[0] ?? '';

    const optionsData = txt.match(/(([a-z]\).+?){2,})RESPOSTA/)?.[1];
    const options = optionsData ? [ ...optionsData.matchAll(/.+?(?=[a-z]\)|$)/g) ].map(o => o.toString().trim()) : [ 'Certo', 'Errada' ];

    const answerData = txt.match(/RESPOSTA:\s*([a-z])/)?.[1]
    if(!answerData) throw Error('Existe uma pergunta sem RESPOSTA');

    const answer = options.findIndex(o => o.charAt(0).toLowerCase() === answerData.toLowerCase());
    if(answer < 0) throw Error('Existe uma pergunta com uma RESPOSTA não encontrada');

    return {
        question,
        options,
        answer
    }

}

async function main(origin : string, destiny : string) : Promise<void> {

    await rm(destiny, { recursive: true, force: true });
    await mkdir(destiny);

    const data : Data = {};

    let count : number = 100;

    for(let category of (await readdir(origin))) {

        if(!(await lstat(origin + '/' + category)).isDirectory()) continue;
        data[category] = {}
        
        for(let subcategory of (await readdir(`data/${category}/`))) {

            if(!/\.txt/i.test(subcategory)) continue;

            let txt = await readFile(`${origin}/${category}/${subcategory}`, { encoding: 'utf8' });
            txt = txt.replace(/[\n\r]/g, ' ').replace(/\s{2,}/g, ' ');

            const file = `q${count++}.json`
            await writeFile(destiny + '/' + file, JSON.stringify(txt.split('-----').map(getQuiz)));

            data[category][subcategory.replace(/.txt$/i, '')] = file;

        }

    }

    await writeFile(destiny + '/index.json', JSON.stringify(data, undefined, 4));

}

main('data', 'src/data').then(() => console.log('The data was compiled!'));
