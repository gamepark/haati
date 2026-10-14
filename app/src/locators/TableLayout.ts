import { LocationType } from '@gamepark/haati/material/LocationType'
import { MaterialContext } from '@gamepark/react-game'

/**
 * The board stands upright in the middle of the table, the Palace at the top and the Jungle at the
 * bottom. Each player sits on one side of it — the viewer on the left — and lays their two columns
 * of animals out from the board towards their own edge: the Palace row facing the Palace, the Jungle
 * row facing the Jungle, and between them the duel and the hand.
 *
 * Above and below the board, the two piles of Animal cards with their revealed card on top, lying
 * sideways to keep the table low, flanked by the other piles of cards and by the shared supplies. The
 * player panels and the material each player wins fill the corners. Every measure is in centimetres.
 */
export const CARD_WIDTH = 6.35
export const CARD_HEIGHT = 8.89

/** The publisher's file is 1595 × 4608 px at 177.17 px/cm (450 dpi). Cards and tokens are drawn at the same density. */
export const BOARD_WIDTH = 9
export const BOARD_HEIGHT = 26

/** Centres of the Palace and Jungle circles printed on the board, where the Collection tokens wait. */
export const PALACE_SPOT_Y = -6
export const JUNGLE_SPOT_Y = 5.85

/** The Palace and Jungle rows of each player, as close to the duel as the cards lying sideways allow. */
export const ROW_Y = 9.1
export const ROW_X = 8.3
export const ROW_STEP = 2.5

/** The duel, face to face across the board, then the hand. */
export const DUEL_X = 8.3
export const DUEL_CHARACTER_X = 15.1
export const HAND_X = 22.8
export const HAND_STEP = 5

/**
 * The rows of shared material at both ends of the board. The cards there lie sideways (rotated by a
 * quarter turn), so the rows are only a card width high.
 */
export const SHARED_ROW_Y = 16.8
export const SHARED_ROTATE_Z = 90
export const CHARACTER_DECK = { x: -10, y: -SHARED_ROW_Y }
export const CHARACTER_DISCARD = { x: 10, y: -SHARED_ROW_Y }
export const ANIMAL_SET_ASIDE = { x: -10, y: SHARED_ROW_Y }
export const ANIMAL_DISCARD = { x: 10, y: SHARED_ROW_Y }
export const FAVOR_BANK = { x: -19, y: -SHARED_ROW_Y }
export const HONOR_BANK = { x: 19, y: -SHARED_ROW_Y }
export const VICTORY_RESERVE = { x: -19.6, y: SHARED_ROW_Y }

/** What a player owns: the Prestige in the bottom corner of their side, the tokens won along the bottom edge. */
export const PLAYER_FAVOR_X = 37.9
export const PLAYER_HONOR_X = 31.6
export const PLAYER_PRESTIGE_Y = 7.9
export const PRESTIGE_UNIT_STEP = 2.2
export const PLAYER_COLLECTION_X = 28.5
export const PLAYER_COLLECTION_GAP = 5.3
export const PLAYER_VICTORY_X = 39.3
export const PLAYER_VICTORY_GAP = 2.8

export const TABLE_WIDTH = 88.6
export const TABLE_HEIGHT = 2 * (SHARED_ROW_Y + CARD_WIDTH / 2 + 0.3)

/** The player panels, in the top corner of each side. */
export const PLAYER_PANEL_X = 23
export const PLAYER_PANEL_WIDTH = 10.5
export const PLAYER_PANEL_Y = -SHARED_ROW_Y - CARD_WIDTH / 2

/** -1 for the viewer's side, on the left; 1 for the opponent's side. Spectators see the first player on the left. */
export const side = (player: number | undefined, context: MaterialContext): number => {
  const me = context.player ?? context.rules.players[0]
  return player === me ? -1 : 1
}

export const placeY = (type: LocationType) => (type === LocationType.Palace ? -ROW_Y : ROW_Y)
