import { Link } from 'react-router-dom';
import { ROUTES } from '../../configs/constants';

export default function NotFound() {
    return (
        <div className="container-fluid p-5 text-center">
            <h4 className="fw-bold">404 — Page not found</h4>
            <p className="text-muted">The page you are looking for does not exist.</p>
            <Link to={ROUTES.HOME.DASHBOARD} className="btn btn-primary">Go to Dashboard</Link>
        </div>
    );
}
