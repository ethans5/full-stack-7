# Documentation du Projet : Boardgame Shop

## Architecture Globale

Ce projet est une application full-stack ("full-stack-7") séparée en plusieurs répertoires principaux, typique d'une architecture client-serveur :

- **`/client`** : Application front-end développée en **React** (v19).
- **`/server`** : API back-end développée en **Node.js** avec **Express** (v5).
- **`/database`** : Scripts et fichiers de configuration pour la base de données MySQL.
- **`/shared`** : Code ou utilitaires partagés entre le client et le serveur.
- **`/tests-e2e`** : Tests de bout en bout (end-to-end) pour tester le flux complet de l'application.

---

## 1. Le Back-End (`/server`)

L'API est responsable de la logique métier, de l'accès aux données, de l'authentification et des intégrations tierces.

### Technologies Principales
- **Express.js** : Framework web pour l'API.
- **MySQL2** : Pilote de base de données relationnelle.
- **Bcrypt / JSONWebToken (JWT)** : Sécurité des mots de passe et authentification par jeton.
- **Stripe** : Intégration des paiements.
- **Axios & XML2JS** : Utilisés pour interroger l'API BoardGameGeek (BGG), récupérer des données XML et les parser.
- **Multer** : Gestion des uploads de fichiers (ex: images de profil ou de produits).
- **Jest & Supertest** : Frameworks pour les tests unitaires et d'intégration de l'API.

### Structure du répertoire
- **`/src/server.js`** : Point d'entrée de l'application serveur, instanciation d'Express et connexion.
- **`/src/config`** : Configuration générale (base de données, variables d'environnement via dotenv).
- **`/src/routes`** : Définition des endpoints (URL de l'API).
- **`/src/controllers`** : Fonctions déclenchées par les routes. Elles orchestrent les requêtes et formatent les réponses.
- **`/src/models`** : Abstractions pour interagir avec la base de données.
- **`/src/services`** : Logique métier complexe découpée pour être réutilisable (ex: appels à Stripe, appels à l'API BGG).
- **`/src/middlewares`** : Fonctions intermédiaires (ex: vérification de token JWT, parsing des uploads).
- **`/tests`** : Fichiers de test (ex: `bggService.test.js`, `orderService.test.js`).
- **`/uploads`** : Dossier de stockage local temporaire ou permanent pour les fichiers uploadés.

---

## 2. Le Front-End (`/client`)

Le client est une Single Page Application (SPA) en React chargée d'afficher l'interface utilisateur.

### Technologies Principales
- **React (v19)** : Bibliothèque d'interface utilisateur.
- **React Router Dom (v7)** : Gestion de la navigation et des URLs du côté client.
- **React Scripts (CRA)** : Scripts de build et serveur de développement.

### Structure du répertoire
- **`/src/App.js` & `index.js`** : Points d'entrée de l'application React.
- **`/src/assets`** : Ressources statiques (images, icônes SVG, logos, polices).
- **`/src/components`** : Composants d'UI réutilisables (boutons, formulaires, cartes de jeux).
- **`/src/context`** : Gestion de l'état global avec React Context (ex: état du panier, session de l'utilisateur).
- **`/src/hooks`** : Hooks React personnalisés pour extraire de la logique complexe.
- **`/src/pages`** : Composants représentant des vues entières (ex: Page d'accueil, `GameList.js`, Panier).
- **`/src/services`** : Fonctions pour effectuer des requêtes HTTP (fetch/axios) vers le back-end (`/server`).
- **`/src/App.css` & `index.css`** : Fichiers de styles CSS globaux à la racine.
- **`/src/styles`** : Dossier centralisant tous les fichiers de styles CSS des composants et pages (`Home.css`, `Navbar.css`, `Cart.css`, etc.).

---

## 3. La Base de Données (`/database`)

- **`init.sql`** : Script SQL contenant la structure de la base de données (création des tables, contraintes, index).
- **`setup_db.js`** : Script utilitaire Node.js permettant d'exécuter `init.sql` et d'initialiser rapidement la base de données, potentiellement avec des données de test (seed).

---

## 4. Tests End-to-End (`/tests-e2e`)
Contient les tests qui simulent le parcours d'un véritable utilisateur dans son navigateur (peut utiliser Cypress, Playwright ou un outil similaire) pour s'assurer que le client et le serveur communiquent correctement ensemble.

---

## Flux Typique d'une Requête (Ex: Liste de jeux)
1. L'utilisateur visite `http://localhost:3000/games`. Le **Client (React)** charge `GameList.js`.
2. Le composant `GameList` utilise un fichier dans `/client/src/services/` pour envoyer une requête HTTP `GET /api/games` vers le Serveur.
3. Le **Serveur (Express)** reçoit la requête via un fichier dans `/server/src/routes/`.
4. La route appelle la fonction appropriée dans `/server/src/controllers/`.
5. Le contrôleur fait appel à un ou plusieurs `/server/src/models/` pour interroger la base de données MySQL via `mysql2`.
6. Les données sont retournées au contrôleur, puis envoyées en JSON au Client.
7. Le Client met à jour son état React et affiche la liste des jeux à l'écran.
