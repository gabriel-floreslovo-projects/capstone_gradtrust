'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Web3 from 'web3';

interface StatusMessage {
    message: string;
    type: 'success' | 'danger';
}

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

            const response = await fetch('https://gradtrust-459152f15ccf.herokuapp.com/api/issuer/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    address: connectedAccount,
                    name: issuerName,
                    signature: signature
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
        <div className="container mt-5">
            <h2>Register as an Issuer</h2>
            <div className="card mt-4">
                <div className="card-body">
                    <form onSubmit={registerIssuer}>
                        <div className="mb-3">
                            <label htmlFor="issuerName" className="form-label">Issuer Name</label>
                            <input
                                type="text"
                                className="form-control"
                                id="issuerName"
                                value={issuerName}
                                onChange={(e) => setIssuerName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Connected Address</label>
                            <p className="form-control-static">
                                {connectedAccount || 'Not connected'}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={connectWallet}
                            className="btn btn-primary mb-3"
                        >
                            Connect Wallet
                        </button>
                        <button
                            type="submit"
                            className="btn btn-success"
                            disabled={!connectedAccount}
                        >
                            Register
                        </button>
                    </form>
                </div>
            </div>

            {status && (
                <div className="mt-3">
                    <div className={`alert alert-${status.type} alert-dismissible fade show`} role="alert">
                        {status.message}
                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => setStatus(null)}
                            aria-label="Close"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
