import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { context } from "../context/DataContext"; 
import NavBar from "../components/NavBar";
export default function ProtectedLayout() {
    const { user, loading } = useContext(context);
    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;

    return (
        <>
             <NavBar />
        <Outlet />
        </>
       
)
}