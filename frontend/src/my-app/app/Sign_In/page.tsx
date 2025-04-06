"use client"

import { useState } from "react"
import Link from "next/link"
import Navbar from "../../components/navbar"
import Footer from "../../components/footer"
import { motion } from "framer-motion"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Signing in with", { email, password })

    console.log(`${backendUrl}/api/login`)
    
    const loginRes = await fetch(`${backendUrl}/api/login`,{
      "method": "POST",
      "body": JSON.stringify({
        username: email,
        password: password
      }),
      "headers": {
        "Content-Type": "application/json"
      }
    });

    const loginData = await loginRes.json();

    console.log(loginData);
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background gradients */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        <div className="absolute right-0 top-0 h-[500px] w-[500px] bg-blue-500/10 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] bg-purple-500/10 blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col flex-grow">
        <Navbar />
        <main className="flex flex-col items-center justify-center flex-grow p-8 md:p-24 text-white">
          {/* Sign In Section */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-md bg-slate-800/40 p-8 rounded-xl shadow-lg"
          >
            <h1 className="text-3xl font-bold mb-6 text-center">Sign In</h1>

            <form onSubmit={handleSignIn} className="flex flex-col space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input
                  type="string"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full p-3 rounded-lg bg-slate-900 text-white focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="Enter your email"
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full p-3 rounded-lg bg-slate-900 text-white focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="Enter your password"
                />
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <Link href="/forgot-password" className="text-teal-400 hover:underline text-sm">
                  Forgot Password?
                </Link>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 px-6 rounded-lg transition-colors w-full"
              >
                Sign In
              </button>
            </form>

            {/* Sign Up Link */}
            <p className="text-center text-gray-400 mt-4">
              Don't have an account?{" "}
              <Link href="/Sign_Up" className="text-teal-400 hover:underline">
                Sign Up
              </Link>
            </p>
          </motion.section>
        </main>
        <Footer />
      </div>
    </div>
  )
}
