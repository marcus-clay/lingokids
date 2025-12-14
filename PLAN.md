# Plan d'Implémentation - LingoKids English v2.0

## Vision Globale

Refonte complète de LingoKids English en une application d'apprentissage de l'anglais gamifiée pour enfants français (CP à CM2), avec authentification réelle, base de données Firebase, et génération de contenu IA pré-calculée.

---

## 1. Architecture Technique

### Stack Technologique
- **Frontend** : React 19 + Vite + TypeScript + Tailwind CSS
- **Backend** : Vercel Serverless Functions (API Routes)
- **Base de données** : Firebase Firestore
- **Authentification** : Firebase Auth (Google + Magic Link)
- **IA** : Google Gemini (génération de leçons + TTS)
- **Hébergement** : Vercel

### Structure Firebase Firestore

```
/users/{userId}
  - email: string
  - role: 'ADMIN' | 'PARENT'
  - createdAt: timestamp
  - familyId: string (auto-generated)

/families/{familyId}
  - parentId: string (userId du parent)
  - createdAt: timestamp
  - subscription: 'free' | 'premium'

/children/{childId}
  - familyId: string
  - name: string
  - avatarColor: string
  - avatarCustomization: object (yeux, cheveux, accessoires)
  - grade: 'CP' | 'CE1' | 'CE2' | 'CM1' | 'CM2'
  - birthYear: number
  - level: number (1-100)
  - xp: number
  - totalXp: number
  - streak: number
  - lastActivityDate: timestamp
  - gems: number
  - lives: number (max 5, regenerate over time)
  - badges: string[]
  - unlockedRewards: string[]
  - settings: { soundEnabled, voiceSpeed, etc. }

/progress/{childId}/lessons/{lessonId}
  - completed: boolean
  - stars: number (0-3)
  - bestScore: number
  - attempts: number
  - timeSpent: number (seconds)
  - completedAt: timestamp
  - mistakesByType: object

/lessons/{lessonId}
  - unitId: string
  - order: number
  - title: string
  - titleFr: string
  - description: string
  - descriptionFr: string
  - type: 'VOCABULARY' | 'GRAMMAR' | 'STORY' | 'LISTENING' | 'SPEAKING'
  - gradeLevel: 'CP' | 'CE1' | 'CE2' | 'CM1' | 'CM2'
  - cefrLevel: 'pre-A1' | 'A1' | 'A1+'
  - topic: string
  - objectives: string[]
  - prerequisites: string[] (lessonIds)
  - estimatedMinutes: number

/lessonContent/{lessonId}
  - introduction: {
      textFr: string,           // Explication en français
      audioUrlFr: string,       // Audio de l'enseignant français
      vocabulary: [{word, translation, audioUrl, imageUrl}]
    }
  - exercises: [{
      id: string,
      type: 'multiple-choice' | 'fill-blank' | 'match' | 'listen-select' | 'speak' | 'order-words',
      questionEn: string,
      questionFr: string,
      audioUrlEn: string,
      options: string[],
      correctAnswer: string | string[],
      explanationFr: string,
      hints: string[],
      xpReward: number
    }]
  - summary: {
      textFr: string,
      keyPoints: string[],
      practiceWords: string[]
    }
  - generatedAt: timestamp
  - generatedBy: 'template' | 'ai' | 'hybrid'

/units/{unitId}
  - order: number
  - title: string
  - titleFr: string
  - description: string
  - gradeLevel: string[]
  - theme: string (animals, family, colors, etc.)
  - totalLessons: number
  - badgeReward: string

/rewards/{rewardId}
  - type: 'badge' | 'avatar-item' | 'theme' | 'pet'
  - name: string
  - description: string
  - imageUrl: string
  - unlockCondition: object
  - gemsCost: number (if purchasable)

/dailyChallenges/{date}
  - challenges: [{
      id: string,
      type: 'complete-lesson' | 'perfect-score' | 'streak' | 'time-bonus',
      description: string,
      xpReward: number,
      gemsReward: number
    }]

/leaderboards/weekly/{familyId}
  - rankings: [{childId, name, xp, avatar}]
  - weekStart: timestamp
```

---

## 2. Système d'Authentification

### Flux d'inscription
1. **Page d'accueil** → Choix "Créer un compte" ou "Se connecter"
2. **Authentification Parent** :
   - Google OAuth (recommandé)
   - Email + Magic Link
3. **Création famille** → familyId auto-généré
4. **Onboarding Parent** :
   - Ajouter enfant(s) : prénom, classe (CP-CM2), avatar
   - Chaque enfant = un profil avec son propre suivi

