import { useState } from "react";
import { Container, Navbar } from "react-bootstrap";
import Quiz from "./Quiz";
import Start from "./Start";

export default function App() {

    const [ quiz, setQuiz ] = useState<string | null>(null);

    return <>
    
    <header>
        <Navbar bg="primary" data-bs-theme="dark">
            <Container>
                <Navbar.Brand>
                    QUIZ
                </Navbar.Brand>
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

    
    </>;

}
