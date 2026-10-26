/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { LocationType } from '@gamepark/haati/material/LocationType'
import { MaterialType } from '@gamepark/haati/material/MaterialType'
import { LocationHelpProps, MaterialComponent, usePlay, usePlayerName } from '@gamepark/react-game'
import { MaterialMove, MaterialMoveBuilder } from '@gamepark/rules-api'
import { Trans, useTranslation } from 'react-i18next'
import { useLastTakenCard } from '../../history/lastTakenCard'
import { helpComponents, helpIntro, helpTitle } from './helpStyles'

/**
 * The help of a hand the viewer cannot see, opened from its (?) (see LastTakenCards): the card its owner
 * took at the last turn. A click on the card opens its own help, which covers this one.
 */
export const TakenCardHelp = ({ location }: LocationHelpProps) => {
  const { t } = useTranslation()
  const play = usePlay<MaterialMove>()
  const player = usePlayerName(location.player)
  const id = useLastTakenCard(location.player)
  if (id === undefined) return null
  const item = { id, location: { type: LocationType.PlayerHand, player: location.player } }
  return (
    <div css={balanceCss}>
      <h2 css={helpTitle}>{t('help.taken.title')}</h2>
      <p css={helpIntro}>
        <Trans i18nKey="help.taken.intro" values={{ player }} components={helpComponents} />
      </p>
      <MaterialComponent
        type={MaterialType.AnimalCard}
        itemId={id}
        css={cardCss}
        onClick={() => play(MaterialMoveBuilder.displayMaterialHelp(MaterialType.AnimalCard, item), { local: true })}
      />
    </div>
  )
}

/**
 * The framework pads the help of a location 3em on the left and 1em on the right of the dialog, to leave
 * room for a picture of the location on the left. This help has none: the right side gets 3em more, so
 * that the long title stays clear of the close button, and the left side 1em, so that both margins match
 * (in em of the dialog: the content is 2.4 times bigger). Below, room for the edge of the card, which the
 * scrolling area of the dialog would cut.
 */
const balanceCss = css`
  padding: 0 ${3 / 2.4}em 0.3em ${1 / 2.4}em;
`

/** The card is drawn in em of its centimetres: the font size sizes it. */
const cardCss = css`
  font-size: 2.5em;
  margin: 0 auto;
  cursor: pointer;
`
