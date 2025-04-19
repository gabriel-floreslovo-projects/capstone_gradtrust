"use client"

import { useState, useEffect, Suspense } from "react";
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

function HolderNFCPageContent() {
    const searchParams = useSearchParams();
    const urlAddress = searchParams.get('address');

    const [credentials, setCredentials] = useState<Credential[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (urlAddress) {
            fetchCredentials(urlAddress);
        } else {
            setError("No wallet address provided");
            setLoading(false);
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
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">NFC Credentials</h1>
                        <p className="text-lg text-gray-300 mb-10">
                            Viewing credentials for wallet: <span className="font-mono">{urlAddress}</span>
                        </p>

                        {loading ? (
                            <p>Loading credentials...</p>
                        ) : error ? (
                            <div className="mb-8 p-4 bg-red-600/20 border border-red-500 text-red-300 rounded-lg">
                                {error}
                            </div>
                        ) : credentials.length > 0 ? (
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
                        ) : (
                            <p>No credentials found for this wallet address.</p>
                        )}
                    </section>
                </main>
                <Footer />
            </div>
        </div>
    );
}

export default function HolderNFCPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <HolderNFCPageContent />
        </Suspense>
    );
} 