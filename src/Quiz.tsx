import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Button, ListGroup } from "react-bootstrap";

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

export type QuizProps = {
    file : string;
    onEnd : () => void;
}

export type QuizData = {
    owner ?: string
    question : string;
    options : string[];
    answer : number;
}

export default function Quiz({ file, onEnd } : QuizProps) {

    const dataset : QuizData[] = useMemo(() => require('./data/' + file), [file]);
    const sequence : number[] = useMemo(() => getRandomIndex(dataset.length), [dataset]);

    const [ index, setIndex ] = useState<number>(0);
    const [ hit, setHit ] = useState<Array<boolean | null>>([]);
    const [ answer, setAnswer ] = useState<number | null>(null);

    const getHits = useCallback((stat : boolean | null) : number => hit.filter(h => h === stat).length, [hit]);
    useEffect(() => setHit(Array(dataset.length).fill(null)), [dataset]);

    const quiz : QuizData | null = useMemo(() => dataset?.[sequence?.[index] ?? 'end'] ?? null, [dataset, index, sequence]);

    const submit = useCallback(() => {
        if(answer === null) return;
        setHit(hit => hit.map((h, i) => i === index ? answer === quiz.answer : h));
        setIndex(index => index + 1);
        setAnswer(null);
    }, [answer, index, quiz]);

    const back = useCallback(() => {
        const i = index - 1;
        setIndex(i);
        setHit(hit => hit.map((h, k) => i === k ? null : h));
    }, [index]);

    const remake = useCallback(() => {
        setIndex(0);
        setHit(Array(dataset.length).fill(null));
    }, [dataset]);

    return quiz ? (

        <div>

            <div>

                <Alert variant="warning" className="d-flex justify-content-around">
                    <div>Acertou: { getHits(true) }</div>
                    <div>Errou: { getHits(false) }</div>
                    <div>Faltam: { getHits(null) }</div>
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
                { getHits(true) } { getHits(true) === 1 ? 'questão' : 'questões' }
            </Alert>

            <Alert variant="danger">
                <Alert.Heading>Errou</Alert.Heading>
                { getHits(false) } { getHits(false) === 1 ? 'questão' : 'questões' }
            </Alert>

            <div className="text-center">
                <Button className="mx-2" variant="outline-primary" size="lg" onClick={ remake }>
                    Refazer
                </Button>
                <Button className="mx-2" variant="dark" size="lg" onClick={ onEnd }>
                    Encerrar
                </Button>
            </div>

        </div>

    );

}
