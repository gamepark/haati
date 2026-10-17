import { LocationType } from '@gamepark/haati/material/LocationType'
import { MaterialType } from '@gamepark/haati/material/MaterialType'
import { CustomMoveType } from '@gamepark/haati/rules/CustomMoveType'
import { RuleId } from '@gamepark/haati/rules/RuleId'
import { LogDescription, MovePlayedLogDescription } from '@gamepark/react-game'
import { isCustomMoveType, isMoveItemType, isStartPlayerTurn, MaterialGame, MaterialMove, MoveItem } from '@gamepark/rules-api'
import {
  ActivateCharacterLog,
  CollectionLog,
  DiscardCharacterLog,
  DrawCharacterLog,
  DuelWonLog,
  GainLog,
  HonorToFavorLog,
  LastCardLog,
  MoveAnimalLog,
  PassLog,
  PlaceAnimalLog,
  RefillLog,
  RevealLog,
  RoundWonLog
} from './HaatiLogs'
import { HaatiContext, isPrestigeMove, prestigeGain, previousMove } from './moveRuns'

type Entry = MovePlayedLogDescription

/** The effects that move an animal already on the table, and may be declined. */
const moveAnimalRules = [RuleId.JungleElephant, RuleId.JungleTiger, RuleId.Maharaja, RuleId.Thief, RuleId.Hunter]

/**
 * What the journal writes down, move by move.
 *
 * Every entry is read off the move and off the state it was played on, never off anything the rules
 * keep for the journal: they keep nothing for it.
 *
 * Two levels. What a player decides, or what the duel decides for them, stands on the left with their
 * avatar: the cards revealed, the duel won, an Animal card placed, a Character activated, a card chosen
 * to complete one's hand, the round won. What it comes to is indented under it: the Favors and the
 * Honors, an animal moved, a Character drawn, a Collection completed.
 *
 * Left out: the cards committed face down (their reveal says them), the shuffles, the deal, and the top
 * card of the piles turned over.
 */
export class HaatiHistory implements LogDescription<MaterialMove, number, MaterialGame> {
  getMovePlayedLogDescription(move: MaterialMove, context: HaatiContext): Entry | undefined {
    const ruleId = context.game.rule?.id as RuleId | undefined
    const player = context.game.rule?.player

    if (isStartPlayerTurn(move)) return ruleId === RuleId.RevealDuel && move.id === RuleId.ResolveDuel ? this.entry(DuelWonLog, move.player) : undefined

    if (isMoveItemType(MaterialType.AnimalCard)(move)) return this.animalMove(move, context, ruleId)

    if (isMoveItemType(MaterialType.CharacterCard)(move)) {
      if (ruleId === RuleId.ResolveDuel && move.location.type === LocationType.CharacterDiscard) return this.entry(ActivateCharacterLog, player)
      if (ruleId === RuleId.ResolveDuel && move.location.type === LocationType.PlayerHand) return this.entry(DrawCharacterLog, player, 1)
      if (ruleId === RuleId.DiscardCharacter) return this.entry(DiscardCharacterLog, player, 1)
      // A bet lost goes without a word: the reveal says it (see RevealLog).
      return undefined
    }

    if (isCustomMoveType(CustomMoveType.Pass)(move)) return this.entry(PassLog, player, 1)

    if (isMoveItemType(MaterialType.CollectionToken)(move)) {
      return move.location.type === LocationType.PlayerCollection ? this.entry(CollectionLog, move.location.player, 1) : undefined
    }

    if (isMoveItemType(MaterialType.RoundVictoryToken)(move)) return this.entry(RoundWonLog, move.location.player)

    if (isPrestigeMove(move)) {
      // Between two rounds, every token of both players is turned over at once: one entry says it all.
      if (ruleId === RuleId.EndOfRound) {
        const previous = previousMove(context)
        return previous !== undefined && isPrestigeMove(previous) ? undefined : this.entry(HonorToFavorLog, undefined, 1)
      }
      const gain = prestigeGain(context)
      return gain.first && (gain.favor || gain.honor) ? this.entry(GainLog, gain.player, 1) : undefined
    }

    return undefined
  }

  private animalMove(move: MoveItem, context: HaatiContext, ruleId?: RuleId): Entry | undefined {
    const player = context.game.rule?.player
    switch (ruleId) {
      case RuleId.RevealDuel:
        return move.location.rotation ? this.entry(RevealLog, move.location.player) : undefined
      case RuleId.ResolveDuel:
        return this.entry(PlaceAnimalLog, move.location.player)
      case RuleId.RefillHand:
        return move.location.type !== LocationType.PlayerHand
          ? undefined
          : move.location.player === player
            ? this.entry(RefillLog, player)
            : this.entry(RefillLog, move.location.player, 1)
      case RuleId.EndOfRound:
        return move.location.type === LocationType.PlayerDuel ? this.entry(LastCardLog, move.location.player) : undefined
    }
    if (ruleId !== undefined && moveAnimalRules.includes(ruleId)) return this.entry(MoveAnimalLog, player, 1)
    return undefined
  }

  /** The avatar is drawn on the entries of the first level alone: an indented one names its player in words anyway. */
  private entry(Component: Entry['Component'], player?: number, depth = 0): Entry {
    return { Component, player: depth === 0 ? player : undefined, depth, liveCss: true }
  }
}
