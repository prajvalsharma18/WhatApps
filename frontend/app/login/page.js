"use client";
import React, { useState } from 'react'
import { Mail, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const {data} = await axios.post(`http://localhost:5000/api/v1/login`, {
                email,
            });
            alert(data.message);
            router.push(`/verify?email=${email}`);
        } catch (err) {
            alert(err.response.data.message);
        } finally {
            setLoading(false);
        }
    }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
                <div className="text-center mb-8">
                    <div className="mx-auto w-20 h-20 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                          <Mail size={40} className="text-white"/>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-3">
                        Welcome to ChatApp
                    </h1>
                    <p className="text-gray-300 text-lg">Enter your Email to continue your work</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                            Email Address
                        </label>
                        <input 
                            type="email" 
                            id="email" 
                            className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500" 
                            placeholder="Enter Your email address"
                            value = {email}
                            onChange={e=>setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-4 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-lg shadow-blue-600/20 disabled:opacity-50"
                    >
                        {loading ? "Sending..." : "Send Verification Code"}
                        <ArrowRight size={20} />
                    </button>
                </form>
            </div>
        </div>
    </div>
  )
}

export default LoginPage