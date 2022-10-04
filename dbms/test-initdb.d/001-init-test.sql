/*
Script de création de la base de données de test.
*/

/* On supprime notre base pour chaque test, afin de recommoncer à zero */
drop database IF EXISTS mtdb_test;

/* On crée de nouveau la base */
create database mtdb_test;

/* Créer l'utilisateur API */
create user IF NOT EXISTS 'api-test'@'%.%.%.%' identified by 'api-test-password';
grant select, update, insert, delete on mtdb_test.* to 'api-test'@'%.%.%.%';
flush privileges;

