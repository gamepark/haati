import { HaatiOptionsSpecV2 } from '@gamepark/haati/HaatiOptions'
import { HaatiRules } from '@gamepark/haati/HaatiRules'
import { HaatiSetup } from '@gamepark/haati/HaatiSetup'
import { GameProvider } from '@gamepark/react-game'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { gameAnimations } from './animations/GameAnimations'
import { App } from './App'
import { HaatiHistory } from './history/HaatiHistory'
import { Locators } from './locators/Locators'
import { Material } from './material/Material'
import { haatiScoring } from './scoring/HaatiScoring'
import { theme } from './theme'
import { haatiTutorial } from './tutorial/Tutorial'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GameProvider
      game="haati"
      Rules={HaatiRules}
      optionsSpec={HaatiOptionsSpecV2}
      GameSetup={HaatiSetup}
      material={Material}
      locators={Locators}
      animations={gameAnimations}
      logs={new HaatiHistory()}
      scoring={haatiScoring}
      tutorial={haatiTutorial}
      theme={theme}
    >
      <App />
    </GameProvider>
  </StrictMode>
)
