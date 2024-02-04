import map from "object-as-array/map";
import { useEffect, useState } from "react";
import { Button, Modal, Table } from "react-bootstrap";
import { getData } from "./App";
import Icon from "./Icon";
import { FormatSave } from "./Quiz";

export type StatisticProps = {
    show : boolean;
    onHide : () => void;
}

export default function Statistic({ show, onHide } : StatisticProps) {

    const [ files, setFiles ] = useState<Record<string, string>>({});
    useEffect(() => { getData('files').then(setFiles) }, []);

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
                        <tr>
                            <th>Disciplina</th>
                            <th>Acertos</th>
                            <th>Erros</th>
                        </tr>
                    </thead>

                    <tbody>
                        { Object.keys(data).length ? map(data, ([ s, e ], file) => (
                            <tr key={ file }>
                                <td className="text-truncate">{ (files as Record<string, string>)?.[file] ?? file  }</td>
                                <td className="bg-success-subtle text-success">{ s }</td>
                                <td className="bg-danger-subtle text-danger">{ e }</td>
                            </tr>
                        )) : (
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
