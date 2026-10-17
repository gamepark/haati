import { css, keyframes } from '@emotion/react'
import { getValue } from '@gamepark/haati/material/Animal'
import { Collection, collectionPlace } from '@gamepark/haati/material/Collection'
import { LocationType } from '@gamepark/haati/material/LocationType'
import { MaterialType } from '@gamepark/haati/material/MaterialType'
import { ItemContext, MaterialContext, transformItem } from '@gamepark/react-game'
import { isMoveItemType, MaterialMove, MoveItem } from '@gamepark/rules-api'
import { goldSlide } from './BetShow'
import { futureRules, MoveAnimation } from './RowMove'

/**
 * A Collection token won: first the Animal cards of the run that wins it grow a little under the golden
 * shine of a won bet, while the token waits on its spot; then the token flies to the player and the shine
 * fades. Every card whose value belongs to the run shines, two cards of the same value included. When both
 * Collections are won at once, the tokens go one after the other, each one with its own row.
 */
export const COLLECTION_SHOW_DURATION = 1800
/** The share of the animation in which the run shines, before the token flies. */
const SHINE_SHARE = 0.5

/** A Collection token leaving its spot for the player who completed it. */
export const isCollectionWon = (move: MaterialMove, { rules }: MaterialContext) =>
  isMoveItemType(MaterialType.CollectionToken)(move) &&
  move.location.type === LocationType.PlayerCollection &&
  rules.material(MaterialType.CollectionToken).getItem(move.itemIndex).location.type === LocationType.CollectionSpot

/** The values that belong to 4 consecutive values or more. */
const runValues = (values: Set<number>) =>
  new Set([...values].filter((value) => [-3, -2, -1, 0].some((start) => [0, 1, 2, 3].every((i) => values.has(value + start + i)))))

const runPulse = keyframes`
  0%, 100% { scale: 1; }
  ${SHINE_SHARE * 50}%, ${SHINE_SHARE * 100}% { scale: 1.1; }
  ${SHINE_SHARE * 160}% { scale: 1; }
`

const shineFade = keyframes`
  0% { opacity: 0; }
  ${SHINE_SHARE * 25}%, ${SHINE_SHARE * 100}% { opacity: 1; }
  ${SHINE_SHARE * 160}%, 100% { opacity: 0; }
`

export const collectionShow = (context: ItemContext, animation: MoveAnimation) => {
  const move = animation.move as MoveItem
  const token = context.rules.material(MaterialType.CollectionToken).getItem<Collection>(move.itemIndex)

  if (context.type === MaterialType.CollectionToken) {
    if (context.index !== move.itemIndex) return
    // It waits on its spot while the run shines, then flies to the player.
    const future = futureRules(context, move)
    const description = context.material[context.type]
    const current = transformItem(context).join(' ')
    const target = (description?.getItemTransform(future.material(MaterialType.CollectionToken).getItem(context.index), { ...context, rules: future }) ?? []).join(' ')
    const flight = keyframes`
      0%, ${SHINE_SHARE * 100}% { transform: ${current}; }
      100% { transform: ${target}; }
    `
    return description?.getAnimationCss(flight, animation.duration)
  }

  if (context.type !== MaterialType.AnimalCard) return
  const item = context.rules.material(MaterialType.AnimalCard).getItem<number>(context.index)
  if (item.location.type !== collectionPlace[token.id] || item.location.player !== move.location.player) return
  const row = context.rules.material(MaterialType.AnimalCard).location(item.location.type).player(item.location.player)
  if (!runValues(new Set(row.getItems<number>().map((card) => getValue(card.id)))).has(getValue(item.id))) return
  return css`
    && > * > * > :first-child {
      overflow: hidden;
      animation: ${runPulse} ${animation.duration}s ease-in-out forwards;

      &:after {
        content: '';
        position: absolute;
        pointer-events: none;
        inset: -100%;
        z-index: 1;
        transform-style: preserve-3d;
        background: linear-gradient(
          to bottom right,
          rgba(255, 196, 64, 0) 34%,
          rgba(255, 196, 64, 0.8) 50%,
          rgba(255, 196, 64, 0) 66%
        );
        animation:
          ${goldSlide} ${animation.duration * SHINE_SHARE}s linear infinite,
          ${shineFade} ${animation.duration}s ease-in-out forwards;
      }
    }
  `
}
