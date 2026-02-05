# MultiTask Pro — Roadmap

> TodoList intelligente multi-rôles avec sync cloud et IA

## Vision Produit

**Free** : 1 workspace, 20 tâches, pas d'IA, données locales
**Pro** : Illimité + IA (Eisenhower, suggestions) + Sync multi-device

---

## Phase 1 — Fondations ✈️

### 1.1 Déploiement Vercel
- [ ] Créer compte Vercel (si pas existant)
- [ ] Déployer version actuelle (localStorage)
- [ ] Configurer domaine personnalisé (optionnel)
- [ ] Tester PWA en production

### 1.2 Setup Supabase
- [ ] Créer projet Supabase
- [ ] Configurer Auth (email/password + magic link)
- [ ] Créer schéma base de données :
  - `users` (profil, plan, settings)
  - `workspaces` (id, user_id, name, icon, color, ...)
  - `tasks` (id, workspace_id, title, priority, stars, deadline, reminder, ...)
  - `subtasks` (id, task_id, title, completed, order)
- [ ] Configurer Row Level Security (RLS)
- [ ] Créer fonctions API (CRUD)

### 1.3 Migration localStorage → Supabase
- [ ] Adapter le store.ts pour Supabase
- [ ] Gérer le mode offline (fallback localStorage)
- [ ] Migration des données existantes au premier login
- [ ] Sync temps réel (Supabase Realtime)

---

## Phase 2 — Valeur Ajoutée 🚀

### 2.1 Intégration LLM Multi-Provider
- [ ] Interface settings pour API keys (stockées côté client, chiffrées)
- [ ] Support providers :
  - OpenAI (GPT-4, GPT-3.5)
  - Anthropic (Claude)
  - Mistral
  - OpenRouter (fallback multi)
- [ ] Abstraction API unifiée

### 2.2 Fonctionnalités IA
- [ ] **Matrice Eisenhower** : classification auto Urgent/Important
- [ ] **Suggestions de priorisation** : "Tu devrais te concentrer sur..."
- [ ] **Estimation de durée** : analyse du titre/description
- [ ] **Reformulation** : améliorer les titres de tâches
- [ ] **Décomposition** : suggérer des sous-tâches

### 2.3 Fonctionnalités Organisation
- [ ] **Tags/Labels** personnalisés
- [ ] **Filtres avancés** (par tag, date, priorité, étoiles)
- [ ] **Recherche** full-text
- [ ] **Récurrence avancée** (tous les X jours, jours spécifiques)
- [ ] **Statistiques** (tâches complétées, temps moyen, productivité)
- [ ] **Export** (CSV, JSON, PDF)
- [ ] **Templates** de tâches récurrentes
- [ ] **Mode Focus** (une tâche à la fois, timer Pomodoro)

---

## Phase 3 — Monétisation 💰

### 3.1 Setup Stripe
- [ ] Créer compte Stripe
- [ ] Configurer produits/prix (Free, Pro mensuel, Pro annuel)
- [ ] Intégrer Stripe Checkout
- [ ] Webhooks pour sync statut abonnement

### 3.2 Gestion des Plans
- [ ] Middleware de vérification du plan
- [ ] Limites Free (1 workspace, 20 tâches)
- [ ] Upgrade flow in-app
- [ ] Page pricing
- [ ] Gestion abonnement (annuler, changer plan)

### 3.3 Landing Page
- [ ] Page marketing avec features
- [ ] Pricing table
- [ ] Témoignages / Social proof
- [ ] CTA inscription

---

## Stack Technique

- **Frontend** : Next.js 14, TypeScript, Tailwind CSS
- **Backend** : Supabase (Auth, Database, Realtime, Edge Functions)
- **Paiements** : Stripe
- **Déploiement** : Vercel
- **IA** : OpenAI / Anthropic / Mistral (API côté client)

---

## Sessions de Développement

### Session 1 (aujourd'hui)
- [x] Définir roadmap
- [ ] Déployer sur Vercel
- [ ] Créer projet Supabase
- [ ] Setup Auth basique

### Session 2
- [ ] Schéma DB complet
- [ ] Migration store.ts → Supabase
- [ ] Test sync

### Session 3
- [ ] Interface settings LLM
- [ ] Intégration premier provider (OpenAI)

### Session 4
- [ ] Fonctionnalités IA (Eisenhower)
- [ ] Autres providers LLM

### Session 5
- [ ] Stripe setup
- [ ] Gestion plans Free/Pro

### Session 6
- [ ] Landing page
- [ ] Polish & launch

---

## Notes

- Données utilisateur = propriété de l'utilisateur (export toujours dispo)
- API keys LLM stockées localement (jamais sur nos serveurs)
- Mode offline first (fonctionne sans connexion)
