"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";

interface Credential {
  credentialHash: string;
  issuer: string;
  holder: string;
  issuedAt: string;
  data: string;
}

export default function HolderPage() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    const fetchAddressAndCredentials = async () => {
      try {
        // Fetch user info from backend (which reads JWT from HttpOnly cookie)
        const meResponse = await fetch(
          "https://gradtrust-459152f15ccf.herokuapp.com/api/holder-address",
          { credentials: "include" }
        );
        console.log("Response status:", meResponse.status);
        if (!meResponse.ok) {
          setError("Not logged in or session expired.");
          setLoading(false);
          return;
        }
        const meData = await meResponse.json();
        const walletAddress = meData.address;
        setAddress(walletAddress);

        if (!walletAddress) {
          setError("No wallet address found in user info.");
          setLoading(false);
          return;
        }

        // Fetch credentials from backend
        const credResponse = await fetch(
          `https://gradtrust-459152f15ccf.herokuapp.com/api/pull-credentials?address=${walletAddress}`
        );
        const credData = await credResponse.json();
        if (credData.success) {
          setCredentials(credData.credentials);
        } else {
          setError(credData.error || "Failed to fetch credentials");
        }
      } catch (err) {
        setError("Error fetching credentials");
      } finally {
        setLoading(false);
      }
    };
    fetchAddressAndCredentials();
  }, []);

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
            {address && (
              <p className="mb-4 text-gray-400">Wallet Address: <span className="font-mono">{address}</span></p>
            )}
            {loading ? (
              <p>Loading credentials...</p>
            ) : error ? (
              <div className="mt-6 p-4 bg-red-600/20 border border-red-500 text-red-300 rounded-lg shadow-md">{error}</div>
            ) : credentials.length === 0 ? (
              <p>No credentials found for this address.</p>
            ) : (
              <div className="mt-6 bg-gray-700/50 p-6 rounded-lg shadow-md w-full text-left">
                <h2 className="text-2xl font-semibold mb-4">Your Credentials</h2>
                <ul className="space-y-4">
                  {credentials.map((cred) => (
                    <li key={cred.credentialHash} className="p-4 bg-gray-800 rounded-lg shadow">
                      <h3 className="text-lg font-medium">{cred.data}</h3>
                      <p className="text-gray-300">Issuer: {cred.issuer}</p>
                      <p className="text-gray-400 text-sm">Issued At: {cred.issuedAt}</p>
                      <p className="text-gray-400 text-sm">Credential Hash: <span className="font-mono break-all">{cred.credentialHash}</span></p>
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
