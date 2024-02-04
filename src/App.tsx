import { useState } from "react";
import { Container, Image, Navbar } from "react-bootstrap";
import Icon from "./Icon";
import Quiz from "./Quiz";
import Start from "./Start";
import Statistic from "./Statistic";
import View from "./View";

export async function getData(file : string = 'index') {
    const response = await fetch(`data/${file}.json`);
    return await response.json();
}

export default function App() {

    const [ quiz, setQuiz ] = useState<[string, string] | null>(null);

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
                    <Start onSubmit={ (file, name) => setQuiz([ file, name ]) } />
                ) : (
                    <Quiz name={ quiz[1] } onOpen={ setView } file={ quiz[0] } onEnd={ () => setQuiz(null) } />
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
