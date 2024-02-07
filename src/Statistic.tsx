import map from "object-as-array/map";
import { useEffect, useState } from "react";
import { Button, Modal, Table } from "react-bootstrap";
import { FormatSave } from "./App";
import Icon from "./Icon";

export type StatisticProps = {
    show : boolean;
    onHide : () => void;
}

export default function Statistic({ show, onHide } : StatisticProps) {

    const [ data, setData ] = useState<FormatSave>({});
    useEffect(() => { if(show && typeof localStorage === 'object') setData(JSON.parse(localStorage.getItem('quiz_score') ?? '{}')); }, [ show ]);

    function reset() {
        if(typeof localStorage !== 'object') return;
        localStorage.setItem('quiz_score', '{}');
        onHide();
    }

    return (

        <Modal show={ show } onHide={ onHide } size="lg" centered>

            <Modal.Header className="alert alert-warning rounded-bottom-0 user-select-none" closeButton>
                <Modal.Title>
                    <Icon variant="chart" />
                    &nbsp;
                    Estatística
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                
                <Table striped bordered hover responsive>

                    <thead>
                        <tr className="text-center">
                            <th>Disciplina</th>
                            <th>Acertos</th>
                            <th>Erros</th>
                        </tr>
                    </thead>

                    <tbody>
                        { Object.keys(data).length ? map(data, ([ hits, errors ], name) => {

                            const [ category, subcategory ] = name.split('/');

                            return (
                                <tr key={ name }>
                                    <td className="small">
                                        <span className="text-truncate">{ category }</span>
                                        <br />
                                        <span className="text-truncate">{ subcategory }</span>
                                    </td>
                                    <td className="bg-success-subtle text-success text-center pt-3 h5">
                                        { hits }
                                    </td>
                                    <td className="bg-danger-subtle text-danger text-center pt-3 h5">
                                        { errors }
                                    </td>
                                </tr>
                             );

                        }) : (
                            <tr>
                                <td colSpan={ 3 } className="text-warning-emphasis">
                                    Nenhuma estatística salva!
                                </td>
                            </tr>
                        ) }
                    </tbody>

                </Table>

            </Modal.Body>

            <Modal.Footer>
                <Button variant="outline-danger" onDoubleClick={ reset } title="Apague toda a estatística com um click duplo">
                    Resetar
                </Button>
                <Button variant="dark" onClick={ onHide }>
                    Fechar
                </Button>
            </Modal.Footer>

        </Modal>

    );

}
