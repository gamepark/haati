import { CustomMove, ItemMove, MaterialItem, MaterialMove } from '@gamepark/rules-api'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { CustomMoveType } from './CustomMoveType'
import { HaatiRule } from './HaatiRule'

/**
 * An effect that moves one animal already on the table. Each of them may be declined, and none of
 * them triggers the effect of the place the animal arrives in.
 *
 * With no animal to move, the effect is skipped.
 */
abstract class MoveAnimalRule extends HaatiRule {
  abstract getAnimalMoves(): MaterialMove[]

  onRuleStart() {
    return this.getAnimalMoves().length ? [] : this.resume()
  }

  getPlayerMoves() {
    return [...this.getAnimalMoves(), this.customMove(CustomMoveType.Pass)]
  }

  afterItemMove(move: ItemMove) {
    return move.itemType === MaterialType.AnimalCard ? this.resume() : []
  }

  onCustomMove(move: CustomMove) {
    return move.type === CustomMoveType.Pass ? this.resume() : []
  }

  animals(place: LocationType, player?: number) {
    return this.material(MaterialType.AnimalCard).location(place).player(player)
  }
}

/** Keeps the owner of the animal: the effects never move an animal from one camp to the other. */
const sameOwner = (type: LocationType) => (item: MaterialItem) => ({ type, player: item.location.player })

/** Jungle Elephant: 1 animal of either Jungle goes to the Palace of the same player. */
export class JungleElephantRule extends MoveAnimalRule {
  getAnimalMoves() {
    return this.animals(LocationType.Jungle).moveItems(sameOwner(LocationType.Palace))
  }
}

/** Jungle Tiger: 1 animal of either Palace goes to the Jungle of the same player. */
export class JungleTigerRule extends MoveAnimalRule {
  getAnimalMoves() {
    return this.animals(LocationType.Palace).moveItems(sameOwner(LocationType.Jungle))
  }
}

/** The Maharaja: 1 animal of any camp goes from the Palace to the Jungle, or the other way round. */
export class MaharajaRule extends MoveAnimalRule {
  getAnimalMoves() {
    return [
      ...this.animals(LocationType.Palace).moveItems(sameOwner(LocationType.Jungle)),
      ...this.animals(LocationType.Jungle).moveItems(sameOwner(LocationType.Palace))
    ]
  }
}

/**
 * The Thief: an animal of the opponent's Jungle comes into the player's own Jungle if the duel was
 * won, from the opponent's Palace into the player's own Palace if it was lost.
 */
export class ThiefRule extends MoveAnimalRule {
  getAnimalMoves() {
    const place = this.isDuelWinner ? LocationType.Jungle : LocationType.Palace
    return this.animals(place, this.opponent).moveItems({ type: place, player: this.player })
  }
}

/** The Hunter: 1 animal of the opponent, in their Palace or their Jungle, is discarded. */
export class HunterRule extends MoveAnimalRule {
  getAnimalMoves() {
    return this.material(MaterialType.AnimalCard)
      .location((location) => location.type === LocationType.Palace || location.type === LocationType.Jungle)
      .player(this.opponent)
      .moveItems({ type: LocationType.AnimalDiscard })
  }
}
