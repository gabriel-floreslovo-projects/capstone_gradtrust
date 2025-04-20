"use client"

import { useState, useCallback } from "react";
import Link from "next/link";
import Navbar from "../../../components/navbar";
import Footer from "../../../components/footer";
import { useDropzone } from "react-dropzone";
import { FiUploadCloud, FiCheckCircle, FiXCircle, FiFileText } from "react-icons/fi";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function VerifyDocumentPage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [issuer, setIssuer] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    message: string;
    credentialData?: any;
  } | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.type === "application/pdf") {
        setPdfFile(file);
        setVerificationResult(null);
        // Create object URL for preview
        const fileUrl = URL.createObjectURL(file);
        setPdfPreviewUrl(fileUrl);
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

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handleVerify = async () => {
    if (!pdfFile || !issuer) {
      alert("Please upload a PDF and select an issuer");
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      // Mock verification process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Random success/failure for demo purposes
      const isVerified = Math.random() > 0.3;
      
      if (isVerified) {
        setVerificationResult({
          success: true,
          message: "Document successfully verified on the blockchain!",
          credentialData: {
            issuer,
            verifiedAt: new Date().toISOString(),
            documentHash: "0x123...abc" // Mock hash
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
    setPdfPreviewUrl(null);
    setNumPages(null);
    setIssuer("");
    setVerificationResult(null);
    // Clean up object URL
    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl);
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
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Verify Your Own Document</h1>
            <p className="text-lg text-gray-300 mb-10">
              Upload your certified document to verify its authenticity on the blockchain
            </p>

            <div className="space-y-8">
              {/* Drag and drop area */}
              {!pdfPreviewUrl ? (
                <div 
                  {...getRootProps()} 
                  className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
                    isDragActive ? "border-blue-500 bg-blue-500/10" : "border-gray-600 hover:border-gray-500"
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <FiUploadCloud className="text-4xl text-gray-400" />
                    {isDragActive ? (
                      <p className="text-lg">Drop the PDF here...</p>
                    ) : (
                      <>
                        <p className="text-lg">Drag & drop your PDF here, or click to select</p>
                        <p className="text-sm text-gray-400">Only PDF files are accepted</p>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="border-2 border-gray-600 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                      <FiFileText className="text-xl" />
                      <span className="font-medium">{pdfFile?.name}</span>
                    </div>
                    <button 
                      onClick={resetForm}
                      className="text-gray-400 hover:text-white"
                    >
                      Change File
                    </button>
                  </div>
                  
                  {/* PDF Preview */}
                  <div className="border border-gray-700 rounded-lg overflow-hidden max-h-[500px] overflow-y-auto">
                    <Document
                      file={pdfPreviewUrl}
                      onLoadSuccess={onDocumentLoadSuccess}
                      loading={<div className="p-8 text-center">Loading PDF...</div>}
                      error={<div className="p-8 text-center text-red-400">Failed to load PDF</div>}
                    >
                      {Array.from(new Array(numPages), (el, index) => (
                        <Page
                          key={`page_${index + 1}`}
                          pageNumber={index + 1}
                          width={600}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                          loading={<div className="p-8 text-center">Loading page {index + 1}...</div>}
                        />
                      ))}
                    </Document>
                  </div>
                  {numPages && (
                    <p className="text-sm text-gray-400 mt-2">
                      {numPages} page{numPages > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              )}

              {/* Issuer selection */}
              <div className="space-y-2 text-left">
                <label className="block text-gray-300 mb-2">Where did you get this document certified?</label>
                <select
                  value={issuer}
                  onChange={(e) => setIssuer(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!pdfFile}
                >
                  <option value="">Select an issuer</option>
                  <option value="university">University</option>
                  <option value="government">Government Agency</option>
                  <option value="professional">Professional Certification Body</option>
                  <option value="employer">Previous Employer</option>
                  <option value="other">Other Organization</option>
                </select>
              </div>

              {/* Action buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  disabled={!pdfFile && !issuer}
                >
                  Reset
                </button>
                <button
                  onClick={handleVerify}
                  disabled={!pdfFile || !issuer || isVerifying}
                  className={`px-6 py-3 rounded-lg transition-colors flex items-center justify-center ${
                    (!pdfFile || !issuer) 
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
                <div className={`p-4 rounded-lg border ${
                  verificationResult.success 
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