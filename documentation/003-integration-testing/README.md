[[_TOC_]]

# Tests d'intégration

Les tests unitaires sont bien, mais il est assez rare que les modules de notre plateforme fonctionnent dans une vide.

La plupart du temps, il y a une interaction avec, au moins, une base de données.

Comment on pourrait tester notre code en sachant qu'il faudrait lancer une appli ou une module externe, même avant de tourner nos tests ?

## Le cas de la base de données

La base de données est particulièrement compliqué.

On pourrait juste tester contre notre base de développement, mais il faut que les tests soit répétables. Si on modifie le schéma en dev, ou on ajoute des données supplémentaires, on risque de casse nos tests.

Idéalement, on utilise une base de données *uniquement dédié à nos tests* :
* Avant de lancer nos tests, on supprime l'ancienne base (si elle existe)
* On recrée le schema
* On crée un utilisateur de test (qui aura les même droits que notre API ou module en question)
* On pre-remplit la base avec des données (qu'on appelle les données *seed*)

Cette procédure assure que nos tests reste répétables. 

> Il y a encore un avantage : dans l'esprit de CI/CD, cette procedure pourrait être répété n'importe où (y compris sur notre serveur de développement)

## Docker au secours

Docker est donc idéal pour des tests d'intégration. Avec un `docker-compose.yml` bien écrit, on pourrait créer sans effort l'environnement de dépendances nécessaires pour nos tests (par exemple, lancer un MariaDB, Redis, ... ) puis lancer nos tests automatiques.

Pour notre environnement de développement, eh ben, on a déjà une instance de MariaDB qui est crée. Super ! Quand on lance notre API en développement, on parle par défaut avec une base qui s'appelle `mtdb`.

Nous n'avons qu'à ajouter une deuxième base de données, qu'on appellera `mtdb_test`. Nous allons interagir avec cette base via l'utilisateur `api-test`.

On commence par créer un fichier .sql qui crée cette base et cet utilisateur. Dans l'esprit de l'environnement de développement, nous allons stocker ces instructions dans [dbms/test-initdb.d/001-init-test.sql](../../dbms/test-initdb.d/001-init-test.sql).

> A noter ! Nous allons utiliser le même DDL que pour le mode développement !

Nous ajoutons aussi cette ligne dans notre [docker-compose.dev.yml](../../docker-compose.dev.yml) pour que cette base soit bien crée pour chaque nouveau développeur qui reprend le projet :

```yml
    volumes:
      - ./dbms/dbms-data:/var/lib/mysql
      - ./dbms/mariadb.cnf:/etc/mysql/mariadb.cnf
      # Pointer vers le fichier de configuration pour la base de dev
      - ./dbms/dev-initdb.d/001-init-dev.sql:/docker-entrypoint-initdb.d/001-init-dev.sql
      # Pointer vers le fichier de configuration pour la base de test
      - ./dbms/test-initdb.d/001-init-test.sql:/docker-entrypoint-initdb.d/002-init-test.sql
      # Ajouter le DDL qui va tourner en dernier
      - ./dbms/ddl/ddl.sql:/docker-entrypoint-initdb.d/099-ddl.sql
```

## Outil pour réinitialiser notre base de données

On aura besoin d'un outil qui permet de remettre à zéro notre base de données.

Cette opération est en dehors de l'utilisation de notre API de base, parce qu'il y aura des opérations normalement interdites :
* `drop database`
* `create table`
* etc.

Pour nos tests uniquement, nous allons se connecter d'abord en tant que l'utilisateur `root`, effectuer ces opérations, puis laisser l'utilisateur de l'API reprendre la main.

Pour cela, j'ai crée une classe utilitaire qui s'appelle `RootDB.ts` à [test/utility/RootDB.ts](../../test/utility/RootDB.ts). Ce fichier est dans le dossier `test` pour ne pas être inclut lors de notre build en production.

```ts
const config: PoolOptions = {         
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  user: process.env.DB_ROOT_USER,      
  password: process.env.DB_ROOT_PASSWORD,
  multipleStatements: true
};
const POOL = mysql.createPool(config);

// Ici, nous éxecutons les contenus de notre fichier d'initialisation
const setup = await readFile(join('dbms', 'test-initdb.d', '001-init-test.sql'), { encoding: 'utf-8'});    
await POOL.query(setup);

// Ici, on recrée le schéma de notre base de données
const ddl = await readFile(join('dbms', 'ddl', 'ddl.sql'), { encoding: 'utf-8'});
await POOL.query(`use ${process.env.DB_DATABASE}; ${ddl}`);

// Optionel : pourquoi pas charger d'autres scripts SQL qui remplissent notre base avec des données "seed" ?

await POOL.end();
```

## Test d'intégration

Nous allons utiliser une librairie de plus `chai-as-promised` qui permet d'exprimer nos assertions qui concerne des Promises (des opérations async).

```
npm install --save-dev chai-as-promised @types/chai-as-promised
```

On pourrait, par exemple, tester une opération CRUD pour l'ajout d'un utilisateur.

[test/integration/suites/User/UserCrud.test.ts](../../test/integration/suites/User/UserCrud.test.ts)

```ts
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import { DB } from '../../../../src/classes/DB';
import { UserController } from '../../../../src/routes/auth/UserController';
import { RootDB } from '../../../utility/RootDB';
chai.use(chaiAsPromised);

describe("User CRUD", function () {
  
  before(async function() {
    // Vider la base de données de test
    await RootDB.Reset();
  });

  after(async function() {
    // Forcer la fermeture de la base de données
    await DB.Close();
  });

  it("Create a new user", async function () {
    const user = new UserController();
    const result = await user.createUser({
      familyName: "Glass",
      givenName: "Kevin",
      email: "kevin@nguni.fr",
      balance: 0
    });

    expect(result.id).to.equal(1);
  });

  it("Create the same user twice throws an exception", async function () {
    const user = new UserController();

    await expect(user.createUser({
      familyName: "Glass",
      givenName: "Kevin",
      email: "kevin@nguni.fr",
      balance: 0
    })).to.be.rejected;
      
  });

});
```

Note bien l'utilisation du *hook* `before` et `after`. Ce sont les fonctions appelées avant tous les tests de ce fichier et après tous les tests. Cela permet d'initialiser la base de données, et aussi fermer la connection à la fin de tous les tests.

## Lancer les tests d'integration

Il faut maintenant lancer nos tests. Par contre, on aura besoin de bien préciserr les valeurs pour nos variables d'environnement. Souvenez qu'on utilise au moins :
* `DB_HOST` : normalement `dbms` (selon notre `docker-compose.yml`)
* `DB_DATABASE`: le nom de la base à utiliser. Pour le dev, c'est `mtdb`, mais pour nos tests, on va plutôt utiliser `mtdb_test`
* `DB_USER`: le nom d'utilisateur
* `DB_PASSWORD`: le mot de passe
* `DB_ROOT_USER`: le nom d'utilisateur admin
* `DB_ROOT_PASSWORD` : le mot de passe de l'admin

On devrait donc fournir un `.env` qui va fixer toutes ses variables uniquement pour nos tests.

Moi, j'ai crée un fichier [test/.env.test](../../test/.env.test)

> Attention ! Les valeurs pour la base de test et l'utilisateur de test viennent de notre fichier [dbms/test-initdb.d/001-init-test.sql](../../dbms/test-initdb.d/001-init-test.sql). Les valeurs pour le `root` viennent du fichier [dbms/.env.dev](../../dbms/.env.dev) car ce sont les valeurs crées à l'initialisation de notre SGBDR MariaDB.


Ensuite, nous créons des scripts dans `package.json` pour lancer nos tests d'intégration :

```json
  "scripts": {
    "integration": "env-cmd -f ./test/.env.test npm run integration-no-env",
    "integration-no-env": "mocha -r ts-node/register \"test/integration/suites/**/*.test.ts\"",
  },
```

Notez qu'on a crée 2 scripts :
* `integration-no-env`: qui, comme `unit` lance mocha normalement
* `integration`: qui ca va commencer par charger les variables d'environnement de `./test/.env.test` avant de lancer le script `integration-no-env`

On sépare ses deux scripts parce qu'à terme, on va pouvoir préciser ces variables d'environnement dans un ficher externe (un `docker-composer.yml` par exemple).

Pour lancer le test en local, on va devoir d'abord installer le package `env-cmd`:

```
npm install --save-dev env-cmd
```

On est enfin prêt à lancer notre test d'intégration :

```sh
npm run integration
```

... qui donnera le resultat suivant :

```
  User CRUD
    ✔ Create a new user
    ✔ Create the same user twice throws an exception


  2 passing (191ms)
```


# Considerations

Les tests d'intégration, surtout avec une base de données peut-être assez compliqué à mettre en place :
* Quelles sont les données à charger (préconditions) avant l'execution de mon test ? Parfois ils en sont nombreuses. Pour l'exemple de publicité, il faut d'abord un annonceur, un éditeur, un utilisateur, une publicité. Il faut créer toutes ces données, et les importer dans votre base avant de lancer le test. Ceci pourrait être :
  * dans les scripts d'initialisation par exemple (`before` hook de mocha)
  * via des modules utilitaires qui permette de créer tout le scenario
  * un combinaison des deux
* Parfois, on aimerait interroger directement la base de données pour valider que les bonnes données y sont mises. Il faudrait peut-être ajouter à la classe "RootDB.ts" des fonctions utiles pour ce faire. 
* Attention au *TEMPS* et aux *DATES* ! Si votre application utilise la notion de temps, il faut bien concevoir vos tests pour se passer à un moment fixe, sinon vos tests ne fonctionneront plus dans le future. En revanche, cela veut dire qu'il y aie uns possibilité de paramétrer la date/temps de votre plateforme de façon globale.
* Performance : attention à ne pas importer toute une base de production avant chaque test. On ne veut pas que les tests soit trop longues !


# Code coverage

A un moment on aimerait savoir si on a testé *toutes* les lignes de code dans notre projet.

Et si on oublie un condition particulière, et on n'a pas un test pour cela ?

Heureusement il y a des outils qui permettent de nous indiquer si nos tests on bien couverts toutes les différentes branches possibles de notre projet.

Nous allons utiliser le package `istanbul` (ou `nyc`) :

```
npm install --save-dev nyc source-map-support
```


Nous allons mettre à jour notre `package.json` afin d'invoquer cet outil et le paramétrer :

```json
 "scripts": {
    ...
    "unit": "nyc --report-dir ./coverage/unit mocha -r ts-node/register -r source-map-support/register --recursive \"test/unit/suites/**/*.test.ts\"",
    "integration": "env-cmd -f ./test/.env.test npm run integration-no-env",
    "integration-no-env": "nyc --report-dir ./coverage/integration mocha -r ts-node/register -r source-map-support/register --recursive \"test/integration/suites/**/*.test.ts\""
  },
```

A noter, nous avons ajouté le prefixe `nyc --report-dir ./coverage/[DOSSIER]` ainsi que l'option `-r source-map-support/register --recursive` à nos 2 lignes de test.

A la fin du fichier, on ajoute une section dédié à `nyc` :

```json
  "nyc": {
    "extension": [
      ".ts",
      ".tsx"
    ],
    "exclude": [
      "**/*.d.ts"
    ],    
    "all": false,
    "reporter": ["text", "text-summary", "cobertura"]
  }
```

On précise de regarder uniquement les fichier `.ts`, et de nous générer 3 types de rapport :
* `text`: En texte pour chaque fichier
* `text-summary`: Un résumé de tous les tests
* `cobertura`: Un rapport en XML qu'on va utiliser plus tard pour nos processus de CI/CD


Si on relance `npm run unit` on aura le résultat :

```sh
  AdView
    ✔ One ad view should debit publisher and user, and credit advertiser
    ✔ Should throw an exception if the advertiser does not have enough credit


  2 passing (7ms)

------------------|---------|----------|---------|---------|-------------------
File              | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
------------------|---------|----------|---------|---------|-------------------
All files         |   66.66 |    66.66 |   35.71 |   65.62 |                   
 Business/AdViews |     100 |      100 |     100 |     100 |                   
  AdView.ts       |     100 |      100 |     100 |     100 |                   
 Errors           |      52 |       50 |      25 |   47.61 |                   
  ApiError.ts     |   36.84 |        0 |   18.18 |   26.66 | 15-30,38-58       
  ErrorCode.ts    |     100 |      100 |     100 |     100 |                   
------------------|---------|----------|---------|---------|-------------------
```

On vois qu'il y a des fichiers dont on n'a pas forcement touché à toutes les lignes de code dans nos tests.

Essayez avec `npm run integration`.


# La suite

Nous avons la possibilité de bien tester notre code.

Mais est-ce que vous avez remarqué qu'on n'a pas forcement testé les comportements de l'API ? C'est à dire, tester qu'on récupère les bons codes HTTP dans nos réponses etc.

Prochaine étape : [Tests e2e](https://dev.glassworks.tech:18081/hetic-mt1-p2023/backend/cicd/-/tree/003-e2e-testing/documentation/004-e2e-testing)