/** @jsxImportSource @emotion/react */
import { css, Global } from '@emotion/react'
import { HaatiRules } from '@gamepark/haati/HaatiRules'
import { useFocusContext, useRules } from '@gamepark/react-game'
import { RuleId } from '@gamepark/haati/rules/RuleId'
import { useEffect, useState } from 'react'
import { getRound, getTurn } from '../panels/RoundProgress'
import { TURN_ANNOUNCEMENT_DURATION } from '../panels/TurnAnnouncement'
import { haatiTutorial, isPlayerMoveExpected } from './Tutorial'

/** How long the view takes to reach the focus of a step marked `focusFirst`, before its popup shows (ms). */
const FOCUS_TIME = 1000

/**
 * Adjustments of the tutorial display, which only apply during the tutorial:
 * - while a popup focuses on some material, the table background is darkened like the material left
 *   out of the focus, so that the focused elements stand out;
 * - once the player closes a popup ("OK") or plays the expected move, the view zooms out before the game
 *   goes on, so that the moves that follow are seen on the whole table. The next popup zooms in again if
 *   it has a focus;
 * - a step marked `focusFirst` shows its popup once the view has reached its focus, so that the player
 *   sees where the view goes;
 * - a popup asking for a move of the player has no "OK" button;
 * - no popup leaves the screen, and none shows while a turn is announced.
 */
export const TutorialFocusEffects = () => {
  const rules = useRules<HaatiRules>()
  const { focus, setFocus } = useFocusContext()
  const tutorial = rules?.game.tutorial
  const step = tutorial ? haatiTutorial.steps[tutorial.step] : undefined
  const popupClosed = tutorial?.popupClosed
  const stepComplete = tutorial?.stepComplete

  useEffect(() => {
    if (popupClosed || stepComplete) setFocus(undefined, true)
  }, [popupClosed, stepComplete, setFocus])

  // The turn being announced (see TurnAnnouncement): its popup waits for the end of the announcement.
  const announcedTurn = rules?.game.rule?.id === RuleId.ChooseCards ? `${getRound(rules)}-${getTurn(rules)}` : undefined
  const [announcing, setAnnouncing] = useState(false)
  useEffect(() => {
    if (!announcedTurn) return
    setAnnouncing(true)
    const end = setTimeout(() => setAnnouncing(false), TURN_ANNOUNCEMENT_DURATION * 1000)
    return () => {
      clearTimeout(end)
      setAnnouncing(false)
    }
  }, [announcedTurn])

  // A step marked `focusFirst` shows its popup once the view has reached its focus.
  const [focusing, setFocusing] = useState(false)
  useEffect(() => {
    if (!step?.focusFirst) return
    setFocusing(true)
    const shown = setTimeout(() => setFocusing(false), FOCUS_TIME)
    return () => {
      clearTimeout(shown)
      setFocusing(false)
    }
  }, [step])

  if (!tutorial) return null
  return (
    <Global
      styles={[
        veilCss,
        focus?.highlight && shownCss,
        isPlayerMoveExpected(rules.game) && noOkCss,
        popupOnScreenCss(step?.popup?.position),
        (announcing || focusing) && hiddenPopupCss
      ]}
    />
  )
}

/** The popup's dialog: the box holding the line of its buttons, "Previous" among them. */
const POPUP = `div:has(> div > p > button svg[data-icon='backward'])`

/** While a turn is announced, the popup waits hidden: it would hide the announcement. */
const hiddenPopupCss = css`
  ${POPUP} {
    visibility: hidden;
  }
`

/**
 * The popups are placed by a shift from the middle of the screen, set for a 16:9 screen: on another shape of
 * screen, the shift is cut short at the edges, so that no popup leaves the screen (nor hides the top bar).
 */
const popupOnScreenCss = (position: { x?: number; y?: number } = {}) => css`
  ${POPUP} {
    transform: translate(
      clamp(calc(50% - 50vw + 1em), ${position.x ?? 0}em, calc(50vw - 50% - 1em)),
      clamp(calc(50% - 50vh + 6em), ${position.y ?? 0}em, calc(50vh - 50% - 1em))
    ) !important;
  }
`

/**
 * While a popup asks the player for a move, its "OK" button is hidden: the step goes on once the move is played.
 * The button is the only one of the screen with the "play" icon.
 */
const noOkCss = css`
  button:has(svg[data-icon='play']) {
    display: none;
  }
`

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
