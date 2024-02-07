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

function getQuiz(txt : string, exists : (file : string) => boolean) : QuizData {

    const error = (message : string) => ({
        error: message,
        question: txt
    });

    // ANEXOS

    let data = txt.trim();
    const attachs = data.match(/(?<=ANEXO:\s*)\S+/g)?.map(m => m.toString());
    if(attachs) attachs.forEach(attach => {
        if(!exists(attach)) throw error(`O anexo '${attach}' não foi encontrado`);
    });
    data = data.replace(/ANEXO:\s*\S+/g, '');

    // RESPOSTA CHAR

    data = data.trim();
    const answerData = data.match(/RESPOSTA:\s*([a-zA-Z])/)?.[1]
    if(!answerData) throw error('Existe uma pergunta sem RESPOSTA');
    data = data.replace(/RESPOSTA:\s*\S+/, '');

    // OPCOES

    data = data.trim();
    const optionsData = data.match(/(\s[a-zA-Z]\).+?){2,}$/)?.[0];
    if(optionsData) data = data.replace(/(\s[a-zA-Z]\).+?){2,}$/, '');
    const options = optionsData?.match(/(?<=\s)[a-zA-Z]\).+?(?=\s[a-zA-Z]\)|$)/g)?.map(m => m.toString().trim()) ?? [ 'Certo', 'Errado' ];

    // RESPOSTA INDEX

    const answer = options.findIndex(o => o.charAt(0).toLowerCase() === answerData.charAt(0).toLowerCase());
    if(answer < 0) throw error('Existe uma pergunta com uma RESPOSTA não encontrada');

    // BANCA

    data = data.trim();
    const owner = data.match(/^\(.+?\)/)?.[0]?.replace(/^\((.+)\)$/, '$1');
    if(owner) data = data.replace(/^\(.+?\)/, '');

    // QUESTAO

    data = data.trim();
    if(!data) throw error('A questão não foi bem definida');
    const question = data.match(/.{30,}?[.|:](?=\s*[A-Z])|.+$/g)?.map(m => m.toString().trim()) ?? [ data ];

    return {
        owner,
        question,
        options,
        attachs,
        answer,
    }

}

async function main(origin : string, destiny : string) : Promise<void> {

    await rm(destiny, { recursive: true, force: true });
    await mkdir(destiny);

    const data : Data = {};
    let count : number = 100;

    for(let category of (await readdir(origin))) {

        if(!(await lstat(origin + '/' + category)).isDirectory()) continue;

        if(category === '__anexos__') {
            await cp(origin + '/__anexos__', destiny + '/__anexos__', { recursive: true });
            continue;
        }

        data[category] = {}
        
        for(let subcategory of (await readdir(origin + '/' + category))) {

            if(!/\.txt/i.test(subcategory) || !(await lstat(`${origin}/${category}/${subcategory}`)).isFile()) continue;

            let txt = await readFile(`${origin}/${category}/${subcategory}`, { encoding: 'utf8' });
            txt = txt.replace(/[\n\r]/g, ' ').replace(/\s{2,}/g, ' ');

            const file = 'q' + count++;
            await writeFile(destiny + '/' + file + '.json', JSON.stringify(txt.split('-----').map(t => getQuiz(t, f => existsSync(origin + '/__anexos__/' + f))), undefined, 2));

            data[category][subcategory.replace(/.txt$/i, '')] = file;

        }

    }

    await writeFile(destiny + '/index.json', JSON.stringify(data, undefined, 2));

}

main('data', 'public/data')
    .then(() => console.log('The data was compiled!'))
    .catch(e => { console.error(e); process.exitCode = 1; });
