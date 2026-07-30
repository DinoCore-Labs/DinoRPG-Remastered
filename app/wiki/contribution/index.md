---
title: Contribuer au wiki
description: Découvrez comment contribuer au wiki de DinoRPG Remastered.
---

# Contribuer au wiki

Le wiki de **DinoRPG Remastered** est un projet communautaire.

Tout le monde peut proposer une correction, compléter une page existante ou
ajouter de nouvelles informations sur le jeu.

Les contributions sont vérifiées avant leur publication afin de garantir que
les informations présentes sur le wiki restent fiables, cohérentes et
compréhensibles.

::: tip Aucune connaissance en programmation nécessaire
La majorité des pages du wiki sont écrites en Markdown. Il est donc possible de
contribuer directement depuis l’interface de GitHub sans avoir besoin de
connaître Vue ou TypeScript.
:::

## Comment contribuer ?

Vous pouvez contribuer de différentes manières :

- corriger une faute d’orthographe ;
- améliorer une explication ;
- compléter une information manquante ;
- signaler une information incorrecte ;
- ajouter une image ;
- documenter un objet, une compétence ou un monstre ;
- ajouter un lieu ou un personnage ;
- rédiger un guide pour les joueurs ;
- proposer une nouvelle page ;
- améliorer les composants ou le thème du wiki.

## Modifier une page existante

En bas de chaque page du wiki, un lien permet d’accéder directement au fichier
correspondant sur GitHub :

> **Modifier cette page sur GitHub**

Après avoir cliqué sur ce lien :

1. connectez-vous à votre compte GitHub ;
2. cliquez sur l’icône permettant de modifier le fichier ;
3. effectuez vos modifications ;
4. décrivez brièvement les changements réalisés ;
5. proposez la modification avec une pull request.

La modification ne sera pas publiée immédiatement. Elle devra d’abord être
vérifiée et validée par un membre de l’équipe de DinoRPG Remastered.

## Ajouter une nouvelle page

Les pages du wiki se trouvent dans le dossier :

```text
app/wiki/
```

L’encyclopédie se trouve dans :

```text
app/wiki/encyclopedie/
```

Par exemple, une nouvelle fiche d’objet devra être créée dans :

```text
app/wiki/encyclopedie/objets/
```

Une page nommée :

```text
app/wiki/encyclopedie/objets/popo-ange.md
```

sera accessible depuis l’adresse :

```text
/encyclopedie/objets/popo-ange
```

Pensez également à ajouter un lien vers la nouvelle page dans l’index de la
catégorie concernée ou dans la navigation du wiki.

## Organisation du wiki

Le wiki contient plusieurs types de contenu.

### Encyclopédie

Cette section regroupe les informations de référence sur le jeu :

- les Dinoz ;
- les éléments ;
- les objets ;
- les ingrédients ;
- les équipements ;
- les compétences ;
- les statuts ;
- les monstres ;
- les lieux ;
- les personnages ;
- les missions ;
- les scénarios ;
- les événements ;
- les donjons.

### Guides

Cette section contient des explications destinées aux joueurs :

- bien débuter ;
- comprendre les combats ;
- faire progresser ses Dinoz ;
- constituer un groupe ;
- utiliser le marché ;
- réaliser des missions ;
- gérer son inventaire ;
- découvrir les différents systèmes du jeu.

### Documentation technique

Cette section est destinée aux développeurs et aux contributeurs techniques :

- architecture du projet ;
- frontend Vue ;
- backend Fastify ;
- base de données Prisma ;
- package Core ;
- système de combat ;
- missions et dialogues ;
- scénarios ;
- tâches planifiées ;
- déploiement ;
- conventions du projet.

## Comprendre le Markdown

Les pages du wiki de **DinoRPG Remastered** sont principalement écrites en
Markdown.

Le Markdown est un langage de mise en forme simple permettant de créer des
titres, des paragraphes, des listes, des liens, des images, des tableaux ou des
blocs de code sans avoir à écrire directement du HTML.

Les fichiers Markdown utilisent l’extension `.md`.

Par exemple :

```text
app/wiki/encyclopedie/objets/popo-ange.md
```

::: tip Aperçu automatique
Lorsque le wiki est lancé avec `pnpm wiki:dev`, les modifications apportées à
un fichier Markdown sont généralement visibles immédiatement dans le
navigateur.
:::

### Écrire un paragraphe

Un paragraphe s’écrit simplement sous forme de texte :

```md
Le Popo d’Ange est un objet utilisable par un Dinoz.
```

Pour créer un nouveau paragraphe, ajoutez une ligne vide entre les deux blocs
de texte :

```md
Le Popo d’Ange est un objet utilisable par un Dinoz.

Il peut être obtenu dans certaines conditions.
```

Sans ligne vide, les deux lignes peuvent être affichées dans le même
paragraphe.

### Créer des titres

Les titres utilisent le caractère `#`.