### Flux de connexion quotidien
1. Parent se connecte (ou session persistante)
2. Écran de sélection de profil (enfants de la famille)
3. Enfant sélectionne son profil → Dashboard personnel

### Sécurité
- Les enfants n'ont pas de mot de passe
- Seul le parent peut ajouter/modifier/supprimer des profils enfants
- Code PIN optionnel pour accéder au Parent Portal

---

## 3. Onboarding Première Expérience

### Flux pour un nouvel utilisateur (pas de fausses données)

**Étape 1 - Bienvenue**
- Animation de bienvenue avec mascotte
- "Bienvenue dans LingoKids ! Prêt à apprendre l'anglais en s'amusant ?"

**Étape 2 - Test de niveau (optionnel)**
- 5 questions rapides pour évaluer le niveau actuel
- Adapte le point de départ dans le parcours

**Étape 3 - Personnalisation Avatar**
- Choix de couleur de base
- Déblocage progressif d'accessoires (récompenses)

**Étape 4 - Première Leçon Guidée**
- "Leçon Découverte" interactive avec tutoriel intégré
- Introduction aux mécaniques : XP, étoiles, streaks
- Présentation du format : intro FR → exercices EN → résumé

**Étape 5 - Dashboard Initial**
- Affiche uniquement le contenu débloqué
- Pas de statistiques "vides" mais des objectifs à atteindre
- Premier défi quotidien

---

## 4. Structure Pédagogique

### Alignement Programme Éducation Nationale + CECRL

| Classe | Âge | Niveau CECRL | Objectifs |
|--------|-----|--------------|-----------|
| CP | 6 ans | Éveil | Sensibilisation, vocabulaire de base (50 mots), comptines |
| CE1 | 7 ans | Pré-A1 | 150 mots, phrases simples, salutations |
| CE2 | 8 ans | Pré-A1/A1 | 300 mots, questions/réponses, présent simple |
| CM1 | 9 ans | A1 | 500 mots, descriptions, temps passé |
| CM2 | 10 ans | A1/A1+ | 700+ mots, conversations, préparation 6ème |

### Thèmes par Unité (exemple pour CE2)
1. **Hello & Me** - Salutations, se présenter
2. **My Family** - Famille, possessifs
3. **Colors & Numbers** - Couleurs 1-20
4. **Animals** - Animaux domestiques/ferme
5. **My Body** - Corps humain
6. **Food & Drinks** - Nourriture, "I like"
7. **My House** - Pièces, meubles
8. **Clothes** - Vêtements, météo
9. **Daily Routine** - Actions quotidiennes
10. **At School** - École, matières
11. **Sports & Hobbies** - Loisirs
12. **Stories** - Contes simples

### Format de Leçon (15-20 min attention enfant)

```
1. INTRODUCTION (2-3 min) - EN FRANÇAIS
   ├── Voix enseignant français explique le thème
   ├── Présentation du vocabulaire clé (avec images)
   ├── Prononciation modèle (audio natif anglais)
   └── "Aujourd'hui tu vas apprendre à dire..."

2. DÉCOUVERTE (3-4 min) - MIXTE FR/EN
   ├── Écoute et répète (TTS + reconnaissance optionnelle)
   ├── Association image-mot
   └── Mini-jeu de mémorisation

3. EXERCICES (8-10 min) - EN ANGLAIS
   ├── 5-8 exercices variés pré-générés
   ├── Difficulté progressive
   ├── Feedback immédiat vocal (EN) + explication (FR)
   └── Pas de temps de chargement entre questions

4. RÉSUMÉ (2 min) - EN FRANÇAIS
   ├── Récapitulatif des mots appris
   ├── Encouragements personnalisés
   └── Teaser prochaine leçon
```

---

## 5. Système de Gamification (Style Duolingo)

### Frameworks Pédagogiques Intégrés
- **Spaced Repetition** : Révisions intelligentes des mots appris
- **Scaffolding** : Progression par paliers avec support décroissant
- **Immediate Feedback** : Correction instantanée avec explication
- **Mastery Learning** : 80% minimum pour débloquer la suite

### Mécaniques de Jeu

#### 5.1 Progression
- **XP (Experience Points)** : Gagnés à chaque exercice réussi
- **Niveaux (1-100)** : Seuils XP croissants
- **Étoiles (1-3)** : Performance par leçon
  - 1★ : Complétion
  - 2★ : > 80% correct
  - 3★ : 100% correct ou temps bonus

