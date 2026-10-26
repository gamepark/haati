import { LocationType } from '@gamepark/haati/material/LocationType'
import { MaterialContext } from '@gamepark/react-game'

/**
 * The board stands upright in the middle of the table, the Palace at the top and the Jungle at the
 * bottom. Each player sits on one side of it — the viewer on the left — and lays their Palace and
 * Jungle rows out from the board towards their own edge, level with the Palace and Jungle printed on
 * the board.
 *
 * Along the top edge, each player's information, in one row: their panel in the outer corner, then the
 * places of their Round victory tokens, the Favor and Honor tokens they hold and their Collection tokens;
 * the zoom buttons stand below the viewer's panel. Along the bottom edge, their hand in the outer corner.
 * The duel cards wait at the outer edge, between the rows and the hand, and come to the middle of the
 * table, enlarged, once revealed.
 *
 * Above and below the board, the two piles of Animal cards, lying sideways, flanked by the other piles
 * of cards and by the supplies of Favor and Honor. Every measure is in centimetres.
 */
export const TABLE_WIDTH = 88.6
export const TABLE_HEIGHT = 2 * 21.3

export const CARD_WIDTH = 6.35
export const CARD_HEIGHT = 8.89

/** The publisher's file is 1595 × 4608 px at 177.17 px/cm (450 dpi). Cards and tokens are drawn at the same density. */
export const BOARD_WIDTH = 9
export const BOARD_HEIGHT = 26

/** Centres of the Palace and Jungle circles printed on the board, where the Collection tokens wait. */
export const PALACE_SPOT_Y = -6
export const JUNGLE_SPOT_Y = 5.85

/** The Palace and Jungle tabs printed along both edges of the board, a card high: the rows stand level with them. */
export const PALACE_ROW_Y = -4.65
export const JUNGLE_ROW_Y = 4.65

/** The Palace and Jungle rows of each player, from the board outwards. */
export const ROW_X = 8.3
export const ROW_STEP = 2.5

/** The cards a player commits to the duel, at the outer edge of their side: the Animal card, then the Character card. */
export const DUEL_Y = 3
export const DUEL_X = 33.5
export const DUEL_CHARACTER_X = 40.5

/**
 * When the duel is revealed, the two Animal cards leave the table for the middle of the screen, enlarged,
 * and clash. The Character cards stay on the table.
 */
export const DUEL_SHOW_SCALE = 1.5
export const DUEL_SHOW_X = 5.6

/** The hand, fanned out in the bottom outer corner. */
export const HAND = { x: 33, y: 15.6 }
export const HAND_RADIUS = 40
export const HAND_GAP_ANGLE = 7
/** The buttons of a card in hand straddle its top edge, as in Faraway: the top of the cards is what the fan shows best. */
export const HAND_BUTTON_Y = -CARD_HEIGHT / 2
/** The buttons of a card in the duel, at its bottom, off the picture. */
export const DUEL_BUTTON_Y = CARD_HEIGHT / 2 - 1.6

/** The two piles of Animal cards, lying sideways (rotated by a quarter turn) above and below the board. */
export const ANIMAL_DECK_Y = 17.4
export const ANIMAL_DECK_ROTATE_Z = 90

/** The other piles of cards, upright: the Animal cards set aside and eliminated above, the Character cards below. */
export const ANIMAL_SET_ASIDE = { x: -8.5, y: -16.5 }
export const ANIMAL_DISCARD = { x: 8.5, y: -16.5 }
export const CHARACTER_DECK = { x: 8.5, y: 16.5 }
export const CHARACTER_DISCARD = { x: 15.5, y: 16.5 }

/**
 * Between two rounds, the cards are gathered and mixed in the middle of the screen, on the board: the Animal
 * cards on the left, the Character cards on the right, a little gap between the two piles.
 */
const RESET_PILE_X = CARD_WIDTH / 2 + 0.8
export const ANIMAL_RESET = { x: -RESET_PILE_X, y: 0 }
export const CHARACTER_RESET = { x: RESET_PILE_X, y: 0 }

