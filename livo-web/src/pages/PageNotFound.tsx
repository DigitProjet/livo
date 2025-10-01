import { Link } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";


export const PageNotFound = () => {
    return (
        <AppLayout>
            <div>
                <h1>Page Not Found</h1>
                <Link to="/">Go to Home</Link>
            </div>
        </AppLayout>
    );
};