#### 5.2 Engagement Quotidien
- **Streak** : Jours consécutifs d'activité
  - Bouclier gratuit 1x/semaine pour protéger le streak
  - Récompenses à 7, 30, 100 jours
- **Vies (Hearts)** : 5 max, perdues sur erreur
  - Régénération : 1 vie / 4 heures
  - Achat avec gems en cas d'urgence
- **Défis Quotidiens** : 3 objectifs rotatifs
  - "Complete 1 lesson" → 20 XP
  - "Get a perfect score" → 30 XP + 5 gems
  - "Practice for 10 minutes" → 15 XP

#### 5.3 Récompenses
- **Gems** : Monnaie virtuelle
  - Gagnés via leçons, défis, streaks
  - Dépensés dans la boutique
- **Badges** : Accomplissements permanents
  - "First Lesson", "7-Day Streak", "Animal Expert", "Perfect Week"
- **Boutique** :
  - Items d'avatar (chapeaux, lunettes, costumes)
  - Thèmes de couleur pour l'app
  - Mascottes virtuelles

#### 5.4 Social (Famille)
- **Leaderboard Familial** : Classement hebdomadaire entre frères/sœurs
- **Encouragements Parent** : Notifications de progrès
- **Défis Famille** : Objectifs communs

---

## 6. Génération de Contenu IA

### Stratégie Hybride

#### 6.1 Contenu Semi-Statique (Templates)
- Structure des unités et leçons : manuelle
- Vocabulaire de base par thème : pré-défini
- Exercices types : templates JSON

#### 6.2 Génération à la Création du Compte
- Dès qu'un enfant est ajouté :
  - Générer les 2-3 premières leçons complètes (intro + exercices)
  - Générer le test de niveau si demandé
  - Stocker dans Firestore `/lessonContent/{lessonId}`

#### 6.3 Background Generation
- **Trigger** : Enfant commence une leçon
- **Action** : Générer la leçon N+1 et N+2 en arrière-plan
- **Stockage** : Cache Firestore avec TTL

#### 6.4 Prompts Gemini Optimisés

```typescript
// Génération Introduction FR
const introPrompt = `Tu es un professeur d'anglais bienveillant pour enfants français.
Crée une introduction en français pour une leçon sur "${topic}".
Niveau: ${grade} (${cefrLevel})
Durée cible: 2 minutes de lecture/écoute

Format JSON:
{
  "welcomeText": "Texte d'accueil chaleureux",
  "objective": "Ce que l'enfant va apprendre",
  "vocabulary": [
    {"word": "mot anglais", "translation": "traduction", "example": "phrase simple"}
  ],
  "funFact": "Anecdote culturelle amusante (optionnel)"
}`

// Génération Exercices EN
const exercisePrompt = `Create ${count} English exercises for French children.
Grade: ${grade}, CEFR: ${cefrLevel}
Topic: ${topic}
Vocabulary to practice: ${words.join(', ')}

Requirements:
- Questions in simple English
- 4 options for multiple choice
- Include French explanation for wrong answers
- Progressive difficulty
- Age-appropriate, fun context

Return JSON array of exercises...`
```

#### 6.5 Audio TTS
- **Gemini TTS** pour les questions anglaises
- **Cache audio** dans Firebase Storage
- Pré-génération avec les exercices

---

## 7. Interface Utilisateur

### 7.1 Écrans Principaux

```
├── AuthScreen (Login/Signup)
├── OnboardingFlow
│   ├── Welcome
│   ├── AddChild
│   ├── LevelTest (optionnel)
│   ├── AvatarCustomization
│   └── FirstLesson
├── ProfileSelector
├── ChildDashboard
│   ├── DailyProgress
│   ├── LearningPath (Unités/Leçons)
│   ├── DailyChallenges
│   └── StreakWidget
├── LessonFlow
│   ├── LessonIntro (FR)
│   ├── ExerciseScreen (EN)
│   ├── FeedbackModal
│   └── LessonComplete
├── AchievementsScreen
├── ShopScreen
├── ProfileScreen (Avatar customization)
├── ParentPortal
│   ├── ChildrenOverview
│   ├── ProgressReports
│   ├── Settings
│   └── ManageChildren
└── Settings
```

### 7.2 Design System
- **Couleurs** : Palette vive et joyeuse (bleu primaire, accents orange/vert)
- **Typographie** : Varela Round (titres), Inter (corps)
- **Animations** : Célébrations, transitions fluides, confettis
- **Illustrations** : Personnages attachants, animaux mignons
- **Sons** : Feedback sonore positif (optionnel)