```md
# Titre principal

## Grande section

### Sous-section

#### Section détaillée
```

Exemple :

```md
# Popo d’Ange

## Description

## Effet

### Effet sur les points de vie

## Obtention
```

Chaque page doit normalement contenir un seul titre principal de niveau 1 :

```md
# Titre de la page
```

Les niveaux suivants doivent respecter une progression logique.

Exemple à éviter :

```md
## Obtention

#### Boutique
```

Exemple recommandé :

```md
## Obtention

### Boutique
```

### Mettre du texte en gras

Entourez le texte avec deux astérisques :

```md
**Texte important**
```

Résultat :

**Texte important**

Le gras doit être utilisé pour mettre en valeur une information importante,
sans surcharger la page.

### Mettre du texte en italique

Entourez le texte avec un astérisque :

```md
_Texte en italique_
```

Résultat :

_Texte en italique_

### Utiliser le gras et l’italique

Entourez le texte avec trois astérisques :

```md
**_Texte important en italique_**
```

Résultat :

**_Texte important en italique_**

### Barrer du texte

Entourez le texte avec deux caractères `~` :

```md
~~Ancienne information~~
```

Résultat :

~~Ancienne information~~

Le texte barré ne doit normalement pas être utilisé pour conserver une
information obsolète. Il est préférable de corriger directement la page.

### Créer une liste simple

Utilisez un tiret devant chaque élément :

```md
- premier élément ;
- deuxième élément ;
- troisième élément.
```

Résultat :

- premier élément ;
- deuxième élément ;
- troisième élément.

Il est également possible de créer des sous-listes en ajoutant une indentation :

```md
- Objets
  - objets utilisables ;
  - équipements ;
  - objets de mission.
- Ingrédients
  - végétaux ;
  - poissons ;
  - minerais.
```

Résultat :

- Objets
  - objets utilisables ;
  - équipements ;
  - objets de mission.
- Ingrédients
  - végétaux ;
  - poissons ;
  - minerais.

### Créer une liste numérotée

Utilisez des nombres suivis d’un point :

```md
1. sélectionnez votre Dinoz ;
2. ouvrez son inventaire ;
3. choisissez l’objet ;
4. confirmez son utilisation.
```

Résultat :

1. sélectionnez votre Dinoz ;
2. ouvrez son inventaire ;
3. choisissez l’objet ;
4. confirmez son utilisation.

Les listes numérotées sont recommandées pour présenter des étapes dans un
ordre précis.

### Créer une liste de tâches

Une liste de tâches utilise des cases à cocher :

```md
- [x] Ajouter la page.
- [x] Ajouter l’image.
- [ ] Vérifier les informations.
- [ ] Ajouter la page dans la navigation.
```

Résultat :

- [x] Ajouter la page.
- [x] Ajouter l’image.
- [ ] Vérifier les informations.
- [ ] Ajouter la page dans la navigation.

Cette syntaxe est particulièrement utile dans les descriptions de pull
requests.

### Créer un lien interne

Pour créer un lien vers une autre page du wiki :

```md
[Texte du lien](/chemin/de/la/page)
```

Exemple :

```md
[Consulter la liste des objets](/encyclopedie/objets/)
```

Pour créer un lien vers une fiche précise :

```md
[Popo d’Ange](/encyclopedie/objets/popo-ange)
```

N’ajoutez pas l’extension `.md` ou `.html` à la fin des liens internes.

Exemple à éviter :

```md
[Popo d’Ange](/encyclopedie/objets/popo-ange.md)
```

Exemple recommandé :

```md
[Popo d’Ange](/encyclopedie/objets/popo-ange)
```

### Créer un lien vers une section

VitePress crée automatiquement une ancre pour chaque titre.

Pour ce titre :

```md
## Moyens d’obtention
```

vous pouvez utiliser un lien vers la section :

```md
[Voir les moyens d’obtention](#moyens-dobtention)
```

Pour cibler une section située sur une autre page :

```md
[Voir les moyens d’obtention](/encyclopedie/objets/popo-ange#moyens-dobtention)
```

Les accents, apostrophes et autres caractères spéciaux peuvent être transformés
dans l’adresse générée. Vérifiez toujours le lien dans le navigateur.

### Créer un lien vers un site externe

La syntaxe est identique à celle d’un lien interne, mais l’adresse complète
doit être utilisée :

```md
[Consulter le dépôt GitHub](https://github.com/DinoCore-Labs/DinoRPG-Remastered)
```

Pour des raisons de lisibilité, évitez d’afficher directement une adresse
internet très longue dans le texte.

Exemple à éviter :

```md
https://github.com/DinoCore-Labs/DinoRPG-Remastered
```

Exemple recommandé :

```md
[Consulter le dépôt GitHub](https://github.com/DinoCore-Labs/DinoRPG-Remastered)
```

### Ajouter une image

Une image utilise une syntaxe proche de celle d’un lien :

