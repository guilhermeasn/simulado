import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Button, ListGroup, Spinner } from "react-bootstrap";
import { getData } from "./App";
import Icon from "./Icon";

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
    onSave : (hits : number, errors : number) => void;
    onOpen : (file : string) => void;
    onEnd : () => void;
}

export type QuizData = {
    owner   ?: string;
    attachs ?: string[];
    question : string[];
    options  : string[];
    answer   : number;
}

export default function Quiz({ file, onSave, onOpen, onEnd } : QuizProps) {

    const [ data, setData ] = useState<QuizData[]>([]);
    useEffect(() => { getData(file).then(setData) }, [ file ]);

    const sequence : number[] = useMemo(() => getRandomIndex(data.length), [data]);

    const [ index, setIndex ] = useState<number>(0);
    const [ hit, setHit ] = useState<Array<boolean | null>>([]);
    const [ answer, setAnswer ] = useState<number | null>(null);

    const getHits = useCallback((stat : boolean | null) : number => hit.filter(h => h === stat).length, [hit]);
    useEffect(() => setHit(Array(data.length).fill(null)), [data]);

    const quiz : QuizData | null = useMemo(() => data?.[sequence?.[index] ?? 'end'] ?? null, [data, index, sequence]);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { if(quiz === null && file && hit.length) onSave(getHits(true), getHits(false)); }, [file, hit, quiz]);

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

                <p className="fw-bolder">
                    { quiz.question.map((p, i) => (
                        <Fragment key={ i }>
                            { p }
                            <br />
                        </Fragment>
                    )) }
                </p>

                { quiz.attachs && (
                    <div className="d-flex justify-content-end">
                        { quiz.attachs.map(file => (
                            <p className="m-2 text-primary clickable" onClick={ () => onOpen(file) }>
                                <Icon variant="clip" size={ 15 } />
                                <span className="p-1">{ file }</span>
                            </p>
                        )) }
                    </div>
                ) }

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
