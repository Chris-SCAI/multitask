# ✨ MultiTask

TodoList multi-rôles minimaliste et élégante pour gérer tes différentes casquettes.

## Fonctionnalités

- 🎯 **4 espaces de travail** : Enseignant, Formateur IA, Architecte IA, Dirigeant
- 📊 **Cockpit unifié** : Vue d'ensemble des priorités tous rôles confondus
- ✅ **Tâches + sous-tâches** : Organisation hiérarchique
- 📅 **Deadlines & rappels** : Ne rate plus rien
- 🔄 **Récurrence** : Tâches répétitives automatisées
- 📱 **PWA** : Installable sur mobile comme une app native

## Stack

- **Next.js 14** + TypeScript
- **Tailwind CSS** pour le styling
- **localStorage** (MVP) → Supabase (évolution)
- **PWA** avec manifest

## Installation

```bash
# Clone et installe
cd multitask
npm install

# Lance en dev
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000)

## Structure

```
multitask/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/          # Composants génériques
│   ├── task/        # Composants tâches
│   ├── workspace/   # Composants espaces
│   └── dashboard/   # Cockpit
├── lib/
│   ├── types.ts     # Types TypeScript
│   ├── utils.ts     # Utilitaires
│   └── store.ts     # Gestion localStorage
└── public/
    └── manifest.json
```

## Prochaines étapes

- [ ] Formulaire complet de tâche (deadline, priorité, récurrence)
- [ ] Sous-tâches
- [ ] Migration vers Supabase
- [ ] Notifications push
- [ ] Mode sombre

## Licence

MIT