```md
![Description de l’image](/images/dossier/image.png)
```

Exemple :

```md
![Illustration du Popo d’Ange](/images/items/popo-ange.png)
```

Le texte placé entre les crochets correspond à la description de l’image. Il
est important pour l’accessibilité et doit décrire correctement son contenu.

Exemple à éviter :

```md
![](/images/items/popo-ange.png)
```

Exemple recommandé :

```md
![Illustration du Popo d’Ange](/images/items/popo-ange.png)
```

Les images utilisées par le wiki sont placées dans :

```text
app/wiki/public/images/
```

Le préfixe `public` ne doit pas apparaître dans le chemin Markdown.

Pour ce fichier :

```text
app/wiki/public/images/items/popo-ange.png
```

utilisez :

```md
![Popo d’Ange](/images/items/popo-ange.png)
```

et non :

```md
![Popo d’Ange](/public/images/items/popo-ange.png)
```

### Ajouter une infobulle à une image

Une description supplémentaire peut être ajoutée après le chemin de l’image :

```md
![Popo d’Ange](/images/items/popo-ange.png 'Popo d’Ange')
```

Le texte placé entre guillemets peut apparaître lorsque le pointeur survole
l’image.

### Créer une citation

Utilisez le caractère `>` :

```md
> Cette information provient de la version actuelle de DinoRPG Remastered.
```

Résultat :

> Cette information provient de la version actuelle de DinoRPG Remastered.

Pour une citation sur plusieurs paragraphes :

```md
> Premier paragraphe de la citation.
>
> Deuxième paragraphe de la citation.
```

### Afficher du code dans une phrase

Utilisez un accent grave autour du contenu :

```md
La commande `pnpm wiki:dev` lance le wiki localement.
```

Résultat :

La commande `pnpm wiki:dev` lance le wiki localement.

Cette syntaxe peut également être utilisée pour les éléments suivants :

- les noms de fichiers ;
- les noms de dossiers ;
- les commandes ;
- les propriétés ;
- les identifiants internes ;
- les noms de variables.

Exemple :

```md
La page se trouve dans `app/wiki/encyclopedie/objets/`.
```

### Créer un bloc de code

Utilisez trois accents graves avant et après le contenu :

````md
```text
app/wiki/encyclopedie/objets/popo-ange.md
```
````

Il est recommandé de préciser le langage utilisé après les trois accents
graves.

Exemple avec TypeScript :

````md
```ts
const itemName = 'Popo d’Ange';
```
````

Exemple avec Vue :

````md
```vue
<GameItemCard name="Popo d’Ange" image="/images/items/popo-ange.png" />
```
````

Exemple avec Bash :

````md
```bash
pnpm wiki:dev
```
````

Exemple avec JSON :

````md
```json
{
	"name": "Popo d’Ange",
	"type": "item"
}
```
````

Le nom du langage permet d’activer la coloration syntaxique.

### Créer un tableau

Les tableaux utilisent des barres verticales :

```md
| Propriété                  | Valeur           |
| -------------------------- | ---------------- |
| Type                       | Objet utilisable |
| Cible                      | Un Dinoz         |
| Consommé après utilisation | Oui              |
```

Résultat :

| Propriété                  | Valeur           |
| -------------------------- | ---------------- |
| Type                       | Objet utilisable |
| Cible                      | Un Dinoz         |
| Consommé après utilisation | Oui              |

La deuxième ligne indique que la première ligne contient les en-têtes.

### Aligner le contenu d’un tableau

Utilisez les caractères `:` dans la ligne de séparation :

```md
| Nom         | Quantité | Prix |
| :---------- | :------: | ---: |
| Popo d’Ange |    1     |  500 |
| Potion      |    3     |  150 |
```

Signification :

- `:---` aligne le contenu à gauche ;
- `:---:` centre le contenu ;
- `---:` aligne le contenu à droite.

Évitez les tableaux contenant trop de colonnes, car ils deviennent difficiles à
consulter sur mobile.

### Créer une ligne de séparation

Utilisez trois tirets sur une ligne :

```md
---
```

Cette syntaxe crée une séparation horizontale lorsqu’elle est utilisée dans le
contenu de la page.

Attention : lorsqu’elle est utilisée au tout début d’un fichier, cette syntaxe
peut également délimiter le `frontmatter`.

### Comprendre le frontmatter

Le `frontmatter` est un bloc de métadonnées placé au tout début d’une page.

```yaml
---
title: Popo d’Ange
description: Informations sur le Popo d’Ange dans DinoRPG Remastered.
---
```

Il est délimité par deux lignes contenant trois tirets.

Il doit être placé avant tout autre contenu :

```md
---
title: Popo d’Ange
description: Informations sur le Popo d’Ange dans DinoRPG Remastered.
---

# Popo d’Ange
```

Exemple incorrect :

