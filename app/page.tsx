'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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
  Clock,
  Target,
  Users,
  ChevronDown,
  Play,
  Check,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '../lib/utils'

// Animated counter hook
function useCounter(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (!started) return
    let startTime: number
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [started, end, duration])

  return { count, start: () => setStarted(true) }
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
      <p className="text-slate-300 mb-6 italic">&ldquo;{quote}&rdquo;</p>
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

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const tasksCounter = useCounter(10000, 2500)
  const usersCounter = useCounter(5000, 2500)
  const hoursCounter = useCounter(50000, 2500)

  useEffect(() => {
    setIsVisible(true)
    // Start counters when stats section is visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            tasksCounter.start()
            usersCounter.start()
            hoursCounter.start()
          }
        })
      },
      { threshold: 0.5 }
    )
    const statsSection = document.getElementById('stats')
    if (statsSection) observer.observe(statsSection)
    return () => observer.disconnect()
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
            <div className="flex items-center gap-2">
              <span className="text-2xl">✨</span>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                MultiTasks
              </span>
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
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className={cn(
            "text-center max-w-4xl mx-auto transition-all duration-1000",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              Propulsé par l&apos;Intelligence Artificielle
            </div>

            {/* Main headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
              Gérez vos tâches
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                comme jamais auparavant
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              MultiTasks révolutionne votre productivité grâce à l&apos;IA.
              Priorisation automatique, espaces de travail personnalisés,
              et une interface qui s&apos;adapte à votre façon de travailler.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                href="/dashboard"
                className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold text-lg rounded-2xl transition-all duration-300 shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105"
              >
                Démarrer gratuitement
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="flex items-center gap-2 px-8 py-4 bg-slate-800/50 hover:bg-slate-800 text-white font-semibold text-lg rounded-2xl border border-slate-700/50 hover:border-slate-600 transition-all duration-300">
                <Play className="w-5 h-5" />
                Voir la démo
              </button>
            </div>

            {/* Hero image / App preview */}
            <div className="relative mx-auto max-w-5xl">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10 pointer-events-none" />
              <div className="relative rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl shadow-indigo-500/20">
                <div className="bg-slate-800 px-4 py-3 flex items-center gap-2 border-b border-slate-700/50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-xs text-slate-500">multitasks.app</span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 min-h-[400px] flex items-center justify-center">
                  <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">
                    {/* Mock workspace cards */}
                    {[
                      { icon: '💼', name: 'Travail', tasks: 12, color: 'from-blue-500 to-cyan-500' },
                      { icon: '🏠', name: 'Personnel', tasks: 8, color: 'from-purple-500 to-pink-500' },
                      { icon: '📚', name: 'Études', tasks: 5, color: 'from-amber-500 to-orange-500' },
                    ].map((ws, i) => (
                      <div
                        key={i}
                        className={cn(
                          "p-4 rounded-xl bg-slate-800/80 border border-slate-700/50 transform transition-all duration-500",
                          i === 1 ? "scale-105 shadow-xl shadow-purple-500/20" : "opacity-80"
                        )}
                        style={{ animationDelay: `${i * 200}ms` }}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-3 bg-gradient-to-br",
                          ws.color
                        )}>
                          {ws.icon}
                        </div>
                        <p className="font-semibold text-white text-sm">{ws.name}</p>
                        <p className="text-xs text-slate-400">{ws.tasks} tâches</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-slate-500" />
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: tasksCounter.count, suffix: '+', label: 'Tâches accomplies', icon: CheckCircle2 },
              { value: usersCounter.count, suffix: '+', label: 'Utilisateurs actifs', icon: Users },
              { value: hoursCounter.count, suffix: 'h', label: 'Heures économisées', icon: Clock },
              { value: 98, suffix: '%', label: 'Satisfaction client', icon: Star },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <stat.icon className="w-6 h-6 text-indigo-400" />
                  <span className="text-3xl sm:text-4xl font-bold text-white">
                    {stat.value.toLocaleString()}{stat.suffix}
                  </span>
                </div>
                <p className="text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Des fonctionnalités pensées pour booster votre productivité au quotidien
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={Brain}
              title="IA Intelligente"
              description="L'IA analyse vos tâches et suggère automatiquement les priorités avec la matrice d'Eisenhower."
              gradient="bg-gradient-to-br from-purple-500 to-pink-500"
            />
            <FeatureCard
              icon={Layers}
              title="Multi-espaces"
              description="Organisez vos tâches par contexte : travail, perso, projets... Chaque casquette a son espace."
              gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
            />
            <FeatureCard
              icon={Calendar}
              title="Vue Calendrier"
              description="Visualisez vos deadlines et planifiez efficacement avec notre vue calendrier intuitive."
              gradient="bg-gradient-to-br from-amber-500 to-orange-500"
            />
            <FeatureCard
              icon={Zap}
              title="Rappels Intelligents"
              description="Ne manquez plus jamais une deadline grâce aux notifications personnalisées."
              gradient="bg-gradient-to-br from-green-500 to-emerald-500"
            />
            <FeatureCard
              icon={Shield}
              title="100% Sécurisé"
              description="Vos données sont chiffrées et stockées localement. Votre vie privée est notre priorité."
              gradient="bg-gradient-to-br from-red-500 to-rose-500"
            />
            <FeatureCard
              icon={Smartphone}
              title="PWA Native"
              description="Installez l'app sur votre téléphone et accédez à vos tâches même hors ligne."
              gradient="bg-gradient-to-br from-indigo-500 to-violet-500"
            />
          </div>
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
                  'Estimation de durée des tâches',
                  'Assistant IA conversationnel',
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
                    <p className="text-sm text-slate-400 mb-1">Analyse IA</p>
                    <p className="text-white font-medium">&ldquo;Préparer la présentation client&rdquo;</p>
                  </div>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Quadrant</span>
                    <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-medium">
                      🔥 Urgent & Important
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Priorité suggérée</span>
                    <span className="text-amber-400 font-medium">★★★ Haute</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Durée estimée</span>
                    <span className="text-white font-medium">~2h30</span>
                  </div>
                </div>
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
              Ils adorent MultiTasks
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
            {/* Free Plan */}
            <div className="relative p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-all duration-300">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">Gratuit</h3>
                <p className="text-slate-400 text-sm">Pour démarrer en douceur</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-white">0€</span>
                <span className="text-slate-400">/mois</span>
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  '3 espaces de travail',
                  '50 tâches actives',
                  'Vue calendrier',
                  'Rappels basiques',
                  'Stockage local',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/dashboard"
                className="block w-full py-3 px-4 text-center bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all duration-300"
              >
                Commencer gratuit
              </Link>
            </div>

            {/* Pro Plan - Featured */}
            <div className="relative p-8 rounded-2xl bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border-2 border-indigo-500/50 hover:border-indigo-400 transition-all duration-300 transform scale-105 shadow-2xl shadow-indigo-500/20">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="px-4 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-bold rounded-full shadow-lg">
                  Populaire
                </span>
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
                <p className="text-slate-400 text-sm">Pour les professionnels exigeants</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-white">9€</span>
                <span className="text-slate-400">/mois</span>
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  'Espaces illimités',
                  'Tâches illimitées',
                  '🤖 IA Eisenhower',
                  '🤖 Estimation durée IA',
                  'Sync cloud multi-appareils',
                  'Rappels intelligents',
                  'Export PDF/CSV',
                  'Support prioritaire',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300">
                    <Check className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/dashboard"
                className="block w-full py-3 px-4 text-center bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50"
              >
                Essai gratuit 14 jours
              </Link>
            </div>

            {/* Team Plan */}
            <div className="relative p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-all duration-300">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">Équipe</h3>
                <p className="text-slate-400 text-sm">Pour collaborer efficacement</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-white">19€</span>
                <span className="text-slate-400">/utilisateur/mois</span>
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  'Tout le plan Pro',
                  'Espaces partagés',
                  'Collaboration temps réel',
                  'Gestion des rôles',
                  'Tableau de bord équipe',
                  'Statistiques avancées',
                  'API & Webhooks',
                  'Support dédié',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/dashboard"
                className="block w-full py-3 px-4 text-center bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all duration-300"
              >
                Contacter les ventes
              </Link>
            </div>
          </div>

          {/* FAQ teaser */}
          <div className="mt-16 text-center">
            <p className="text-slate-400">
              Des questions ?{' '}
              <a href="#" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">
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

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
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
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✨</span>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                MultiTasks
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
              <a href="#" className="hover:text-white transition-colors">Conditions</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
            <p className="text-sm text-slate-500">
              © 2024 MultiTasks. Fait avec ❤️ en France
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
