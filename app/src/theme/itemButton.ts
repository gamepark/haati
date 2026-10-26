import { css } from '@emotion/react'
import { colors } from './colors'

/** A plum disc with a gold rim, the look of every button laid over the material. */
export const itemButtonCss = css`
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