```md
# Popo d’Ange

---

title: Popo d’Ange
description: Informations sur le Popo d’Ange.

---
```

Les propriétés courantes sont :

```yaml
---
title: Titre de la page
description: Description courte utilisée par le wiki et les moteurs de recherche.
---
```

Certaines pages peuvent également définir des métadonnées spécifiques :

```yaml
---
title: Nom de la mission
description: Informations sur cette mission.
spoiler: true
status: stable
---
```

### Utiliser les encadrés VitePress

VitePress permet d’ajouter des encadrés afin de mettre certaines informations
en valeur.

#### Information

```md
:::
Cette page présente une mécanique du jeu.
:::
```

#### Conseil

```md
:::
Pensez à vérifier la version actuelle du jeu.
:::
```

#### Avertissement

```md
:::
Cette information peut encore évoluer.
:::
```

#### Danger

```md
:::
Cette action peut entraîner une perte définitive.
:::
```

#### Détails repliables

```md
:::
Contenu masqué par défaut.
:::
```

Les blocs repliables sont particulièrement utiles pour les spoilers :

```md
:::

1. Rendez-vous à Dinoville.
2. Parlez au personnage concerné.
3. Terminez le combat.
   :::
```

### Modifier le titre d’un encadré

Le texte placé après le type de bloc devient son titre :

```md
:::
Cette section révèle les étapes complètes du scénario.
:::
```

### Échapper un caractère Markdown

Certains caractères possèdent une signification particulière en Markdown :

```text
*
_
#
`
[
]
```

Pour afficher un caractère sans appliquer sa mise en forme, placez une barre
oblique inversée devant celui-ci :

```md
\*Ce texte ne sera pas en italique\*
```

Résultat :

\*Ce texte ne sera pas en italique\*

### Ajouter un retour à la ligne

En Markdown, un simple retour à la ligne dans le fichier ne crée pas toujours
un retour à la ligne visible.

Exemple :

```md
Première ligne
Deuxième ligne
```

Ces deux lignes peuvent être affichées dans le même paragraphe.

Dans la majorité des cas, créez plutôt deux paragraphes :

```md
Premier paragraphe.

Deuxième paragraphe.
```

Un retour à la ligne forcé peut être créé avec deux espaces à la fin de la
ligne, mais cette méthode doit rester exceptionnelle.

### Utiliser du HTML

VitePress permet d’utiliser du HTML directement dans un fichier Markdown :

```html
<div class="custom-block">Contenu personnalisé</div>
```

L’utilisation directe de HTML doit toutefois rester limitée.

Privilégiez :

- la syntaxe Markdown ;
- les composants Vue réutilisables ;
- les encadrés VitePress.

Cela facilite la maintenance et garantit une présentation cohérente.

### Utiliser un composant Vue

Une page Markdown peut importer et utiliser un composant Vue.

Exemple :

```md
<script setup lang="ts">
import GameItemCard from '../../.vitepress/theme/components/GameItemCard.vue';
</script>

# Popo d’Ange

<GameItemCard
  name="Popo d’Ange"
  image="/images/items/popo-ange.png"
  type="Objet utilisable"
  description="Restaure les points de vie d’un Dinoz."
/>
```

Le chemin d’import dépend de l’emplacement du fichier Markdown.

Pour une page située dans :

```text
app/wiki/encyclopedie/objets/popo-ange.md
```

l’import suivant remonte jusqu’à la racine du wiki :

```ts
import GameItemCard from '../../.vitepress/theme/components/GameItemCard.vue';
```

Vérifiez que :

- le fichier du composant existe ;
- le chemin relatif est correct ;
- les propriétés obligatoires sont fournies ;
- les noms des propriétés correspondent au composant.

### Utiliser des propriétés Vue dynamiques

Une propriété Vue classique reçoit une chaîne de caractères :

```vue
<GameItemCard name="Popo d’Ange" />
```

Pour transmettre une valeur JavaScript, ajoutez `:` devant la propriété :

```vue
<GameItemCard :quantity="3" />
```

Cette syntaxe est également utile lorsqu’une chaîne contient des guillemets :

```vue
<GameItemCard :description="'Objet appelé « Popo d’Ange » dans le jeu.'" />
```

### Ajouter un commentaire invisible

Les commentaires HTML ne sont pas affichés dans la page :

```md
<!-- Cette information doit encore être vérifiée. -->
```

Ils peuvent être utilisés pour laisser une indication aux autres
contributeurs.

Exemple :

```md
<!-- TODO: ajouter les autres moyens d’obtention. -->
```

Les commentaires ne doivent cependant pas remplacer les issues ou les tâches
importantes du projet.

### Exemple complet d’une page Markdown

```md
---
title: Popo d’Ange
description: Informations sur le Popo d’Ange dans DinoRPG Remastered.
---

<script setup lang="ts">
import GameItemCard from '../../.vitepress/theme/components/GameItemCard.vue';
</script>

# Popo d’Ange

