import { getValue } from '@gamepark/haati/material/Animal'
import { Collection } from '@gamepark/haati/material/Collection'
import { LocationType } from '@gamepark/haati/material/LocationType'
import { MaterialType } from '@gamepark/haati/material/MaterialType'
import { DeckLocator, DropAreaDescription, ItemContext, ListLocator, Locator, MaterialContext, PileLocator } from '@gamepark/react-game'
import { Coordinates, Location, MaterialItem } from '@gamepark/rules-api'
import {
  ANIMAL_DISCARD,
  ANIMAL_SET_ASIDE,
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
  PLAYER_FAVOR_X,
  PLAYER_HONOR_X,
  PLAYER_PRESTIGE_Y,
  PLAYER_VICTORY_GAP,
  PLAYER_VICTORY_X,
  PRESTIGE_UNIT_STEP,
  ROW_STEP,
  ROW_X,
  SHARED_ROTATE_Z,
  SHARED_ROW_Y,
  side,
  VICTORY_RESERVE
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

/** The hand: Animal cards first, then Character cards, from the duel outwards. */
class HandLocator extends Locator {
  getItemCoordinates(item: MaterialItem, context: ItemContext): Partial<Coordinates> {
    const hand = (type: MaterialType) => context.rules.material(type).location(LocationType.PlayerHand).player(item.location.player)
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
    return { x: side(location.player, context) * this.x, y: SHARED_ROW_Y }
  }

  getGap(location: Location, context: MaterialContext) {
    return { x: side(location.player, context) * this.step }
  }
}

/** Denominations 6, 3 and 1, side by side; the tokens of one denomination are fanned downwards. */
const prestigeUnitOffset = (unit: number) => (unit === 6 ? 0 : unit === 3 ? 1 : 2) * PRESTIGE_UNIT_STEP

class PlayerPrestigeLocator extends Locator {
  getItemCoordinates(item: MaterialItem, context: ItemContext): Partial<Coordinates> {
    const s = side(item.location.player, context)
    const start = context.type === MaterialType.Favor ? PLAYER_FAVOR_X : PLAYER_HONOR_X
    return {
      x: s * (start + prestigeUnitOffset(item.id)),
      y: PLAYER_PRESTIGE_Y + context.displayIndex * 0.8,
      z: context.displayIndex * 0.05
    }
  }
}

/** The shared supply: the unlimited Favor and Honor tokens, and the Round victory tokens left. */
class ReserveLocator extends PileLocator {
  radius = 0.4

  getCoordinates(_location: Location, context: MaterialContext) {
    const type = (context as ItemContext).type
    const place = type === MaterialType.Favor ? FAVOR_BANK : type === MaterialType.Honor ? HONOR_BANK : VICTORY_RESERVE
    return { ...place, z: 0 }
  }

  getItemCoordinates(item: MaterialItem, context: ItemContext): Partial<Coordinates> {
    if (context.type === MaterialType.RoundVictoryToken) {
      return { x: VICTORY_RESERVE.x + context.displayIndex * 1.2, y: VICTORY_RESERVE.y, z: context.displayIndex * 0.05 }
    }
    const bank = context.type === MaterialType.Favor ? FAVOR_BANK : HONOR_BANK
    return { x: bank.x - PRESTIGE_UNIT_STEP + prestigeUnitOffset(item.id), y: bank.y + context.displayIndex * 0.3, z: context.displayIndex * 0.05 }
  }

  getPileId(item: MaterialItem, context: ItemContext) {
    return `${context.type}-${item.id}`
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
  [LocationType.PlayerRoundVictory]: new PlayerTokensLocator(PLAYER_VICTORY_X, PLAYER_VICTORY_GAP),
  [LocationType.PlayerPrestige]: new PlayerPrestigeLocator()
}
