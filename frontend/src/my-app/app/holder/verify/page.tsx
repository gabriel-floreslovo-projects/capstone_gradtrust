"use client"

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import Navbar from "../../../components/navbar";
import Footer from "../../../components/footer";
import { useDropzone } from "react-dropzone";
import { FiUploadCloud, FiCheckCircle, FiXCircle } from "react-icons/fi";
import Select from 'react-select';

type OptionType = {
    label: string,
    value: string
};

const backendUrl = process.env.NEXT_PUBLIC_BACKEND;

export default function VerifyDocumentPage() {
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationResult, setVerificationResult] = useState<{
        success: boolean;
        message: string;
        credentialData?: any;
    } | null>(null);
    const [issuers, setIssuers] = useState<OptionType[]>([]);
    const [selectedIssuer, setSelectedIssuer] = useState<OptionType | null>(null);

    useEffect(() => {
        const fetchIssuers = async () => {
            const issuersRes = await fetch(`${backendUrl}/api/get-issuers`, {
                method: "GET"
            });
            const issuersData = await issuersRes.json();
            console.log('Raw issuers data:', issuersData);

            const mappedIssuers = issuersData.issuers.map((item: any) => ({
                label: item.name,
                value: item.address
            }));
            console.log('Mapped issuers:', mappedIssuers);

            setIssuers(mappedIssuers);
        }

        fetchIssuers();
    }, []);

    // Add console log for issuers state changes
    useEffect(() => {
        console.log('Current issuers state:', issuers);
    }, [issuers]);

    // Add console log for selectedIssuer changes
    useEffect(() => {
        console.log('Selected issuer:', selectedIssuer);
    }, [selectedIssuer]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            if (file.type === "application/pdf") {
                setPdfFile(file);
                setVerificationResult(null);
            }
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf']
        },
        maxFiles: 1
    });

    const handleVerify = async () => {
        if (!pdfFile || !selectedIssuer) {
            alert("Please upload a PDF and select an issuer");
            return;
        }

        setIsVerifying(true);
        setVerificationResult(null);

        try {
            // Get issuer's entropy
            const issuerEntropyUrl = `${backendUrl}/api/get-entropy?` + new URLSearchParams({
                address: selectedIssuer.value
            }).toString();
            const issuerEntropyRes = await fetch(issuerEntropyUrl, {
                method: "GET"
            });
            const issuerEntropyData = await issuerEntropyRes.json();

            // Convert PDF to array buffer
            const pdfArrayBuffer = await pdfFile.arrayBuffer();

            // Combine PDF with entropy
            const encoder = new TextEncoder();
            const issuerEntropy = encoder.encode(issuerEntropyData.entropy);
            const combinedBuf = new Uint8Array(pdfArrayBuffer.byteLength + issuerEntropy.byteLength);
            combinedBuf.set(new Uint8Array(pdfArrayBuffer), 0);
            combinedBuf.set(issuerEntropy, pdfArrayBuffer.byteLength);

            // Hash the combined buffer
            const hashBuffer = await crypto.subtle.digest('SHA-256', combinedBuf.buffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const credentialHash = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            // Verify the credential hash on chain
            const verifyUrl = `${backendUrl}/api/verifier/verify-credential?` + new URLSearchParams({
                hash: credentialHash
            }).toString();
            const verifyRes = await fetch(verifyUrl, {
                method: "GET"
            });
            const verifyData = await verifyRes.json();

            if (verifyData.success && verifyData.isValid) {
                setVerificationResult({
                    success: true,
                    message: "Document successfully verified on the blockchain!",
                    credentialData: {
                        issuer: selectedIssuer.label,
                        verifiedAt: new Date().toISOString(),
                        documentHash: credentialHash
                    }
                });
            } else {
                setVerificationResult({
                    success: false,
                    message: "Document not found on the blockchain or issuer mismatch."
                });
            }
        } catch (error) {
            setVerificationResult({
                success: false,
                message: "Error during verification. Please try again."
            });
        } finally {
            setIsVerifying(false);
        }
    };

    const resetForm = () => {
        setPdfFile(null);
        setSelectedIssuer(null);
        setVerificationResult(null);
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
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">Verify Your Own Document</h1>
                        <p className="text-lg text-gray-300 mb-10">
                            Upload your certified document to verify its authenticity on the blockchain
                        </p>

                        <div className="space-y-8">
                            {/* Drag and drop area */}
                            <div
                                {...getRootProps()}
                                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${isDragActive ? "border-blue-500 bg-blue-500/10" : "border-gray-600 hover:border-gray-500"
                                    }`}
                            >
                                <input {...getInputProps()} />
                                <div className="flex flex-col items-center justify-center space-y-4">
                                    <FiUploadCloud className="text-4xl text-gray-400" />
                                    {pdfFile ? (
                                        <p className="text-lg">{pdfFile.name}</p>
                                    ) : isDragActive ? (
                                        <p className="text-lg">Drop the PDF here...</p>
                                    ) : (
                                        <>
                                            <p className="text-lg">Drag & drop your PDF here, or click to select</p>
                                            <p className="text-sm text-gray-400">Only PDF files are accepted</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Issuer selection */}
                            <div className="space-y-2 text-left">
                                <Select
                                    options={issuers}
                                    value={selectedIssuer}
                                    onChange={setSelectedIssuer}
                                    placeholder="Select an issuer..."
                                    className="text-black"
                                    classNamePrefix="select"
                                />
                            </div>

                            {/* Action buttons */}
                            <div className="flex space-x-4">
                                <button
                                    onClick={resetForm}
                                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                                >
                                    Reset
                                </button>
                                <button
                                    onClick={handleVerify}
                                    disabled={!pdfFile || !selectedIssuer || isVerifying}
                                    className={`px-6 py-3 rounded-lg transition-colors flex items-center justify-center ${(!pdfFile || !selectedIssuer)
                                        ? "bg-gray-600 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-500"
                                        }`}
                                >
                                    {isVerifying ? (
                                        <span className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Verifying...
                                        </span>
                                    ) : "Verify Document"}
                                </button>
                            </div>

                            {/* Verification result */}
                            {verificationResult && (
                                <div className={`p-4 rounded-lg border ${verificationResult.success
                                    ? "bg-green-600/20 border-green-500 text-green-300"
                                    : "bg-red-600/20 border-red-500 text-red-300"
                                    }`}>
                                    <div className="flex items-start space-x-3">
                                        {verificationResult.success ? (
                                            <FiCheckCircle className="text-2xl flex-shrink-0" />
                                        ) : (
                                            <FiXCircle className="text-2xl flex-shrink-0" />
                                        )}
                                        <div>
                                            <h3 className="font-semibold">
                                                {verificationResult.success ? "Verification Successful" : "Verification Failed"}
                                            </h3>
                                            <p>{verificationResult.message}</p>
                                            {verificationResult.success && verificationResult.credentialData && (
                                                <div className="mt-3 p-3 bg-black/20 rounded">
                                                    <p>Issuer: {verificationResult.credentialData.issuer}</p>
                                                    <p>Verified At: {new Date(verificationResult.credentialData.verifiedAt).toLocaleString()}</p>
                                                    <p className="font-mono text-sm break-all">Document Hash: {verificationResult.credentialData.documentHash}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </main>
                <Footer />
            </div>
        </div>
    );
}