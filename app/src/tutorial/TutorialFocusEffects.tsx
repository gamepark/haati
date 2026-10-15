/** @jsxImportSource @emotion/react */
import { css, Global } from '@emotion/react'
import { HaatiRules } from '@gamepark/haati/HaatiRules'
import { useFocusContext, useMaterialContext, useRules } from '@gamepark/react-game'
import { useEffect } from 'react'
import { haatiTutorial } from './Tutorial'

/** How long the view takes to zoom out, before it zooms in on the focus of a step marked `zoomOutFirst`. */
const ZOOM_OUT_TIME = 1300

/**
 * Adjustments of the tutorial display, which only apply during the tutorial:
 * - while a popup focuses on some material, the table background is darkened like the material left
 *   out of the focus, so that the focused elements stand out;
 * - once the player closes a popup ("OK") or plays the expected move, the view zooms out before the game
 *   goes on, so that the moves that follow are seen on the whole table. The next popup zooms in again if
 *   it has a focus;
 * - a step marked `zoomOutFirst` shows the whole table before zooming in on its focus, so that the player
 *   sees where the view goes.
 */
export const TutorialFocusEffects = () => {
  const rules = useRules<HaatiRules>()
  const context = useMaterialContext()
  const { focus, setFocus } = useFocusContext()
  const tutorial = rules?.game.tutorial
  const step = tutorial ? haatiTutorial.steps[tutorial.step] : undefined
  const popupClosed = tutorial?.popupClosed
  const stepComplete = tutorial?.stepComplete

  useEffect(() => {
    if (popupClosed || stepComplete) setFocus(undefined, true)
  }, [popupClosed, stepComplete, setFocus])

  useEffect(() => {
    if (!step?.zoomOutFirst || !step.focus || !rules) return
    // After the focus the framework applies at once: zoom out, then focus again.
    const zoomOut = setTimeout(() => setFocus(undefined, true))
    const zoomIn = setTimeout(
      () => setFocus({ materials: [], staticItems: [], locations: [], highlight: true, ...step.focus!(rules.game, context) }),
      ZOOM_OUT_TIME
    )
    return () => {
      clearTimeout(zoomOut)
      clearTimeout(zoomIn)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  if (!tutorial) return null
  return <Global styles={[veilCss, focus?.highlight && shownCss]} />
}

const veilCss = css`
  #root::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    opacity: 0;
    transition: opacity 0.6s;
    pointer-events: none;
  }
`

const shownCss = css`
  #root::before {
    opacity: 1;
  }
`
