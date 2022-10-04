# Nodejs Boilerplate API

Ce repo contient des exemples d'une base de projet en NodeJS/Typescript.

La projet évolue au fur et à mesure dans les différentes branches. Utilisez `git checkout [nom de la branche]` afin de passer entre les branches.

[[_TOC_]]

## TL;DR

Lancez VSCode, et accepter de ré-ouvrir le projet dans un Dev Container.

Dans VSCode, on peut facilement accéder à la base :

```sh
mycli -h dbms -u root
# Ensuite, utilisez le mot de passe dans .env.dev
```

Pour lancer le serveur en développement (depuis un terminal dans VSCode) :

```sh
# A faire une fois avant le premier lancement
npm install

# Pour lancer l'API
npm run api
```

L'API est accessible à l'adresse : `http://localhost:5050`.

Vous pouvez tester le endpoint `/info` qui devrait retourner des informations concernant l'API :

```
{"title":"NodeJS Boilerplate API","host":"4acb78b6d440","platform":"linux","type":"Linux"}
```

## Migrations

A tout moment, si vous modifiez votre schema de base de données, vous pouvez le mettre à jour avec : 

```sh
mycli -h dbms -u root mtdb < dbms/ddl/ddl.sql 
```


## Explications

1. [Introduction](./documentation/001-introduction/README.md)
2. [Tests unitaires](https://dev.glassworks.tech:18081/hetic-mt1-p2023/backend/cicd/-/blob/001-unit-testing/documentation/002-unit-testing/README.md)
3. [Tests d'intégration](https://dev.glassworks.tech:18081/hetic-mt1-p2023/backend/cicd/-/tree/002-integration-testing/documentation/003-integration-testing)
4. [Tests e2e](https://dev.glassworks.tech:18081/hetic-mt1-p2023/backend/cicd/-/tree/003-e2e-testing/documentation/004-e2e-testing)
5. [CI : Continuous Integration](https://dev.glassworks.tech:18081/hetic-mt1-p2023/backend/cicd/-/tree/004-ci/documentation/005-ci)
6. [CI : Continuous Deployment](https://dev.glassworks.tech:18081/hetic-mt1-p2023/backend/cicd/-/tree/005-cd/documentation/006-cd)
7. [Exercice pour notation](https://dev.glassworks.tech:18081/hetic-mt1-p2023/backend/cicd/-/tree/006-Exercice/documentation/007-exercice)