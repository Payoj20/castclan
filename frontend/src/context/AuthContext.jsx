import { createContext, useContext, useState, useEffect } from "react";
import client from "../api/axios";
import { toast } from "sonner";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const signup = async (email, username, password) => {
        await client.post("/auth/signup", { email, username, password });
        toast.success("Account Created!", {
            description: "Welcome to CastClan. Please login."
        })
    };

    const login = async (email, password) => {
        const { data } = await client.post("/auth/login", { email, password });
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        toast.success(`Welcome back, ${data.user.username}!`);
        return data;
    };

    const logout = async () => {
        try {
            //tell backend to logout
            await client.post("/auth/logout");
        } catch (error) {
            console.error("logout error", error);
            //if any error occurs, we still logout 
        } finally {
            //remove token and user from localstorage and state
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
            toast.info("Signed out successfully.");
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);