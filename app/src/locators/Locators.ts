import { getValue } from '@gamepark/haati/material/Animal'
import { Collection } from '@gamepark/haati/material/Collection'
import { LocationType } from '@gamepark/haati/material/LocationType'
import { MaterialType } from '@gamepark/haati/material/MaterialType'
import { css } from '@emotion/react'
import { prestigeUnits } from '@gamepark/haati/material/Prestige'
import { RuleId } from '@gamepark/haati/rules/RuleId'
import { DeckLocator, DropAreaDescription, ItemContext, ListLocator, LocationDescription, Locator, MaterialContext } from '@gamepark/react-game'
import { Coordinates, Location, MaterialItem } from '@gamepark/rules-api'
import { PrestigeTotalHelp } from '../material/help/PrestigeTotalHelp'
import roundVictory1 from '../images/tokens/RoundVictory1.png'
import roundVictory2 from '../images/tokens/RoundVictory2.png'
import {
  ANIMAL_DISCARD,
  ANIMAL_SET_ASIDE,
  BANK_FAN_ANGLE,
  BANK_FAN_RADIUS,
  BOTTOM_ROW_Y,
  CARD_HEIGHT,
  CARD_WIDTH,
  CHARACTER_DECK,
  CHARACTER_DISCARD,
  DUEL_CHARACTER_X,
  DUEL_X,
  FAVOR_BANK,
  HAND_STEP,
  HAND_X,
  HONOR_BANK,
  JUNGLE_SPOT_Y,
  PALACE_SPOT_Y,
  placeY,
  PLAYER_COLLECTION_GAP,
  PLAYER_COLLECTION_X,
  PLAYER_FAVOR_Y,
  PLAYER_HONOR_Y,
  PLAYER_VICTORY_X,
  PRESTIGE_ROW_LENGTH,
  PRESTIGE_ROW_STEP,
  PRESTIGE_ROW_X,
  ROW_STEP,
  ROW_X,
  SHARED_ROTATE_Z,
  SHARED_ROW_Y,
  side,
  VICTORY_HEIGHT,
  VICTORY_WIDTH
} from './TableLayout'

class BoardLocator extends Locator {
  coordinates = { x: 0, y: 0, z: 0 }
}

/**
 * A Palace or Jungle row, sorted by value from the board outwards so that a Collection in the making
 * reads at a glance. Each card slightly overlaps the previous one, leaving its value visible.
 */
class PlaceLocator extends Locator {
  constructor(readonly place: LocationType) {
    super()
  }

  locationDescription = new DropAreaDescription({ width: CARD_WIDTH, height: CARD_HEIGHT, borderRadius: 0.4 })

  getLocations({ rules }: MaterialContext) {
    return rules.players.map((player) => ({ type: this.place, player }))
  }

  getCoordinates(location: Location, context: MaterialContext): Partial<Coordinates> {
    const count = context.rules.material(MaterialType.AnimalCard).location(location.type).player(location.player).length
    return { x: side(location.player, context) * (ROW_X + count * ROW_STEP), y: placeY(location.type) }
  }

  getItemCoordinates(item: MaterialItem, context: ItemContext): Partial<Coordinates> {
    const row = context.rules
      .material(MaterialType.AnimalCard)
      .location(item.location.type)
      .player(item.location.player)
      .getItems<number>()
      .map((card) => card.id)
      .sort((a, b) => getValue(a) - getValue(b) || a - b)
    const index = Math.max(0, row.indexOf(item.id))
    return { x: side(item.location.player, context) * (ROW_X + index * ROW_STEP), y: placeY(item.location.type), z: index * 0.05 }
  }
}

/** The cards committed to the duel: the Animal card by the board, the Character card just behind. */
class DuelLocator extends Locator {
  locationDescription = new DropAreaDescription({ width: CARD_WIDTH, height: CARD_HEIGHT, borderRadius: 0.4 })

  getLocations(context: MaterialContext) {
    return context.player !== undefined ? [{ type: LocationType.PlayerDuel, player: context.player }] : []
  }

  getCoordinates(location: Location, context: MaterialContext): Partial<Coordinates> {
    return { x: side(location.player, context) * DUEL_X, y: 0 }
  }

  getItemCoordinates(item: MaterialItem, context: ItemContext): Partial<Coordinates> {
    const x = context.type === MaterialType.CharacterCard ? DUEL_CHARACTER_X : DUEL_X
    return { x: side(item.location.player, context) * x, y: 0 }
  }
}

/**
 * The hand: Animal cards first, then Character cards, from the duel outwards. While the cards of the
 * duel are being chosen, those already committed keep their place in the hand, so that the cards left
 * do not move under the pointer.
 */
