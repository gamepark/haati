/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck'
import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import favor from '../images/tokens/prestige/Favor1.png'
import honor from '../images/tokens/prestige/Honor1.png'
import roundVictory1 from '../images/tokens/RoundVictory1.png'
import roundVictory2 from '../images/tokens/RoundVictory2.png'
import { colors } from '../theme/colors'

const tokenCss = css`
  height: 2.4em;
  vertical-align: middle;
`

/** The bet of a Character card, as printed in its corners: a check or a cross in a small square. */
const betCss = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.2em;
  height: 1.2em;
  border-radius: 0.2em;
  background: ${colors.plum};
  color: ${colors.parchment};
  font-size: 0.85em;
  vertical-align: middle;
`

const elephantCss = css`
  display: flex;
  justify-content: center;
  margin-top: 0.5em;

  img {
    height: 5em;
  }
`

/*
 * The pictures of the texts. <Trans> hands the content of their tag to these components (none here), which
 * ignore it: an <img> given directly would receive it, which React forbids.
 */
export const Favor = () => <img src={favor} alt="" css={tokenCss} />
export const Honor = () => <img src={honor} alt="" css={tokenCss} />
export const Win = () => (
  <span css={betCss}>
    <FontAwesomeIcon icon={faCheck} />
  </span>
)
export const Lose = () => (
  <span css={betCss}>
    <FontAwesomeIcon icon={faXmark} />
  </span>
)
export const Elephant = () => (
  <span css={elephantCss}>
    <img src={roundVictory1} alt="" />
    <img src={roundVictory2} alt="" />
  </span>
)
