import { IAdvert } from "../../../types/tables/advert/IAdvert";
import { IAdvertiser, IAdvertiserRO, IAdvertiserUpdate } from "../../../types/tables/advertiser/IAdvertiser";
import { IPublisher, IPublisherUpdate, IPublisherRO } from '../../../types/tables/publisher/IPublisher';
import { IUser, IUserUpdate, IUserRO } from '../../../types/tables/user/IUser';
import { ApiError } from '../../Errors/ApiError';
import { ErrorCode } from '../../Errors/ErrorCode';
import { IAdvertViewCreate } from '../../../types/tables/advert_view/IAdvertView';

export interface IAdViewResult {
  updates: {
    advertiser: IAdvertiserUpdate,
    publisher: IPublisherUpdate,
    user: IUserUpdate,
  },
  view: IAdvertViewCreate
}

export interface IAdViewSettings {
  publisherPercentage: number;
}

/** Contient la logique business pour la transfert de valeur entre-
 * les parties prenants d'une vue de publicité
 */
export class AdView {

  constructor(private settings: IAdViewSettings) {
  }
  
  transfer(ad: IAdvert, advertiser: IAdvertiserRO, publisher: IPublisherRO, user: IUserRO) : IAdViewResult { 
    
    const advertiserBalance = advertiser.balance - ad.price;
    if (advertiserBalance < 0) {
      throw new ApiError(ErrorCode.BadRequest, 'advertiser/insufficient-credit', "Not enough balance to show the ad");
    }
    /** Ici on va forcer l'arrondie au 10ème de centime, vers le bas:
     * 1.23 € * 0.75€ = 0.9225 €
     * x 100 = 92.25
     * floor(92.25) = 92
     * 92 / 100 = 0.92 €
     */
    const publisherCredit = Math.floor(ad.price * this.settings.publisherPercentage * 100) / 100.0;

    /** Et ici on va donner le reste à l'utilisateur */
    const userCredit = ad.price - publisherCredit;

    const result: IAdViewResult = {
      updates: {
        advertiser: {
          balance: advertiserBalance
        },
        publisher: {
          balance: publisher.balance + publisherCredit
        },
        user: {
          balance: user.balance + userCredit
        }
      },
      view: {
        advertId: ad.advertId,
        advertiserId: ad.advertiserId,
        publisherId: publisher.publisherId,
        userId: user.userId,
        total: ad.price,
        advertiserDebit: ad.price,
        publisherCredit: publisherCredit,
        userCredit: userCredit
      }
    }

    return result;

  }


}