---

## 8. API Routes (Vercel Serverless)

```
/api/auth/
  POST /callback    → Gestion callback OAuth
  POST /magic-link  → Envoi magic link

/api/users/
  GET  /me          → Profil utilisateur connecté
  POST /children    → Ajouter un enfant
  PUT  /children/:id → Modifier un enfant
  DEL  /children/:id → Supprimer un enfant

/api/lessons/
  GET  /            → Liste leçons pour un niveau
  GET  /:id         → Détail leçon + contenu
  GET  /:id/content → Contenu généré (exercises)
  POST /:id/complete → Marquer comme terminée

/api/progress/
  GET  /child/:id   → Progression d'un enfant
  GET  /stats/:id   → Statistiques détaillées

/api/generate/
  POST /lesson      → Déclencher génération IA
  POST /audio       → Générer TTS

/api/rewards/
  GET  /available   → Récompenses débloquables
  POST /claim       → Réclamer une récompense
  POST /purchase    → Acheter avec gems
```

---

## 9. Phases d'Implémentation

### Phase 1 : Infrastructure (2-3 jours)
- [ ] Setup Firebase (Firestore + Auth)
- [ ] Configuration Firebase Auth (Google + Email Link)
- [ ] Structure de base Firestore
- [ ] API Routes de base Vercel
- [ ] Service d'authentification frontend

### Phase 2 : Authentification & Onboarding (2-3 jours)
- [ ] Écran de connexion (Google + Magic Link)
- [ ] Création de compte parent
- [ ] Ajout d'enfants avec sélection classe
- [ ] Sélecteur de profil
- [ ] Onboarding première expérience

### Phase 3 : Structure Pédagogique (3-4 jours)
- [ ] Modèle de données leçons/unités
- [ ] Seed des unités et leçons pour CP-CM2
- [ ] Templates de contenu par thème
- [ ] Service de génération Gemini amélioré
- [ ] Système de pré-génération

### Phase 4 : Expérience de Leçon (3-4 jours)
- [ ] Nouveau flux de leçon (Intro FR → Exercices → Résumé)
- [ ] Types d'exercices variés
- [ ] Audio TTS intégré (voix FR + EN)
- [ ] Système de feedback amélioré
- [ ] Progression sans loading entre questions

### Phase 5 : Gamification (3-4 jours)
- [ ] Système XP/Niveaux
- [ ] Streaks avec protection
- [ ] Système de vies
- [ ] Défis quotidiens
- [ ] Badges et achievements
- [ ] Boutique de récompenses

### Phase 6 : Dashboard & Progression (2-3 jours)
- [ ] Nouveau dashboard enfant
- [ ] Learning path visuel (style Duolingo)
- [ ] Widgets de progression
- [ ] Animations et célébrations

### Phase 7 : Parent Portal (2 jours)
- [ ] Dashboard parent multi-enfants
- [ ] Statistiques de progression
- [ ] Gestion des profils enfants
- [ ] Paramètres famille

### Phase 8 : Polish & Tests (2-3 jours)
- [ ] Animations et micro-interactions
- [ ] Tests sur différents appareils
- [ ] Optimisation performances
- [ ] Bug fixes

---

## 10. Dépendances à Ajouter

```json
{
  "dependencies": {
    "firebase": "^10.x",
    "firebase-admin": "^12.x",
    "@tanstack/react-query": "^5.x",
    "zustand": "^4.x",
    "framer-motion": "^11.x",
    "canvas-confetti": "^1.x",
    "date-fns": "^3.x"
  }
}
```

---

## 11. Variables d'Environnement Requises

```env
# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Firebase Admin (pour API routes)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Gemini
VITE_API_KEY= (existant)
GEMINI_API_KEY= (pour backend)
```

---

## 12. Risques et Mitigations

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Temps de génération IA trop long | UX dégradée | Pré-génération aggressive + cache |
| Coûts API Gemini | Budget | Rate limiting + contenu semi-statique |
| Quotas Firebase gratuit | Service down | Monitoring + alertes |
| Complexité gamification | Retard | MVP gamification d'abord |

---

## Prochaines Actions Immédiates

1. **Créer projet Firebase** et configurer Auth
2. **Implémenter l'authentification** (Google + Magic Link)
3. **Créer la structure Firestore** de base
4. **Migrer le code existant** vers la nouvelle architecture

---

*Ce plan sera implémenté de manière itérative. Chaque phase sera validée avant de passer à la suivante.*
