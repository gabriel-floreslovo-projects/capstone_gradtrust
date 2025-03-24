"use client"

import { useState } from "react"
import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { motion } from "framer-motion"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      alert("Passwords do not match!")
      return
    }
    console.log("Signing up with", { email, password })
    // Add sign-up logic here (API call, Firebase, etc.)
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
          {/* Sign Up Section */}
          <motion.section 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }}
            className="w-full max-w-md bg-slate-800/40 p-8 rounded-xl shadow-lg"
          >
            <h1 className="text-3xl font-bold mb-6 text-center">Sign Up</h1>

            <form onSubmit={handleSignUp} className="flex flex-col space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input
                  type="email"
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

              {/* Confirm Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full p-3 rounded-lg bg-slate-900 text-white focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="Confirm your password"
                />
              </div>

              {/* Sign Up Button */}
              <button
                type="submit"
                className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 px-6 rounded-lg transition-colors w-full"
              >
                Sign Up
              </button>
            </form>

            {/* Sign In Link */}
            <p className="text-center text-gray-400 mt-4">
              Already have an account?{" "}
              <Link href="/Sign_In" className="text-teal-400 hover:underline">
                Sign In
              </Link>
            </p>
          </motion.section>
        </main>
        <Footer />
      </div>
    </div>
  )
}
