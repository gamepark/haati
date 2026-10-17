import { css, keyframes } from '@emotion/react'

/** A golden glow around the shape of the element, beating slowly. */
const shine = keyframes`
  0%, 100% { filter: drop-shadow(0 0 0.15em rgba(255, 214, 120, 0.6)); }
  50% { filter: drop-shadow(0 0 0.6em rgba(255, 214, 120, 1)); }
`

/** What a popup of the tutorial points out shines in gold. */
export const tutorialShineCss = css`
  animation: ${shine} 1.6s ease-in-out infinite;
`

/**
 * An empty place fills in: its picture, grey and faded, takes its colours, then shines (see tutorialShineCss).
 * No transform here: the table places the elements with theirs.
 */
const fillIn = keyframes`
  from { filter: grayscale(1); opacity: 0.35; }
  to { filter: grayscale(0); opacity: 1; }
`

export const tutorialFillInCss = css`
  animation:
    ${fillIn} 0.8s ease-out both,
    ${shine} 1.6s ease-in-out 0.8s infinite;
`