/** The 2 Round victory tokens are the two halves of one elephant: they are laid side by side, upright. */
export const VICTORY_WIDTH = 2.57
export const VICTORY_HEIGHT = 6.56

/** The top of the pile of Animal cards below the board: the Round victory tokens and the supply of Favor and Honor start on that line. */
const BELOW_BOARD_TOP = ANIMAL_DECK_Y - CARD_WIDTH / 2

/**
 * The Round victory tokens not won yet, beside the pile of Animal cards below the board: under the pile of
 * Animal cards set aside, facing the pile of Character cards, their top level with the top of the Animal pile.
 */
export const VICTORY_RESERVE = { x: ANIMAL_SET_ASIDE.x, y: BELOW_BOARD_TOP + VICTORY_HEIGHT / 2 }

/** At the end of the game, the elephant completed by the winner stands in the middle of the table, this many times bigger. */
export const VICTORY_SHOW_SCALE = 3

/**
 * What a player holds lies in one row along the top edge of their side, from the outer edge inwards: the
 * panel, the Round victory tokens, the Prestige in two rows, then the Collection tokens one above the
 * other, each clear of the next by BAND_GAP. The bottom of the panel, of the Favor tokens and of the
 * second Collection token are level with the bottom of the piles of Animal cards set aside and
 * eliminated, and the top of the panel, of the Round victory tokens and of the Honor tokens with their
 * top. Below the viewer's panel, the zoom buttons (see ZOOM_BUTTONS_TOP).
 */
export const PLAYER_BAND_BOTTOM = ANIMAL_SET_ASIDE.y + CARD_HEIGHT / 2
const BAND_GAP = 0.6

/** The player panels in the top outer corner of each side: PLAYER_PANEL_X is their inner edge. */
const PLAYER_PANEL_MARGIN = 0.5
export const PLAYER_PANEL_WIDTH = 10.5
export const PLAYER_PANEL_HEIGHT = CARD_HEIGHT
export const PLAYER_PANEL_X = TABLE_WIDTH / 2 - PLAYER_PANEL_MARGIN - PLAYER_PANEL_WIDTH

/**
 * The areas of a player's panel, as places of their Prestige (the location id): the panel is drawn by the
 * interface, not as material, so these areas let the tutorial focus on the whole panel or on a part of it.
 */
export enum PanelArea {
  Whole = 1,
  Prestige,
  Turn,
  Tiles
}

/**
 * The centre of each area from the centre of the panel, and its size, as the panel lays them out (measured
 * on PlayerPanels): the turn in progress under the name, the row of the Favor and Honor tiles, then the
 * Prestige band at the bottom.
 */
export const PANEL_AREAS: Record<PanelArea, { dx: number; dy: number; width: number; height: number }> = {
  [PanelArea.Whole]: { dx: 0, dy: 0, width: PLAYER_PANEL_WIDTH, height: PLAYER_PANEL_HEIGHT },
  [PanelArea.Prestige]: { dx: 0, dy: 2.89, width: 9.8, height: 2.43 },
  [PanelArea.Turn]: { dx: 0.2, dy: -1.93, width: 3.05, height: 1.27 },
  [PanelArea.Tiles]: { dx: 0, dy: 0.28, width: 9.8, height: 2.29 }
}

/** The places of the Round victory tokens, beside the panel, their top level with its top: x is the line between the two halves. */
export const PLAYER_VICTORY = { x: PLAYER_PANEL_X - BAND_GAP - VICTORY_WIDTH, y: PLAYER_BAND_BOTTOM - PLAYER_PANEL_HEIGHT + VICTORY_HEIGHT / 2 }

/**
 * The Prestige: Honor in the upper row, Favor in the lower one, which covers the Honor tokens all but
 * their value, printed at the top. Highest values first, from the outer edge inwards: PRESTIGE_ROW_X is
 * the centre of the outermost token.
 */
