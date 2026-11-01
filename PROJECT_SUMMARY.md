# EDWIN TRANSPORTS (VTC ETS2) - Résumé de Projet

## 🎯 Objectif
Conception et développement d'un site web vitrine et communautaire haut de gamme pour l'entreprise virtuelle de transport (VTC) Euro Truck Simulator 2 **Edwin Transports** (Edouin Transport). Respect strict de la charte graphique du logo officiel (Noir profond, Rouge carmin néon, Chrome/Argent métallique, rose des vents).

## ⚡ Réalisations
- [assets/logo.png](file:///home/moom/Documents/antigravity/resilient-nobel/assets/logo.png) : Logo officiel importé et optimisé.
- [assets/logos/scania.svg](file:///home/moom/Documents/antigravity/resilient-nobel/assets/logos/scania.svg) & [assets/logos/volvo.svg](file:///home/moom/Documents/antigravity/resilient-nobel/assets/logos/volvo.svg) : Logos vectoriels officiels des constructeurs Scania et Volvo.
- [index.html](file:///home/moom/Documents/antigravity/resilient-nobel/index.html) : Remplacement des icônes génériques par les logos officiels Scania et Volvo sur chaque carte de tracteur, et suppression de la grille des spécifications techniques (châssis/puissance/boîte/livrée). Section convois retirée.
- [css/styles.css](file:///home/moom/Documents/antigravity/resilient-nobel/css/styles.css) : Design système sur-mesure (Glow rouge, chrome métallique, animations boussole/rose des vents, glassmorphism).
- [js/app.js](file:///home/moom/Documents/antigravity/resilient-nobel/js/app.js) : Rendu dynamique de la flotte avec logos officiels et sans bloc technique, synchronisation horaire TrucksBook.
- [scripts/sync_vtc_data.py](file:///home/moom/Documents/antigravity/resilient-nobel/scripts/sync_vtc_data.py) : Script autonome de synchronisation TrucksBook (compagnie #231468).
- [data/company_data.json](file:///home/moom/Documents/antigravity/resilient-nobel/data/company_data.json) : Données télémétriques 100% réelles issues de TrucksBook (flotte réelle, totaux mensuels et chauffeurs).

## 📍 État actuel
- **Cartes Flotte :** Affichage des vrais logos officiels (Scania / Volvo) à la place des icônes génériques, suppression de la grille technique (châssis, puissance, boîte).
- **Classement Chauffeurs :** Strictement mensuel.
- **Dépôt GitHub public synchronisé :** [https://github.com/moon-wasm/edwin-transports](https://github.com/moon-wasm/edwin-transports)
- **Serveur local actif :** Accessible sur `http://127.0.0.1:8080/`.

## ⚠️ Décisions & Contraintes
- Conformité stricte aux consignes utilisateur : logos officiels de marques pour les camions, retrait du bloc technique, suppression de la section convois, classement mensuel uniquement.

## 👉 Prochaines étapes
- Lier le dépôt GitHub à Vercel en 1 clic pour activer l'hébergement en ligne.
