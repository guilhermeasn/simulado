import { useState } from "react";
import { Container, Image, Navbar } from "react-bootstrap";
import Icon from "./Icon";
import Quiz from "./Quiz";
import Start, { QuizInfo } from "./Start";
import Statistic from "./Statistic";
import View from "./View";

export default function App() {

    const [ quiz, setQuiz ] = useState<QuizInfo | null>(null);

    const [ view, setView ] = useState<null | string>(null);
    const [ statistic, setStatistic ] = useState<boolean>(false);

    return <>
    
        <header>
            <Navbar bg="primary" data-bs-theme="dark">
                <Container className="user-select-none">
                    <Navbar.Brand href=".">
                        <Image src="favicon-32x32.png" className="me-2" />
                        Simulado
                    </Navbar.Brand>
                    <div className="text-light clickable" onClick={ () => setStatistic(true) }>
                        <Icon variant="chart" />
                    </div>
                </Container>
            </Navbar>
        </header>

        <main className="my-5 min-vh-70">
            <Container>
                { quiz === null ? (
                    <Start
                        onSubmit={ setQuiz }
                    />
                ) : (
                    <Quiz
                        file={ quiz.file }
                        onOpen={ setView }
                        onEnd={ () => setQuiz(null) }
                        onSave={ (hits, errors) => save(quiz, hits, errors) }
                    />
                ) }
            </Container>
        </main>

        <footer>
            <div className="border-top">
                <Container className="d-flex justify-content-between">
                    <a href='https://github.com/guilhermeasn/quiz' target="_blank" rel="noopener noreferrer">GitHub</a>
                    <a href="https://gn.dev.br/" target="_blank" rel="noopener noreferrer">&lt;gn.dev.br/&gt;</a>
                </Container>
            </div>
        </footer>

        <Statistic
            show={ statistic }
            onHide={ () => setStatistic(false) }
        />

        <View
            file={ view ?? undefined }
            show={ view !== null }
            onHide={ () => setView(null) }
        />

    
    </>;

}

export async function getData(file : string = 'index') {
    const response = await fetch(`data/${file}.json`);
    return await response.json();
}

export type FormatSave = Record<`${string}/${string}`, [ number, number ]>;

function save(quiz : QuizInfo, hits : number, errors : number) : void {
    if(typeof localStorage !== 'object') return;
    let data = JSON.parse(localStorage.getItem('quiz_score') ?? '{}') as FormatSave;
    if(typeof data !== 'object' || Object.values(data).some(v => !Array.isArray(v) || typeof v[0] !== 'number' || typeof v[1] !== 'number')) data = {};
    const key : `${string}/${string}` = `${quiz.category.replace('/','')}/${quiz.subcategory.replace('/','')}`;
    data[key] = [ hits, errors ];
    localStorage.setItem('quiz_score', JSON.stringify(data));
}