<GameItemCard
  name="Popo d’Ange"
  image="/images/items/popo-ange.png"
  type="Objet utilisable"
  description="Objet permettant de restaurer la santé d’un Dinoz."
/>

## Description

Le **Popo d’Ange** est un objet consommable pouvant être utilisé sur un Dinoz.

:::
La valeur exacte de restauration doit être confirmée dans la version actuelle
du jeu.
:::

## Caractéristiques

| Propriété   | Valeur           |
| ----------- | ---------------- |
| Type        | Objet utilisable |
| Cible       | Un Dinoz         |
| Consommable | Oui              |

## Obtention

Le Popo d’Ange peut être obtenu :

- dans certaines boutiques ;
- comme récompense ;
- pendant certains événements.

## Utilisation

1. ouvrez l’inventaire ;
2. sélectionnez le Popo d’Ange ;
3. choisissez le Dinoz ciblé ;
4. confirmez son utilisation.

## Voir également

- [Liste des objets](/encyclopedie/objets/)
- [Points de vie](/encyclopedie/combats/points-de-vie)
```

### Erreurs fréquentes

#### Oublier de fermer un bloc de code

Exemple incorrect :

````md
```ts
const item = 'Popo d’Ange';
```
````

Exemple correct :

````md
```ts
const item = 'Popo d’Ange';
```
````

#### Oublier de fermer un encadré

Exemple incorrect :

```md
::: warning
Information importante.
```

Exemple correct :

```md
::: warning
Information importante.
:::
```

#### Utiliser un mauvais chemin d’image

Exemple incorrect :

```md
![Popo d’Ange](app/wiki/public/images/items/popo-ange.png)
```

Exemple correct :

```md
![Popo d’Ange](/images/items/popo-ange.png)
```

#### Ajouter l’extension `.md` dans un lien

Exemple incorrect :

```md
[Popo d’Ange](/encyclopedie/objets/popo-ange.md)
```

Exemple correct :

```md
[Popo d’Ange](/encyclopedie/objets/popo-ange)
```

#### Utiliser plusieurs titres principaux

Exemple à éviter :

```md
# Popo d’Ange

# Obtention
```

Exemple recommandé :

```md
# Popo d’Ange

## Obtention
```

#### Oublier une ligne vide après un titre

Exemple à éviter :

```md
## Description

Le Popo d’Ange est un objet.
```

Exemple recommandé :

```md
## Description

Le Popo d’Ange est un objet.
```

#### Utiliser un chemin d’import incorrect

Pour une page située dans :

```text
app/wiki/encyclopedie/objets/popo-ange.md
```

exemple incorrect :

```ts
import GameItemCard from '../.vitepress/theme/components/GameItemCard.vue';
```

Exemple correct :

```ts
import GameItemCard from '../../.vitepress/theme/components/GameItemCard.vue';
```

### Vérifier le résultat

Après avoir modifié une page, lancez le wiki :

```bash
pnpm wiki:dev
```

Vérifiez dans le navigateur :

- la mise en forme des titres ;
- les liens internes ;
- les liens externes ;
- les images ;
- les tableaux ;
- les encadrés ;
- les composants Vue ;
- l’affichage sur mobile.

Lancez ensuite le build complet :

```bash
pnpm wiki:build
```

La commande de build permet notamment de détecter :

- les erreurs d’import ;
- les composants Vue manquants ;
- les erreurs de syntaxe ;
- les problèmes de configuration VitePress ;
- certains liens incorrects.

Une page correctement affichée en développement peut malgré tout contenir une
erreur détectée uniquement pendant le build.

## Conventions de rédaction

Pour garantir une présentation cohérente, quelques conventions doivent être
respectées.

### Noms de fichiers

Les noms de fichiers doivent :

- être écrits en minuscules ;
- ne pas contenir d’espace ;
- ne pas contenir d’accent ;
- utiliser des tirets pour séparer les mots.

Exemple recommandé :

```text
popo-ange.md
```

Exemples à éviter :

```text
Popo d'Ange.md
angel_popo.md
Popo-Ange.md
```

L’utilisation des tirets permet d’obtenir des adresses plus lisibles :

```text
/encyclopedie/objets/popo-ange
```

### Titre et description

Chaque page doit commencer par un bloc de métadonnées appelé `frontmatter` :

```yaml
---
title: Popo d’Ange
description: Informations sur le Popo d’Ange dans DinoRPG Remastered.
---
```

La page doit ensuite contenir un titre principal :

```md
# Popo d’Ange
```

Il ne doit normalement y avoir qu’un seul titre de niveau 1 par page.

### Structure des titres

Utilisez les titres dans leur ordre logique :

```md
# Titre de la page

## Grande section

### Sous-section

#### Section détaillée
```

Évitez de passer directement d’un titre de niveau 2 à un titre de niveau 4.

Exemple à éviter :

```md
## Obtention

