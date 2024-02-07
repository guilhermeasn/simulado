import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Button, FloatingLabel, Form } from 'react-bootstrap';
import { getData } from './App';

export type QuizInfo = {
    file : string;
    category : string;
    subcategory : string;
}

export type StartProps = {
    onSubmit : (quiz : QuizInfo) => void
}

type Category = string;
type Subcategory = string;
type File = string;

export type Data = Record<Category, Record<Subcategory, File>>;

export default function Start({ onSubmit } : StartProps) {

    const [ data, setData ] = useState<Data>({});
    const [ category, setCategory ] = useState<string | null>(null);
    const [ subcategory, setSubcategory ] = useState<string | null>(null);

    useEffect(() => { getData().then(setData); }, []);

    const categories = useMemo(() => Object.keys(data), [data]);

    const submit = (event : FormEvent<HTMLFormElement>) => {

        event.preventDefault();

        if(!category || !subcategory) return;

        onSubmit({
            file: data[category][subcategory],
            category: category,
            subcategory: subcategory
        });
        
    };

    return (

        <Form onSubmit={ submit } className='text-center'>

            <FloatingLabel className='my-3' label='Categoria'>
                <Form.Select title='Categoria' value={ category ?? 'empty' } onChange={ input => setCategory(input.currentTarget.value) }>
                    <option value='empty' disabled>Selecione</option>
                    { categories.map((category, index) => (
                        <option key={ index } value={ category }>{ category }</option>
                    )) }
                </Form.Select>
            </FloatingLabel>

            <FloatingLabel className='my-3' label='Subcategoria'>
                <Form.Select title='Subcategoria' value={ subcategory ?? 'empty' } onChange={ input => setSubcategory(input.currentTarget.value) } disabled={ category === null }>
                    <option value='empty' disabled>Selecione</option>
                    { category !== null && Object.keys(data[category as keyof typeof data]).map((subcategory, index) => (
                        <option key={ index } value={ subcategory }>{ subcategory }</option>
                    )) }
                </Form.Select>
            </FloatingLabel>

            <Button type='submit' variant='primary' size='lg' disabled={ category === null || subcategory === null }>
                Iniciar
            </Button>

        </Form>

    );

}
