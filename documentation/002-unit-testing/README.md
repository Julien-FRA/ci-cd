# Tests unitaires

Dans la structuration de vos projets, il est toujours intéressant d'organiser son code dans les modules qui traite un et seul sujet ou problème, sans mélanger d'autres objectifs, fonctions, ou dépendances.

Il n'est pas toujours évident *où* mettre la logique de son code. 

Est-ce qu'on le met dans les _handlers_ de notre API directement ? Et si un jour on aimerait invoquer la fonctionnalité sans passer par une requête HTTP (via un CLI par exemple) ? On sera coincé. Du coup, on pourrait mettre la *logique business* dans une autre fonction ou classe. Dans cette fonction/class, est-ce qu'on intègre directement les instructions IO (vers la base de données) ? Ou serait-il mieux d'encore extraire ces fonctionnalités là, pour rendre notre logique business *indépendant* de la couche de stockage données.

Je répète, il n'est pas toujours évident de décider. L'architecture et la rédaction de son code dépend de plusieurs facteurs dont il faut trouver l'équilibre :
* Le temps et argent à sa disponibilité : il serait bien de réfléchir un design pendant 1 semaine avant de se lancer dans le code. Le design sera parfait, mais ça coûtera cher et sera peut-être en retard.
* La complexité finale de votre projet. Un projet bien avec beaucoup d'abstractions devient de plus en plus difficile à comprendre. 

