'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getProviders, signIn } from "next-auth/react";
import toast from "react-hot-toast";

export default function Signup() {
  const [providers, setProviders] = useState({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const p = await getProviders();
      setProviders(p || {});
    })();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Account created successfully!");
        router.push("/auth/login");
      } else {
        toast.error(data.error || "Something went wrong");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Sign Up</h1>

      <form onSubmit={onSubmit} className="space-y-3">
        <input 
          className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
          placeholder="Full Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required
        />
        <input 
          className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
          type="email"
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required
        />
        <div className="relative">
          <input 
            className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 rounded pr-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
            type={showPassword ? "text" : "password"} 
            placeholder="Password (min 6 characters)" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required
            minLength={6}
          />
          <button 
            type="button" 
            className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400" 
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>
        <button 
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-400" 
          type="submit"
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>
      </form>

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
        Already have an account?{" "}
        <a href="/auth/login" className="text-blue-600 hover:underline">
          Login here
        </a>
      </div>
    </div>
  );
}