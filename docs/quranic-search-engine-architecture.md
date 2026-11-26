# Référentiel coranique intelligent — SAKINA

## Objectif
Ce référentiel transforme une description utilisateur en concepts de recherche. Il ne constitue ni un tafsir, ni une liste de versets thérapeutiques, ni une affirmation que chaque problème moderne est explicitement nommé dans le Coran.

## Fichiers
- `data/quran-concept-lexicon.v1.json` : premiers concepts, alias multilingues, candidats de recherche et garde-fous.
- Le corpus coranique intégral, les traductions, les analyses morphologiques et les tafsirs doivent rester des sources séparées, versionnées et traçables.

## Pipeline cible
1. Normaliser la description sans supprimer son sens.
2. Extraire un ou plusieurs concepts, avec un niveau de confiance.
3. Demander confirmation à l'utilisateur lorsque la détection est ambiguë.
4. Étendre les concepts vers les alias français, arabe standard, darija et anglais.
5. Rechercher dans le texte arabe intégral, puis dans les formes morphologiques vérifiées.
6. Récupérer le contexte du verset (passage et versets voisins).
7. Classer chaque candidat : correspondance lexicale, lien de sens, lien contextuel ou réflexion spirituelle.
8. Écarter les faux positifs après analyse du contexte.
9. Afficher la référence, le texte source, la traduction sourcée et la raison du rapprochement.
10. Signaler explicitement l'absence de mention directe lorsque c'est le cas.

## Règles non négociables
- Le texte arabe coranique ne doit jamais être généré ou corrigé par un modèle.
- Un mot isolé ne suffit pas à valider un verset.
- Une traduction ne prouve pas une occurrence lexicale dans le texte arabe.
- Une racine n'est utilisée que si son analyse morphologique est vérifiée.
- Ne jamais présenter un verset comme traitement, diagnostic ou garantie de guérison.
- Ne jamais fabriquer un tafsir ou une attribution à Ibn Arabi.
- Garder distincts le texte coranique, la traduction, l'analyse linguistique et la réflexion proposée par SAKINA.
- Chaque donnée doit conserver sa source, sa version et sa licence.

## Première couverture fonctionnelle
Le lexique initial couvre : migraine et maux de tête, douleur, maladie, fatigue, sommeil, anxiété, peur, tristesse, épreuve, guérison, patience, invocation, quiétude, miséricorde et espérance.

## Prochaine phase
1. Importer un corpus arabe intégral fiable et vérifier son intégrité (nombre de sourates et de versets, numérotation).
2. Ajouter les lemmes et racines issus d'une source morphologique documentée.
3. Construire un index local de recherche.
4. Annoter manuellement un premier jeu de résultats pour calibrer le classement.
5. Intégrer le moteur à l'API de SAKINA, sans modifier la page d'accueil ni la page /ruqya avant validation.

## Statut
Version 1 — référentiel de départ. Les termes de recherche sont des candidats à auditer sur le corpus ; ils ne sont pas tous certifiés comme occurrences coraniques.
