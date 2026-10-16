/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { HaatiRules } from '@gamepark/haati/HaatiRules'
import { LocationType } from '@gamepark/haati/material/LocationType'
import { MaterialType } from '@gamepark/haati/material/MaterialType'
import { animalPiles } from '@gamepark/haati/rules/NewRoundRule'
import { useFocusContext, useMaterialContext, useRules } from '@gamepark/react-game'
import { maxBy } from 'es-toolkit'
import { useTranslation } from 'react-i18next'
import { Locators } from '../locators/Locators'
import { ANIMAL_DECK_Y, CARD_HEIGHT, CARD_WIDTH, TABLE_HEIGHT, TABLE_WIDTH } from '../locators/TableLayout'
import { colors } from '../theme/colors'
import { fontDisplay } from '../theme'

const COUNTER_SIZE = 1.8
/** From the edges of the card to the edge of the counter. */
const COUNTER_MARGIN = 0.25
const COUNTER_INSET = COUNTER_SIZE / 2 + COUNTER_MARGIN

/**
 * A round has 9 turns: the 2 piles of 8 Animal cards lose 2 cards at each turn (the loser takes one, the
 * winner gets the other), and the 9th turn is played with both piles empty.
 */
const ROUND_TURNS = 9

/**
 * The round and the turn, on the piles of Animal cards: the round on the pile above the board, the turn
 * on the pile below it, the viewer's side. Each label sits in the corner of the top card towards the
 * board, a few millimetres from its edges, opposite to the values printed on the card, and grows towards
 * the middle of the card. The piles lie sideways, a card height wide and a card width high: the top of
 * the card is on the right of the pile above the board, on the left of the pile below it. An empty pile
 * keeps its label where the pile was: the 9th turn is played with no card left.
 */
export const AnimalDeckCounters = () => {
  const { t } = useTranslation()
  const rules = useRules<HaatiRules>()
  const context = useMaterialContext()
  const { focus } = useFocusContext()
  if (!rules) return null
  const piles = rules.material(MaterialType.AnimalCard).location(LocationType.AnimalDeck)
  // While the loser has taken a card and the winner not yet, the turn is not over: round up.
  const turn = ROUND_TURNS - Math.ceil(piles.length / 2)
  const round = rules.material(MaterialType.RoundVictoryToken).location(LocationType.PlayerRoundVictory).getQuantity() + 1
  const label = (pile: number) => (pile === 1 ? t('counter.round', { round }) : t('counter.turn', { turn, turns: ROUND_TURNS }))
  // During a focus of the tutorial, a counter is darkened like the material, unless its pile is in the focus.
  const isPlayedDown = (pile: number) =>
    !!focus?.highlight &&
    !focus.materials?.some((material) => material.getItems().some((item) => item.location.type === LocationType.AnimalDeck && item.location.id === pile))
  return (
    <>
      {animalPiles.map((pile) => {
        const pileCards = rules.material(MaterialType.AnimalCard).location(LocationType.AnimalDeck).locationId(pile)
        // The cards of a pile are slightly offset from each other: the counter follows the top one.
        const top = maxBy(
          pileCards.getIndexes().map((index) => ({ index, item: pileCards.getItem(index) })),
          ({ item }) => item.location.x ?? 0
        )
        const centre = top
          ? Locators[LocationType.AnimalDeck]!.getItemCoordinates(top.item, { ...context, type: MaterialType.AnimalCard, index: top.index, displayIndex: 0 })
          : { x: 0, y: pile === 1 ? -ANIMAL_DECK_Y : ANIMAL_DECK_Y }
        const sx = pile === 1 ? -1 : 1
        const sy = pile === 1 ? 1 : -1
        const x = (centre.x ?? 0) + sx * (CARD_HEIGHT / 2 - COUNTER_INSET)
        const y = (centre.y ?? 0) + sy * (CARD_WIDTH / 2 - COUNTER_INSET)
        return (
          <div key={pile} css={[counterCss, placeCss(x, y), growCss(sx), isPlayedDown(pile) && playedDownCss]}>
            <span css={figureCss}>{label(pile)}</span>
          </div>
        )
      })}
    </>
  )
}

const placeCss = (x: number, y: number) => css`
  left: ${TABLE_WIDTH / 2 + x}em;
  top: ${TABLE_HEIGHT / 2 + y}em;
`

const playedDownCss = css`
  filter: brightness(0.45);
`

/** A rounded label, as high as the former round counter, whose end stays in the corner of the card. */
const counterCss = css`
  position: absolute;
  box-sizing: border-box;
  min-width: ${COUNTER_SIZE}em;
  height: ${COUNTER_SIZE}em;
  padding: 0 0.6em;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  border-radius: ${COUNTER_SIZE / 2}em;
  background: ${colors.plum};
  border: 0.1em solid ${colors.gold};
  box-shadow: 0 0.1em 0.3em rgba(0, 0, 0, 0.5);
  pointer-events: none;
`

/** Towards the right from a left corner (sx = -1), towards the left from a right corner (sx = 1). */
const growCss = (sx: number) => css`
  transform: translate(${sx < 0 ? `-${COUNTER_SIZE / 2}em` : `calc(-100% + ${COUNTER_SIZE / 2}em)`}, -50%) translateZ(1em);
`

// The box is trimmed to the height of the figure, so that the figure itself is centred.
const figureCss = css`
  font-family: ${fontDisplay};
  font-size: 1em;
  line-height: 1;
  text-box: trim-both cap alphabetic;
  color: ${colors.parchment};
`
