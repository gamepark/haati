import { CustomMove, isMoveItem, ItemMove, SimultaneousRule } from '@gamepark/rules-api'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { CustomMoveType } from './CustomMoveType'
import { RuleId } from './RuleId'

/**
 * 1. Each player secretly commits one of their 2 Animal cards to the duel, and optionally one
 * Character card. A player holding Character cards validates once their choice is complete.
 */
export class ChooseCardsRule extends SimultaneousRule {
  getActivePlayerLegalMoves(player: number) {
    const moves = []
    const duel = { type: LocationType.PlayerDuel, player }
    const animalPlayed = this.duelCards(MaterialType.AnimalCard, player).length > 0
    if (!animalPlayed) {
      moves.push(...this.handCards(MaterialType.AnimalCard, player).moveItems(duel))
    }
    if (!this.duelCards(MaterialType.CharacterCard, player).length) {
      moves.push(...this.handCards(MaterialType.CharacterCard, player).moveItems(duel))
      if (animalPlayed) moves.push(this.customMove(CustomMoveType.Validate, player))
    }
    return moves
  }

  afterItemMove(move: ItemMove) {
    if (!isMoveItem(move) || move.location.type !== LocationType.PlayerDuel) return []
    const player = move.location.player!
    const animalPlayed = this.duelCards(MaterialType.AnimalCard, player).length > 0
    const characterDone = this.duelCards(MaterialType.CharacterCard, player).length > 0 || !this.handCards(MaterialType.CharacterCard, player).length
    return animalPlayed && characterDone ? [this.endPlayerTurn(player)] : []
  }

  onCustomMove(move: CustomMove) {
    if (move.type === CustomMoveType.Validate) return [this.endPlayerTurn(move.data as number)]
    return []
  }

  getMovesAfterPlayersDone() {
    return [this.startRule(RuleId.RevealDuel)]
  }

  handCards(type: MaterialType, player: number) {
    return this.material(type).location(LocationType.PlayerHand).player(player)
  }

  duelCards(type: MaterialType, player: number) {
    return this.material(type).location(LocationType.PlayerDuel).player(player)
  }
}

