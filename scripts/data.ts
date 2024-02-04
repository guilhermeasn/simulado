import {
    cp,
    lstat,
    mkdir,
    readFile,
    readdir,
    rm,
    writeFile
} from "fs/promises";

import { existsSync } from "fs";

import type { QuizData } from '../src/Quiz';
import type { Data } from '../src/Start';

function getQuiz(txt : string, origin : string) : QuizData {

    txt = txt.trim();
    const owner = txt.match(/^\(.+?\)/)?.[0]?.replace(/^\((.+)\)$/, '$1');
    if(owner) txt = txt.replace(/^\(.+?\)/, '');

    const attachs = [ ...txt.matchAll(/(?<=ANEXO:\s*)[\w.]+/g) ].map(o => o.toString()).filter(f => existsSync(origin + '/__anexos__/' + f));
    txt = txt.replace(/ANEXO:\s*[\w.]+/g, '');

    const question = txt.match(/.+?(?=([a-zA-Z]\).+?){2,}|RESPOSTA)/)?.[0] ?? '';

    const optionsData = txt.match(/\s(([a-zA-Z]\).+?){2,})RESPOSTA/)?.[1];
    const options = optionsData ? [ ...optionsData.matchAll(/.+?(?=[a-zA-Z]\)|$)/g) ].map(o => o.toString().trim()) : [ 'Certo', 'Errado' ];

    const answerData = txt.match(/RESPOSTA:\s*([a-zA-Z])/)?.[1]
    if(!answerData) throw Error('Existe uma pergunta sem RESPOSTA: ' + question);

    const answer = options.findIndex(o => o.charAt(0).toLowerCase() === answerData.charAt(0).toLowerCase());
    if(answer < 0) throw Error('Existe uma pergunta com uma RESPOSTA não encontrada: ' + question);

    return {
        attachs,
        owner,
        question,
        options,
        answer,
    }

}

async function main(origin : string, destiny : string) : Promise<void> {

    await rm(destiny, { recursive: true, force: true });
    await mkdir(destiny);

    const data : Data = {};
    const files : Record<string, string> = {};

    let count : number = 100;

    for(let category of (await readdir(origin))) {

        if(!(await lstat(origin + '/' + category)).isDirectory()) continue;

        if(category === '__anexos__') {
            await cp(origin + '/__anexos__', destiny + '/__anexos__', { recursive: true });
            continue;
        }

        data[category] = {}
        
        for(let subcategory of (await readdir(origin + '/' + category))) {

            if(!/\.txt/i.test(subcategory)) continue;

            let txt = await readFile(`${origin}/${category}/${subcategory}`, { encoding: 'utf8' });
            txt = txt.replace(/[\n\r]/g, ' ').replace(/\s{2,}/g, ' ');

            const file = 'q' + count++;
            await writeFile(destiny + '/' + file + '.json', JSON.stringify(txt.split('-----').map(t => getQuiz(t, origin))));

            data[category][subcategory.replace(/.txt$/i, '')] = file;
            files[file] = subcategory.replace(/.txt$/i, '');

        }

    }

    await writeFile(destiny + '/index.json', JSON.stringify(data, undefined, 4));
    await writeFile(destiny + '/files.json', JSON.stringify(files, undefined, 4));

}

main('data', 'public/data').then(() => console.log('The data was compiled!'));
