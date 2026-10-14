export enum LocationType {
  Board = 1,
  /**
   * The two piles of Animal cards, id 1 above the board and id 2 below it. Face down, except their top
   * card, revealed (`rotation: true`): the cards the loser chooses from.
   */
  AnimalDeck,
  /** The 4 Animal cards removed face down at the start of each round. */
  AnimalSetAside,
  /** Animal cards eliminated by the Hunter. */
  AnimalDiscard,
  CharacterDeck,
  CharacterDiscard,
  PlayerHand,
  /** The cards a player commits to the current duel, face down until both players are ready. */
  PlayerDuel,
  Palace,
  Jungle,
  /** Where each Collection token waits on the board, id = Collection. */
  CollectionSpot,
  /** Collection tokens won during the round. */
  PlayerCollection,
  /** Round victory tokens not won yet, and the infinite supply of Prestige tokens. */
  Reserve,
  PlayerRoundVictory,
  /** Favor and Honor tokens owned by a player. */
  PlayerPrestige
}
