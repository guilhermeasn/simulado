import { useMemo, useState } from "react";
import { Alert, Button, ListGroup } from "react-bootstrap";

export type QuizProps = {
    file : string;
    onEnd : () => void;
}

function getRandomInt(min : number, max : number) : number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomIndex(length : number) : number[] {

    const indexes : number[] = []

    while(indexes.length < length) {
        const random : number = getRandomInt(0, length - 1);
        if(indexes.some(i => i === random)) continue;
        indexes.push(random);
    }

    return indexes;

}

type QuizData = {
    question : string;
    options : string[];
    answer : number;
}

export default function Quiz({ file, onEnd } : QuizProps) {

    const dataset : QuizData[] = useMemo(() => require('./data/' + file), [file]);
    const sequence = useMemo(() => getRandomIndex(dataset.length), [dataset]);

    const [ index, setIndex ] = useState<number>(0);
    const [ hit, setHit ] = useState<number>(0);
    const [ answer, setAnswer ] = useState<number | null>(null);

    const quiz : QuizData | null = dataset?.[sequence[index]] ?? null;

    const submit = () => {
        console.log('aqui', answer, quiz, hit);
        if(answer === null) return;
        if(answer === quiz.answer) setHit(hit => hit + 1);
        setIndex(index => index + 1);
        setAnswer(null);
    }

    return quiz ? (

        <div>

            <div>

                <Alert variant="warning" className="d-flex justify-content-around">
                    <div>Acertou: { hit }</div>
                    <div>Errou: { index - hit }</div>
                    <div>Faltam: { sequence.length - index }</div>
                </Alert>

                <p>{ quiz.question }</p>

                <ListGroup>
                    { quiz.options.map((option, i) => (
                        <ListGroup.Item variant="info" className="py-3" key={ i } active={ answer === i } onClick={ () => setAnswer(i) } action>
                            { option }
                        </ListGroup.Item>
                    )) }
                </ListGroup>

            </div>

            <div className="d-flex justify-content-center mt-4">
                <Button className="mx-2" variant="outline-secondary" size="lg" onClick={ onEnd }>
                    Encerrar
                </Button>
                <Button className="mx-2" variant="success" size="lg" onClick={ submit } disabled={ answer === null }>
                    Confirmar
                </Button>
            </div>

        </div>

    ) : (

        <div>

            <Alert variant="success">
                <Alert.Heading>Acertou</Alert.Heading>
                { hit } { hit === 1 ? 'questão' : 'questões' }
            </Alert>

            <Alert variant="danger">
                <Alert.Heading>Errou</Alert.Heading>
                { index - hit } { index - hit === 1 ? 'questão' : 'questões' }
            </Alert>

            <div className="text-center">
                <Button className="mx-2" variant="outline-primary" size="lg" onClick={ () => setIndex(0) }>
                    Refazer
                </Button>
                <Button className="mx-2" variant="dark" size="lg" onClick={ onEnd }>
                    Encerrar
                </Button>
            </div>

        </div>

    );

}
