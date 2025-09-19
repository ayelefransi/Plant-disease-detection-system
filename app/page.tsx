"use client";
import { Leaf, Upload, Brain, Shield, Users, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { useState } from "react"

export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false)
  return (
    <div className="relative min-h-screen bg-plant-gradient overflow-hidden">

      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50 shadow-plant">
        <div className="container mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-plant"
            >
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </motion.div>
            <span className="text-2xl font-bold font-heading text-foreground">PlantCare AI</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </Link>
            <Link href="/auth/login" className="text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link href="/auth/sign-up">
              <Button className="bg-primary hover:bg-primary/90 shadow-plant">Get Started</Button>
            </Link>
          </nav>
          <button onClick={() => setMobileOpen((s) => !s)} className="md:hidden p-2 rounded-lg border border-border bg-card">
            <span className="sr-only">Menu</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-card/95 backdrop-blur">
            <div className="px-4 py-3 space-y-2">
              <Link href="#features" onClick={() => setMobileOpen(false)} className="block text-foreground/80">Features</Link>
              <Link href="#how-it-works" onClick={() => setMobileOpen(false)} className="block text-foreground/80">How It Works</Link>
              <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="block text-foreground/80">Sign In</Link>
              <Link href="/auth/sign-up" onClick={() => setMobileOpen(false)} className="block">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Get Started</Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute -top-32 -left-24 h-80 w-80 rounded-full blur-3xl bg-growth-gradient" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full blur-3xl bg-growth-gradient" />
        </div>
        <div className="container mx-auto max-w-7xl flex flex-col lg:flex-row items-center justify-between gap-16">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 bg-[#000000]/10 text-[#042f23] px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-plant">
              <Brain className="w-4 h-4 animate-pulse" />
              AI-Powered Plant Disease Detection
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold font-heading mb-6 bg-gradient-to-r from-[#164c23] via-[#55C67C] to-[#6DD39F] bg-clip-text text-transparent">
              Protect Your Plants with Advanced AI
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-foreground/80 mb-8 max-w-2xl leading-relaxed">
              Upload a photo of your plant and get instant disease detection with confidence scores, detailed analysis,
              and expert treatment recommendations powered by cutting-edge AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/auth/sign-up">
                <Button size="lg" className="bg-[#042f23] hover:opacity-90 text-lg px-8 py-6 shadow-plant text-white">
                  <Upload className="w-5 h-5 mr-2 animate-bounce" />
                  Start Detection
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-card shadow-plant hover:shadow-plant text-[#042f23] border-[#042f23]/30">
                  Learn More
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Metrics Panel (replaces image) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: "Detections Today", value: "128", icon: <TrendingUp className="w-4 h-4" /> },
                { title: "Avg Confidence", value: "93%", icon: <Shield className="w-4 h-4" /> },
                { title: "Plants Monitored", value: "1,243", icon: <Users className="w-4 h-4" /> },
              ].map((kpi, i) => (
                <motion.div key={i} whileHover={{ y: -4 }} className="rounded-2xl bg-card border border-border p-5 shadow-plant">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{kpi.title}</span>
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">{kpi.icon}</div>
                  </div>
                  <div className="text-3xl font-semibold text-foreground">{kpi.value}</div>
                  <div className="mt-3 h-2 rounded-full bg-secondary">
                    <div className="h-2 rounded-full bg-growth-gradient" style={{ width: i === 0 ? "70%" : i === 1 ? "93%" : "60%" }} />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Three-Panel Quick Actions Grid */}
      <section className="px-4">
        <div className="container mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-6">
          {[{
            title: "Upload & Analyze",
            desc: "Instant AI diagnosis with confidence metrics.",
            icon: <Upload className="w-5 h-5" />,
            href: "/auth/sign-up",
            cta: "Start Now"
          },{
            title: "Knowledge Base",
            desc: "Explore diseases, symptoms and treatments.",
            icon: <Leaf className="w-5 h-5" />,
            href: "#features",
            cta: "Explore"
          },{
            title: "Dashboard Insights",
            desc: "Monitor trends and track plant health.",
            icon: <TrendingUp className="w-5 h-5" />,
            href: "/dashboard",
            cta: "View"
          }].map((card, i) => (
            <motion.div key={i} whileHover={{ y: -4 }} className="rounded-2xl bg-card border border-border p-6 shadow-plant">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">{card.title}</h3>
                <div className="p-2 rounded-lg bg-[#042f23]/10 text-[#042f23]">{card.icon}</div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{card.desc}</p>
              <Link href={card.href} className="inline-flex">
                <Button className="bg-[#042f23] hover:opacity-90 shadow-plant text-white">{card.cta}</Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-heading mb-4">Advanced Plant Health Analysis</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our AI system provides comprehensive plant disease detection with professional-grade accuracy
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[{
              icon: <Brain className="w-8 h-8 text-primary animate-spin-slow" />, title: "AI Disease Detection", desc: "Advanced CNN models trained on thousands of plant images for accurate disease identification", points: ["95%+ accuracy rate", "Supports tomato, potato, pepper plants", "Real-time analysis"]
            },{
              icon: <TrendingUp className="w-8 h-8 text-green-600 animate-pulse" />, title: "Confidence Scoring", desc: "Get detailed confidence metrics and probability distributions for each prediction", points: ["Detailed confidence percentages", "Risk assessment levels", "Alternative diagnoses"]
            },{
              icon: <Shield className="w-8 h-8 text-emerald-600 animate-bounce" />, title: "Treatment Plans", desc: "Receive expert treatment recommendations and prevention strategies", points: ["Customized treatment plans", "Prevention strategies", "Product recommendations"]
            },{
              icon: <Upload className="w-8 h-8 text-primary animate-float" />, title: "Easy Upload", desc: "Drag and drop or click to upload plant images with instant processing", points: ["Multiple image formats", "Batch processing", "Mobile-friendly interface"]
            },{
              icon: <Users className="w-8 h-8 text-green-700 animate-pulse" />, title: "History Tracking", desc: "Keep track of all your plant health assessments and monitor progress over time", points: ["Complete analysis history", "Progress monitoring", "Export capabilities"]
            },{
              icon: <Leaf className="w-8 h-8 text-emerald-700 animate-spin" />, title: "Plant Database", desc: "Access comprehensive information about plant diseases, symptoms, and treatments", points: ["Extensive disease database", "Symptom descriptions", "Treatment guidelines"]
            }].map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05 }}
                className="bg-card border border-border rounded-2xl shadow-plant hover:shadow-plant transition-all p-6 flex flex-col"
              >
                <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground mb-4">{feature.desc}</p>
                <ul className="space-y-1 text-sm text-foreground/70">
                  {feature.points.map((point, i) => <li key={i}>• {point}</li>)}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
