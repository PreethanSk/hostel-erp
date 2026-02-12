import { BrowserRouter as Router } from 'react-router-dom';
import RouteApp from './RouteApp';

export default function RouteInit() {
    return (
        <Router>
            <RouteApp />
        </Router>
    );
}