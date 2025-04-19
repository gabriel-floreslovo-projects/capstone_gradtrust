"use client"

import { useState, useEffect } from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import { format } from 'date-fns';
import { useSearchParams } from 'next/navigation';

interface Credential {
    credentialHash: string;
    issuer: string;
    holder: string;
    issuedAt: string;
    data: string;
}

export default function HolderNFCPage() {
    const searchParams = useSearchParams();
    const urlAddress = searchParams.get('address');

    const [credentials, setCredentials] = useState<Credential[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [address, setAddress] = useState<string>(urlAddress || "");

    useEffect(() => {
        if (urlAddress) {
            fetchCredentials(urlAddress);
        }
    }, [urlAddress]);

    const fetchCredentials = async (walletAddress: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `https://gradtrust-459152f15ccf.herokuapp.com/api/pull-credentials?address=${walletAddress}`
            );
            const data = await response.json();
            if (data.success) {
                setCredentials(data.credentials);
            } else {
                setError(data.error || "Failed to fetch credentials");
            }
        } catch (err) {
            setError("Error fetching credentials");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!address) return;
        fetchCredentials(address);
    };

    // This would be called when NFC is scanned
    const handleNFCCardScan = (walletAddress: string) => {
        setAddress(walletAddress);
        // Automatically submit the form
        const event = new Event('submit', { bubbles: true });
        document.querySelector('form')?.dispatchEvent(event);
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
                    <section className="w-full max-w-3xl mb-16 text-center bg-gray-800/60 p-8 rounded-xl shadow-lg">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">NFC Verification</h1>
                        <p className="text-lg text-gray-300 mb-10">
                            Enter wallet address or scan NFC card to view credentials
                        </p>

                        <form onSubmit={handleSubmit} className="mb-8">
                            <div className="flex flex-col items-center space-y-4">
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Enter wallet address"
                                    className="w-full max-w-md p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400"
                                />
                                <button
                                    type="submit"
                                    disabled={loading || !address}
                                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-lg font-medium disabled:opacity-50"
                                >
                                    {loading ? "Loading..." : "View Credentials"}
                                </button>
                            </div>
                        </form>

                        {error && (
                            <div className="mb-8 p-4 bg-red-600/20 border border-red-500 text-red-300 rounded-lg">
                                {error}
                            </div>
                        )}

                        {credentials.length > 0 && (
                            <div className="mt-8 bg-gray-700/50 p-6 rounded-lg shadow-md w-full text-left">
                                <h2 className="text-2xl font-semibold mb-4">Credentials</h2>
                                <ul className="space-y-4">
                                    {credentials.map((cred) => (
                                        <li key={cred.credentialHash} className="p-4 bg-gray-800 rounded-lg shadow">
                                            <h3 className="text-lg font-medium">{cred.data}</h3>
                                            <p className="text-gray-300">Issuer: {cred.issuer}</p>
                                            <p className="text-gray-400 text-sm">
                                                Issued At: {format(new Date(parseInt(cred.issuedAt) * 1000), 'MMMM d, yyyy h:mm a')}
                                            </p>
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