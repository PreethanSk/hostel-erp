import { useNavigate } from "react-router-dom";
import "./style.scss";

function Index() {
    const navigate = useNavigate()
    return <>
        <div className="text-center my-2">
            <span className="bg-light border rounded p-1 fs-6" role="button" onClick={() => navigate(-1)}>Go Back</span>
        </div>
        <div className="d-flex justify-content-center align-items-center py-5">
            <div className="position-relative w-100">
                <div className="notfound">
                    <div className="notfound-404">
                        <h3>Oops! Page not found</h3>
                        <h1><span>4</span><span>0</span><span>4</span></h1>
                    </div>
                </div>
            </div>
        </div>
    </>
}

export default Index;
