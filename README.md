# PayReg Burundi 🇧🇮

Page web professionnelle et responsive d'**enregistrement de paiement**, avec design sombre, météo en direct du Burundi, contact WhatsApp intégré, et sauvegarde en base de données MySQL.

## ✨ Fonctionnalités

- **Design sombre, moderne et responsive** (mobile, tablette, desktop)
- **Formulaire d'enregistrement de paiement** avec validation en temps réel (nom, téléphone, e-mail, montant, devise, mode de paiement, référence)
- **Reçu récapitulatif en direct** qui se met à jour pendant la saisie
- **Météo du Burundi** (Bujumbura) via l'API gratuite [Open-Meteo](https://open-meteo.com/) — sans clé API requise
- **Intégration WhatsApp** : bouton flottant + bouton contextuel qui pré-remplit un message avec les infos du paiement, via l'API `wa.me`
- **Backend PHP + MySQL** avec requêtes préparées (PDO) pour un enregistrement sécurisé

## 📁 Structure du projet

```
paiement-burundi/
├── index.html              # Page principale
├── css/
│   └── style.css           # Styles (thème sombre)
├── js/
│   └── app.js               # Logique front (météo, reçu, WhatsApp, soumission)
├── php/
│   ├── config.php            # Connexion PDO à la base de données
│   └── api/
│       ├── save_payment.php  # POST — enregistre un paiement
│       └── get_payments.php  # GET  — liste les paiements
├── database/
│   └── schema.sql            # Script de création de la base et de la table
├── .gitignore
└── README.md
```

## 🚀 Installation locale

### 1. Prérequis
- PHP 8.0+
- MySQL ou MariaDB
- Un serveur web local (PHP intégré, XAMPP, WAMP, Laragon…)

### 2. Cloner le projet
```bash
git clone https://github.com/<votre-utilisateur>/payreg-burundi.git
cd payreg-burundi
```

### 3. Créer la base de données
```bash
mysql -u root -p < database/schema.sql
```

### 4. Configurer la connexion
Définissez les variables d'environnement (ou modifiez directement `php/config.php`) :
```bash
export DB_HOST=127.0.0.1
export DB_NAME=payreg_burundi
export DB_USER=root
export DB_PASS=votre_mot_de_passe
```

### 5. Configurer le numéro WhatsApp
Dans `js/app.js`, modifiez :
```js
WHATSAPP_NUMBER: "25779000000", // votre numéro au format international, sans "+"
```

### 6. Lancer le serveur de développement
```bash
php -S localhost:8000
```
Puis ouvrez [http://localhost:8000](http://localhost:8000).

## ☁️ Déploiement

Le projet est compatible avec tout hébergement supportant PHP + MySQL (o2switch, Hostinger, un VPS, etc.). Pensez à :
- ne jamais committer vos vrais identifiants de base de données (voir `.gitignore`) ;
- servir le site en HTTPS pour que l'API WhatsApp et la géolocalisation météo fonctionnent de manière fiable ;
- restreindre l'accès à `php/api/get_payments.php` (authentification) avant une mise en production, car il expose la liste des paiements.

## 🔗 API interne

| Méthode | Endpoint                     | Description                        |
|---------|-------------------------------|-------------------------------------|
| POST    | `/php/api/save_payment.php`  | Enregistre un nouveau paiement (JSON) |
| GET     | `/php/api/get_payments.php`  | Liste les paiements (`?limit=&offset=`) |

## 🛠️ Technologies

HTML5 · CSS3 (responsive, variables CSS) · JavaScript (Fetch API) · PHP (PDO) · MySQL · [Open-Meteo API](https://open-meteo.com/) · [WhatsApp `wa.me` API](https://faq.whatsapp.com/425247423114725)

## 📄 Licence

Libre d'utilisation et de modification pour vos projets personnels ou professionnels.
