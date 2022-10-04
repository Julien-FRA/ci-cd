[[_TOC_]]

# CI/CD

L'objectif de ce programme est de vous amener sur l'aventure de CI/CD.

Qu'est-ce que c'est le CI/CD ?

En anglais ça veut dire :
* CI : continuous integration
* CD : continuous deployment

## Continuous Integration

Quand on commence à travailler sur le grands projets avec beaucoup de coéquipiers, il devient compliqué de tracer le travail de tous les contributeurs.

Chaque contributeur n'aura peut-être pas forcément une vue global de la plateforme en développement, il créera des nouvelles fonctionnalités ou il corrigera des problèmes, qui selon ses propres tests locaux fonctionnent.

SAUF ! Il se trouve que ses modifications casse autres choses dans la plateforme. Par exemple, il fait une modification dans une classe, qui change la façon dont des paramètres sont traités. D'un coup, un API qui dépendait sur cette classe ne réagit plus de la même façon, ou retourne des résultats différents. Au bout de cette chaîne, l'interface utilisateur en React qui consomme l'API ne fonctionne plus, parce que les données retournés ne sont plus dans le bon format.

Comment le développeur qui a corrigé la classe aurait connu toutes les implications de sa modification ??

> Je signal aussi que même un dévéloppeur seul pourrat faire la même erreur !

### Procédures de développement avec GIT

Normalement aujourd’hui nous utilisons Git quand on travail en équipe, avec des procédures comme **Git Flow**.

L'idée est de maintenir une branche "officielle" qui s'appelle `main` ou `master`, et pourquoi seulement certains développeurs (les tech-leads, par exemple) auront le droit de modifier (notamment faire les "merges" dessus).

Quand un développeur dans l'équipe veut apporter une modification :
1. Il crée une branche à partir de la branche `main`
2. Il fait ses modifications. Tout le long il commit et push ses modifications (pour avoir ses sauvegardes)
3. Quand il sera prêt il crée un **merge request** de sa branche. Un **merge request** signal au tech-lead qu'il pourrait commencer à regarder la branche pour intégration dans la branche `main`
4. Le tech-lead fera un **code reveiw**, c'est à dire, il regarde toutes les modifications, et il en fera des commentaires, ou des suggestions de modification.
5. On peut supposer que le développeur et le tech-lead testera la modification
6. Quand on est satisfait de la branche, le tech-lead **merge** (ou fusionne) la branche dans la branche `main`. Cette modification est devenu officielle et sera prise en compte pour la prochaine déploiement, ou prise en compte dans toutes les modifications ultérieures.

Le problème se manifeste pendant les étapes 3, 4, et 5 :
* Le développeur fait ses tests, mais il n'a pas forcement une vue suffisamment large pour comprendre les implications ultimes de ses modifications
* Le tech-lead, qui normalement aura une vue large, n'aura peut-être pas le temps de tester TOUTES les implications possibles. Ou il en aura oublié. Ou peut-être la plateforme est suffisamment complexe qu'on ne se rend même pas compte.

### La solution : automatisation

La solution, **continuous integration**, dépend donc de l'automatisation des tests pour résoudre ces problèmes.

Imaginons qu'on pourrait lancer des processus qui vont exécuter notre code, et faire tourner TOUTES les possibilités, et valider que les résultats correspondent systématiquement à nos attentes. Le moindre modification qui change les résultats de l'attendu sera toute suite détecté et signalé.

Donc :
* Le développeur pourrait lancer lui même les tests, et se rendre compte que sa modification casse la logique ailleur dans la plateforme
* Le tech-lead se base sa décision de merger dans la branche `main` sur l'exécution réussite de ces tests. Il n'aura même pas à perdre du temps sur un code review si les tests ne fonctionne pas.

Idéalement ces tests se feront automatiquement :
* A chaque fois qu'on PUSH, par exemple
* Ou, quand on crée ou mettre à jour une merge-request
* Ou, avant de merger dans la branche `main`

## Continuous Deployment

Supposons qu'on a une branche `main` qui passe toutes les tests automatiques. On en est content de la version actuelle, et on veut maintenant déployer la nouvelle version de la plateforme.

Cette procédure de déploiement pourrait être un peut ardue :
* Exécuter une dernière fois les tests pour être double certain qu'il n'y a pas de bug
* Compiler les modules (en image Docker pas exemple)
* Accéder aux serveurs (via SSH, par exemple)
* Faire une sauvegarde des bases de données
* Executer les migrations de la base de données
* "Pull" les images Docker et les relancer
* ... vous voyez d'autres étapes ?

Il faut être certain de ne pas oublier une étape. Ou bien que la procédure soit bien documenté (les IP des serveurs, les codes d'accès, etc) pour que quelqu'un d'autre puisse le faire si nécessaire.

Idéalement, on automatise toutes ses étapes, pour enlever la possibilité d'erreur :
* On merge la branche `main` dans une branche `production` (ou on crée un `tag` sur la branche `main`)
* Lors de cette action, un script se lance qui fait toutes les démarche ci-dessus pour le déploiement de notre nouvelle version.


# La suite

Nous allons parcourir toutes ses étapes. 

Commençons par la création des tests automatiques, car ils sont au cœur des processus CI/CD.

Dans ce dépôt GIT, la structure est la suivante :
* La branche `master`: le point de départ du projet. Vous pouvez cloner la branche main pour suivre vous-même les instructions.
* Les branches `001-..`, `002-...` etc. sont les différents étapes, par exemple tests-unitaires, tests d'intégration, etc. Chaque branche contient la solution ainsi que les explications des démarches à suivre pour mettre en place la solution. 

Prochaine étape : [Tests unitaires](https://dev.glassworks.tech:18081/hetic-mt1-p2023/backend/cicd/-/blob/001-unit-testing/documentation/002-unit-testing/README.md)