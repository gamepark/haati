import { css } from '@emotion/react'
import { DevToolsHub, GameTable, GameTableNavigation } from '@gamepark/react-game'
import { TABLE_HEIGHT, TABLE_WIDTH } from './locators/TableLayout'
import { PlayerPanels } from './panels/PlayerPanels'
import { HandHoverStyles } from './material/HandHoverStyles'
import { TutorialFocusEffects } from './tutorial/TutorialFocusEffects'
import { AnimalDeckCounters } from './panels/AnimalDeckCounters'

export function GameDisplay() {
  const margin = { top: 7, left: 0, right: 0, bottom: 0 }
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
        <GameTableNavigation />
        <PlayerPanels />
        <TutorialFocusEffects />
        <HandHoverStyles />
        <AnimalDeckCounters />
        {process.env.NODE_ENV === 'development' && <DevToolsHub fabBottom="calc(5em)" />}
      </GameTable>
    </>
  )
}

const tableBorder = css`
  border: 1px solid white;
`
