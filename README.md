# Livo Backend — API REST complète

Plateforme de livraison à la demande pour le Mali. Backend Node.js/Express/MySQL/Sequelize.

---

## 🔧 Corrections & Améliorations Apportées

### ❌ Bugs critiques corrigés

| Problème | Correction |
|---|---|
| `MARCHANT` vs `MERCHANT` — incohérence dans les enums | Harmonisé partout en `MERCHANT` |
| `merchant.js` model inexistant | Créé complet avec tous les champs |
| `orderController` : pas de `paymentStatus` dans Order | Ajouté au modèle + controller |
| `courierController.getAvailableDeliveries` : `courierId: null` avec contrainte NOT NULL | Corrigé — cherche maintenant `courierId IS NULL` correctement |
| Mot de passe retourné dans les réponses API | `defaultScope` exclut automatiquement les champs sensibles |
| Pas de transaction dans createOrder — stock pouvait devenir négatif | Transactions Sequelize ajoutées partout |
| Race condition sur acceptDelivery — double acceptation possible | Lock pessimiste `LOCK.UPDATE` |
| Admin routes inline dans server.js, non exportées | Extrait en fichier propre |
| `merchantRoutes.js` vide | Complété |

### ✅ Fonctionnalités ajoutées

**Sécurité**
- Refresh tokens avec rotation (access 15min, refresh 7j)
- Protection brute force : verrouillage compte après 5 échecs
- Même message d'erreur email/mot de passe (anti-énumération)
- Validation complète inputs avec `express-validator`
- Rate limiting différencié (auth: 10/15min, global: 200/15min)
- CORS strict avec liste blanche
- HTTPS headers via `helmet`
- Hash bcrypt niveau 12

**Nouveaux contrôleurs**
- `notificationController` — CRUD notifications + marquer lu
- `reviewController` — avis clients, mise à jour rating automatique, réponses
- Upload fichiers KYC (livreurs) et images produits/marchands via `multer`

**Nouveau modèle**
- `Subscription` — abonnement Livo Plus

**Améliorations métier**
- Calcul commission automatique à la création de commande
- Application codes promo avec vérification validité/stock
- Décrémentation stock produit à la commande, remise si annulation
- Vérification horaires d'ouverture marchand
- Vérification montant minimum commande
- Transitions de statut commande validées (empêche les transitions impossibles)
- Notifications automatiques à chaque étape clé
- Mise à jour rating moyen marchand/livreur après chaque avis
- Mise à jour totaux livreur (gains, courses) à la livraison
- updateLocation endpoint pour GPS temps réel livreur

---

## 🚀 Installation

```bash
# 1. Cloner et installer
npm install

# 2. Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# 3. Créer la base de données MySQL
mysql -u root -p -e "CREATE DATABASE livo_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 4. Lancer en développement (sync auto des tables)
npm run dev
```

---

## 📡 Endpoints API

### Auth `/api/users`
| Méthode | Route | Accès | Description |
|---|---|---|---|
| POST | `/register` | Public | Créer un compte |
| POST | `/login` | Public | Connexion |
| POST | `/refresh-token` | Public | Rafraîchir access token |
| POST | `/logout` | Auth | Déconnexion |
| GET | `/profile` | Auth | Mon profil |
| PUT | `/profile` | Auth | Modifier profil |
| PUT | `/change-password` | Auth | Changer mot de passe |

### Marchands `/api/merchants`
| Méthode | Route | Accès | Description |
|---|---|---|---|
| GET | `/` | Public | Liste des marchands actifs |
| GET | `/:id` | Public | Détail marchand + produits |
| POST | `/profile` | MERCHANT | Créer profil |
| GET | `/profile/me` | MERCHANT | Mon profil |
| PUT | `/profile/me` | MERCHANT | Modifier profil |
| GET | `/dashboard/me` | MERCHANT | Tableau de bord |

### Produits `/api/products`
| Méthode | Route | Accès | Description |
|---|---|---|---|
| GET | `/` | Public | Tous les produits disponibles |
| POST | `/` | MERCHANT | Créer produit (+ image) |
| GET | `/mine` | MERCHANT | Mes produits |
| PUT | `/:id` | MERCHANT | Modifier produit |
| DELETE | `/:id` | MERCHANT | Supprimer produit |

### Commandes `/api/orders`
| Méthode | Route | Accès | Description |
|---|---|---|---|
| POST | `/` | CLIENT | Passer commande |
| GET | `/my-orders` | CLIENT | Mes commandes |
| PUT | `/:id/cancel` | CLIENT | Annuler commande |
| GET | `/merchant` | MERCHANT | Commandes reçues |
| PUT | `/:id/status` | MERCHANT | Changer statut |
| GET | `/:id` | Auth | Détail commande |

