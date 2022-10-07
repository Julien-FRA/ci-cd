import axios from 'axios';
import * as chai from 'chai'    
import chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import { DB } from '../../../../src/classes/DB';
import { RootDB } from '../../../utility/RootDB';
import { TestServer } from '../../../utility/TestServer';
chai.use(chaiAsPromised);

describe("/info", function () {
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

    it("Check if api `/info` is valid" ,  async function () {
        const returnFalse = () => {
            return false;
        };
        chai.expect(returnFalse()).to.equal(false);
    });

    it("Check if /info return json" ,  async function () {
        const result = await axios.get(process.env.API_HOST + '/info');

        chai.expect(result.status).to.equal(200);
        chai.expect(result.data.title).to.equal("NodeJS Boilerplate API");    
    });
});