import {
  CompetitiveScore,
  hideItemId,
  hideItemIdToOthers,
  HidingSecretsStrategy,
  MaterialGame,
  MaterialItem,
  MaterialMove,
  PositiveSequenceStrategy,
  RollItem,
  SecretMaterialRules,
  TimeLimit
} from '@gamepark/rules-api'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { ChooseCardsRule } from './rules/ChooseCardsRule'
import { DiscardCharacterRule } from './rules/DiscardCharacterRule'
import { EndOfRoundRule } from './rules/EndOfRoundRule'
import { HunterRule, JungleElephantRule, JungleTigerRule, MaharajaRule, ThiefRule } from './rules/MoveAnimalRules'
import { NewRoundRule } from './rules/NewRoundRule'
import { RefillHandRule } from './rules/RefillHandRule'
import { ResolveDuelRule } from './rules/ResolveDuelRule'
import { RevealDuelRule } from './rules/RevealDuelRule'
import { RuleId } from './rules/RuleId'

/**
 * A card in hand or committed to the duel is only seen by its owner, unless it is rotated: in hand,
 * that is a card the opponent saw arrive (the winner receives the card the loser left); in the duel,
 * a card that was revealed.
 */
const hideUnlessRotated: HidingSecretsStrategy<number, LocationType> = (item: MaterialItem<number, LocationType>, player?: number) =>
  item.location.rotation ? [] : hideItemIdToOthers(item, player)

/** An Animal pile is face down, except its top card, which the rules rotate (`rotation: true`). */
const hideItemIdUnlessRotated: HidingSecretsStrategy<number, LocationType> = (item: MaterialItem<number, LocationType>) =>
  item.location.rotation ? [] : ['id']

export class HaatiRules
  extends SecretMaterialRules<number, MaterialType, LocationType>
  implements
    CompetitiveScore<MaterialGame<number, MaterialType, LocationType>, MaterialMove<number, MaterialType, LocationType>, number>,
    TimeLimit<MaterialGame<number, MaterialType, LocationType>, MaterialMove<number, MaterialType, LocationType>, number>
{
  rules = {
    [RuleId.ChooseCards]: ChooseCardsRule,
    [RuleId.RevealDuel]: RevealDuelRule,
    [RuleId.ResolveDuel]: ResolveDuelRule,
    [RuleId.JungleElephant]: JungleElephantRule,
    [RuleId.JungleTiger]: JungleTigerRule,
    [RuleId.Maharaja]: MaharajaRule,
    [RuleId.Thief]: ThiefRule,
    [RuleId.Hunter]: HunterRule,
    [RuleId.DiscardCharacter]: DiscardCharacterRule,
    [RuleId.RefillHand]: RefillHandRule,
    [RuleId.EndOfRound]: EndOfRoundRule,
    [RuleId.NewRound]: NewRoundRule
  }

  hidingStrategies = {
    [MaterialType.AnimalCard]: {
      [LocationType.AnimalDeck]: hideItemIdUnlessRotated,
      [LocationType.AnimalSetAside]: hideItemId,
      [LocationType.PlayerHand]: hideUnlessRotated,
      [LocationType.PlayerDuel]: hideUnlessRotated
    },
    [MaterialType.CharacterCard]: {
      [LocationType.CharacterDeck]: hideItemId,
      [LocationType.PlayerHand]: hideItemIdToOthers,
      [LocationType.PlayerDuel]: hideUnlessRotated
    }
  }

  locationsStrategies = {
    [MaterialType.AnimalCard]: {
      [LocationType.AnimalDeck]: new PositiveSequenceStrategy(),
      [LocationType.AnimalSetAside]: new PositiveSequenceStrategy(),
      [LocationType.AnimalDiscard]: new PositiveSequenceStrategy(),
      [LocationType.PlayerHand]: new PositiveSequenceStrategy(),
      [LocationType.PlayerDuel]: new PositiveSequenceStrategy(),
      [LocationType.Palace]: new PositiveSequenceStrategy(),
      [LocationType.Jungle]: new PositiveSequenceStrategy()
    },
    [MaterialType.CharacterCard]: {
      [LocationType.CharacterDeck]: new PositiveSequenceStrategy(),
      [LocationType.CharacterDiscard]: new PositiveSequenceStrategy(),
      [LocationType.PlayerHand]: new PositiveSequenceStrategy()
    }
  }

  /** Collection tokens are flipped like a coin: face 0 or face 1. */
  roll(_move: RollItem<number, MaterialType, LocationType>): number {
    return Math.floor(Math.random() * 2)
  }

  /** The game is played in 2 winning rounds: the score is the number of Round victory tokens. */
  getScore(player: number): number {
    return this.material(MaterialType.RoundVictoryToken).location(LocationType.PlayerRoundVictory).player(player).getQuantity()
  }

  giveTime(): number {
    return 60
  }
}
