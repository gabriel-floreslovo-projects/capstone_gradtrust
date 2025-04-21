"use client"

import { useState } from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import { motion } from "framer-motion";
import Link from "next/link";

interface IssueResult {
  success: boolean;
  message: string;
  transactionHash?: string;
  credentialHash?: string;
}

const backendUrl = process.env.NEXT_PUBLIC_BACKEND;

export default function IssuerPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [holderAddress, setHolderAddress] = useState("");
  const [issuerAddress, setIssuerAddress] = useState("");
  const [issuerName, setIssuerName] = useState("");
  const [metadata, setMetadata] = useState("");
  const [result, setResult] = useState<IssueResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      if (!selectedFile || !holderAddress || !issuerAddress || !issuerName || !metadata) {
        throw new Error("Please fill out all fields and select a PDF file");
      }

      // Get the issuer's entropy value to add to the hash
      const encoder = new TextEncoder();
      const issuerEntropyUrl = `${backendUrl}/api/get-entropy?`+ new URLSearchParams({
        address: issuerAddress
      }).toString();
      const issuerEntropyRes = await fetch(issuerEntropyUrl, {
        method: "GET"
      });
      const issuerEntropyData = await issuerEntropyRes.json();
      const issuerEntropy = encoder.encode(issuerEntropyData.entropy);
      // Convert PDF to hash
      const pdfArrayBuffer = await selectedFile.arrayBuffer();
      // Combine pdf with entropy
      const combinedBuf = new Uint8Array(pdfArrayBuffer.byteLength + issuerEntropy.byteLength);
      combinedBuf.set(new Uint8Array(pdfArrayBuffer), 0);
      combinedBuf.set(issuerEntropy, pdfArrayBuffer.byteLength);      
      // Now hash
      const hashBuffer = await crypto.subtle.digest('SHA-256', combinedBuf.buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const credentialHash = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      // Prepare form data
      const formData = new FormData();
      formData.append('credentialHash', credentialHash);
      formData.append('holderAddress', holderAddress);
      formData.append('issuerAddress', issuerAddress);
      formData.append('issuerName', issuerName);
      formData.append('metaData', metadata);

      // Send to backend
      const response = await fetch('https://gradtrust-459152f15ccf.herokuapp.com/api/issuer/issue-credential', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        setResult({
          success: true,
          message: 'Credential Issued Successfully!',
          transactionHash: result.transactionHash,
          credentialHash: result.credentialHash
        });
      } else {
        throw new Error(result.error || "Failed to issue credential");
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred"
      });
    } finally {
      setLoading(false);
    }
  };

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
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-3xl bg-slate-800/40 p-8 rounded-xl shadow-lg"
          >
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold">Issue New Credential</h1>
              <Link href="/issuer/register">
                <button className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                  Register Institution
                </button>
              </Link>
            </div>
            <p className="text-lg text-gray-300 mb-6">Fill out the details below and upload a PDF.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4 bg-white/5 p-6 rounded-2xl shadow-md backdrop-blur-md">
                {/* PDF Upload */}
                <div className="flex flex-col">
                  <label className="text-gray-300 text-sm font-medium mb-1">
                    Credential PDF
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    required
                    className="p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-teal-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-500/50 file:text-white hover:file:bg-teal-500/70"
                  />
                </div>

                {/* Recipient Address */}
                <div className="flex flex-col">
                  <label className="text-gray-300 text-sm font-medium mb-1">
                    Recipient's Ethereum Address
                  </label>
                  <input
                    type="text"
                    value={holderAddress}
                    onChange={(e) => setHolderAddress(e.target.value)}
                    placeholder="0x..."
                    required
                    className="p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Issuer Address */}
                <div className="flex flex-col">
                  <label className="text-gray-300 text-sm font-medium mb-1">
                    Your Issuer Address
                  </label>
                  <input
                    type="text"
                    value={issuerAddress}
                    onChange={(e) => setIssuerAddress(e.target.value)}
                    placeholder="0x..."
                    required
                    className="p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Institution Name */}
                <div className="flex flex-col">
                  <label className="text-gray-300 text-sm font-medium mb-1">
                    Institution Name
                  </label>
                  <input
                    type="text"
                    value={issuerName}
                    onChange={(e) => setIssuerName(e.target.value)}
                    placeholder="Institution Name"
                    required
                    className="p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Metadata */}
                <div className="flex flex-col">
                  <label className="text-gray-300 text-sm font-medium mb-1">
                    Metadata
                  </label>
                  <input
                    type="text"
                    value={metadata}
                    onChange={(e) => setMetadata(e.target.value)}
                    placeholder="Student name & major(s)"
                    required
                    className="p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Issuing..." : "Issue Credential"}
                </button>
              </div>
            </form>

            {/* Result Display */}
            {result && (
              <div className={`mt-6 p-4 rounded-lg ${result.success ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
                <h3 className={`text-lg font-semibold mb-2 ${result.success ? 'text-green-300' : 'text-red-300'}`}>
                  {result.success ? '✓ Success' : 'Error'}
                </h3>
                <p className="text-sm">{result.message}</p>

                {result.success && (
                  <div className="mt-3 space-y-1 text-xs">
                    <p><span className="font-medium">Transaction Hash:</span> {result.transactionHash}</p>
                    <p><span className="font-medium">Credential Hash:</span> {result.credentialHash}</p>
                  </div>
                )}
              </div>
            )}
          </motion.section>
        </main>
        <Footer />
      </div>
    </div>
  );
}