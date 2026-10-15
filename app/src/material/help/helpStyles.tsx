/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { colors } from '../../theme/colors'
import { fontDisplay } from '../../theme'

/**
 * The one look every help dialog wears: brown ink on the parchment of the board, plum for the
 * headings, and the gold rule of the rulebook to mark out a block.
 */

/** The name of the item, at the top of the dialog. */
export const helpTitle = css`
  font-family: ${fontDisplay};
  font-weight: normal;
  color: ${colors.plum};
  margin: 0 0 0.4em 0 !important;
  padding: 0 0 0.25em 0;
  border-bottom: 0.08em solid ${colors.gold};
  text-align: left !important;
`

/** What the item is, in a sentence or two. */
export const helpIntro = css`
  font-size: 0.95em;
  line-height: 1.5;
  color: ${colors.ink};
  margin: 0 0 0.8em 0;

  strong {
    color: ${colors.plum};
  }
`

/** A heading over a block, with a gold rule trailing off to the right. */
export const helpSection = css`
  display: flex;
  align-items: center;
  gap: 0.5em;
  font-family: ${fontDisplay};
  font-size: 0.85em;
  letter-spacing: 0.06em;
  color: ${colors.plum};
  margin: 0.9em 0 0.35em 0 !important;

  &::after {
    content: '';
    flex: 1;
    height: 0.08em;
    background: linear-gradient(90deg, ${colors.gold} 0%, rgba(201, 154, 59, 0.2) 60%, transparent 100%);
  }
`

/** What the item gives or asks for: the body of a dialog. */
export const helpBlock = css`
  font-size: 0.92em;
  line-height: 1.55;
  color: ${colors.ink};
  padding: 0.4em 0.7em;
  margin: 0 0 0.5em 0;
  background: rgba(204, 185, 145, 0.18);
  border-left: 0.25em solid ${colors.gold};
  border-radius: 0 0.3em 0.3em 0;

  strong {
    color: ${colors.plum};
  }

  ul,
  ol {
    margin: 0;
    padding-left: 1.2em;
  }

  li + li {
    margin-top: 0.25em;
  }
`

/** The block that applies right now, among several. */
export const helpBlockActive = css`
  border-left-color: ${colors.plum};
  background: rgba(102, 34, 75, 0.1);
`

/** Where the item currently stands, at the foot of the dialog. */
export const helpLocation = css`
  font-size: 0.85em;
  font-style: italic;
  color: ${colors.inkLight};
  margin: 1em 0 0 0;
  padding-top: 0.5em;
  border-top: 0.06em dashed rgba(140, 115, 84, 0.45);
`

/** Components given to every <Trans> of the help dialogs: bold, and superscript for ordinals (3<sup>e</sup>). */
export const helpComponents = { b: <strong />, sup: <sup /> }
