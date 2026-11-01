# EDWIN TRANSPORTS (VTC ETS2) - Résumé de Projet

## 🎯 Objectif
Conception et développement d'un site web vitrine et communautaire haut de gamme pour l'entreprise virtuelle de transport (VTC) Euro Truck Simulator 2 **Edwin Transports** (Edouin Transport). Respect strict de la charte graphique du logo officiel (Noir profond, Rouge carmin néon, Chrome/Argent métallique, rose des vents).

## ⚡ Réalisations
- [assets/logo.png](file:///home/moom/Documents/antigravity/resilient-nobel/assets/logo.png) : Logo officiel importé et optimisé.
- [index.html](file:///home/moom/Documents/antigravity/resilient-nobel/index.html) : Portail web complet (Hero cinématique, 4 pôles officiels, showcase flotte réelle, classement TrucksBook mensuel et formulaire de recrutement). Section convois retirée conformément à la demande.
- [css/styles.css](file:///home/moom/Documents/antigravity/resilient-nobel/css/styles.css) : Design système sur-mesure (Glow rouge, chrome métallique, animations boussole/rose des vents, glassmorphism).
- [js/app.js](file:///home/moom/Documents/antigravity/resilient-nobel/js/app.js) : Interactivité et synchronisation dynamique toutes les 1 heures (chargement des chauffeurs TrucksBook, compteurs km/missions, modale de recrutement, synthe audio klaxon).
- [scripts/sync_vtc_data.py](file:///home/moom/Documents/antigravity/resilient-nobel/scripts/sync_vtc_data.py) : Script autonome de synchronisation TrucksBook (compagnie #231468) :
  - **Extraction directe des camions réels de chaque chauffeur** depuis `user-career-stats` (Scania R, Scania S, Volvo FH4), sans attribution artificielle.
  - **Agrégation automatique de la Flotte Officielle** basée exclusivement sur les camions réels conduits par les membres.
  - Récupération des kilomètres mensuels (`km_month`) et carrières (`km_all`).
- [data/company_data.json](file:///home/moom/Documents/antigravity/resilient-nobel/data/company_data.json) : Données télémétriques 100% réelles issues de TrucksBook (flotte réelle, totaux mensuels et chauffeurs).

## 📍 État actuel
- **Section Convois :** Retirée de `index.html`, de la barre de navigation, du footer et des scripts.
- **Flotte Réelle :** Remplacement des camions fictifs par la flotte exacte des chauffeurs (Scania R : n3rox.off & Miam50 ; Scania S : romuald.lelerre, B R U X Y, Zenotoa ; Volvo FH4 : Sora658).
- **Classement des Chauffeurs :** Strictly **Mensuel** (tri par `km_month` et `deliveries_month` du mois en cours : n3rox.off #1 avec 1 674 km, Sora658 #2 avec 1 056 km).
- **Dépôt GitHub public synchronisé :** [https://github.com/moon-wasm/edwin-transports](https://github.com/moon-wasm/edwin-transports)
- **Déploiement Vercel :** Prêt via import GitHub, avec workflow GitHub Actions pour synchronisation automatique toutes les 1h.
- **Serveur local actif :** Accessible sur `http://127.0.0.1:8080/`.

## ⚠️ Décisions & Contraintes
- Conformité stricte aux consignes utilisateur : suppression complète de la section convois TruckersMP, aucun camion artificiel dans la flotte (uniquement les tracteurs télémétrie TrucksBook des chauffeurs), et classement exclusivement mensuel.

## 👉 Prochaines étapes
- Lier le dépôt GitHub à Vercel en 1 clic pour activer l'hébergement en ligne.
