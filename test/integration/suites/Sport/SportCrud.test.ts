import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import { DB } from '../../../../src/classes/DB';
import { SportController } from '../../../../src/routes/sport/SportController';
import { RootDB } from '../../../utility/RootDB';
chai.use(chaiAsPromised);

describe("Sport CRUD", function () {

  before(async function() {
    // Vider la base de données de test
    await RootDB.Reset();
  });

  after(async function() {
    // Forcer la fermeture de la base de données
    await DB.Close();
  });

  it("Check if test is valid", async function () {
    const returnFalse = () => {
      return false;
    };

    expect(returnFalse()).to.equal(false);
  });

  it("Create a new sport", async function () {
    const sport = new SportController();
    const result = await sport.createSport({
      category: "Foot"
    });

    expect(result.id).to.equal(1);
});

  it("Create a second sport", async function () {
    const sport = new SportController();
    const result = await sport.createSport({
      category: "Basket"
    });

    expect(result.id).to.equal(2);
  });

  it("Get all sports", async function () {
    const sport = new SportController();
    const result = await sport.getSports();
  
    expect(result.total).to.equal(2);
  });
});