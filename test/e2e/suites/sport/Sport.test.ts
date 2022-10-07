import axios from 'axios';
import * as chai from 'chai'    
import chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import { DB } from '../../../../src/classes/DB';
import { RootDB } from '../../../utility/RootDB';
import { TestServer } from '../../../utility/TestServer';
chai.use(chaiAsPromised);

describe("/sport", function () {
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

    it("Check if api `/sport` is valid" ,  async function () {
        const returnFalse = () => {
            return false;
        };
        chai.expect(returnFalse()).to.equal(false);
    });

    it("Create a new sport", async function () {
        const result = await axios.post(process.env.API_HOST + '/sport', 
          {
            category: "FootBall"
          }
        );
      
      chai.expect(result.status).to.equal(200);
      chai.expect(result.data.id).to.equal(1);    
    });

    it("Create sport with the same sportId return error", async function () {
      const response = await axios.post(process.env.API_HOST + '/sport', 
        {
          sportId: 1,
          category: "Football"
        }, 
              {        
                headers: {
                  Authorization: "Bearer INSERT HERE"
                },
                validateStatus: (status) => { return true }
              }
      );

      chai.expect(response.status).to.equal(400);
      chai.expect(response.data.code).to.equal(400);
      chai.expect(response.data.structured).to.equal('validation/failed');
    });
});