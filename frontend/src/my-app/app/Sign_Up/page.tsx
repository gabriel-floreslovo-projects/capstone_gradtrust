"use client"

import { useState } from "react"
import Link from "next/link"
import Navbar from "../../components/navbar"
import Footer from "../../components/footer"
import { motion } from "framer-motion"

export default function SignUpPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [address, setAddress] = useState("")

  const sanitizeInput = (input: string) => {
    //trim whitespace and remove any unwanted characters
    const trimmedInput = input.trim(); // Remove leading and trailing whitespace
    const sanitizedInput = trimmedInput.replace(/['"\\<>;]/g, "");

    return sanitizedInput;
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    const sanitizedUsername = sanitizeInput(username);
    const sanitizedPassword = sanitizeInput(password);
    const sanitizedConfirmPassword = sanitizeInput(confirmPassword);
    const sanitizedAddress = sanitizeInput(address);

    if(sanitizedPassword !== sanitizedConfirmPassword) {
      alert("Passwords do not match. Please try again.");
      console.error("Passwords do not match");
      return;
    }

    if(sanitizedAddress.length !== 42){
      // Valid Ethereum address length (0x + 40 hex characters)
      alert("Please enter a valid Ethereum address.");
      console.error("Current address is of length:", sanitizedAddress.length);
      console.error("Invalid Ethereum address length");
      return;
    }

    console.log("Signing up with", { sanitizedUsername, sanitizedPassword })
    const formData = new FormData();
    formData.append("username", sanitizedUsername);
    formData.append("password", sanitizedPassword);
    formData.append("address", sanitizedAddress);

    const response = await fetch('https://gradtrust-459152f15ccf.herokuapp.com/api/create-account', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();

    if(result.success) {
      // Handle success (e.g., redirect to sign-in page or dashboard)
      alert("Sign up successful! You can now sign in.");
      window.location.href = "/Sign_In"; // Redirect to sign-in page
    }
    else {
      // Handle error (e.g., show error message)
      alert(`Sign up failed: ${result.error || "Unknown error"}`);
      console.error("Sign up error:", result);
    }
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
        {/* MetaMask Info Card */}
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg shadow-md mx-auto max-w-2xl text-center">
          <p>
            This application uses MetaMask for blockchain usage, please{" "}
            <a href="https://metamask.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
              >
                create an account here
            </a>{" "}
            for access to a valid wallet address.
          </p>
        </div>
        <main className="flex flex-col items-center justify-center flex-grow p-1 md:p-16 text-white">
          {/* Sign Up Section */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-md bg-slate-800/40 p-8 rounded-xl shadow-lg"
          >
            <h1 className="text-3xl font-bold mb-6 text-center">Sign Up</h1>

            <form onSubmit={handleSignUp} className="flex flex-col space-y-4">
              {/* Wallet Address Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Wallet</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  className="w-full p-3 rounded-lg bg-slate-900 text-white focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="Enter your Wallet Address (0x...)"
                />
              </div>

              {/* Username Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full p-3 rounded-lg bg-slate-900 text-white focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="Enter your Username"
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