#### Boutique
```

Exemple recommandé :

```md
## Obtention

### Boutique
```

### Paragraphes

Utilisez des phrases courtes et compréhensibles.

Séparez les différentes idées avec des paragraphes afin d’éviter les blocs de
texte trop longs.

Évitez également d’utiliser un vocabulaire trop technique dans les pages
destinées aux joueurs.

### Listes

Utilisez une liste lorsqu’il est nécessaire d’énumérer plusieurs éléments :

```md
- premier élément ;
- deuxième élément ;
- troisième élément.
```

Pour une suite d’étapes, utilisez une liste numérotée :

```md
1. sélectionnez votre Dinoz ;
2. ouvrez son inventaire ;
3. choisissez l’objet ;
4. confirmez son utilisation.
```

### Tableaux

Les tableaux peuvent être utilisés pour présenter des caractéristiques ou des
valeurs :

```md
| Propriété                  | Valeur           |
| -------------------------- | ---------------- |
| Type                       | Objet utilisable |
| Cible                      | Un Dinoz         |
| Consommé après utilisation | Oui              |
```

Les tableaux doivent rester lisibles sur mobile. Évitez donc d’ajouter trop de
colonnes.

## Liens internes

Pour créer un lien vers une autre page du wiki :

```md
[Voir les objets](/encyclopedie/objets/)
```

Pour créer un lien vers une fiche précise :

```md
[Popo d’Ange](/encyclopedie/objets/popo-ange)
```

N’ajoutez pas l’extension `.md` ou `.html` dans les liens internes.

Exemple à éviter :

```md
[Popo d’Ange](/encyclopedie/objets/popo-ange.md)
```

Exemple recommandé :

```md
[Popo d’Ange](/encyclopedie/objets/popo-ange)
```

## Modèle de fiche d’objet

Une fiche d’objet peut utiliser la structure suivante :

```md
---
title: Nom de l’objet
description: Informations sur cet objet dans DinoRPG Remastered.
---

<script setup lang="ts">
import GameItemCard from '../../.vitepress/theme/components/GameItemCard.vue';
</script>

# Nom de l’objet

<GameItemCard
  name="Nom de l’objet"
  image="/images/items/nom-image.png"
  type="Objet utilisable"
  description="Description courte de l’objet."
/>

## Description

Présentez ici l’objet et son utilité générale.

## Effet

Décrivez précisément l’effet de l’objet.

| Propriété                  | Valeur           |
| -------------------------- | ---------------- |
| Type                       | Objet utilisable |
| Cible                      | Un Dinoz         |
| Consommé après utilisation | Oui              |

## Obtention

Indiquez les différents moyens permettant d’obtenir l’objet :

- boutique ;
- récompense de mission ;
- événement ;
- autre moyen d’obtention.

## Utilisation

Expliquez comment et dans quelles conditions l’objet peut être utilisé.

## Voir également

- [Liste des objets](/encyclopedie/objets/)
```

## Modèle de fiche de compétence

Une fiche de compétence peut utiliser la structure suivante :

```md
---
title: Nom de la compétence
description: Informations sur cette compétence dans DinoRPG Remastered.
---

# Nom de la compétence

## Description

Présentez l’effet général de la compétence.

## Caractéristiques

| Propriété     | Valeur      |
| ------------- | ----------- |
| Élément       | Feu         |
| Type          | Active      |
| Niveau requis | À compléter |
| Condition     | À compléter |

## Effet

Décrivez précisément le fonctionnement de la compétence.

## Obtention

Expliquez comment cette compétence peut être apprise.

## Voir également

- [Liste des compétences](/encyclopedie/competences/)
```

## Modèle de fiche de monstre

Une fiche de monstre peut utiliser la structure suivante :

```md
---
title: Nom du monstre
description: Informations sur ce monstre dans DinoRPG Remastered.
---

# Nom du monstre

## Présentation

Présentez brièvement le monstre.

## Caractéristiques

| Propriété | Valeur      |
| --------- | ----------- |
| Niveau    | À compléter |
| Élément   | À compléter |
| Zone      | À compléter |

## Lieux d’apparition

Indiquez les endroits dans lesquels le monstre peut être rencontré.

## Capacités

Présentez les capacités ou particularités du monstre.

## Récompenses

Indiquez les récompenses pouvant être obtenues après le combat.

## Voir également

- [Liste des monstres](/encyclopedie/monstres/)
```

## Modèle de fiche de lieu

Une fiche de lieu peut utiliser la structure suivante :

```md
---
title: Nom du lieu
description: Informations sur ce lieu dans DinoRPG Remastered.
---

# Nom du lieu

## Présentation

Présentez le lieu et son rôle dans le monde de Dinoland.

## Actions disponibles

- combattre ;
- discuter avec les personnages ;
- réaliser une mission ;
- accéder à une boutique.

## Personnages présents

Indiquez les personnages pouvant être rencontrés dans ce lieu.

