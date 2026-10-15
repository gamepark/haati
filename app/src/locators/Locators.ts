import { getValue } from '@gamepark/haati/material/Animal'
import { Collection } from '@gamepark/haati/material/Collection'
import { LocationType } from '@gamepark/haati/material/LocationType'
import { MaterialType } from '@gamepark/haati/material/MaterialType'
import { css } from '@emotion/react'
import { RuleId } from '@gamepark/haati/rules/RuleId'
import {
  DeckLocator,
  DropAreaDescription,
  HandLocator,
  ItemContext,
  ListLocator,
  LocationDescription,
  Locator,
  MaterialContext,
  PileLocator
} from '@gamepark/react-game'
import { Coordinates, Location, MaterialItem } from '@gamepark/rules-api'
import { PrestigeTotalHelp } from '../material/help/PrestigeTotalHelp'
import roundVictory1 from '../images/tokens/RoundVictory1.png'
import roundVictory2 from '../images/tokens/RoundVictory2.png'
import {
  ANIMAL_DECK_ROTATE_Z,
  ANIMAL_DECK_Y,
  ANIMAL_DISCARD,
  ANIMAL_SET_ASIDE,
  BANK_RADIUS,
  CARD_HEIGHT,
  CARD_WIDTH,
  CHARACTER_DECK,
  CHARACTER_DISCARD,
  DUEL_CHARACTER_X,
  DUEL_X,
  DUEL_Y,
  HAND,
  HAND_GAP_ANGLE,
  HAND_RADIUS,
  JUNGLE_SPOT_Y,
  PALACE_SPOT_Y,
  placeY,
  PLAYER_BAND_BOTTOM,
  PLAYER_COLLECTION_GAP,
  PLAYER_COLLECTION_X,
  PLAYER_COLLECTION_Y,
  PLAYER_FAVOR_Y,
  PLAYER_HONOR_Y,
  PLAYER_PANEL_HEIGHT,
  PLAYER_PANEL_WIDTH,
  PLAYER_PANEL_X,
  PLAYER_VICTORY,
  PRESTIGE_BANK,
  PRESTIGE_ROW_LENGTH,
  PRESTIGE_ROW_STEP,
  PRESTIGE_ROW_X,
  ROW_STEP,
  ROW_X,
  side,
  VICTORY_HEIGHT,
  VICTORY_RESERVE,
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

/**
 * The cards committed to the duel, at the outer edge of their owner's side: the Animal card, then the
 * Character card beside it. Their reveal is played as a show in the middle of the screen (see the game
 * animations), after which they wait here to be resolved.
 */
class DuelLocator extends Locator {
  locationDescription = new DropAreaDescription({ width: CARD_WIDTH, height: CARD_HEIGHT, borderRadius: 0.4 })

  getLocations(context: MaterialContext) {
    return context.player !== undefined ? [{ type: LocationType.PlayerDuel, player: context.player }] : []
  }

  getCoordinates(location: Location, context: MaterialContext): Partial<Coordinates> {
    return { x: side(location.player, context) * DUEL_X, y: DUEL_Y }
  }

  getItemCoordinates(item: MaterialItem, context: ItemContext): Partial<Coordinates> {
    const x = context.type === MaterialType.CharacterCard ? DUEL_CHARACTER_X : DUEL_X
    return { x: side(item.location.player, context) * x, y: DUEL_Y }
  }
}

/**
 * The hand, fanned out in the bottom outer corner: Animal cards first, then Character cards. While the
 * cards of the duel are being chosen, those already committed keep their place in the hand, so that the
 * cards left do not move under the pointer. Only the viewer's own hand does so: a gap in the opponent's hand
 * would tell which of their cards they played.
 */
class PlayerHandLocator extends HandLocator {
  radius = HAND_RADIUS
  gapMaxAngle = HAND_GAP_ANGLE
  maxAngle = 4 * HAND_GAP_ANGLE

  getCoordinates(location: Location, context: MaterialContext): Partial<Coordinates> {
    return { x: side(location.player, context) * HAND.x, y: HAND.y }
  }

  hand(type: MaterialType, player: number | undefined, context: MaterialContext) {
    const choosing = context.rules.game.rule?.id === RuleId.ChooseCards && player === context.player
    return context.rules
      .material(type)
      .location((location) => location.type === LocationType.PlayerHand || (choosing && location.type === LocationType.PlayerDuel))
      .player(player)
  }

  countItems(location: Location, context: MaterialContext) {
    return this.hand(MaterialType.AnimalCard, location.player, context).length + this.hand(MaterialType.CharacterCard, location.player, context).length
  }

  getItemIndex(item: MaterialItem, context: ItemContext) {
    const animals = this.hand(MaterialType.AnimalCard, item.location.player, context)
    const index =
      context.type === MaterialType.AnimalCard
        ? animals.getIndexes().indexOf(context.index)
        : animals.length + this.hand(MaterialType.CharacterCard, item.location.player, context).getIndexes().indexOf(context.index)
    return Math.max(0, index)
  }
}

/** A pile of Animal cards lying sideways at one end of the board: a quarter turn above the board, the other way below. */
class AnimalDeckLocator extends DeckLocator {
  getCoordinates(location: Location): Partial<Coordinates> {
    return { x: 0, y: location.id === 1 ? -ANIMAL_DECK_Y : ANIMAL_DECK_Y }
  }

  getRotateZ(location: Location) {
    return location.id === 1 ? ANIMAL_DECK_ROTATE_Z : -ANIMAL_DECK_ROTATE_Z
  }
}

class CollectionSpotLocator extends Locator {
  getCoordinates(location: Location) {
    return { x: 0, y: location.id === Collection.Palace ? PALACE_SPOT_Y : JUNGLE_SPOT_Y, z: 0.1 }
  }
}

/** The Collection tokens a player won, one above the other, beside their Prestige. */
class PlayerCollectionLocator extends ListLocator {
  gap = { y: PLAYER_COLLECTION_GAP }

  getCoordinates(location: Location, context: MaterialContext) {
    return { x: side(location.player, context) * PLAYER_COLLECTION_X, y: PLAYER_COLLECTION_Y }
  }
}

/** The help about the whole Prestige of a player. The dialog requires a size, but draws nothing. */
class PrestigeTotalDescription extends LocationDescription {
  width = 0.01
  height = 0.01
  help = PrestigeTotalHelp

  getLocationSize(location: Location) {
    if (location.id === PLAYER_PANEL_AREA) return { width: PLAYER_PANEL_WIDTH, height: PLAYER_PANEL_HEIGHT }
    if (location.id === PLAYER_PRESTIGE_AREA) return { width: PLAYER_PANEL_WIDTH, height: PRESTIGE_BAND_HEIGHT }
    return { width: this.width, height: this.height }
  }
}

/**
 * The area of a player's panel, as a place of their Prestige (id): the panel is drawn by the interface,
 * not as material, so this area lets the tutorial focus on it like on any other place.
 */
export const PLAYER_PANEL_AREA = 1
/** The Prestige band at the bottom of the panel, about a third of its height. */
export const PLAYER_PRESTIGE_AREA = 2
const PRESTIGE_BAND_HEIGHT = 2.8

/**
 * A player's Prestige, in two rows from the outer edge inwards, highest values first: Honor above,
 * Favor below. The Favor row covers the Honor row all but its values, printed at the top of the tokens:
 * the Honor row shows the Favor of the next round.
 */
class PlayerPrestigeLocator extends Locator {
  /** The help about the whole Prestige of a player, opened from their panel. */
  locationDescription = new PrestigeTotalDescription()

  getCoordinates(location: Location, context: MaterialContext): Partial<Coordinates> {
    const x = side(location.player, context) * (PLAYER_PANEL_X + PLAYER_PANEL_WIDTH / 2)
    if (location.id === PLAYER_PANEL_AREA) return { x, y: PLAYER_BAND_BOTTOM - PLAYER_PANEL_HEIGHT / 2 }
    if (location.id === PLAYER_PRESTIGE_AREA) return { x, y: PLAYER_BAND_BOTTOM - PRESTIGE_BAND_HEIGHT / 2 }
    return {}
  }

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
 * The shared supply. The unlimited Favor and Honor tokens lie in one heap, white and black mixed, every
 * token turned its own way. The Round victory tokens not won yet stand beside the pile of Animal cards
 * below the board, each showing the half of the elephant still to be won.
 */
class ReserveLocator extends PileLocator {
  radius = BANK_RADIUS

  getCoordinates() {
    return PRESTIGE_BANK
  }

  getPileId() {
    return 'prestige'
  }

  getItemCoordinates(item: MaterialItem, context: ItemContext): Partial<Coordinates> {
    if (context.type === MaterialType.RoundVictoryToken) {
      return { x: VICTORY_RESERVE.x + (victoryHalf(item, context) * VICTORY_WIDTH) / 2, y: VICTORY_RESERVE.y, z: 0.1 }
    }
    return super.getItemCoordinates(item, context)
  }

  getItemRotateZ(item: MaterialItem, context: ItemContext) {
    if (context.type === MaterialType.RoundVictoryToken) return 0
    return super.getItemRotateZ(item, context)
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

/** The Round victory tokens a player won, below their panel, halves side by side. */
class PlayerVictoryLocator extends Locator {
  locationDescription = new VictorySlotDescription()

  /** A place for each half of each player's elephant: `x` is the half, -1 left and 1 right. */
  getLocations({ rules }: MaterialContext) {
    return rules.players.flatMap((player) => [-1, 1].map((x) => ({ type: LocationType.PlayerRoundVictory, player, x })))
  }

  getCoordinates(location: Location, context: MaterialContext) {
    return { x: side(location.player, context) * PLAYER_VICTORY.x + ((location.x ?? 0) * VICTORY_WIDTH) / 2, y: PLAYER_VICTORY.y }
  }

  getItemCoordinates(item: MaterialItem, context: ItemContext): Partial<Coordinates> {
    const x = side(item.location.player, context) * PLAYER_VICTORY.x + (victoryHalf(item, context) * VICTORY_WIDTH) / 2
    return { x, y: PLAYER_VICTORY.y, z: 0.1 }
  }
}

export const Locators: Partial<Record<LocationType, Locator<number, MaterialType, LocationType>>> = {
  [LocationType.Board]: new BoardLocator(),
  [LocationType.AnimalDeck]: new AnimalDeckLocator(),
  [LocationType.AnimalSetAside]: new DeckLocator({ coordinates: ANIMAL_SET_ASIDE }),
  [LocationType.AnimalDiscard]: new DeckLocator({ coordinates: ANIMAL_DISCARD }),
  [LocationType.CharacterDeck]: new DeckLocator({ coordinates: CHARACTER_DECK }),
  [LocationType.CharacterDiscard]: new DeckLocator({ coordinates: CHARACTER_DISCARD }),
  [LocationType.PlayerHand]: new PlayerHandLocator(),
  [LocationType.PlayerDuel]: new DuelLocator(),
  [LocationType.Palace]: new PlaceLocator(LocationType.Palace),
  [LocationType.Jungle]: new PlaceLocator(LocationType.Jungle),
  [LocationType.CollectionSpot]: new CollectionSpotLocator(),
  [LocationType.PlayerCollection]: new PlayerCollectionLocator(),
  [LocationType.Reserve]: new ReserveLocator(),
  [LocationType.PlayerRoundVictory]: new PlayerVictoryLocator(),
  [LocationType.PlayerPrestige]: new PlayerPrestigeLocator()
}
