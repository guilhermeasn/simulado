import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Button, ListGroup, Spinner } from "react-bootstrap";
import { getData } from "./App";

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

export type FormatSave = Record<string, [ number, number ]>;

function save(file : string, hits : number, errors : number) : void {
    if(typeof localStorage !== 'object') return;
    let data = JSON.parse(localStorage.getItem('quiz_score') ?? '{}') as FormatSave;
    if(typeof data !== 'object' || Object.values(data).some(v => !Array.isArray(v) || typeof v[0] !== 'number' || typeof v[1] !== 'number')) data = {};
    data[file] = [ hits, errors ];
    localStorage.setItem('quiz_score', JSON.stringify(data));
}

export type QuizProps = {
    file : string;
    onEnd : () => void;
}

export type QuizData = {
    attachs ?: string[];
    owner   ?: string;
    question : string;
    options  : string[];
    answer   : number;
}

export default function Quiz({ file, onEnd } : QuizProps) {

    const [ data, setData ] = useState<QuizData[]>([]);
    useEffect(() => { getData(file).then(setData) }, [ file ]);

    const sequence : number[] = useMemo(() => getRandomIndex(data.length), [data]);

    const [ index, setIndex ] = useState<number>(0);
    const [ hit, setHit ] = useState<Array<boolean | null>>([]);
    const [ answer, setAnswer ] = useState<number | null>(null);

    const getHits = useCallback((stat : boolean | null) : number => hit.filter(h => h === stat).length, [hit]);
    useEffect(() => setHit(Array(data.length).fill(null)), [data]);

    const quiz : QuizData | null = useMemo(() => data?.[sequence?.[index] ?? 'end'] ?? null, [data, index, sequence]);

    useEffect(() => { if(quiz === null && file && hit.length) save(file, getHits(true), getHits(false)); }, [file, getHits, hit.length, quiz]);

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
        setHit(Array(data.length).fill(null));
    }, [data]);

    const end = () => {
        setData([]);
        onEnd();
    };

    if(data.length === 0) return <Loading />;

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
                <Button className="mx-2" variant="outline-secondary" size="lg" onClick={ end }>
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
                <Button className="mx-2" variant="dark" size="lg" onClick={ end }>
                    Encerrar
                </Button>
            </div>

        </div>

    );

}

export function Loading() {

    return (
        <div className="d-flex justify-content-center">
            <Spinner animation="border" variant="secondary" />
            <div className="ms-3 mt-1 text-secondary">Aguarde ...</div>
        </div>
    )

}
