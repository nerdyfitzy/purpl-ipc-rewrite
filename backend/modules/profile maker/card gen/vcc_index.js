const names = require("node-random-name");
const { getProfile, newGroup, addProfile, loadProfiles } = require("../index");
const Privacy = require("./scripts/privacy");

class VCC_Controller {
  constructor(service, action, profileId, groupID) {
    this.service = service;
    this.action = action;
    this.profile = profileId;
    this.profileGroup = groupID;
  }

  async addCardsToProfiles(Cards) {
    const Profile = await getProfile(this.profile, this.profileGroup);
    const { uuid } = await newGroup(`${this.service} Import`);
    Cards.forEach(async (card) => {
      Profile.profile_name = `${card.name} | ${card.site_locked}`;
      delete Profile.uuid;
      const { cardNumber, expMonth, expYear, cvv } = card.cardDetails;
      switch (cardNumber.charAt(0)) {
        case "4":
          Profile.payment.type = "Visa";
          break;
        case "5":
          Profile.payment.type = "MasterCard";
          break;
        default:
          Profile.payment.type = "AmericanExpress";
          break;
      }
      Profile.payment.cnb = cardNumber;
      Profile.payment.month = expMonth;
      Profile.payment.year = expYear;
      Profile.payment.cvv = cvv;

      await addProfile(Profile, uuid);
    });

    const ProfileGroupFinal = await loadProfiles(false, uuid);

    return ProfileGroupFinal;
  }

  async startTasks(cardsName = false, qty = false) {
    var VCC_PROVIDER;
    switch (this.service) {
      case "Privacy":
        VCC_PROVIDER = new Privacy();
        break;
    }

    await VCC_PROVIDER.getApiKey();
    console.log("Got Key");
    let ReturnedCards = [];
    if (this.action === "make") {
      for (let i = 0; i < qty; i++) {
        let name = cardsName;
        if (!cardsName) name = names();

        const Card = await VCC_PROVIDER.makeCards(name);
        ReturnedCards.push(Card);
      }
    } else {
      ReturnedCards = await VCC_PROVIDER.getCards();
    }
    const final = await this.addCardsToProfiles(ReturnedCards);
    return final;
  }
}

module.exports = VCC_Controller;
