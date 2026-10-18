/** What the display shows during a step of the tutorial only, besides its popup and its focus (see getTutorialEffect). */
export enum TutorialEffect {
  /** Both Round victory tokens fill the places of the viewer's elephant and shine. */
  RoundVictory = 1,
  /** The board is lit in a circle on its cycle of the animals only. */
  AnimalCycle,
  /** The Honor tokens come in front of the Favor tokens and shine. */
  Honor,
  /** The turn counter of the viewer's panel grows and beats, to catch the eye. */
  TurnCounter,
  /** The counters of the piles of Animal cards grow and beat, to catch the eye. */
  DeckCounters
}
