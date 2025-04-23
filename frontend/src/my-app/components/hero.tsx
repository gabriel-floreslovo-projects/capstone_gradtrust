"use client";
import { Button } from "../components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="container flex min-h-[calc(100vh-4rem)] max-w-screen-2xl flex-col items-center justify-center space-y-8 py-24 text-center md:py-32">
      <h1 className="bg-gradient-to-br from-white from-30% via-white/90 to-white/70 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl md:text-6xl lg:text-7xl">
        GradTrust
      </h1>
      <p className="mx-auto max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
        A secure, quick system that securely verifies credentials is needed to authenticate academic
        credentials and prevent diploma fraud.
      </p>
    </section>
  );
}