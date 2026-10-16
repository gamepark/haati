/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faBolt } from '@fortawesome/free-solid-svg-icons/faBolt'
import { faBookOpen } from '@fortawesome/free-solid-svg-icons/faBookOpen'
import { faHand } from '@fortawesome/free-solid-svg-icons/faHand'
import { faHourglassEnd } from '@fortawesome/free-solid-svg-icons/faHourglassEnd'
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons/faLayerGroup'
import { faTrophy } from '@fortawesome/free-solid-svg-icons/faTrophy'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import jungle from '../../images/tokens/collection/Jungle1.png'
import palace from '../../images/tokens/collection/Palace1.png'
import favor from '../../images/tokens/prestige/Favor1.png'
import roundVictory from '../../images/tokens/RoundVictory1.png'

/**
 * The icons in front of the section headings of the help dialogs: a piece of the game when one says it
 * (the Palace and Jungle tokens, a Favor token, half of the golden elephant), a plain pictogram otherwise.
 */
const tokenCss = css`
  height: 2.2em;
  flex: none;
`

const pictogramCss = css`
  width: 1.1em;
  flex: none;
`

const token = (src: string) => {
  const Token = () => <img src={src} alt="" css={tokenCss} />
  return Token
}

const pictogram = (icon: IconDefinition) => {
  const Pictogram = () => <FontAwesomeIcon icon={icon} css={pictogramCss} />
  return Pictogram
}

export const PalaceIcon = token(palace)
export const JungleIcon = token(jungle)
export const FavorIcon = token(favor)
export const ElephantIcon = token(roundVictory)
export const RulesIcon = pictogram(faBookOpen)
export const EndOfRoundIcon = pictogram(faHourglassEnd)
export const VictoryIcon = pictogram(faTrophy)
export const ChooseIcon = pictogram(faHand)
export const DuelIcon = pictogram(faBolt)
export const RefillIcon = pictogram(faLayerGroup)
