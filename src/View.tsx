import { Button, Modal } from "react-bootstrap";
import Icon from "./Icon";

export type ViewProps = {
    show : boolean;
    file ?: string;
    onHide : () => void;
}

export default function View({ show, file, onHide } : ViewProps) {

    return (

        <Modal show={ show } onHide={ onHide } size="lg" centered>

            <Modal.Header className="alert alert-info rounded-bottom-0 user-select-none" closeButton>
                <Modal.Title>
                    <Icon variant="clip" />
                    &nbsp;
                    Anexo
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                
                { file ? (
                    <iframe
                        src={ 'data/__anexos__/' + file }
                        title={ file }
                        className="w-100 min-vh-50"
                    /> 
                ) : 'Nenhum arquivo para exibir!' }
               
            </Modal.Body>

            <Modal.Footer>
                <Button variant="dark" onClick={ onHide }>
                    Fechar
                </Button>
            </Modal.Footer>

        </Modal>

    );

}
