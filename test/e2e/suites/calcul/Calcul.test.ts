import axios from 'axios';
import * as chai from 'chai'    
import chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import { DB } from '../../../../src/classes/DB';
import { RootDB } from '../../../utility/RootDB';
import { TestServer } from '../../../utility/TestServer';
chai.use(chaiAsPromised);

describe("/calcul", function () {
    before(async function() {
        // Vider la base de données de test
        await RootDB.Reset();
        // Lancer le serveur
        await TestServer.Start();
    });
    
    after(async function() {
        // Forcer la fermeture de la base de données
        await DB.Close();
        // Arrêter le serveur
        await TestServer.Stop();    
    });

    it("Check if api `/calcul` is valid" ,  async function () {
        const returnFalse = () => {
            return false;
        };
        chai.expect(returnFalse()).to.equal(false);
    });

    it("Check calcul" ,  async function () {
        console.log(process.env.API_HOST);
        const result = await axios.post(process.env.API_HOST + '/calcul',
        {
            nb1: 2,
            nb2: 2,
        } 
        );


        const secondResult = await axios.post(process.env.API_HOST + '/calcul', 
        {
            nb1: 4,
            nb2: 4,
        }
      );

        chai.expect(result.status).to.equal(200);
        chai.expect(result.data.result).to.equal(4);  
        chai.expect(secondResult.status).to.equal(200);
        chai.expect(secondResult.data.result).to.equal(16);   
    });
});