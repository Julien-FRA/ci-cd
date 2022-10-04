import { expect } from 'chai';
import { describe } from 'mocha';
import { AdView } from '../../../../src/classes/Business/AdViews/AdView';
import { ApiError } from '../../../../src/classes/Errors/ApiError';
import { IAdvertRO } from '../../../../src/types/tables/advert/IAdvert';
import { IAdvertiserRO } from '../../../../src/types/tables/advertiser/IAdvertiser';
import { IPublisherRO } from '../../../../src/types/tables/publisher/IPublisher';
import { IUserRO } from '../../../../src/types/tables/user/IUser';

describe("AdView", function () {

  it("One ad view should debit publisher and user, and credit advertiser", function () {
    const adview = new AdView({
      publisherPercentage: 0.75
    });

    const advertiser: IAdvertiserRO = {
      advertiserId: 1,
      name: 'Test advertiser',
      balance: 100
    };

    const publisher: IPublisherRO = {
      publisherId: 1,
      name: 'Test publisher',
      balance: 76.32
    };

    const user: IUserRO = {
      userId: 1,
      email: '',
      balance: 1.45
    }

    const advert: IAdvertRO = {
      advertId: 1,
      advertiserId: 1,
      price: 1.99
    };

    const adPublisherCredit = 1.49; // Manually calculated rounded down

    const result = adview.transfer(
      advert,
      advertiser,
      publisher, 
      user
    );

    expect(result).to.not.be.undefined;
    expect(result.view).to.not.be.undefined;
    expect(result.view.advertId).to.equal(advert.advertId);
    expect(result.view.advertiserId).to.equal(advertiser.advertiserId);
    expect(result.view.publisherId).to.equal(publisher.publisherId);
    expect(result.view.userId).to.equal(user.userId);
    expect(result.view.total).to.equal(advert.price);
    expect(result.view.advertiserDebit).to.equal(advert.price);
    expect(result.view.publisherCredit).to.equal(adPublisherCredit);
    expect(result.view.userCredit).to.equal(advert.price - adPublisherCredit);
    expect(result.updates.advertiser.balance).to.equal(advertiser.balance - advert.price);
    expect(result.updates.publisher.balance).to.equal(publisher.balance + adPublisherCredit);
    expect(result.updates.user.balance).to.equal(user.balance + (advert.price - adPublisherCredit));

    return true;
  });

  it("Should throw an exception if the advertiser does not have enough credit", function () {
    const adview = new AdView({
      publisherPercentage: 0.75
    });

    const advertiser: IAdvertiserRO = {
      advertiserId: 1,
      name: 'Test advertiser',
      balance: 1
    };

    const publisher: IPublisherRO = {
      publisherId: 1,
      name: 'Test publisher',
      balance: 76.32
    };

    const user: IUserRO = {
      userId: 1,
      email: '',
      balance: 1.45
    }

    const advert: IAdvertRO = {
      advertId: 1,
      advertiserId: 1,
      price: 1.99
    };    

    expect(() => {
      adview.transfer(
        advert,
        advertiser,
        publisher, 
        user
      );
    }).to.throw(ApiError).with.property('structured', 'advertiser/insufficient-credit');
  })
});