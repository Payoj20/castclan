import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext"
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Room from "./pages/Room";
import Home from "./pages/Home";
import History from "./pages/History";
import LandingPage from "./pages/LandingPage";
import { Toaster } from "./components/ui/sonner";


function Spinner() {
    return (
        <div className="h-screen bg-gray-950 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );
}

// Logged-in only
function PrivateRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <Spinner />;
    return user ? children : <Navigate to="/" replace />;
}

// Redirect to /home if already logged in
function PublicOnlyRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <Spinner />;
    return user ? <Navigate to="/home" replace /> : children;
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Toaster position="top-center" richColors toastOptions={{
                    duration: 2500
                }} />
                <Routes>
                    <Route path="/" element={<PublicOnlyRoute><LandingPage /></PublicOnlyRoute>} />
                    <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
                    <Route path="/signup" element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />
                    <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
                    <Route path="/room/:roomCode" element={<PrivateRoute><Room /></PrivateRoute>} />
                    <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}