"use client"
import { motion } from "framer-motion"

export default function Unauthorized() {
    return (
      <div className="relative min-h-screen">
        {/* Background gradients */}
        <div className="pointer-events-none fixed inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
          <div className="absolute right-0 top-0 h-[500px] w-[500px] bg-blue-500/10 blur-[100px]" />
          <div className="absolute bottom-0 left-0 h-[500px] w-[500px] bg-purple-500/10 blur-[100px]" />
        </div>

        <div className="relative z-10">
            <main className="flex flex-col items-center p-8 md:p-24 text-white">
            {/* Hero Section */}
            <motion.section
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="w-full max-w-7xl mb-16"
            >
                <h1 className="text-4xl md:text-6xl font-bold mb-6">403: Unauthorized</h1>
                <p className="text-xl text-gray-200 max-w-3xl">
                You do not have the necessary permissions to access this page.
                </p>
            </motion.section>
            </main>
        </div>
      </div>
    )
  }