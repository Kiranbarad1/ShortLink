'use client';

import { useState } from "react";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSent(true);
        toast.success("Password reset email sent!");
      } else {
        toast.error(data.error || "Something went wrong");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-center">
        <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Email Sent!</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Check your email for password reset instructions.
        </p>
        <a href="/auth/login" className="text-blue-600 hover:underline">
          Back to Login
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Forgot Password</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Enter your email address and we'll send you a link to reset your password.
      </p>

      <form onSubmit={onSubmit} className="space-y-3">
        <input 
          className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
          type="email"
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required
        />
        <button 
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-400" 
          type="submit"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
      
      <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        Remember your password?{" "}
        <a href="/auth/login" className="text-blue-600 hover:underline">
          Login here
        </a>
      </div>
    </div>
  );
}