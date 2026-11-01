# EDWIN TRANSPORTS (VTC ETS2) - Résumé de Projet

## 🎯 Objectif
Conception et développement d'un site web vitrine et communautaire haut de gamme pour l'entreprise virtuelle de transport (VTC) Euro Truck Simulator 2 **Edwin Transports** (Edouin Transport). Respect strict de la charte graphique du logo officiel (Noir profond, Rouge carmin néon, Chrome/Argent métallique, rose des vents).

## ⚡ Réalisations
- [assets/logo.png](file:///home/moom/Documents/antigravity/resilient-nobel/assets/logo.png) : Logo officiel importé et optimisé.
- [index.html](file:///home/moom/Documents/antigravity/resilient-nobel/index.html) : Portail web complet (Hero cinématique, 4 pôles officiels, showcase flotte 7 camions, calendrier convois TruckersMP dynamique, classement TrucksBook et formulaire de recrutement).
- [css/styles.css](file:///home/moom/Documents/antigravity/resilient-nobel/css/styles.css) : Design système sur-mesure (Glow rouge, chrome métallique, animations boussole/rose des vents, glassmorphism).
- [js/app.js](file:///home/moom/Documents/antigravity/resilient-nobel/js/app.js) : Interactivité et synchronisation dynamique toutes les 1 heures (chargement des chauffeurs TrucksBook, compteurs km/missions, retrait automatique des convois passés, modale de recrutement, synthe audio klaxon).
- [scripts/sync_vtc_data.py](file:///home/moom/Documents/antigravity/resilient-nobel/scripts/sync_vtc_data.py) : Script autonome de synchronisation TrucksBook (compagnie #231468) :
  - **Extraction directe des camions réels de chaque chauffeur** depuis `user-career-stats` (ex: Scania R, Scania S, Volvo FH4), sans attribution artificielle.
  - Récupération des kilomètres, livraisons et frets fréquents réels de chaque membre.
  - Purge et retrait automatique des convois expirés.
- [data/company_data.json](file:///home/moom/Documents/antigravity/resilient-nobel/data/company_data.json) : Données télémétriques 100% réelles issues de TrucksBook avec double jeu de métriques (Tout le temps et Mensuel).

## 📍 État actuel
- **Classement des Chauffeurs :** 
  - Affichage par défaut sur **🏆 Tout le temps** (Sora658: 48 311 km, B R U X Y: 47 329 km, Miam50: 16 111 km, Zenotoa: 7 449 km, n3rox.off: 5 637 km, romuald.lelerre: 5 221 km).
  - Bouton interactif pour basculer en **📅 Mensuel** selon besoin.
- **Dépôt GitHub public :** [https://github.com/moon-wasm/edwin-transports](https://github.com/moon-wasm/edwin-transports)
- **Déploiement Vercel prêt :** 
  - Fichier `vercel.json` configuré à la racine.
  - Workflow GitHub Actions (`.github/workflows/hourly-sync.yml`) pour exécuter la synchronisation TrucksBook toutes les heures et actualiser le site Vercel automatiquement.
- **Serveur local actif :** Accessible sur `http://127.0.0.1:8080/`.

## ⚠️ Décisions & Contraintes
- Intégration fidèle des descriptions exactes de l'entreprise fournies par le responsable.
- Lien direct vérifié vers l'entreprise officielle TrucksBook (ID 231468) et Discord officiel.

## 👉 Prochaines étapes
- Surveillance du cron horaire et ajout de nouveaux convois au calendrier selon planning de l'équipe.
