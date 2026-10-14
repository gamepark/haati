/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ItemMenuButton } from '@gamepark/react-game'
import { MaterialMove } from '@gamepark/rules-api'
import { useTranslation } from 'react-i18next'
import { colors } from './colors'
import { fontDisplay } from './index'

/** One thing a player may do to the item the buttons are laid over. */
export type ItemAction = {
  move: MaterialMove
  icon: IconDefinition
  /** Translation key of the label shown beside the button. */
  title: string
}

/**
 * The buttons laid over a card or a token, in a row centred on it. Plum discs with a gold rim, like
 * the backs of the Character cards, each with its label so that the action never has to be guessed.
 */
export const ItemActions = ({ actions, x = 0, y = 0 }: { actions: ItemAction[]; x?: number; y?: number }) => {
  const { t } = useTranslation()
  return (
    <>
      {actions.map((action, index) => (
        <ItemMenuButton
          key={index}
          css={buttonCss}
          x={x + (index - (actions.length - 1) / 2) * 2.6}
          y={y}
          move={action.move}
          label={t(action.title)}
          labelPosition="right"
        >
          <FontAwesomeIcon icon={action.icon} />
        </ItemMenuButton>
      ))}
    </>
  )
}

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

  > span {
    font-size: 0.8em;
    font-family: ${fontDisplay};
    color: ${colors.plumDeep};
    background: ${colors.parchment};
    border: 0.1em solid ${colors.gold};
    border-radius: 0.35em;
    padding: 0.2em 0.6em;
    box-shadow: 0 0.12em 0.35em rgba(0, 0, 0, 0.4);
    white-space: nowrap;
  }
`
