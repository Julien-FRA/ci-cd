import axios from 'axios';
import { expect } from 'chai';
import { describe } from 'mocha';
import { Calcul } from '../../../../src/classes/Calcul/Calcul';

describe("Calcul", function () {

    it("Test unit path /calcul", function () {
        const firstNumbers = new Calcul(2, 2);
        const firstResult = firstNumbers.getCalcul();

        const secondNumbers = new Calcul(4, 4);
        const secondResult = secondNumbers.getCalcul();

        const thirdNumbers = new Calcul(0, 20);
        const thirdResult = thirdNumbers.getCalcul();

        expect(firstNumbers).to.not.be.undefined;
        expect(secondNumbers).to.not.be.undefined;
        expect(thirdNumbers).to.not.be.undefined;
        expect(firstResult).to.equal(4);
        expect(secondResult).to.equal(16);
        expect(thirdResult).to.equal(0);
        return true;
      });
});