class HandLocator extends Locator {
  getItemCoordinates(item: MaterialItem, context: ItemContext): Partial<Coordinates> {
    const choosing = context.rules.game.rule?.id === RuleId.ChooseCards
    const hand = (type: MaterialType) =>
      context.rules
        .material(type)
        .location((location) => location.type === LocationType.PlayerHand || (choosing && location.type === LocationType.PlayerDuel))
        .player(item.location.player)
    const animals = hand(MaterialType.AnimalCard)
    const index =
      context.type === MaterialType.AnimalCard
        ? animals.getIndexes().indexOf(context.index)
        : animals.length + hand(MaterialType.CharacterCard).getIndexes().indexOf(context.index)
    return { x: side(item.location.player, context) * (HAND_X + Math.max(0, index) * HAND_STEP), y: 0, z: index * 0.05 }
  }
}

/** A pile of cards at one end of the board, lying sideways: a quarter turn above the board, the other way below. */
class SharedDeckLocator extends DeckLocator {
  constructor(readonly position?: Partial<Coordinates>) {
    super()
  }

  getCoordinates(location: Location): Partial<Coordinates> {
    return this.position ?? { x: 0, y: location.id === 1 ? -SHARED_ROW_Y : SHARED_ROW_Y }
  }

  getRotateZ(location: Location) {
    return (this.getCoordinates(location).y ?? 0) < 0 ? SHARED_ROTATE_Z : -SHARED_ROTATE_Z
  }
}

class CollectionSpotLocator extends Locator {
  getCoordinates(location: Location) {
    return { x: 0, y: location.id === Collection.Palace ? PALACE_SPOT_Y : JUNGLE_SPOT_Y, z: 0.1 }
  }
}

/** The tokens a player wins, along the bottom edge of their side, from the board outwards. */
class PlayerTokensLocator extends ListLocator {
  constructor(
    readonly x: number,
    readonly step: number
  ) {
    super()
  }

  getCoordinates(location: Location, context: MaterialContext) {
    return { x: side(location.player, context) * this.x, y: BOTTOM_ROW_Y }
  }

  getGap(location: Location, context: MaterialContext) {
    return { x: side(location.player, context) * this.step }
  }
}

/** The help about the whole Prestige of a player. The dialog requires a size, but draws nothing. */
class PrestigeTotalDescription extends LocationDescription {
  width = 0.01
  height = 0.01
  help = PrestigeTotalHelp
}

/**
 * A player's Prestige, in two rows from the outer edge inwards, highest values first: Honor above,
 * Favor below. The Favor row covers the Honor row all but its values, printed at the top of the tokens:
 * the Honor row shows the Favor of the next round.
 */
class PlayerPrestigeLocator extends Locator {
  /** The help about the whole Prestige of a player, opened from their panel. */
  locationDescription = new PrestigeTotalDescription()

  getItemCoordinates(item: MaterialItem, context: ItemContext): Partial<Coordinates> {
    const tokens = context.rules.material(context.type).location(LocationType.PlayerPrestige).player(item.location.player)
    const rank = tokens.id((id: number) => id > item.id).getQuantity() + context.displayIndex
    const step = Math.min(PRESTIGE_ROW_STEP, PRESTIGE_ROW_LENGTH / Math.max(1, tokens.getQuantity() - 1))
    const favor = context.type === MaterialType.Favor
    return {
      x: side(item.location.player, context) * (PRESTIGE_ROW_X - rank * step),
      y: favor ? PLAYER_FAVOR_Y : PLAYER_HONOR_Y,
      z: (favor ? 1 : 0) + rank * 0.05
    }
  }
}

/** The rank of a Round victory token among those of its place, each unit of a quantity counting for one. */
const victoryRank = (item: MaterialItem, context: ItemContext) =>
  context.rules
    .material(MaterialType.RoundVictoryToken)
    .location(item.location.type)
    .player(item.location.player)
    .filter((_, index) => index < context.index)
    .getQuantity() + (context.displayIndex ?? 0)

/**
 * Which half of the elephant a Round victory token is: -1 for the left half (its front face), 1 for
 * the right half (its back face). A player's first token is the half on their own side of the table,
 * and their second one completes the elephant. The reserve keeps what the players did not take: both
 * halves, or the one missing from the elephant started by a player.
 */
