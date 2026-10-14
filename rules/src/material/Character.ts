export enum Character {
  Merchant = 1,
  Maharaja,
  Thief,
  Hunter
}

/** Win: the card pays if its owner wins the duel. Lose: if they lose it. */
export enum Bet {
  Win = 1,
  Lose
}

export enum CharacterCard {
  MerchantWin = 11,
  MerchantLose,
  MaharajaWin = 21,
  MaharajaLose,
  ThiefWin = 31,
  ThiefLose,
  HunterWin = 41,
  HunterLose
}

export const characterCards = Object.values(CharacterCard).filter((v): v is CharacterCard => typeof v === 'number')

export const getCharacter = (card: CharacterCard): Character => Math.floor(card / 10)
export const getBet = (card: CharacterCard): Bet => card % 10

/** A player never keeps more than 2 Character cards in hand. */
export const CHARACTER_HAND_LIMIT = 2
