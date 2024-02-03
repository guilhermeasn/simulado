import {
    lstat,
    readFile,
    readdir,
    writeFile
} from "fs/promises";

type Category = string;
type Subcategory = string;

type Quiz = {
    question : string;
    options : string[];
    answer : number;
}

type Data = Record<Category, Record<Subcategory, Quiz[]>>;

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

async function getData() : Promise<Data> {

    const data : Data = {};

    for(let category of (await readdir('data/'))) {

        if(!(await lstat('data/' + category)).isDirectory()) continue;
        data[category] = {}
        
        for(let subcategory of (await readdir(`data/${category}/`))) {

            if(!/\.txt/i.test(subcategory)) continue;

            let txt = await readFile(`data/${category}/${subcategory}`, { encoding: 'utf8' });
            txt = txt.replace(/[\n\r]/g, '');

            data[category][subcategory.replace(/.txt$/i, '')] = txt.split('-----').map(getQuiz);

        }

    }

    return data;

}

getData().then(data => 
    writeFile('src/data.json', JSON.stringify(data)).then(() => 
        console.log('Data was created!')
    )
);
