/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ItemMenuButton } from '@gamepark/react-game'
import { MaterialMove } from '@gamepark/rules-api'
import { useTranslation } from 'react-i18next'
import { colors } from './colors'

/** One thing a player may do to the item the buttons are laid over. */
export type ItemAction = {
  move: MaterialMove
  icon: IconDefinition
  /** Translation key of the action, read out by screen readers: on screen, the icon says it. */
  title: string
}

/**
 * The buttons laid over a card or a token, in a row centred on it. Plum discs with a gold rim, like
 * the backs of the Character cards. The icon alone says the action, so that no label covers the
 * button of the next card; the help of the card explains them.
 *
 * The buttons of a card in hand are tilted with it (`angle`), and follow it when it is hovered (see
 * HandHoverStyles).
 */
export const ItemActions = ({ actions, x = 0, y = 0, angle }: { actions: ItemAction[]; x?: number; y?: number; angle?: number }) => {
  const { t } = useTranslation()
  const buttons = (
    <>
      {actions.map((action, index) => (
        <ItemMenuButton key={index} css={buttonCss} x={x + (index - (actions.length - 1) / 2) * 2.6} y={y} move={action.move} aria-label={t(action.title)}>
          <FontAwesomeIcon icon={action.icon} />
        </ItemMenuButton>
      ))}
    </>
  )
  if (angle === undefined) return buttons
  return (
    <div data-hand-actions css={handActionsCss} style={{ transform: `rotateZ(${angle}deg)` }}>
      {buttons}
    </div>
  )
}

/** The buttons of a card in hand turn around the centre of the card, like the card. */
const handActionsCss = css`
  width: 0;
  height: 0;
  transform-style: preserve-3d;

  > * {
    position: absolute;
  }
`

const buttonCss = css`
  width: 2.2em;
  height: 2.2em;
  border-radius: 50%;
  background: ${colors.plum};
  border: 0.12em solid ${colors.gold};
  color: ${colors.parchment};
  box-shadow: 0 0.15em 0.4em rgba(0, 0, 0, 0.45);
  transition: background 150ms ease;

  &:hover:not(:disabled) {
    background: ${colors.plumLight};
    border-color: ${colors.goldLight};
  }
`
