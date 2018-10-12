// Deck class that has an ID, which is also its key in the API decks object,
// and an array of cards. Has a method to add more cards

class Deck {
  constructor(id) {
    this.id = id;
    this.cards = [];

    // Adds data to the default deck
    if (this.id === 'Default') {
      const card1 = {
        kanji: '水',
        kana: 'みず',
        english: 'water (esp. cool, fresh water, e.g. drinking water)',
      };

      const card2 = {
        kanji: '日',
        kana: 'ひ',
        english: 'day, days',
      };
      this.addCard(card1);
      this.addCard(card2);
    }
  }

  // Cards will have kanji, kana, and english values.
  // Not all will have valid kanji, so the client will
  // differentiate the identifier to kana if kanji is invalid.
  addCard(card) {
    this.cards.push(card);
  }
}

module.exports = {
  Deck,
};
