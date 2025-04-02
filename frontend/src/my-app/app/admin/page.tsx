"use client";

import { useState } from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";

export default function UpdateMerkleRoot() {
  const [adminAddress, setAdminAddress] = useState("");
  const [signature, setSignature] = useState("");
  const [merkleRoot, setMerkleRoot] = useState("");  // This would need to be retrieved from your backend
  const [updating, setUpdating] = useState(false);
  const [result, setResult] = useState<{ merkleRoot: string; transactionHash: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async () => {
    setUpdating(true);
    setResult(null);
    setError(null);

    // Ensure adminAddress, signature, and merkleRoot are provided
    if (!adminAddress || !signature || !merkleRoot) {
      setError("Please provide all required fields: admin address, signature, and Merkle root.");
      setUpdating(false);
      return;
    }

    try {
      const response = await fetch("https://gradtrust-459152f15ccf.herokuapp.com/api/admin/multi-sig/update-merkle-root", {
        method: "POST",
        headers: {
          "Cache-Control": "no-cache",
          "Pragma": "no-cache",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminAddress,
          signature,
          merkleRoot, // Include the Merkle root
        }),
      });
      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setUpdating(false);
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
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Admin - Update Merkle Root</h1>
            <div className="bg-yellow-500/20 border border-yellow-400 text-yellow-300 p-4 rounded-lg mb-6">
              <strong>⚠️ Warning:</strong> This action will update the Merkle root in the smart contract.
              Ensure all issuer registrations are properly synchronized before proceeding.
            </div>
            <div className="mb-6">
              <label htmlFor="adminAddress" className="block mb-2">Admin Address:</label>
              <input
                id="adminAddress"
                type="text"
                value={adminAddress}
                onChange={(e) => setAdminAddress(e.target.value)}
                className="p-2 rounded-lg w-full bg-gray-700 border border-gray-500"
                placeholder="Enter your admin address"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="signature" className="block mb-2">Signature:</label>
              <input
                id="signature"
                type="text"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                className="p-2 rounded-lg w-full bg-gray-700 border border-gray-500"
                placeholder="Enter your signature"
              />
            </div>
            <button
              onClick={handleUpdate}
              disabled={updating}
              className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
            >
              {updating ? "Updating..." : "Update Merkle Root"}
            </button>
            {result && (
              <div className="mt-6 p-6 bg-green-600/20 border border-green-500 text-green-300 rounded-lg shadow-md">
                <h3 className="text-2xl font-semibold mb-2">✅ Merkle Root Updated Successfully!</h3>
                <p><span className="font-bold">New Merkle Root:</span> {result.merkleRoot}</p>
                <p><span className="font-bold">Transaction Hash:</span> {result.transactionHash}</p>
              </div>
            )}
            {error && (
              <div className="mt-6 p-6 bg-red-600/20 border border-red-500 text-red-300 rounded-lg shadow-md">
                <p>Error: {error}</p>
              </div>
            )}
          </section>
        </main>
        <Footer />
      </div>
    </div>
  );
}
