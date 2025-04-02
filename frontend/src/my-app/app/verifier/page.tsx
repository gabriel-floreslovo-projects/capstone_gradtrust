"use client"

import { useState } from "react"
import Navbar from "../../components/navbar"
import Footer from "../../components/footer"
import { motion } from "framer-motion"

interface Credential {
  issuedAt: number
  data: string
}

export default function AboutPage() {
  const [address, setAddress] = useState("")
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `https://gradtrust-459152f15ccf.herokuapp.com/api/pull-credentials?address=${address}`
      )
      const result = await response.json()

      if (result.success) {
        setCredentials(result.credentials || [])
      } else {
        setError(result.error || "Failed to fetch credentials")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

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
          {/* Hero Section */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-xl bg-slate-800/40 p-8 rounded-xl shadow-lg"
          >
            <section className="w-full max-w-lg bg-white/10 p-6 rounded-2xl shadow-md backdrop-blur-md text-center">
              <section className="w-full max-w-7xl mb-16 text-center">
                <h1 className="text-4xl md:text-6xl font-bold mb-6">Verifier</h1>
              </section>

              {/* Address Input Section */}
              <form onSubmit={handleSubmit}>
                <label htmlFor="address" className="block text-lg font-semibold mb-2">
                  Enter Recipient Address
                </label>
                <input
                  id="address"
                  type="text"
                  placeholder="Enter recipient address here..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 px-6 rounded-lg transition-colors mt-6 disabled:opacity-50"
                >
                  {loading ? "Loading..." : "Submit"}
                </button>
              </form>
            </section>

            {/* Results Section */}
            {loading && (
              <div className="mt-8 text-center">
                <p>Loading credentials...</p>
              </div>
            )}

            {error && (
              <div className="mt-8 p-4 bg-red-500/20 rounded-lg text-red-300">
                <p>Error: {error}</p>
              </div>
            )}

            {credentials.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Found Credentials</h2>
                <div className="space-y-4">
                  {credentials.map((cred, index) => {
                    const date = new Date(cred.issuedAt * 1000).toLocaleDateString()
                    return (
                      <div
                        key={index}
                        className="bg-white/5 p-4 rounded-lg border border-white/10"
                      >
                        <h3 className="text-xl font-semibold mb-2">Credential</h3>
                        <p className="mb-1">
                          <span className="text-gray-300 font-medium">Issued Date:</span> {date}
                        </p>
                        <p>
                          <span className="text-gray-300 font-medium">Metadata:</span> {cred.data}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {!loading && credentials.length === 0 && address && !error && (
              <div className="mt-8 p-4 bg-blue-500/20 rounded-lg text-blue-300">
                <p>No credentials found for this address.</p>
              </div>
            )}
          </motion.section>
        </main>
        <Footer />
      </div>
    </div>
  )
}