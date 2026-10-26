import { css } from '@emotion/react'
import { DevToolsHub, GameTable, GameTableNavigation } from '@gamepark/react-game'
import { TABLE_HEIGHT, TABLE_WIDTH, ZOOM_BUTTONS_LEFT, ZOOM_BUTTONS_TOP } from './locators/TableLayout'
import { PlayerPanels } from './panels/PlayerPanels'
import { HandHoverStyles } from './material/HandHoverStyles'
import { TutorialFocusEffects } from './tutorial/TutorialFocusEffects'
import { AnimalDeckCounters } from './panels/AnimalDeckCounters'
import { TurnAnnouncement } from './panels/TurnAnnouncement'
import { RoundWonAnnouncement } from './panels/RoundWonAnnouncement'
import { LastTakenCards } from './panels/LastTakenCards'

const margin = { top: 7, left: 0, right: 0, bottom: 0 }

export function GameDisplay() {
  return (
    <>
      <GameTable
        xMin={-TABLE_WIDTH / 2}
        xMax={TABLE_WIDTH / 2}
        yMin={-TABLE_HEIGHT / 2}
        yMax={TABLE_HEIGHT / 2}
        margin={margin}
        css={process.env.NODE_ENV === 'development' && tableBorder}
      >
        <GameTableNavigation css={navigationCss} />
        <PlayerPanels />
        <TutorialFocusEffects />
        <HandHoverStyles />
        <AnimalDeckCounters />
        <LastTakenCards />
        <TurnAnnouncement />
        <RoundWonAnnouncement />
        {process.env.NODE_ENV === 'development' && <DevToolsHub fabBottom="calc(5em)" />}
      </GameTable>
    </>
  )
}

const tableBorder = css`
  border: 1px solid white;
`

/**
 * One centimetre of the table, in em of the page, before any zoom: the framework fits the table in the
 * height left under the top margin, and centres it.
 */
const CM = (100 - margin.top - margin.bottom) / TABLE_HEIGHT

/** The zoom buttons, one above the other, below the viewer's panel. They stay put when the table is zoomed. */
const navigationCss = css`
  flex-direction: column;
  top: ${margin.top + ZOOM_BUTTONS_TOP * CM}em;
  left: calc(50vw - ${(TABLE_WIDTH / 2 - ZOOM_BUTTONS_LEFT) * CM}em);
`
