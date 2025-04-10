"use client";

import { useState, useEffect } from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import Web3 from "web3";
import { connected } from "process";
import { io } from "socket.io-client";

declare global {
    interface Window {
        ethereum?: {
            isMetaMask?: boolean;
            request: (args: { method: string; params?: any[] }) => Promise<any>;
            on?: (event: string, callback: (...args: any[]) => void) => void;
            removeListener?: (event: string, callback: (...args: any[]) => void) => void;
        };
    }
}

interface PendingUpdate {
    merkleRoot: string;
    firstAdmin: string;
}

interface UpdateResult {
    success: boolean;
    merkleRoot?: string;
    transactionHash?: string;
    needsSecondSignature?: boolean;
    error?: string;
}

export default function AdminPage() {
    const [web3, setWeb3] = useState<Web3 | null>(null);
    const [connectedAccount, setConnectedAccount] = useState<string | null>(null);
    const [pendingUpdates, setPendingUpdates] = useState<PendingUpdate[]>([]);
    const [updating, setUpdating] = useState(false);
    const [result, setResult] = useState<UpdateResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSigningSecondAdmin, setIsSigningSecondAdmin] = useState(false);

    useEffect(() => {
        // Check if MetaMask is installed
        if (typeof window.ethereum !== 'undefined') {
            const web3Instance = new Web3(window.ethereum);
            setWeb3(web3Instance);

            // Check if already connected
            window.ethereum.request({ method: 'eth_accounts' })
                .then(accounts => {
                    if (accounts.length > 0) {
                        setConnectedAccount(accounts[0]);
                        loadPendingUpdates();
                    }
                });

            // Listen for account changes
            if (window.ethereum.on) {
                window.ethereum.on('accountsChanged', (accounts: string[]) => {
                    if (accounts.length > 0) {
                        setConnectedAccount(accounts[0]);
                        loadPendingUpdates();
                    } else {
                        setConnectedAccount(null);
                    }
                });
            }
        }

        // Cleanup listener on component unmount
        return () => {
            if (window.ethereum?.removeListener) {
                window.ethereum.removeListener('accountsChanged', () => { });
            }
        };
    }, []);

    useEffect(() => {
        if (connectedAccount) {
            loadPendingUpdates();
        }
    }, [connectedAccount]);

    useEffect(() => {
        //connect to websocket server
        const socket = io("https://gradtrust-459152f15ccf.herokuapp.com/")

        //listen for merkle root updates
        socket.on("merkle_root_updated", (data) => {
            setResult({
                success: true,
                merkleRoot: data.merkleRoot,
                transactionHash: data.transactionHash,
                needsSecondSignature: false
            });
            // Clear pending updates when root is updated
            setPendingUpdates([]);
        });

        //listen for pending updates
        socket.on("pending_updates", (data) => {
            setPendingUpdates(data.pending);
            if (data.pending.length > 0) {
                setResult({
                    success: true,
                    merkleRoot: data.pending[0].merkleRoot,
                    needsSecondSignature: true
                });
            }
        });

        //cleanup on component unmount
        return () => {
            socket.disconnect();
        };
    }, []);

    const fetchLastUpdate = async () => {
        try {
            const response = await fetch('https://gradtrust-459152f15ccf.herokuapp.com/api/admin/multi-sig/last-update');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.success) {
                setResult({
                    success: true,
                    merkleRoot: data.lastUpdate.merkleRoot,
                    transactionHash: data.lastUpdate.transactionHash,
                    needsSecondSignature: false
                });
            }
            else {
                setResult(null);
            }
        } catch (error) {
            console.error('Error fetching last update:', error);
            setError('Error fetching last update');
        }
    };

    const connectWallet = async () => {
        try {
            if (typeof window.ethereum !== 'undefined') {
                const web3Instance = new Web3(window.ethereum);
                setWeb3(web3Instance);
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setConnectedAccount(accounts[0]);
                loadPendingUpdates();
            } else {
                setError('Please install MetaMask!');
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Error connecting wallet');
        }
    };

    const loadPendingUpdates = async () => {
        try {
            const response = await fetch('https://gradtrust-459152f15ccf.herokuapp.com/api/admin/multi-sig/pending-updates');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.success) {
                setPendingUpdates(data.pending || []);

                // If there are no pending updates and we have a lastUpdate, show that
                if (data.pending.length === 0 && data.lastUpdate) {
                    setResult({
                        success: true,
                        merkleRoot: data.lastUpdate.merkleRoot,
                        transactionHash: data.lastUpdate.transactionHash,
                        needsSecondSignature: false
                    });
                }
            }
        } catch (error) {
            console.error('Error loading pending updates:', error);
            setError('Error loading pending updates');
        }
    };

    const updateMerkleRoot = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);
        setError(null);
        setResult(null);

        try {
            if (!web3 || !connectedAccount) {
                throw new Error('Please connect your wallet first');
            }

            // Get the new root that needs to be signed
            const rootResponse = await fetch('https://gradtrust-459152f15ccf.herokuapp.com/api/admin/get-new-root');
            const rootData = await rootResponse.json();

            if (!rootData.success) {
                throw new Error(rootData.error || 'Failed to get new root');
            }

            // Construct the message to sign
            const message = `Update Merkle Root: ${rootData.merkleRoot}`;
            const signature = await web3.eth.personal.sign(message, connectedAccount, "");

            const response = await fetch('https://gradtrust-459152f15ccf.herokuapp.com/api/admin/multi-sig/update-merkle-root', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    adminAddress: connectedAccount,
                    signature: signature,
                    merkleRoot: rootData.merkleRoot
                }),
            });

            const result = await response.json();
            if (result.success) {
                // Update the UI to show waiting for second signature
                setResult({
                    success: true,
                    merkleRoot: result.merkleRoot,
                    needsSecondSignature: true
                });
                // Load pending updates to show the update in the list
                loadPendingUpdates();
            } else {
                throw new Error(result.error || 'Update failed');
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : 'An unknown error occurred');
        } finally {
            setUpdating(false);
        }
    };

    const signUpdate = async (merkleRoot: string) => {
        setIsSigningSecondAdmin(true);
        setError(null);
        setResult(null);
        try {
            if (!web3 || !connectedAccount) {
                throw new Error('Please connect your wallet first');
            }

            const message = `Update Merkle Root: ${merkleRoot}`;
            const signature = await web3.eth.personal.sign(message, connectedAccount, "");

            const response = await fetch('https://gradtrust-459152f15ccf.herokuapp.com/api/admin/multi-sig/update-merkle-root', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    adminAddress: connectedAccount,
                    signature: signature,
                    merkleRoot: merkleRoot
                }),
            });

            const result = await response.json();
            if (result.success) {
                setResult({
                    success: true,
                    merkleRoot: result.merkleRoot,
                    transactionHash: result.transactionHash,
                    needsSecondSignature: false
                });
                loadPendingUpdates();
            } else {
                throw new Error(result.error || 'Update failed');
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : 'An unknown error occurred');
        } finally {
            setIsSigningSecondAdmin(false);
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
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">Admin - Multi-Signature Merkle Root Update</h1>

                        <div className="bg-yellow-500/20 border border-yellow-400 text-yellow-300 p-4 rounded-lg mb-6">
                            <strong>⚠️ Warning:</strong> This action requires two different admin signatures to update the Merkle root.
                            Make sure all issuer registrations are properly synchronized before proceeding.
                        </div>

                        <div className="bg-gray-700/60 p-4 rounded-lg mb-6">
                            <p className="mb-2"><strong>Connected Address:</strong></p>
                            <p className="font-mono text-sm break-all">{connectedAccount || 'Not connected'}</p>
                            <button
                                onClick={connectWallet}
                                className="mt-2 bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                            >
                                Connect Wallet
                            </button>
                        </div>

                        <form onSubmit={updateMerkleRoot} className="mb-6">
                            <button
                                type="submit"
                                disabled={updating || !connectedAccount}
                                className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 w-full"
                            >
                                {updating ? "Signing..." : "Update Merkle Root"}
                            </button>
                        </form>


                        {pendingUpdates.length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-2xl font-semibold mb-4">Pending Updates</h3>
                                {pendingUpdates.map((update, index) => (
                                    <div key={index} className="bg-gray-700/60 p-4 rounded-lg mb-4">
                                        <p className="mb-2"><span className="font-bold">Merkle Root:</span></p>
                                        <p className="font-mono text-sm break-all mb-2">{update.merkleRoot}</p>
                                        <p className="mb-2"><span className="font-bold">First Admin:</span></p>
                                        <p className="font-mono text-sm break-all mb-4">{update.firstAdmin}</p>
                                        {update.firstAdmin.toLowerCase() !== connectedAccount?.toLowerCase() ? (
                                            <button
                                                onClick={() => signUpdate(update.merkleRoot)}
                                                className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                                            >
                                                Sign as Second Admin
                                            </button>
                                        ) : (
                                            <p className="text-yellow-300">Waiting for second admin signature</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {isSigningSecondAdmin && (
                            <div className="mt-6 p-4 bg-blue-600/20 border border-blue-500 text-blue-300 rounded-lg shadow-md">
                                <p>⏳ Waiting for successful transaction receipt...</p>
                            </div>
                        )}

                        {result && (
                            <div className="relative mt-6 p-6 bg-green-600/20 border border-green-500 text-green-300 rounded-lg shadow-md">
                                <button
                                    onClick={async () => {
                                        setResult(null); // Clear local state immediately
                                        try {
                                            const response = await fetch('https://gradtrust-459152f15ccf.herokuapp.com/api/admin/multi-sig/clear-last-update', {
                                                method: 'POST',
                                            });
                                            if (!response.ok) {
                                                console.error('Failed to clear last update on server');
                                            }
                                        } catch (err) {
                                            console.error('Error clearing last update on server:', err);
                                        }
                                    }}
                                    className="absolute top-2 right-2 text-green-300 hover:text-white text-2xl font-bold"
                                    aria-label="Close notification"
                                >
                                    &times;
                                </button>
                                {result.needsSecondSignature ? (
                                    <h3 className="text-2xl font-semibold mb-2">First signature recorded. Waiting for second admin signature.</h3>
                                ) : (
                                    <>
                                        <h3 className="text-2xl font-semibold mb-2">✅ Merkle Root Updated Successfully!</h3>
                                        {result.merkleRoot && (
                                            <div className="mt-4">
                                                <p className="font-bold mb-2">New Merkle Root:</p>
                                                <p className="font-mono text-sm break-all bg-gray-800/60 p-2 rounded">{result.merkleRoot}</p>
                                            </div>
                                        )}
                                        {result.transactionHash && (
                                            <div className="mt-4">
                                                <p className="font-bold mb-2">Transaction Hash:</p>
                                                <p className="font-mono text-sm break-all bg-gray-800/60 p-2 rounded">{result.transactionHash}</p>
                                            </div>
                                        )}
                                    </>
                                )}
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