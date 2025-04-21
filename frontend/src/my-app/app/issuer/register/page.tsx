'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Web3 from 'web3';
import Navbar from "../../../components/navbar";
import Footer from "../../../components/footer";
import { motion } from "framer-motion";

interface StatusMessage {
    message: string;
    type: 'success' | 'danger';
}

const backendUrl = process.env.NEXT_PUBLIC_BACKEND;

export default function RegisterIssuer() {
    const [web3, setWeb3] = useState<Web3 | null>(null);
    const [connectedAccount, setConnectedAccount] = useState<string | null>(null);
    const [issuerName, setIssuerName] = useState('');
    const [status, setStatus] = useState<StatusMessage | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Check if already connected
        if (typeof window.ethereum !== 'undefined') {
            window.ethereum.request({ method: 'eth_accounts' })
                .then((accounts: string[]) => {
                    if (accounts.length > 0) {
                        setConnectedAccount(accounts[0]);
                    }
                });
        }
    }, []);

    const connectWallet = async () => {
        try {
            if (typeof window.ethereum !== 'undefined') {
                const web3Instance = new Web3(window.ethereum);
                setWeb3(web3Instance);
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setConnectedAccount(accounts[0]);
                setStatus({ message: 'Wallet connected successfully!', type: 'success' });
            } else {
                setStatus({ message: 'Please install MetaMask!', type: 'danger' });
            }
        } catch (error) {
            setStatus({ message: `Error connecting wallet: ${error instanceof Error ? error.message : 'Unknown error'}`, type: 'danger' });
        }
    };

    const registerIssuer = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!issuerName) {
            setStatus({ message: 'Please enter an issuer name', type: 'danger' });
            return;
        }

        if (!web3 || !connectedAccount) {
            setStatus({ message: 'Web3 is not initialized or no account connected. Please connect your wallet.', type: 'danger' });
            return;
        }

        try {
            const message = `${connectedAccount},${issuerName}`;
            const signature = await web3.eth.personal.sign(message, connectedAccount, '');
            const issuerEntropyResponse = await fetch('https://safe-cicada-neatly.ngrok-free.app/entropy', {
                method: 'GET',
                headers: {
                    'ngrok-skip-browser-warning': 'True',
                },
            });

            // const issuerEntropy = await issuerEntropyResponse.json();


            const response = await fetch('https://gradtrust-459152f15ccf.herokuapp.com/api/issuer/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    address: connectedAccount,
                    name: issuerName,
                    signature: signature,
                    // BS entropy value because server down
                    entropy: "8639FA6BAA1E02A49FDD5B3CD580A327C0A1F2B4D9533AC94EBA11F1C4B8A007"
                }),
            });

            const result = await response.json();

            if (result.success) {
                setStatus({ message: 'Registration successful!', type: 'success' });
                // Optionally redirect after successful registration
                // router.push('/issuer/dashboard');
            } else {
                setStatus({ message: `Registration failed: ${result.error}`, type: 'danger' });
            }
        } catch (error) {
            setStatus({ message: `Error during registration: ${error instanceof Error ? error.message : 'Unknown error'}`, type: 'danger' });
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
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">Register as an Issuer</h1>
                        <p className="text-lg text-gray-300 mb-6 text-center">Connect your wallet and register your institution to start issuing credentials.</p>

                        <form onSubmit={registerIssuer} className="space-y-6">
                            <div className="space-y-4 bg-white/5 p-6 rounded-2xl shadow-md backdrop-blur-md">
                                <div className="flex flex-col">
                                    <label className="text-gray-300 text-sm font-medium mb-1">
                                        Institution Name
                                    </label>
                                    <input
                                        type="text"
                                        value={issuerName}
                                        onChange={(e) => setIssuerName(e.target.value)}
                                        placeholder="Enter your institution name"
                                        required
                                        className="p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-gray-300 text-sm font-medium mb-1">
                                        Connected Wallet
                                    </label>
                                    <div className="p-3 rounded-lg bg-white/20 text-white">
                                        {connectedAccount || 'Not connected'}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={connectWallet}
                                    className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                                >
                                    Connect Wallet
                                </button>
                            </div>

                            <div className="flex justify-center">
                                <button
                                    type="submit"
                                    disabled={!connectedAccount}
                                    className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Register Institution
                                </button>
                            </div>
                        </form>

                        {status && (
                            <div className={`mt-6 p-4 rounded-lg ${status.type === 'success' ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
                                <p className={`text-sm ${status.type === 'success' ? 'text-green-300' : 'text-red-300'}`}>
                                    {status.message}
                                </p>
                            </div>
                        )}
                    </motion.section>
                </main>
                <Footer />
            </div>
        </div>
    );
}
