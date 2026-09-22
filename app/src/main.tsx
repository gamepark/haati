import { HaatiOptionsSpecV2 } from '@gamepark/haati/HaatiOptions'
import { HaatiRules } from '@gamepark/haati/HaatiRules'
import { HaatiSetup } from '@gamepark/haati/HaatiSetup'
import { GameProvider } from '@gamepark/react-game'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { gameAnimations } from './animations/GameAnimations'
import { App } from './App'
import { Locators } from './locators/Locators'
import { Material } from './material/Material'

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
    >
      <App />
    </GameProvider>
  </StrictMode>
)
