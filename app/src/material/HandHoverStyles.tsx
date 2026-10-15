/** @jsxImportSource @emotion/react */
import { css, Global } from '@emotion/react'
import { useEffect } from 'react'
import { HAND_CARD_LABEL, HAND_HOVER_LIFT, HAND_HOVER_SCALE, HAND_HOVER_TIME } from './handHover'

/**
 * The hover of the cards in hand, written here rather than left to the framework, whose hover doubles
 * the card and lifts it high: the pointer then left the card while still on its picture, and the buttons,
 * drawn apart from the card, stayed where they were.
 *
 * A card counts as hovered while the pointer is on it or on its buttons (in the element right after the
 * card, when the card has buttons: otherwise that element is another item of the table, which must not
 * count). Its buttons follow it, and the buttons of the other cards fade out meanwhile: the page is marked
 * while a card of the hand is hovered, since CSS cannot look for a hovered card from the page itself.
 *
 * The element of an item holds the component of the card, which wears the label of the cards in hand,
 * and inside it the wrapper the hover transforms.
 */
const card = `div:has(> [class*='${HAND_CARD_LABEL}'])`
const hovered = `${card}:is(:hover, :has(+ div > [data-hand-actions]:hover))`
const hoverTransform = `translateY(-${HAND_HOVER_LIFT}em) scale(${HAND_HOVER_SCALE})`
const HAND_HOVERED = 'hand-hovered'

export const HandHoverStyles = () => {
  useEffect(() => {
    const root = document.getElementById('root')
    const onPointerOver = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : undefined
      root?.classList.toggle(HAND_HOVERED, !!target?.closest(`${card}, [data-hand-actions]`))
    }
    document.addEventListener('pointerover', onPointerOver)
    return () => {
      document.removeEventListener('pointerover', onPointerOver)
      root?.classList.remove(HAND_HOVERED)
    }
  }, [])
  return <Global styles={styles} />
}

const styles = css`
  ${card} > * > * {
    transition: transform ${HAND_HOVER_TIME} ease-out;
  }

  [data-hand-actions] {
    transition:
      transform ${HAND_HOVER_TIME} ease-out,
      opacity ${HAND_HOVER_TIME};
  }

  @media (hover) {
    ${hovered} > * > * {
      transform: translateZ(1em) rotateZ(calc(-1 * var(--hand-angle))) ${hoverTransform};
    }

    #root.${HAND_HOVERED} [data-hand-actions] {
      opacity: 0;
      pointer-events: none;
    }

    #root.${HAND_HOVERED} ${hovered} + div [data-hand-actions] {
      opacity: 1;
      pointer-events: auto;
      transform: ${hoverTransform} !important;
    }
  }
`
