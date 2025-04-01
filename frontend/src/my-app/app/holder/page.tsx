"use client"

import { useState } from "react";
import Link from "next/link";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";

export default function AboutPage() {
  const [showCredentials, setShowCredentials] = useState(false);

  const credentials = [
    { id: 1, title: "Bachelor's Degree in Computer Engineering", issuer: "Texas A&M University", date: "May 2025" },
    { id: 2, title: "Blockchain Certification", issuer: "Ethereum Academy", date: "March 2024" },
  ];

  return (
    <div className="relative min-h-screen">
      {/* Background gradients */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        <div className="absolute right-0 top-0 h-[500px] w-[500px] bg-blue-500/10 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] bg-purple-500/10 blur-[100px]" />
      </div>

      <div className="relative z-10">
        <Navbar />
        <main className="flex flex-col items-center p-8 md:p-24 text-white">
          {/* Hero Section */}
          <section className="w-full max-w-3xl mb-16 text-center bg-gray-800/60 p-8 rounded-xl shadow-lg">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-center">Holder</h1>
            <p className="text-lg text-gray-300 mb-10">
              Access and manage your verified credentials in one place.
            </p>
            <button
              onClick={() => setShowCredentials(!showCredentials)}
              className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              {showCredentials ? "Hide Credentials" : "View Credentials"}
            </button>

            {/* Credentials Section */}
            {showCredentials && (
              <div className="mt-6 bg-gray-700/50 p-6 rounded-lg shadow-md w-full text-left">
                <h2 className="text-2xl font-semibold mb-4">Your Credentials</h2>
                <ul className="space-y-4">
                  {credentials.map((cred) => (
                    <li key={cred.id} className="p-4 bg-gray-800 rounded-lg shadow">
                      <h3 className="text-lg font-medium">{cred.title}</h3>
                      <p className="text-gray-300">{cred.issuer}</p>
                      <p className="text-gray-400 text-sm">{cred.date}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </main>
        <Footer />
      </div>
    </div>
  );
}