export const victoryHalf = (item: MaterialItem, context: ItemContext): number => {
  if (!item.location) return -1
  const rank = victoryRank(item, context)
  if (item.location.type === LocationType.PlayerRoundVictory) {
    const first = side(item.location.player, context)
    return rank === 0 ? first : -first
  }
  const tokens = context.rules.material(MaterialType.RoundVictoryToken)
  if (tokens.location(item.location.type).getQuantity() > 1) return rank === 0 ? -1 : 1
  const holder = tokens.location(LocationType.PlayerRoundVictory).getItem()?.location.player
  return holder === undefined ? -1 : -side(holder, context)
}

/**
 * The shared supply. The unlimited Favor and Honor tokens are fanned out, 6 at the back, then 3, then 1.
 * The Round victory tokens not won yet are kept out of sight, under the board: the players' places
 * show where they will go.
 */
class ReserveLocator extends Locator {
  getItemCoordinates(item: MaterialItem, context: ItemContext): Partial<Coordinates> {
    if (context.type === MaterialType.RoundVictoryToken) return { x: 0, y: 0, z: -2 }
    const bank = context.type === MaterialType.Favor ? FAVOR_BANK : HONOR_BANK
    const angle = this.getItemRotateZ(item, context) * (Math.PI / 180)
    const rank = prestigeUnits.indexOf(item.id)
    return {
      x: bank.x + BANK_FAN_RADIUS * Math.sin(angle),
      y: bank.y + BANK_FAN_RADIUS * (1 - Math.cos(angle)),
      z: rank * 0.05
    }
  }

  getItemRotateZ(item: MaterialItem, context: ItemContext) {
    if (context.type === MaterialType.RoundVictoryToken) return 0
    return (prestigeUnits.indexOf(item.id) - 1) * BANK_FAN_ANGLE
  }
}

/** The empty place of each half of the elephant, in black and white, waiting for the Round victory tokens. */
class VictorySlotDescription extends LocationDescription {
  width = VICTORY_WIDTH
  height = VICTORY_HEIGHT
  borderRadius = 0.3
  images = { [-1]: roundVictory1, [1]: roundVictory2 }
  extraCss = css`
    background-size: cover;
    filter: grayscale(1);
    opacity: 0.35;
  `

  getImage(location: Location) {
    return location.x !== undefined && location.x < 0 ? roundVictory1 : roundVictory2
  }
}

/** The Round victory tokens a player won, in the outer corner of their side, halves side by side. */
class PlayerVictoryLocator extends Locator {
  locationDescription = new VictorySlotDescription()

  /** A place for each half of each player's elephant: `x` is the half, -1 left and 1 right. */
  getLocations({ rules }: MaterialContext) {
    return rules.players.flatMap((player) => [-1, 1].map((x) => ({ type: LocationType.PlayerRoundVictory, player, x })))
  }

  getCoordinates(location: Location, context: MaterialContext) {
    return { x: side(location.player, context) * PLAYER_VICTORY_X + ((location.x ?? 0) * VICTORY_WIDTH) / 2, y: BOTTOM_ROW_Y }
  }

  getItemCoordinates(item: MaterialItem, context: ItemContext): Partial<Coordinates> {
    const x = side(item.location.player, context) * PLAYER_VICTORY_X + (victoryHalf(item, context) * VICTORY_WIDTH) / 2
    return { x, y: BOTTOM_ROW_Y, z: 0.1 }
  }
}

export const Locators: Partial<Record<LocationType, Locator<number, MaterialType, LocationType>>> = {
  [LocationType.Board]: new BoardLocator(),
  [LocationType.AnimalDeck]: new SharedDeckLocator(),
  [LocationType.AnimalSetAside]: new SharedDeckLocator(ANIMAL_SET_ASIDE),
  [LocationType.AnimalDiscard]: new SharedDeckLocator(ANIMAL_DISCARD),
  [LocationType.CharacterDeck]: new SharedDeckLocator(CHARACTER_DECK),
  [LocationType.CharacterDiscard]: new SharedDeckLocator(CHARACTER_DISCARD),
  [LocationType.PlayerHand]: new HandLocator(),
  [LocationType.PlayerDuel]: new DuelLocator(),
  [LocationType.Palace]: new PlaceLocator(LocationType.Palace),
  [LocationType.Jungle]: new PlaceLocator(LocationType.Jungle),
  [LocationType.CollectionSpot]: new CollectionSpotLocator(),
  [LocationType.PlayerCollection]: new PlayerTokensLocator(PLAYER_COLLECTION_X, PLAYER_COLLECTION_GAP),
  [LocationType.Reserve]: new ReserveLocator(),
  [LocationType.PlayerRoundVictory]: new PlayerVictoryLocator(),
  [LocationType.PlayerPrestige]: new PlayerPrestigeLocator()
}
