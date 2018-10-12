class Deck {
  constructor(id){
    this.id = id;
    this.cards = [];

    if (this.id === "Default") {
      const card1 = {
        kanji: '水',
        kana: 'みず',
        english: 'water (esp. cool, fresh water, e.g. drinking water)'
      }
    
      const card2 = {
        kanji: '日',
        kana: 'ひ',
        english: 'day, days'
      }
      this.addCard(card1);
      this.addCard(card2);
    }
  }

  addCard(card) {
    this.cards.push(card);
  }
}

module.exports = {
  Deck
}