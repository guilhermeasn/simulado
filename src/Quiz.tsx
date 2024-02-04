import { useEffect, useMemo, useState } from "react";
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

export type QuizData = {
    owner ?: string
    question : string;
    options : string[];
    answer : number;
}

export default function Quiz({ file, onEnd } : QuizProps) {

    const dataset : QuizData[] = useMemo(() => require('./data/' + file), [file]);
    const sequence = useMemo(() => getRandomIndex(dataset.length), [dataset]);

    const [ index, setIndex ] = useState<number>(0);
    const [ hit, setHit ] = useState<Array<boolean | null>>([]);
    const [ answer, setAnswer ] = useState<number | null>(null);

    useEffect(() => setHit(Array(dataset.length).fill(null)), [dataset]);

    const quiz : QuizData | null = dataset?.[sequence[index]] ?? null;

    const submit = () => {
        if(answer === null) return;
        setHit(hit => hit.map((h, i) => i === index ? answer === quiz.answer : h));
        setIndex(index => index + 1);
        setAnswer(null);
    }

    const back = () => {
        const i = index - 1;
        setIndex(i);
        setHit(hit => hit.map((h, k) => i === k ? null : h));
    }

    return quiz ? (

        <div>

            <div>

                <Alert variant="warning" className="d-flex justify-content-around">
                    <div>Acertou: { hit.filter(h => h === true).length }</div>
                    <div>Errou: { hit.filter(h => h === false).length }</div>
                    <div>Faltam: { hit.filter(h => h === null).length }</div>
                </Alert>

                { quiz.owner && <p className="small">{ quiz.owner }</p> }

                <p className="fw-bolder">{ quiz.question }</p>

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
                <Button className="mx-2" variant="outline-secondary" size="lg" onClick={ back } disabled={ index === 0 }>
                    Voltar
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
                { hit.filter(h => h === true).length } { hit.filter(h => h === true).length === 1 ? 'questão' : 'questões' }
            </Alert>

            <Alert variant="danger">
                <Alert.Heading>Errou</Alert.Heading>
                { hit.filter(h => h === false).length } { hit.filter(h => h === false).length === 1 ? 'questão' : 'questões' }
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