L'architecture du logiciel est donc le sujet de divers études, écoles, normes, frameworks :
* [Model-View-Controller](https://fr.wikipedia.org/wiki/Modèle-vue-contrôleur)
* [Hexagonal design](https://fr.wikipedia.org/wiki/Architecture_hexagonale)
* Broker
* Event-bus
* ...

L'architecture peut être stricte, ou combinés dans le même projet. 

Une technique *concrète* qui aide à la structuration de son code et utiliser des tests pour décider comment structurer vos modules. 
* Est-ce que je pourrais tester clairement et facilement une logique business ?
* Est-ce que mon test est indépendant d'autres facteurs qui n'ont rien avoir avec la logique business (surtout provenant des dépendances externes)?

## Un exemple

Je vous ai rédigé une classe qui implémente la logique business d'un transaction dans la publicité en-ligne:

[src/classes/Business/AdViews/AdView.ts](../../src/classes/Business/AdViews/AdView.ts)

Comme vous voyez, cette classe n'implémente que la transaction entre l'annonceur, l'éditeur, l'utilisateur et la publicité. Vous allez remarquer aussi que :
* Dans la classe, on suppose que les données ont déjà été chargées. Cette classe ne s'en occupe pas
* Dans la classe, on ne s'occupe pas du sauvegarde des données. En effet, la fonction `transfer` va simplement retourner un objet avec les mises à jours à apporter, puis on laisse un autre module sauvegarder ses données dans la base
* Cette classe ne se préoccupe pas du tout de QUI va l'appeler, ni COMMENT, ni QUAND.
* La classe pourrait fonctionner comme une boîte noire : il y e des entrées bien définies, et des sorties bien définies

Qu'est qu'on vient de faire ?
* On a isolé la logique business 
* On a enlevé les dépendances (notamment le stockage, MySQL, etc)

Cette classe devient un cas parfait pour ce qu'on appelle un *test unitaire* qui a pour objectif de faire le suivant :

> Un test unitaire a pour objectif de tester toutes les combinaisons de *input*, et mesurer toutes les combinaisons de *output*, pour être sur que le *output* soit toujours valable, et consistent.

Via un test unitaire on pourrait :
* Détecter un comportement inattendu si jamais on refait une passe sur l'implémentation (par exemple, pour optimiser)
* Détecter des bugs (le test plante)
* Assurer que les valeurs ne change pas (en quantité, type, format, etc)
* Tester les *edge-case* : par exemple, utilisé des valeurs non-valides comme *input*, assurer qu'un exception d'un certain type est lancé, par exemple.


# Mocha et Chai

Pour les projets en NodeJS, on utilise de packages [Mocha](https://mochajs.org) et [Chai](https://www.chaijs.com) pour exécuter nos tests unitaires.

```sh
npm install --save-dev mocha @types/mocha
npm install --save-dev chai @types/chai 
```

Attention l'option `--save-dev` : on veut utiliser ces packages uniquement en développement et pas en déploiement.

Ensuite, nous allons créer nos premiers tests dans le dossier `test/unit/suites`.

Pourquoi cette organisation ?
* On range tous nos tests dans le repertoire `test` pour pouvoir facilement l'exclure de notre build de production
* On range les tests unitaires à part des autres tests à venir (intégration, e2e)
* On peut ranger encore plus par thème (`suites`)

Regardons [les tests pour AdView.ts](../../test/unit/suites/AdView/Adview.test.ts)

Dans `mocha`, on utilise uns structure *BDD* (behaviour driven development), qui veut dire qu'on va préciser un comportement souhaité, puis chaque test va assurer ce comportement.

Dans le fichier, on commence par le mot clé `describe` qui précise le module qu'on est en train de décrire.

Ensuite, avec la fonction `it`, nous précisons le comportement souhaite :``

```ts
describe("AdView", function () {

  it("One ad view should debit publisher and user, and credit advertiser", function () {

    // Implementation du test
```

A un moment il faut valider que le comportement est validé ou pas. Normalement nous faison des *assertions* dans le negatif : si tout fonctionne bien, la fonction quitte sans erreur. Si un problème est détecté, on devrait quitter la fonction avec une erreur.

Dans pratiquement toutes les languages de progammation on a la notion *d'assertion* (ou la fonction `assert`), qui va tester un condition, et arrêter le processus avec un code d'erreur si la condition ne passe pas.

La librairie `chai` nous propose un nombre de clauses qui implement la fonction `assert` mais dans une façon plus proche à l'anglais :

```ts
  expect(result).to.not.be.undefined;
  expect(result.view.advertId).to.equal(advert.advertId);
```

Si une condition ne passe pas, le processes (le test) va s'arreter avec une code d'erreur. 

On pourrait même tester que les exceptions sont bien lancées :

```ts
expect(() => {
  adview.transfer(
    advert,
    advertiser,
    publisher, 
    user
  );
}).to.throw(ApiError).with.property('structured', 'advertiser/insufficient-credit');
```


Pour executer notre test, on va ajouter un script à [package.json](../../package.json) : 
```json
  "scripts": {
    ...
    "unit": "mocha -r ts-node/register \"test/unit/suites/**/*.test.ts\""
  },
```

On peut ensuite lancer nos tests avec :

```sh
npm run unit
```

Le résultat :

```
  AdView
    ✔ One ad view should debit publisher and user, and credit advertiser
    ✔ Should throw an exception if the advertiser does not have enough credit


  2 passing (6ms)
```

Essayez d'apporter une modification qui change le comportement du module Adview pour voir comment les tests réagissent !

## Exclure nos tests du build final

Nous avons ajouté des fichiers `.ts` à notre projet qu'on ne veut pas forcément inclure dans le build final. Si on essaye de lancer `tsc` sans la libraire `mocha` installé, il y a aura une erreur.

Nous allons donc exclure notre dossier `test` des builds en production. Pour cela il faut modifier [tsconfig.jon](../../tsconfig.json) :

```json
  "exclude": [
    "test"
  ]
```

# Conception des tests

Attention ! La rédaction des tests peut être assez longue. 

De façon générale, je compte 1 unité de temps pour la création d'un module, et 2 ou 3 fois plus pour la conception et redaction des tests.

Pourquoi ?
* Il faut imaginer TOUTES les scénarii possible : l'usage normale, les edge-case, les erreurs, etc
* Il faut être capable de créer les données entrantes, et le conditions du test avant de le lancer. Cela peut être longue et ardu.

En revanche, le temps et la douleur que les tests enlèvent dans le futur fait que ça vaut le coût !!

# Et s'il y a des dépendances ?

Mais, vous dites, cela est très bien, mais pour la plupart, nos plateformes vont interagir avec des dépendances externes. Notamment, une base de données. 

Prochaine étape : [Tests d'intégration](https://dev.glassworks.tech:18081/hetic-mt1-p2023/backend/cicd/-/tree/002-integration-testing/documentation/003-integration-testing)




