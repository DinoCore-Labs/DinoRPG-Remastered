# Étape 23 — Noms aléatoires et persistants des clés

Source : captures Wayback DinoCenter fournies par le projet (Arbres Magiques, Calmars Enchantés, Dragons Morts, Kabukis en Plastique, Roméo Étincellants, Gobelins Rouges, Anges Maquillés, Roncivores en Carton).

## Installation

Appliquer d'abord les étapes 21 et 22, puis, depuis la racine du monorepo :

```bash
node dungeon_step23/apply-step23.mjs
pnpm --filter @dinorpg/client test -- mtDungeonKeyNames
pnpm --filter @dinorpg/client exec vue-tsc --noEmit
```

Les noms sont des combinaisons pseudo-aléatoires déterministes du préfixe et du suffixe des **exemples retrouvés**. La liste exacte originale MT complète et son système de tirage côté serveur restent inconnus. Une même clé porte toujours le même nom pour un chef et un donjon, y compris après rechargement et changement d'étage. Les IDs numériques originaux restent les seuls éléments d'autorisation des portes.

La génération est fondée sur l'ID du Dinoz meneur, l'identifiant de donjon et l'ID de clé ; elle est **stable, pas aléatoire à chaque nouvelle exploration** d'un même donjon. Ne prétend pas reproduire la graine historique MT.

Aucun changement GitHub. Commit suggéré : `feat(dungeon): display seeded MT-style key names in message boxes`
