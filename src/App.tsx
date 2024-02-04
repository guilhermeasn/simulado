import { useState } from "react";
import { Container, Navbar } from "react-bootstrap";
import Icon from "./Icon";
import Quiz from "./Quiz";
import Start from "./Start";
import Statistic from "./Statistic";

export async function getData(file : string = 'index') {
    const response = await fetch(`/data/${file.replace(/.json$/i, '')}.json`);
    return await response.json();
}

export default function App() {

    const [ quiz, setQuiz ] = useState<string | null>(null);
    const [ modal, setModal ] = useState<boolean>(false);

    return <>
    
        <header>
            <Navbar bg="primary" data-bs-theme="dark">
                <Container className="user-select-none">
                    <Navbar.Brand>
                        QUIZ
                    </Navbar.Brand>
                    <div className="text-light clickable" onClick={ () => setModal(true) }>
                        <Icon variant="chart" />
                    </div>
                </Container>
            </Navbar>
        </header>

        <main className="my-5 min-vh-70">
            <Container>
                { quiz === null ? (
                    <Start onSubmit={ setQuiz } />
                ) : (
                    <Quiz file={ quiz } onEnd={ () => setQuiz(null) } />
                ) }
            </Container>
        </main>

        <footer>
            <div className="border-top">
                <Container className="d-flex justify-content-between">
                    <div>GitHub</div>
                    <div>&lt;gn.dev.br/&gt;</div>
                </Container>
            </div>
        </footer>

        <Statistic
            show={ modal }
            onHide={ () => setModal(false) }
        />

    
    </>;

}
