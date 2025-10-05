'use client';

import { getProviders, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [providers, setProviders] = useState({});
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const p = await getProviders();
      setProviders(p || {});
    })();
  }, []);

  const onCredentialsLogin = async (e) => {
    e.preventDefault();
    
    // Check if admin credentials
    if (email === 'admin@shortlinker.com' && password === 'admin123456') {
      try {
        const adminRes = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        
        if (adminRes.ok) {
          router.replace('/admin/dashboard');
          return;
        }
      } catch (error) {
        console.error('Admin login failed:', error);
      }
    }
    
    // Regular user login
    const res = await signIn("credentials", { redirect: false, email, password });
    if (res?.ok) {
      router.replace("/");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Login</h1>

      <form onSubmit={onCredentialsLogin} className="space-y-3">
        <input 
          className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <div className="relative">
          <input 
            className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 rounded pr-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
            type={showPassword ? "text" : "password"} 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
          <button 
            type="button" 
            className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400" 
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>
        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700" type="submit">
          Login
        </button>
      </form>
      
      <div className="text-center mt-3">
        <a href="/auth/forgot-password" className="text-sm text-blue-600 hover:underline">
          Forgot Password?
        </a>
      </div>

      <div className="my-6 h-px bg-gray-200 dark:bg-gray-700" />

      {providers?.google && (
        <button
          className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
          onClick={() => signIn(providers.google.id, { callbackUrl: "/" })}
        >
          Continue with Google
        </button>
      )}
      
      <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        Don't have an account?{" "}
        <a href="/auth/signup" className="text-blue-600 hover:underline">
          Sign up here
        </a>
      </div>
    </div>
  );
}