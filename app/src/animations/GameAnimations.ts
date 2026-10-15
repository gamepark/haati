import { LocationType } from '@gamepark/haati/material/LocationType'
import { MaterialType } from '@gamepark/haati/material/MaterialType'
import { MaterialGameAnimations } from '@gamepark/react-game'
import { isMoveItem, isShuffle, MaterialMove } from '@gamepark/rules-api'

/**
 * Most moves keep the framework's pace. Faster are only the housekeeping a player does not need to
 * follow: the Character pile made again from its discard when it runs out, and the Animal cards
 * gathered and laid out in piles between two rounds (the top card of each pile still turns over at
 * the usual pace). The Favor and Honor tokens move at half the usual second.
 */
export const gameAnimations = new MaterialGameAnimations()

const isPrestige = (move: MaterialMove) => 'itemType' in move && (move.itemType === MaterialType.Favor || move.itemType === MaterialType.Honor)

const isCharacterPileRemade = (move: MaterialMove) =>
  (isMoveItem(move) && move.itemType === MaterialType.CharacterCard && move.location.type === LocationType.CharacterDeck) ||
  (isShuffle(move) && move.itemType === MaterialType.CharacterCard)

const isAnimalPileLaidOut = (move: MaterialMove) =>
  isMoveItem(move) &&
  move.itemType === MaterialType.AnimalCard &&
  (move.location.type === LocationType.AnimalSetAside || (move.location.type === LocationType.AnimalDeck && !move.location.rotation))

gameAnimations.configure(isPrestige).duration(500)
gameAnimations.configure((move) => isCharacterPileRemade(move) && !isShuffle(move)).duration(150)
gameAnimations.configure((move) => isCharacterPileRemade(move) && isShuffle(move)).duration(500)
gameAnimations.configure(isAnimalPileLaidOut).duration(150)
