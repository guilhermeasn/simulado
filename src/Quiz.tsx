import { useMemo, useState } from "react";
import { Button, ListGroup } from "react-bootstrap";
import data from './data.json';

export type QuizProps = {
    category : string;
    subcategory : string;
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

type Quiz = {
    question : string;
    options : string[];
    answer : number;
}

export default function Quiz({ category, subcategory, onEnd } : QuizProps) {

    // @ts-ignore
    const dataset : Quiz[] = useMemo(() => data[category][subcategory], [category, subcategory]);
    const sequence = useMemo(() => getRandomIndex(dataset.length), [dataset]);

    const [ index, setIndex ] = useState<number>(0);
    const [ hit, setHit ] = useState<number>(0);
    const [ answer, setAnswer ] = useState<number | null>(null);

    const quiz : Quiz = useMemo(() => dataset[sequence[index]], [dataset, sequence, index]);

    return (

        <div>

            <div>

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
                <Button className="mx-2" variant="success" size="lg">
                    Confirmar
                </Button>
            </div>

        </div>

    );

}
