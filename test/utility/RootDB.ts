import { readFile } from 'fs/promises';
import mysql from 'mysql2/promise';
import { PoolOptions } from 'mysql2/typings/mysql';
import { join } from 'path';

/** Class utilitaire pour réinitialiser la base de données 
 * - On DROP la base existant, si elle existe, 
 * - on en crée une nouvelle, 
 * - on importe le DDL
 * - (optionnelle) on fait executer les instructions SEED (remplir la base avec les données de test)
*/
export class RootDB {
  static async Reset() {

    const config: PoolOptions = {         
      host: process.env.DB_HOST,
      database: process.env.DB_DATABASE,
      user: process.env.DB_ROOT_USER,      
      password: process.env.DB_ROOT_PASSWORD,
      multipleStatements: true
    };
    const POOL = mysql.createPool(config);

    const setup = await readFile(join('dbms', 'test-initdb.d', '001-init-test.sql'), { encoding: 'utf-8'});  
    await POOL.query(setup);

    const ddl = await readFile(join('dbms', 'ddl', 'ddl.sql'), { encoding: 'utf-8'});
    await POOL.query(`use ${process.env.DB_DATABASE}; ${ddl}`);

    await POOL.end();
  }
}