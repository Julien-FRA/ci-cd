/*
Script de création de la base de données de test.
A noter, on utilise une stratégie avec DROP et IF NOT EXISTS afin de rendre 
notre script réutilisable dans le future, même si la base existe déjà
*/
create database IF NOT EXISTS mtdb_stage;

/* Créer l'utilisateur API */
create user IF NOT EXISTS 'api-stage'@'%.%.%.%' identified by 'api-stage-password';
grant select, update, insert, delete on mtdb_stage.* to 'api-stage'@'%.%.%.%';
flush privileges;