## Destinations accessibles

| Destination | Condition   |
| ----------- | ----------- |
| Nom du lieu | Aucune      |
| Nom du lieu | À compléter |

## Missions associées

Indiquez les missions ou scénarios liés à ce lieu.

## Voir également

- [Liste des lieux](/encyclopedie/lieux/)
```

## Ajouter une image

Les images du wiki sont stockées dans :

```text
app/wiki/public/images/
```

Utilisez le dossier correspondant au type de contenu :

```text
app/wiki/public/images/dinoz/
app/wiki/public/images/items/
app/wiki/public/images/ingredients/
app/wiki/public/images/skills/
app/wiki/public/images/monsters/
app/wiki/public/images/places/
app/wiki/public/images/npc/
app/wiki/public/images/interface/
```

Une image située ici :

```text
app/wiki/public/images/items/popo-ange.png
```

doit être utilisée dans une page avec le chemin :

```md
![Popo d’Ange](/images/items/popo-ange.png)
```

Dans un composant Vue, utilisez également le chemin commençant par `/images/` :

```vue
<GameItemCard
	name="Popo d’Ange"
	image="/images/items/popo-ange.png"
	type="Objet utilisable"
	description="Description de l’objet."
/>
```

Les noms d’images doivent être :

- écrits en minuscules ;
- sans espace ;
- sans accent ;
- séparés par des tirets.

Exemple recommandé :

```text
popo-ange.png
```

Exemple à éviter :

```text
Popo d'Ange.png
```

::: warning Taille des fichiers
Évitez d’ajouter des images inutilement lourdes. Les images doivent être
recadrées et optimisées avant leur ajout au dépôt.
:::

## Informations issues du code du jeu

Certaines informations du wiki sont directement liées aux données présentes
dans le projet :

- les identifiants internes ;
- les effets des objets ;
- les valeurs des compétences ;
- les statistiques des monstres ;
- les récompenses ;
- les conditions de déblocage ;
- les lieux ;
- les missions ;
- les scénarios.

Lorsque ces informations existent déjà dans le code, celui-ci doit être
considéré comme la source de référence.

Les souvenirs provenant du jeu original peuvent être utiles, mais ils ne
correspondent pas toujours au fonctionnement actuel de DinoRPG Remastered.

Si une information du wiki ne correspond pas au comportement actuel du jeu,
précisez-le dans la pull request.

## Informations non confirmées

N’indiquez pas une supposition comme s’il s’agissait d’une information
confirmée.

Lorsqu’une information n’a pas encore été vérifiée, utilisez un avertissement :

```md
:::
Cette information n’a pas encore été confirmée dans la version actuelle du jeu.
:::
```

Vous pouvez également utiliser une formulation explicite :

```md
Cette information doit encore être vérifiée dans la version actuelle du jeu.
```

## Gestion des spoilers

Certaines pages peuvent révéler :

- les étapes d’une mission ;
- les étapes d’un scénario ;
- l’emplacement d’un objet secret ;
- un combat spécial ;
- une récompense cachée ;
- le contenu d’un donjon ;
- un événement important de l’histoire.

Ajoutez un avertissement avant la section concernée :

```md
:::
Cette section révèle des informations importantes sur la progression.
:::
```

Lorsque cela est possible, évitez également de révéler une information majeure
directement dans :

- le titre de la page ;
- la description de la page ;
- le nom du fichier ;
- le texte d’un lien de navigation.

## Qualité des informations

Avant de proposer une modification, vérifiez :

- que l’information correspond à DinoRPG Remastered ;
- que la page n’existe pas déjà ;
- que les liens internes fonctionnent ;
- que les images s’affichent correctement ;
- que les titres respectent la hiérarchie Markdown ;
- que les informations importantes sont clairement expliquées ;
- que les spoilers sont signalés ;
- que le texte est compréhensible par un nouveau joueur ;
- que les valeurs indiquées ont été vérifiées ;
- qu’aucun fichier généré n’est ajouté au commit.

## Fichiers à ne pas ajouter

Les fichiers générés par VitePress ne doivent pas être ajoutés à Git.

Les dossiers suivants doivent rester ignorés :

```text
app/wiki/.vitepress/cache/
app/wiki/.vitepress/dist/
```

Les dépendances ne doivent pas non plus être ajoutées :

```text
node_modules/
```

Vous devez en revanche conserver les fichiers sources :

```text
app/wiki/.vitepress/config.ts
app/wiki/.vitepress/theme/
app/wiki/encyclopedie/
app/wiki/guides/
app/wiki/contribution/
```

## Tester les modifications localement

Après avoir installé les dépendances du projet, lancez le wiki depuis la racine
du dépôt :

```bash
pnpm wiki:dev
```

Vérifiez ensuite :

- la page modifiée ;
- la navigation principale ;
- le menu latéral ;
- les liens internes ;
- les images ;
- l’affichage sur mobile ;
- les éventuelles erreurs dans le terminal.

Avant de créer une pull request, lancez également les vérifications du projet :

```bash
pnpm lint
pnpm wiki:build
```

La commande de build permet notamment de détecter :

- les erreurs d’import ;
- les composants Vue manquants ;
- certaines erreurs dans les fichiers Markdown ;
- les problèmes de configuration VitePress.

## Créer une branche

Utilisez une branche dédiée à votre contribution :

```bash
git checkout -b docs/wiki-nom-de-la-modification
```

Exemples :

```bash
git checkout -b docs/wiki-add-popo-ange
git checkout -b docs/wiki-fix-combat-guide
git checkout -b docs/wiki-add-dinoville
git checkout -b feat/wiki-monster-card
```

## Ajouter les fichiers au commit

Ajoutez uniquement les fichiers concernés par votre contribution :

```bash
git add app/wiki/encyclopedie/objets/popo-ange.md
```

Pour une page utilisant une nouvelle image :

```bash
git add \
  app/wiki/encyclopedie/objets/popo-ange.md \
  app/wiki/public/images/items/popo-ange.png
