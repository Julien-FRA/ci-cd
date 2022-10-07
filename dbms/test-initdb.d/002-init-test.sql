/*
Script de création de la base de données de test.
*/

/* On supprime la bdd afin de la reset */
drop database IF EXISTS mtdb_test;

/* On crée de nouveau la base */
create database IF NOT EXISTS mtdb_test;

use mtdb_test;

/* Créer l'utilisateur API */
create user IF NOT EXISTS 'api-test'@'%.%.%.%' identified by 'api-test-password';
grant select, update, insert, delete on mtdb_test.* to 'api-test'@'%.%.%.%';
flush privileges;

/* Créer la table de test */
create table if not exists sport (
  sportId int auto_increment not null,
  category varchar(256) not null, 
  primary key(sportId)
);