### Livreurs `/api/couriers`
| Méthode | Route | Accès | Description |
|---|---|---|---|
| POST | `/profile` | COURIER | Créer profil (+ docs KYC) |
| GET | `/profile` | COURIER | Mon profil |
| PUT | `/availability` | COURIER | Changer disponibilité |
| PUT | `/location` | COURIER | Mettre à jour GPS |
| GET | `/available-deliveries` | COURIER | Courses disponibles |
| POST | `/deliveries/:id/accept` | COURIER | Accepter course |
| PUT | `/deliveries/:id/pickup` | COURIER | Marquer récupéré |
| PUT | `/deliveries/:id/deliver` | COURIER | Marquer livré |
| GET | `/earnings` | COURIER | Mes gains |
| GET | `/history` | COURIER | Historique |

### Paiements `/api/payments`
| Méthode | Route | Accès | Description |
|---|---|---|---|
| POST | `/initiate` | CLIENT | Initier paiement |
| GET | `/status/:orderId` | Auth | Statut paiement |
| POST | `/refund` | CLIENT | Demander remboursement |

### Notifications `/api/notifications`
| Méthode | Route | Accès | Description |
|---|---|---|---|
| GET | `/` | Auth | Mes notifications |
| PUT | `/read-all` | Auth | Tout marquer lu |
| PUT | `/:id/read` | Auth | Marquer lue |
| DELETE | `/:id` | Auth | Supprimer |

### Avis `/api/reviews`
| Méthode | Route | Accès | Description |
|---|---|---|---|
| GET | `/merchant/:id` | Public | Avis d'un marchand |
| POST | `/` | CLIENT | Publier un avis |
| PUT | `/:id/respond` | MERCHANT/COURIER | Répondre |

### Admin `/api/admin`
| Méthode | Route | Description |
|---|---|---|
| GET | `/dashboard/stats` | Statistiques globales |
| GET | `/users` | Liste utilisateurs |
| PUT | `/users/:id/status` | Suspendre/activer |
| GET | `/merchants` | Liste marchands |
| PUT | `/merchants/:id/verify` | Valider/rejeter marchand |
| PUT | `/merchants/:id/commission` | Modifier commission |
| GET | `/couriers` | Liste livreurs |
| PUT | `/couriers/:id/verify` | Vérifier livreur |
| GET | `/orders` | Toutes les commandes |
| PUT | `/orders/:id/resolve` | Résoudre litige |
| GET | `/reports/revenue` | Rapport financier |

---

## 🏗️ Structure du projet

```
livo-backend/
├── server.js                    # Point d'entrée
├── package.json
├── .env.example
├── uploads/                     # Fichiers uploadés
│   ├── products/
│   ├── merchants/
│   └── kyc/
│       ├── couriers/
│       └── merchants/
└── src/
    ├── config/
    │   └── database.js
    ├── models/
    │   ├── user.js
    │   ├── client.js
    │   ├── merchant.js          # ✅ Ajouté
    │   ├── courier.js
    │   ├── product.js
    │   ├── order.js             # ✅ Corrigé
    │   ├── orderItem.js
    │   ├── delivery.js
    │   ├── payment.js
    │   ├── notification.js
    │   ├── review.js
    │   ├── promotion.js
    │   ├── address.js
    │   └── subscription.js      # ✅ Ajouté
    ├── controllers/
    │   ├── userController.js    # ✅ Corrigé + refresh tokens
    │   ├── merchantController.js # ✅ Complet
    │   ├── courierController.js  # ✅ Bug courierId corrigé
    │   ├── orderController.js    # ✅ Transactions + promo
    │   ├── productController.js
    │   ├── paymentController.js
    │   ├── notificationController.js # ✅ Ajouté
    │   └── reviewController.js   # ✅ Ajouté
    ├── routes/
    │   ├── userRoutes.js
    │   ├── merchantRoutes.js    # ✅ Complété
    │   ├── courierRoutes.js
    │   ├── orderRoutes.js
    │   ├── productRoutes.js
    │   ├── paymentRoutes.js
    │   ├── adminRoutes.js       # ✅ Extrait proprement
    │   ├── notificationRoutes.js # ✅ Ajouté
    │   └── reviewRoutes.js      # ✅ Ajouté
    ├── middlewares/
    │   ├── authMiddleware.js    # ✅ Amélioré
    │   ├── validationMiddleware.js # ✅ Ajouté
    │   └── uploadMiddleware.js  # ✅ Ajouté
    └── utils/
        └── enums.js             # ✅ MERCHANT corrigé
```