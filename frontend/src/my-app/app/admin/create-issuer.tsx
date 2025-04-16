"use client";

import { useState } from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";

export default function CreateIssuerPage() {
  const [issuerName, setIssuerName] = useState("");
  const [issuerAddress, setIssuerAddress] = useState("");
  const [signature, setSignature] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const response = await fetch(
        "https://gradtrust-459152f15ccf.herokuapp.com/api/admin/create-issuer",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: issuerName,
            address: issuerAddress,
            signature: signature,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setSuccessMessage(`Issuer "${data.name}" created successfully!`);
        setIssuerName("");
        setIssuerAddress("");
        setSignature("");
      } else {
        setErrorMessage(data.error || "Failed to create issuer.");
      }
    } catch (error) {
      setErrorMessage("An error occurred while creating the issuer.");
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        <div className="absolute right-0 top-0 h-[500px] w-[500px] bg-blue-500/10 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] bg-purple-500/10 blur-[100px]" />
      </div>

      <div className="relative z-10">
        <Navbar />
        <main className="flex flex-col items-center p-8 md:p-24 text-white">
          <section className="w-full max-w-3xl mb-16 text-center bg-gray-800/60 p-8 rounded-xl shadow-lg">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Create Issuer</h1>
            <p className="text-lg text-gray-300 mb-10">
              Add a new issuer to the system by providing their details below.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-left text-gray-300 mb-2">
                  Issuer Name
                </label>
                <input
                  type="text"
                  value={issuerName}
                  onChange={(e) => setIssuerName(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-700 text-white"
                  placeholder="Enter issuer name"
                  required
                />
              </div>

              <div>
                <label className="block text-left text-gray-300 mb-2">
                  Issuer Address
                </label>
                <input
                  type="text"
                  value={issuerAddress}
                  onChange={(e) => setIssuerAddress(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-700 text-white"
                  placeholder="Enter issuer address"
                  required
                />
              </div>

              <div>
                <label className="block text-left text-gray-300 mb-2">
                  Signature
                </label>
                <input
                  type="text"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-700 text-white"
                  placeholder="Enter signature"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Create Issuer
              </button>
            </form>

            {successMessage && (
              <div className="mt-6 p-4 bg-green-600/20 border border-green-500 text-green-300 rounded-lg shadow-md">
                {successMessage}
              </div>
            )}

            {errorMessage && (
              <div className="mt-6 p-4 bg-red-600/20 border border-red-500 text-red-300 rounded-lg shadow-md">
                {errorMessage}
              </div>
            )}
          </section>
        </main>
        <Footer />
      </div>
    </div>
  );
}