const PRESTIGE_WIDTH = 1.63
export const PRESTIGE_ROW_STEP = 2.3
export const PRESTIGE_ROW_LENGTH = 6.9
export const PRESTIGE_ROW_X = PLAYER_VICTORY.x - VICTORY_WIDTH - BAND_GAP - PRESTIGE_WIDTH / 2
export const PRESTIGE_HEIGHT = 5.76
export const PLAYER_FAVOR_Y = PLAYER_BAND_BOTTOM - PRESTIGE_HEIGHT / 2
export const PLAYER_HONOR_Y = PLAYER_BAND_BOTTOM - CARD_HEIGHT + PRESTIGE_HEIGHT / 2
export const COLLECTION_DIAMETER = 4.97
export const PLAYER_COLLECTION_X = PRESTIGE_ROW_X - PRESTIGE_ROW_LENGTH - PRESTIGE_WIDTH / 2 - BAND_GAP - COLLECTION_DIAMETER / 2
export const PLAYER_COLLECTION_GAP = 4.2
export const PLAYER_COLLECTION_Y = PLAYER_BAND_BOTTOM - COLLECTION_DIAMETER / 2 - PLAYER_COLLECTION_GAP

/**
 * The top of the zoom buttons, from the top of the table: below the viewer's panel. They are drawn by the
 * framework over the screen, not on the table.
 */
export const ZOOM_BUTTONS_TOP = PLAYER_BAND_BOTTOM + TABLE_HEIGHT / 2 + BAND_GAP
export const ZOOM_BUTTONS_LEFT = PLAYER_PANEL_MARGIN

/**
 * The unlimited supply of Favor and Honor, below the board on the viewer's side, in a frame so that it does
 * not read as anybody's tokens; its title lies in a cartouche over the bottom of the Favor tokens. The
 * tokens are drawn smaller than the players' ones, and the frame is never bigger than a card. Its top is
 * level with the top of the pile of Animal cards below the board, its bottom with the bottom of the pile of
 * Character cards. Inside: Honor above, Favor below, covering the Honor tokens all but their value; a pile
 * of each value, highest first, its tokens slightly offset up and right.
 */
const RESERVE_BOTTOM = CHARACTER_DECK.y + CARD_HEIGHT / 2
export const RESERVE_SCALE = 0.7
const RESERVE_PADDING = 0.45
const RESERVE_TOKEN_HEIGHT = PRESTIGE_HEIGHT * RESERVE_SCALE
export const RESERVE_PILE_STEP = 2.3 * RESERVE_SCALE
export const RESERVE_PILE_OFFSET = 0.15
/** The part of an Honor token left uncovered by the Favor token below it: its value. */
const RESERVE_HONOR_VISIBLE = 2.1 * RESERVE_SCALE
export const RESERVE_FAVOR_Y = RESERVE_BOTTOM - RESERVE_PADDING - RESERVE_TOKEN_HEIGHT / 2
export const RESERVE_HONOR_Y = RESERVE_FAVOR_Y - RESERVE_HONOR_VISIBLE
/** The scale and the padding are chosen so that the tokens fill that height. */
const RESERVE_TOP = BELOW_BOARD_TOP
export const RESERVE_WIDTH = 2 * RESERVE_PILE_STEP + 1.63 * RESERVE_SCALE + 2 * RESERVE_PILE_OFFSET + 2 * RESERVE_PADDING
export const RESERVE_HEIGHT = RESERVE_BOTTOM - RESERVE_TOP
/** The frame stands this far from the Round victory tokens, on their left. */
const RESERVE_GAP = 0.82
export const RESERVE = { x: VICTORY_RESERVE.x - VICTORY_WIDTH - RESERVE_GAP - RESERVE_WIDTH / 2, y: (RESERVE_TOP + RESERVE_BOTTOM) / 2 }
/** The cartouche of the title, as wide as the tokens, level with the bottom of the Favor tokens. */
export const RESERVE_TITLE_INSET = RESERVE_PADDING

/** -1 for the viewer's side, on the left; 1 for the opponent's side. Spectators see the first player on the left. */
export const side = (player: number | undefined, context: MaterialContext): number => {
  const me = context.player ?? context.rules.players[0]
  return player === me ? -1 : 1
}

export const placeY = (type: LocationType) => (type === LocationType.Palace ? PALACE_ROW_Y : JUNGLE_ROW_Y)
