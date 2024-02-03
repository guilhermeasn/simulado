import data from './data.json';

export default function App() {

    return <pre>{ JSON.stringify(data, undefined, 4) }</pre>;

}