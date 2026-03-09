import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Signup = () => {
    const [form, setForm] = useState({ email: '', username: "", password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    //Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (form.password !== form.confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }
        if (form.password.length < 8) {
            toast.error("Password must be at least 8 characters.");
            return;
        }

        setLoading(true);

        try {
            await signup(form.email, form.username, form.password);
            navigate("/login");
        } catch (error) {
            console.error("submit error", error);
            setError(error.response?.data?.message || "Signup Failed!");
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-white">
                        <span className="text-blue-400">CastClan</span>
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Create your account</p>
                </div>

                <Card className="bg-gray-900 border-white/10 text-white">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg text-center text-white">Get started</CardTitle>
                        <CardDescription className="text-center text-gray-400">
                            Fill in your details to create an account
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <FieldGroup>
                                {/* Email */}
                                <Field>
                                    <FieldLabel htmlFor="email">Email</FieldLabel>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                        required
                                        className="bg-gray-800 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-indigo-500"
                                    />
                                </Field>

                                {/* Username */}
                                <Field>
                                    <FieldLabel htmlFor="username">Username</FieldLabel>
                                    <Input
                                        id="username"
                                        placeholder="username"
                                        value={form.username}
                                        onChange={e => setForm({ ...form, username: e.target.value })}
                                        required
                                        className="bg-gray-800 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-indigo-500"
                                    />
                                </Field>

                                {/* Password */}
                                <Field>
                                    <FieldLabel htmlFor="password">
                                        Password{" "}
                                        <span className="text-gray-500 font-normal text-xs">(min 8 chars, letter + number)</span>
                                    </FieldLabel>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={form.password}
                                        onChange={e => setForm({ ...form, password: e.target.value })}
                                        required
                                        className="bg-gray-800 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-indigo-500"
                                    />
                                </Field>

                                {/* Confirm Password */}
                                <Field>
                                    <FieldLabel htmlFor="password">
                                        Password{" "}
                                        <span className="text-gray-500 font-normal text-xs">(min 8 chars, letter + number)</span>
                                    </FieldLabel>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        value={form.confirmPassword}
                                        onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                                        required
                                        className="bg-gray-800 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-indigo-500"
                                    />
                                </Field>

                                {/* Submit */}
                                <Field>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold mt-2"
                                    >
                                        {loading ? (
                                            <span className="flex items-center gap-2">
                                                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                                                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                                </svg>
                                                Creating account…
                                            </span>
                                        ) : 'Sign Up'}
                                    </Button>
                                    <FieldDescription className="text-center">
                                        Already have an account?{" "}
                                        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                                            Log in
                                        </Link>
                                    </FieldDescription>
                                </Field>
                            </FieldGroup>

                        </form>
                    </CardContent>
                </Card>

            </div>
        </div>
    )
}

export default Signup