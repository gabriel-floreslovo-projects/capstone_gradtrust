"use client"

import Link from "next/link"
import Image from "next/image"
import Navbar from "../../components/navbar"
import Footer from "../../components/footer"
import { motion } from "framer-motion"

export default function AboutPage() {
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
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="w-full max-w-7xl mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">About Our Company</h1>
            <p className="text-xl text-gray-200 max-w-3xl">
              We're on a mission to bring trust back into the hiring process.
            </p>
          </motion.section>

          {/* Our Story */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="w-full max-w-7xl mb-20"
          >
            <h2 className="text-3xl font-bold mb-8 border-b border-teal-400 pb-2 inline-block">Our Story</h2>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-lg mb-4">
                  Founded in 2025, GradTrust was built on a simple mission: restore trust in the hiring process.
                  Our founders saw a growing need for a secure and efficient way to verify academic credentials,
                  ensuring that employers can confidently assess candidates based on authenticated qualifications.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Contact Section */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="w-full max-w-7xl mb-12"
          >
            <h2 className="text-3xl font-bold mb-8 border-b border-teal-400 pb-2 inline-block">Get In Touch</h2>
            <div className="bg-slate-800/30 p-8 rounded-xl">
              <p className="text-lg mb-6">
                We'd love to hear from you! Whether you have questions about our products, need support, or are interested
                in joining our team, reach out to us.
              </p>
              <div className="flex flex-col md:flex-row gap-4">
                <a
                  href="mailto:contact@streamline.com"
                  className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 px-6 rounded-lg transition-colors text-center"
                >
                  Email Us
                </a>
                <a
                  href="#"
                  className="bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-6 rounded-lg transition-colors text-center"
                >
                  Schedule a Call
                </a>
              </div>
            </div>
          </motion.section>
        </main>
        <Footer />
      </div>
    </div>
  )
}