```

Vérifiez ensuite les fichiers ajoutés :

```bash
git status
```

## Créer un commit

Utilisez un message de commit clair et précis.

### Ajouter une nouvelle page

```bash
git commit -m "docs(wiki): add Angel Popo item page"
```

### Corriger une information

```bash
git commit -m "docs(wiki): fix Angel Popo description"
```

### Ajouter plusieurs pages d’une catégorie

```bash
git commit -m "docs(wiki): add healing item pages"
```

### Ajouter une fonctionnalité au wiki

```bash
git commit -m "feat(wiki): add reusable monster card"
```

### Corriger un problème technique

```bash
git commit -m "fix(wiki): resolve broken encyclopedia links"
```

### Modifier le style du wiki

```bash
git commit -m "style(wiki): improve item card layout"
```

## Créer une pull request

La description de la pull request doit préciser :

- ce qui a été ajouté ou modifié ;
- pourquoi la modification est nécessaire ;
- les pages concernées ;
- la manière dont les informations ont été vérifiées ;
- la présence éventuelle de spoilers ;
- les captures d’écran utiles pour les changements visuels.

Exemple de description :

```md
## Description

Ajout de la fiche consacrée au Popo d’Ange dans l’encyclopédie des objets.

## Modifications

- ajout de la page de l’objet ;
- ajout de son image ;
- ajout du lien dans l’index des objets.

## Vérifications

- [x] Le wiki se construit correctement.
- [x] Les liens internes fonctionnent.
- [x] L’image s’affiche correctement.
- [x] Aucun fichier généré n’est inclus.
```

## Liste de vérification

Avant d’envoyer une pull request :

- [ ] La page possède un titre et une description.
- [ ] Le nom du fichier respecte les conventions.
- [ ] Les titres Markdown sont correctement organisés.
- [ ] Les liens internes fonctionnent.
- [ ] Les images sont optimisées.
- [ ] Les informations correspondent au jeu actuel.
- [ ] Les informations non confirmées sont signalées.
- [ ] Les spoilers sont signalés.
- [ ] Le wiki fonctionne en développement.
- [ ] Le wiki se construit correctement.
- [ ] ESLint ne retourne aucune erreur.
- [ ] Aucun fichier de cache ou de build n’est inclus.

## Signaler une erreur sans modifier le code

Vous pouvez également ouvrir une issue sur le dépôt GitHub de
DinoRPG Remastered.

Précisez autant que possible :

- le lien de la page concernée ;
- l’information incorrecte ;
- la correction proposée ;
- une capture d’écran si nécessaire ;
- la source permettant de vérifier l’information ;
- la version du jeu concernée.

## Proposer une nouvelle page

Avant de créer une nouvelle page, vérifiez qu’une page similaire n’existe pas
déjà.

Dans votre proposition, précisez :

- le titre de la page ;
- la catégorie concernée ;
- le contenu prévu ;
- les éventuelles images nécessaires ;
- la présence de spoilers ;
- les sources utilisées.

## Respect du projet original

DinoRPG Remastered est un projet communautaire indépendant inspiré du jeu
DinoRPG créé par Motion Twin.

Les contributions doivent respecter :

- les crédits du projet original ;
- les auteurs des ressources utilisées ;
- les licences applicables ;
- le travail des autres contributeurs ;
- les règles du dépôt DinoRPG Remastered.

N’ajoutez pas de contenu provenant d’un autre site ou d’un autre wiki sans en
avoir vérifié les conditions d’utilisation.

## Merci pour votre contribution

Chaque correction, nouvelle page ou amélioration aide à construire une
encyclopédie plus complète pour la communauté de DinoRPG Remastered.

Merci à toutes les personnes qui participent à la préservation et à
l’amélioration de l’univers de DinoRPG.
