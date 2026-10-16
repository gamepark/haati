/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { HaatiRules } from '@gamepark/haati/HaatiRules'
import { LocationType } from '@gamepark/haati/material/LocationType'
import { MaterialType } from '@gamepark/haati/material/MaterialType'
import { animalPiles } from '@gamepark/haati/rules/NewRoundRule'
import { useFocusContext, useMaterialContext, useRules } from '@gamepark/react-game'
import { maxBy } from 'es-toolkit'
import { Locators } from '../locators/Locators'
import { CARD_HEIGHT, CARD_WIDTH, TABLE_HEIGHT, TABLE_WIDTH } from '../locators/TableLayout'
import { colors } from '../theme/colors'
import { fontDisplay } from '../theme'

const COUNTER_SIZE = 1.8
/** From the edges of the card to the edge of the counter. */
const COUNTER_MARGIN = 0.25
const COUNTER_INSET = COUNTER_SIZE / 2 + COUNTER_MARGIN

/**
 * The number of cards left in each pile of Animal cards, the revealed one included, in the corner of
 * the top card towards the board, a few millimetres from its edges, opposite to the values printed on
 * the card. The piles lie sideways, a card height wide and a card width high: the top of the card is
 * on the right of the pile above the board, on the left of the pile below it.
 */
export const AnimalDeckCounters = () => {
  const rules = useRules<HaatiRules>()
  const context = useMaterialContext()
  const { focus } = useFocusContext()
  if (!rules) return null
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
        // An empty pile speaks for itself: a counter showing 0 would float alone on the table.
        if (!top) return null
        const centre = Locators[LocationType.AnimalDeck]!.getItemCoordinates(top.item, {
          ...context,
          type: MaterialType.AnimalCard,
          index: top.index,
          displayIndex: 0
        })
        const sx = pile === 1 ? -1 : 1
        const sy = pile === 1 ? 1 : -1
        const x = (centre.x ?? 0) + sx * (CARD_HEIGHT / 2 - COUNTER_INSET)
        const y = (centre.y ?? 0) + sy * (CARD_WIDTH / 2 - COUNTER_INSET)
        return (
          <div key={pile} css={[counterCss, placeCss(x, y), isPlayedDown(pile) && playedDownCss]}>
            <span css={figureCss}>{pileCards.length}</span>
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

const counterCss = css`
  position: absolute;
  box-sizing: border-box;
  width: ${COUNTER_SIZE}em;
  height: ${COUNTER_SIZE}em;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: ${colors.plum};
  border: 0.1em solid ${colors.gold};
  box-shadow: 0 0.1em 0.3em rgba(0, 0, 0, 0.5);
  transform: translate(-50%, -50%) translateZ(1em);
  pointer-events: none;
`

// The box is trimmed to the height of the figure, so that the figure itself is centred.
const figureCss = css`
  font-family: ${fontDisplay};
  font-size: 1em;
  line-height: 1;
  text-box: trim-both cap alphabetic;
  color: ${colors.parchment};
`
