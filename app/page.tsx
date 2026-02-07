'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  Sparkles,
  Brain,
  Calendar,
  Layers,
  Zap,
  Shield,
  Smartphone,
  ArrowRight,
  Star,
  Target,
  ChevronDown,
  ChevronUp,
  Check,
  Menu,
  X,
  HelpCircle,
  AlertCircle,
} from 'lucide-react'
import { cn } from '../lib/utils'
import { PricingCard } from '@/components/pricing/PricingCard'

// Branded MultiTasks component - always displays with icon + gradient
function BrandedName({ withIcon = true, className = "" }: { withIcon?: boolean, className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {withIcon && <span className="text-indigo-400">✦</span>}
      <span className="bg-gradient-to-r from-indigo-400 to-amber-300 bg-clip-text text-transparent font-bold">
        MultiTasks
      </span>
    </span>
  )
}

// Helper to replace "MultiTasks" in strings with branded component
function formatWithBrand(text: string) {
  const parts = text.split(/(MultiTasks)/g)
  return parts.map((part, i) =>
    part === 'MultiTasks' ? <BrandedName key={i} withIcon={false} /> : part
  )
}

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
}

// Animated Section wrapper
function AnimatedSection({
  children,
  className,
  delay = 0
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Feature card component
function FeatureCard({
  icon: Icon,
  title,
  description,
  gradient
}: {
  icon: React.ElementType
  title: string
  description: string
  gradient: string
}) {
  return (
    <div className="group relative p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-indigo-500/50 transition-all duration-500 hover:transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10">
      <div className={cn(
        "w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform duration-500 group-hover:scale-110",
        gradient
      )}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
  )
}

// Testimonial component
function Testimonial({
  quote,
  author,
  role,
  avatar
}: {
  quote: string
  author: string
  role: string
  avatar: string
}) {
  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50">
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <p className="text-slate-300 mb-6 italic">&ldquo;{formatWithBrand(quote)}&rdquo;</p>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xl">
          {avatar}
        </div>
        <div>
          <p className="font-semibold text-white">{author}</p>
          <p className="text-sm text-slate-400">{role}</p>
        </div>
      </div>
    </div>
  )
}

// Step component
function Step({
  number,
  title,
  description
}: {
  number: number
  title: string
  description: string
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">
        {number}
      </div>
      <div>
        <h4 className="text-lg font-semibold text-white mb-1">{title}</h4>
        <p className="text-slate-400">{description}</p>
      </div>
    </div>
  )
}

// Animated App Preview - Shows AI in action
function AnimatedAppPreview() {
  const [step, setStep] = useState(0)
  const steps = [
    { text: "Préparer présentation client Q4", type: "task" },
    { text: "Analyse IA en cours...", type: "analyzing" },
    { text: "Faire maintenant", type: "result", stars: 3 }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 4)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl shadow-indigo-500/20 bg-slate-900">
      {/* Browser chrome */}
      <div className="bg-slate-800 px-4 py-3 flex items-center border-b border-slate-700/50 relative">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm text-slate-400 font-medium">multitasks.fr</span>
        </div>
      </div>

      {/* App content */}
      <div className="p-6 min-h-[350px] bg-gradient-to-br from-slate-900 to-slate-800">
        {/* Task input simulation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/50 mb-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded border-2 border-slate-600" />
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.span
                  key="typing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-slate-400 flex items-center"
                >
                  <span className="typing-animation">{steps[0].text}</span>
                  <span className="ml-1 animate-pulse">|</span>
                </motion.span>
              )}
              {step >= 1 && (
                <motion.span
                  key="typed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-white font-medium"
                >
                  {steps[0].text}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* AI Analysis */}
        <AnimatePresence>
          {step >= 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl p-4 border border-indigo-500/30"
            >
              <div className="flex items-start gap-3">
                <motion.div
                  animate={step === 1 ? { rotate: 360 } : {}}
                  transition={{ duration: 1, repeat: step === 1 ? Infinity : 0, ease: "linear" }}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0"
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </motion.div>
                <div className="flex-1">
                  <p className="text-base text-indigo-300 mb-2 font-medium">Analyse Eisenhower</p>
                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div
                        key="analyzing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <div className="flex gap-1">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                            className="w-2 h-2 rounded-full bg-indigo-400"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                            className="w-2 h-2 rounded-full bg-indigo-400"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                            className="w-2 h-2 rounded-full bg-indigo-400"
                          />
                        </div>
                        <span className="text-white">Analyse en cours...</span>
                      </motion.div>
                    )}
                    {step >= 2 && (
                      <motion.div
                        key="result"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3"
                      >
                        <div className="flex items-center justify-between bg-slate-900/50 rounded-lg p-3">
                          <span className="text-white font-medium text-base">Quadrant</span>
                          <span className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-full text-base font-semibold">
                            🔥 Faire maintenant
                          </span>
                        </div>
                        <div className="flex items-center justify-between bg-slate-900/50 rounded-lg p-3">
                          <span className="text-white font-medium text-base">Priorité suggérée</span>
                          <span className="text-white font-semibold text-base">Haute</span>
                        </div>
                        <div className="flex items-center justify-between bg-slate-900/50 rounded-lg p-3">
                          <span className="text-white font-medium text-base">Étoiles</span>
                          <span className="text-amber-400 font-semibold text-base">⭐⭐⭐</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA in preview */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold text-base shadow-lg shadow-purple-500/25"
            >
              ✓ Appliquer les suggestions
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// Problem Section Component
function ProblemSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  const problems = [
    "Vous passez plus de temps à organiser qu'à faire",
    "Les deadlines vous échappent constamment",
    "Impossible de savoir par quoi commencer"
  ]

  return (
    <section ref={ref} className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 to-slate-800/50">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="text-4xl mb-6 block">😩</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8">
            &ldquo;Encore une liste de tâches qui déborde...&rdquo;
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="space-y-4 mb-12"
        >
          {problems.map((problem, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.4 + i * 0.15 }}
              className="flex items-center justify-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-white font-semibold">{problem}</span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-xl" />
          <div className="relative bg-slate-800/50 rounded-2xl border border-indigo-500/30 p-8">
            <span className="text-4xl mb-4 block">✨</span>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
              Et si une <span className="text-indigo-400">IA</span> faisait ce travail pour vous ?
            </h3>
            <p className="text-white font-semibold">
              <BrandedName /> analyse, priorise et organise automatiquement.
              <br />
              <span className="text-white font-medium">Vous, vous passez à l&apos;action.</span>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// FAQ Item component
function FAQItem({
  question,
  answer,
  isOpen,
  onToggle
}: {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div className="border-b border-slate-700/50 last:border-0">
      <button
        onClick={onToggle}
        className="w-full py-5 flex items-center justify-between text-left group"
      >
        <span className="text-lg font-medium text-white group-hover:text-indigo-400 transition-colors pr-4">
          {formatWithBrand(question)}
        </span>
        <span className="flex-shrink-0 p-1 rounded-lg bg-slate-800 group-hover:bg-indigo-500/20 transition-colors">
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-indigo-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-indigo-400" />
          )}
        </span>
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-96 opacity-100 pb-5" : "max-h-0 opacity-0"
        )}
      >
        <p className="text-slate-400 leading-relaxed">{formatWithBrand(answer)}</p>
      </div>
    </div>
  )
}

// Mobile Sticky CTA Component
function MobileStickyCTA() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past hero (about 600px)
      setIsVisible(window.scrollY > 600)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 p-4 safe-area-pb"
        >
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30"
          >
            Essayer gratuitement
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// FAQ Data
const faqData = [
  {
    question: "MultiTasks est-il vraiment gratuit ?",
    answer: "Oui ! Le plan gratuit vous donne accès à 3 espaces de travail et 50 tâches actives, sans limite de temps. C'est parfait pour un usage personnel. Les fonctionnalités avancées comme l'IA et la synchronisation cloud sont disponibles dans les plans payants."
  },
  {
    question: "Comment fonctionne l'IA de priorisation ?",
    answer: "Notre IA analyse le titre, la description et le contexte de chaque tâche pour déterminer son urgence et son importance selon la matrice d'Eisenhower. Elle vous suggère ensuite une priorité et un nombre d'étoiles. Vous gardez toujours le contrôle final !"
  },
  {
    question: "Mes données sont-elles sécurisées ?",
    answer: "Absolument. Avec le plan gratuit, vos données restent 100% locales sur votre appareil. Avec les plans payants, la synchronisation cloud est protégée par chiffrement SSL et vos données sont stockées de manière sécurisée. Nous ne revendons jamais vos données et sommes conformes au RGPD."
  },
  {
    question: "Puis-je utiliser MultiTasks hors ligne ?",
    answer: "Oui ! MultiTasks est une Progressive Web App (PWA). Une fois installée, l'application fonctionne entièrement hors ligne. Vos modifications seront synchronisées automatiquement dès que vous retrouverez une connexion internet."
  },
  {
    question: "Comment annuler mon abonnement ?",
    answer: "Vous pouvez annuler votre abonnement à tout moment depuis les paramètres de votre compte. Vous conserverez l'accès aux fonctionnalités premium jusqu'à la fin de votre période de facturation. Aucun engagement, aucune pénalité."
  },
  {
    question: "Proposez-vous un essai gratuit des plans payants ?",
    answer: "Oui, le plan Pro est disponible en essai gratuit pendant 14 jours, sans carte bancaire requise. Vous aurez accès à toutes les fonctionnalités pour tester l'IA et la synchronisation cloud avant de vous engager."
  },
]

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Close mobile menu when clicking a link
  const handleMobileNavClick = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-slate-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <BrandedName className="text-xl" />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-300 hover:text-white transition-colors">Fonctionnalités</a>
              <a href="#how-it-works" className="text-slate-300 hover:text-white transition-colors">Comment ça marche</a>
              <a href="#pricing" className="text-slate-300 hover:text-white transition-colors">Tarifs</a>
              <a href="#testimonials" className="text-slate-300 hover:text-white transition-colors">Témoignages</a>
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/dashboard"
                className="px-4 py-2 text-slate-300 hover:text-white transition-colors font-medium"
              >
                Connexion
              </Link>
              <Link
                href="/dashboard"
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105"
              >
                Commencer gratuit
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            "md:hidden absolute top-16 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/50 transition-all duration-300 ease-in-out",
            isMobileMenuOpen
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-4 pointer-events-none"
          )}
        >
          <div className="px-4 py-6 space-y-4">
            {/* Mobile Navigation Links */}
            <a
              href="#features"
              onClick={handleMobileNavClick}
              className="block px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl transition-colors"
            >
              Fonctionnalités
            </a>
            <a
              href="#how-it-works"
              onClick={handleMobileNavClick}
              className="block px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl transition-colors"
            >
              Comment ça marche
            </a>
            <a
              href="#pricing"
              onClick={handleMobileNavClick}
              className="block px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl transition-colors"
            >
              Tarifs
            </a>
            <a
              href="#testimonials"
              onClick={handleMobileNavClick}
              className="block px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl transition-colors"
            >
              Témoignages
            </a>

            {/* Mobile CTA */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <Link
                href="/dashboard"
                onClick={handleMobileNavClick}
                className="block w-full px-4 py-3 text-center text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl transition-colors font-medium"
              >
                Connexion
              </Link>
              <Link
                href="/dashboard"
                onClick={handleMobileNavClick}
                className="block w-full px-4 py-3 text-center bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/30"
              >
                Commencer gratuit
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 8, repeat: Infinity, delay: 2 }}
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-sm font-medium mb-8"
            >
              <Sparkles className="w-4 h-4" />
              Propulsé par l&apos;Intelligence Artificielle
            </motion.div>

            {/* Main headline - NEW IMPACTFUL COPY */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white mb-6 leading-tight"
            >
              Arrêtez de subir vos tâches
              <br />
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
              >
                Dominez-les
              </motion.span>
            </motion.h1>

            {/* Subtitle - PROBLEM-ORIENTED */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Fini les post-it par dizaines, les multiples notes oubliées sur son mobile, le stress des deadlines oubliées et des priorités floues.
              <br />
              <span className="text-white font-semibold">L&apos;IA analyse, priorise, et vous guide.</span>
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-bold">Concentrez-vous enfin sur l&apos;essentiel !</span>
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex justify-center mb-16"
            >
              <Link
                href="/dashboard"
                className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold text-lg rounded-2xl transition-all duration-300 shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105"
              >
                Essayer gratuitement
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* Social proof - PWA & Offline */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-center justify-center gap-2 text-base text-white font-medium mb-12"
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span>Fonctionne 100% hors-ligne une fois installé</span>
            </motion.div>

            {/* Hero image / Animated App Preview */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              id="app-preview"
              className="relative mx-auto max-w-3xl"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10 pointer-events-none" />
              <AnimatedAppPreview />
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
        >
          <ChevronDown className="w-8 h-8 text-slate-500" />
        </motion.div>
      </section>

      {/* Stats Section - Valeurs qualitatives */}
      <section id="stats" className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { value: '∞', suffix: '', label: 'Tâches possibles', icon: CheckCircle2 },
              { value: '3', suffix: '', label: 'Fonctions IA', icon: Brain },
              { value: '100', suffix: '%', label: 'Hors-ligne', icon: Smartphone },
              { value: '0', suffix: '€', label: 'Pour commencer', icon: Star },
            ].map((stat, i) => (
              <motion.div key={i} variants={fadeInUp} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <stat.icon className="w-6 h-6 text-indigo-400" />
                  <span className="text-3xl sm:text-4xl font-bold text-white">
                    {stat.value}{stat.suffix}
                  </span>
                </div>
                <p className="text-white/90 text-base font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Problem Section - Emotional Hook */}
      <ProblemSection />

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Des fonctionnalités pensées pour booster votre productivité au quotidien
            </p>
          </AnimatedSection>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              { icon: Brain, title: "IA Intelligente", description: "L'IA analyse vos tâches et suggère automatiquement les priorités avec la matrice d'Eisenhower.", gradient: "bg-gradient-to-br from-purple-500 to-pink-500" },
              { icon: Layers, title: "Multi-espaces", description: "Organisez vos tâches par contexte : travail, perso, projets... Chaque casquette a son espace.", gradient: "bg-gradient-to-br from-blue-500 to-cyan-500" },
              { icon: Calendar, title: "Vue Calendrier", description: "Visualisez vos deadlines et planifiez efficacement avec notre vue calendrier intuitive.", gradient: "bg-gradient-to-br from-amber-500 to-orange-500" },
              { icon: Zap, title: "Notifications", description: "Ne manquez plus jamais une deadline grâce aux rappels personnalisés.", gradient: "bg-gradient-to-br from-green-500 to-emerald-500" },
              { icon: Shield, title: "100% Sécurisé", description: "Vos données sont chiffrées et stockées localement. Votre vie privée est notre priorité.", gradient: "bg-gradient-to-br from-red-500 to-rose-500" },
              { icon: Smartphone, title: "PWA Native", description: "Installez l'app sur votre téléphone et accédez à vos tâches même hors ligne.", gradient: "bg-gradient-to-br from-indigo-500 to-violet-500" },
            ].map((feature, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  gradient={feature.gradient}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* AI Feature Highlight */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border-y border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-sm font-medium mb-6">
                <Brain className="w-4 h-4" />
                Intelligence Artificielle
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Laissez l&apos;IA prioriser
                <br />
                <span className="text-indigo-400">vos tâches pour vous</span>
              </h2>
              <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                Notre IA analyse le contexte, l&apos;urgence et l&apos;importance de chaque tâche
                pour vous suggérer la meilleure priorisation selon la matrice d&apos;Eisenhower.
              </p>
              <ul className="space-y-4">
                {[
                  'Analyse automatique du contexte',
                  'Suggestions de priorité intelligentes',
                  'Classification par matrice Eisenhower',
                  'Estimation de durée des tâches',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-indigo-400" />
                    </div>
                    <span className="text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl blur-3xl" />
              <div className="relative bg-slate-800/80 rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-400 mb-1">Analyse Eisenhower</p>
                    <p className="text-white font-medium">&ldquo;Préparer la présentation client&rdquo;</p>
                  </div>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Quadrant</span>
                    <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-medium">
                      🔥 Faire maintenant
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Priorité suggérée</span>
                    <span className="text-white font-medium">Haute</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Étoiles</span>
                    <span className="text-amber-400 font-medium">⭐⭐⭐</span>
                  </div>
                </div>
                <button className="w-full mt-4 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-purple-500/25">
                  ✓ Appliquer les suggestions
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Commencez à être productif en 3 étapes simples
            </p>
          </div>

          <div className="max-w-2xl mx-auto space-y-8">
            <Step
              number={1}
              title="Créez vos espaces de travail"
              description="Organisez vos tâches par contexte : travail, personnel, projets... Chaque espace a son propre univers."
            />
            <div className="ml-5 border-l-2 border-dashed border-slate-700 h-8" />
            <Step
              number={2}
              title="Ajoutez vos tâches"
              description="Créez rapidement vos tâches avec notre Quick Add ou le formulaire complet avec deadlines et sous-tâches."
            />
            <div className="ml-5 border-l-2 border-dashed border-slate-700 h-8" />
            <Step
              number={3}
              title="Laissez l'IA vous guider"
              description="L'IA analyse vos tâches et vous suggère les priorités. Concentrez-vous sur ce qui compte vraiment."
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ils adorent <BrandedName />
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Découvrez ce que nos utilisateurs disent de leur expérience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Testimonial
              quote="MultiTasks a complètement transformé ma façon de travailler. L'IA de priorisation est bluffante !"
              author="Marie Dupont"
              role="Chef de projet"
              avatar="👩‍💼"
            />
            <Testimonial
              quote="Enfin une app de tâches qui comprend qu'on a plusieurs casquettes. Les espaces de travail sont géniaux."
              author="Thomas Martin"
              role="Freelance"
              avatar="👨‍💻"
            />
            <Testimonial
              quote="Simple, élégante, efficace. Je recommande à tous mes étudiants. La version hors-ligne est un plus énorme."
              author="Sophie Bernard"
              role="Professeure"
              avatar="👩‍🏫"
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Des tarifs simples et transparents
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Commencez gratuitement, évoluez selon vos besoins
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard
              name="Gratuit"
              description="Pour demarrer en douceur"
              price="0€"
              period="/mois"
              plan="free"
              ctaText="Commencer gratuit"
              features={[
                '3 espaces de travail',
                '50 taches actives',
                'Vue calendrier',
                'Rappels basiques',
                'Stockage local',
              ]}
            />

            <PricingCard
              name="Pro"
              description="Pour les professionnels exigeants"
              price="9,90€"
              period="/mois"
              plan="pro"
              featured
              ctaText="Essai gratuit 14 jours"
              features={[
                'Espaces illimites',
                'Taches illimitees',
                'IA Eisenhower',
                'Estimation duree IA',
                'Sync cloud multi-appareils',
                'Rappels personnalises',
                'Export PDF/CSV',
                'Support prioritaire',
              ]}
            />

{/* Plan Team masqué - fonctionnalités non encore implémentées
            <PricingCard
              name="Equipe"
              description="Pour collaborer efficacement"
              price="19,90€"
              period="/utilisateur/mois"
              plan="team"
              ctaText="Bientot disponible"
              features={[
                'Tout le plan Pro',
                'Espaces partages',
                'Collaboration temps reel',
                'Gestion des roles',
                'Tableau de bord equipe',
                'Statistiques avancees',
                'API & Webhooks',
                'Support dedie',
              ]}
            />
            */}
          </div>

          {/* FAQ teaser */}
          <div className="mt-16 text-center">
            <p className="text-slate-400">
              Des questions ?{' '}
              <a href="#faq" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">
                Consultez notre FAQ
              </a>
              {' '}ou{' '}
              <a href="#" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">
                contactez-nous
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-sm font-medium mb-6">
              <HelpCircle className="w-4 h-4" />
              FAQ
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Questions fréquentes
            </h2>
            <p className="text-lg text-slate-400">
              Tout ce que vous devez savoir sur <BrandedName withIcon={false} />
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 sm:p-8">
            {faqData.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFAQ === index}
                onToggle={() => setOpenFAQ(openFAQ === index ? null : index)}
              />
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-slate-400 mb-4">
              Vous ne trouvez pas la réponse à votre question ?
            </p>
            <a
              href="mailto:support@multitasks.app"
              className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              Contactez notre support
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl blur-3xl" />
            <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-3xl border border-slate-700/50 p-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Prêt à booster votre productivité ?
              </h2>
              <p className="text-lg text-slate-400 mb-8 max-w-xl mx-auto">
                Rejoignez des milliers d&apos;utilisateurs qui ont déjà transformé leur façon de gérer leurs tâches.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold text-lg rounded-2xl transition-all duration-300 shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105"
              >
                Commencer gratuitement
                <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-sm text-slate-500 mt-4">
                Pas de carte bancaire requise • 100% gratuit
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800 pb-24 md:pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center">
              <BrandedName className="text-xl" />
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
              <a href="#" className="hover:text-white transition-colors">Conditions</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
            <p className="text-sm text-slate-500">
              © 2024 <BrandedName withIcon={false} />. Fait avec ❤️ en France
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile Sticky CTA - appears after scrolling */}
      <MobileStickyCTA />
    </div>
  )
}
