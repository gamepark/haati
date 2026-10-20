import { sumBy } from 'es-toolkit'
import { isMoveItemType, ItemMove, MaterialMove } from '@gamepark/rules-api'
import { Animal, getAnimal, hasCollection } from '../material/Animal'
import { CharacterCard } from '../material/Character'
import { Collection, collectionPlace, getCollectionReward } from '../material/Collection'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { gainPrestige, PrestigeSide } from '../material/Prestige'
import { HaatiRule } from './HaatiRule'
import { animalPiles } from './NewRoundRule'
import { RuleId } from './RuleId'

/**
 * 3. The winner of the duel places their card in their Palace and applies its effect, then the loser
 * places theirs in their Jungle. A player whose Character bet is won chooses whether it is activated
 * before or after the Animal card; with no such Character, the Animal card goes by itself.
 *
 * The rule starts again after each effect: once both duel cards are gone, the player checks their
 * Collections.
 */
export class ResolveDuelRule extends HaatiRule {
  onRuleStart() {
    if (this.duelCharacter.length) return []
    const animal = this.duelAnimal
    if (animal.length) return [animal.moveItem(this.destination)]
    return this.endResolution()
  }

  getPlayerMoves() {
    return [...this.duelAnimal.moveItems(this.destination), ...this.duelCharacter.moveItems({ type: LocationType.CharacterDiscard })]
  }

  get destination() {
    return { type: this.isDuelWinner ? LocationType.Palace : LocationType.Jungle, player: this.player }
  }

  get duelAnimal() {
    return this.material(MaterialType.AnimalCard).location(LocationType.PlayerDuel).player(this.player)
  }

  get duelCharacter() {
    return this.material(MaterialType.CharacterCard).location(LocationType.PlayerDuel).player(this.player)
  }

  afterItemMove(move: ItemMove) {
    if (isMoveItemType(MaterialType.AnimalCard)(move) && move.location.type === this.destination.type) {
      const animal = getAnimal(this.material(MaterialType.AnimalCard).getItem<number>(move.itemIndex).id)
      return this.isDuelWinner ? this.palaceEffect(animal) : this.jungleEffect(animal)
    }
    if (isMoveItemType(MaterialType.CharacterCard)(move) && move.location.type === LocationType.CharacterDiscard) {
      return this.characterEffect(this.material(MaterialType.CharacterCard).getItem<CharacterCard>(move.itemIndex).id)
    }
    return []
  }

  count(place: LocationType, animal: Animal) {
    return this.material(MaterialType.AnimalCard)
      .location(place)
      .player(this.player)
      .id<number>((id) => getAnimal(id) === animal).length
  }

  /** The Palace effect is mandatory, and only ever gains something. */
  palaceEffect(animal: Animal): MaterialMove[] {
    switch (animal) {
      case Animal.Elephant:
        return [...gainPrestige(this, PrestigeSide.Favor, this.player, this.count(LocationType.Palace, Animal.Elephant)), ...this.resume()]
      case Animal.Tiger:
        return [...gainPrestige(this, PrestigeSide.Favor, this.player, this.count(LocationType.Jungle, Animal.Tiger)), ...this.drawCharacter()]
      case Animal.Mouse: {
        const pairs = Math.floor(this.count(LocationType.Palace, Animal.Mouse) / 2)
        return [
          ...gainPrestige(this, PrestigeSide.Favor, this.player, pairs),
          ...gainPrestige(this, PrestigeSide.Honor, this.player, pairs),
          ...this.resume()
        ]
      }
    }
  }

  /** The Jungle effect is optional: the moves offer to pass. */
  jungleEffect(animal: Animal): MaterialMove[] {
    switch (animal) {
      case Animal.Elephant:
        return [this.startPlayerTurn(RuleId.JungleElephant, this.player)]
      case Animal.Tiger:
        return [this.startPlayerTurn(RuleId.JungleTiger, this.player)]
      case Animal.Mouse:
        return this.drawCharacter()
    }
  }

  characterEffect(card: CharacterCard): MaterialMove[] {
    switch (card) {
      case CharacterCard.MerchantWin:
        return [...gainPrestige(this, PrestigeSide.Favor, this.player, 2), ...this.resume()]
      case CharacterCard.MerchantLose:
        return [...gainPrestige(this, PrestigeSide.Favor, this.player, 1), ...gainPrestige(this, PrestigeSide.Honor, this.player, 1), ...this.resume()]
      case CharacterCard.MaharajaWin:
        return [this.startPlayerTurn(RuleId.Maharaja, this.player)]
      case CharacterCard.MaharajaLose:
        return [...gainPrestige(this, PrestigeSide.Favor, this.player, 1), this.startPlayerTurn(RuleId.Maharaja, this.player)]
      case CharacterCard.ThiefWin:
      case CharacterCard.ThiefLose:
        return [this.startPlayerTurn(RuleId.Thief, this.player)]
      case CharacterCard.HunterWin:
        return [...gainPrestige(this, PrestigeSide.Favor, this.player, 1), this.startPlayerTurn(RuleId.Hunter, this.player)]
      case CharacterCard.HunterLose:
        return [...gainPrestige(this, PrestigeSide.Honor, this.player, 1), this.startPlayerTurn(RuleId.Hunter, this.player)]
    }
  }

  /** Both duel cards are resolved: Collections, then the loser's resolution, or the refill of the hands. */
  endResolution(): MaterialMove[] {
    const moves: MaterialMove[] = this.checkCollections()
    if (this.isDuelWinner) {
      moves.push(this.startPlayerTurn(RuleId.ResolveDuel, this.opponent))
    } else if (
      this.material(MaterialType.AnimalCard)
        .location(LocationType.AnimalDeck)
        .filter((item) => !!item.location.rotation).length === animalPiles.length
    ) {
      moves.push(this.startPlayerTurn(RuleId.RefillHand, this.player))
    } else {
      moves.push(this.startRule(RuleId.EndOfRound))
    }
    return moves
  }

  /**
   * A Collection is 4 consecutive values in the Palace or in the Jungle, rewarded once per round. The
   * Collection token comes to the player first, then its reward, so that one sees where the tokens come
   * from. Both Collections may be completed at once: their rewards are added up into a single gain of
   * each kind.
   */
  checkCollections(): MaterialMove[] {
    const tokens = this.material(MaterialType.CollectionToken)
      .location(LocationType.CollectionSpot)
      .getItems<Collection>()
      .filter((token) => {
        const cards = this.material(MaterialType.AnimalCard).location(collectionPlace[token.id]).player(this.player).getItems<number>()
        return hasCollection(cards.map((card) => card.id))
      })
    const rewards = tokens.map((token) => getCollectionReward(token.id, token.location.rotation))
    return [
      ...tokens.map((token) =>
        this.material(MaterialType.CollectionToken)
          .id(token.id)
          .moveItem({ type: LocationType.PlayerCollection, player: this.player, rotation: token.location.rotation })
      ),
      ...gainPrestige(this, PrestigeSide.Favor, this.player, sumBy(rewards, (reward) => reward.favor)),
      ...gainPrestige(this, PrestigeSide.Honor, this.player, sumBy(rewards, (reward) => reward.honor))
    ]
  }
}
