import { css, keyframes } from '@emotion/react'
import { LocationType } from '@gamepark/haati/material/LocationType'
import { MaterialType } from '@gamepark/haati/material/MaterialType'
import { ItemContext, MaterialAnimations, MaterialContext, transformItem } from '@gamepark/react-game'
import { GridBoundaries, isMoveItemType, MaterialGame, MaterialMove, MaterialRules, MoveItem } from '@gamepark/rules-api'

/** What this file reads of the framework's animation (react-client's Animation type, not a dependency of the app). */
export type MoveAnimation = Parameters<MaterialAnimations['getItemAnimation']>[1]

/**
 * An Animal card that enters a Palace or a Jungle row, or leaves one, in two steps. The rows are sorted
 * by value, so the card often goes between two others: first the cards of the rows make room for it (and
 * close the gap it leaves), then it flies straight to its place, above the others. Nothing moves once it
 * lands. The framework would only move the card, and the others would jump to their place afterwards.
 */
export const ROW_MOVE_DURATION = 900
/** The share of the animation in which the rows make room, before the card flies. */
const MAKE_ROOM_SHARE = 0.35

const isPlace = (type?: LocationType) => type === LocationType.Palace || type === LocationType.Jungle

/** An Animal card moved into a Palace or a Jungle, or out of one to another of them or to the discard (the Hunter). */
export const isRowMove = (move: MaterialMove, context: MaterialContext) => {
  if (!isMoveItemType(MaterialType.AnimalCard)(move)) return false
  const from = context.rules.material(MaterialType.AnimalCard).getItem(move.itemIndex).location
  return isPlace(move.location.type) || (isPlace(from.type) && move.location.type === LocationType.AnimalDiscard)
}

/** The animation of the framework, kept for a card dropped by the player: it is already where the pointer let go of it. */
export const frameworkAnimations = new MaterialAnimations()

type RulesCreator = new (game: MaterialGame, options: { player?: number }) => MaterialRules

/** The rules once the move is played, as the framework computes them for the card it moves. */
export const futureRules = (context: ItemContext, move: MaterialMove) => {
  const Rules = context.rules.constructor as unknown as RulesCreator
  const rules = new Rules(JSON.parse(JSON.stringify(context.rules.game)), { player: context.player })
  rules.play(move)
  return rules
}

export const rowMove = (context: ItemContext, animation: MoveAnimation, boundaries: GridBoundaries) => {
  if (context.type !== MaterialType.AnimalCard) return
  const move = animation.move as MoveItem
  const item = context.rules.material(MaterialType.AnimalCard).getItem(context.index)
  const moved = context.index === move.itemIndex
  if (!moved && !isPlace(item.location.type)) return
  const dropped = context.rules.game.droppedItems?.some((drop) => drop.type === context.type && drop.index === context.index)
  if (moved && dropped) return frameworkAnimations.getItemAnimation(context, animation, boundaries)

  const future = futureRules(context, move)
  const futureItem = future.material(MaterialType.AnimalCard).getItem(context.index)
  const description = context.material[context.type]
  const current = transformItem(context).join(' ')
  const target = (description?.getItemTransform(futureItem, { ...context, rules: future }) ?? []).join(' ')
  const pause = MAKE_ROOM_SHARE * 100

  if (moved) {
    // It waits while the rows make room, then flies, lifted above the others like any card the framework moves.
    const flight = keyframes`
      0%, ${pause}% { transform: ${current}; }
      100% { transform: ${target}; }
    `
    return description?.getAnimationCss(flight, animation.duration)
  }
  if (current === target) return
  // A card of a row slides to its new place while the moved card waits.
  const slide = keyframes`
    0% { transform: ${current}; }
    ${pause}%, 100% { transform: ${target}; }
  `
  return css`
    > * {
      animation: ${slide} ${animation.duration}s ease-in-out forwards;
    }
  `
}
