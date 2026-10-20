import { HaatiRules } from '@gamepark/haati/HaatiRules'
import { countPrestige, PrestigeSide } from '@gamepark/haati/material/Prestige'
import { wrapRulesWithTutorial } from '../../../node_modules/@gamepark/react-game/dist/components/tutorial/TutorialRulesWrapper.js'
import { applyAutomaticMoves, LocalMoveType, Material, MaterialGame, MaterialMove, MoveKind } from '@gamepark/rules-api'
import { describe, expect, it, vi } from 'vitest'
import { Tutorial } from './Tutorial'
import { me } from './TutorialSetup'

/**
 * The display is not loaded: it needs a browser. The tutorial only takes its base class from it, which
 * is rebuilt here from what it does — everything else it exports is a stand-in nobody calls (as in greylune).
 */
vi.mock('@gamepark/react-game', () => {
  class MaterialTutorial {
    declare setup: { setup(options: unknown, tutorial: unknown): MaterialGame }
    declare options: unknown
    declare players: unknown[]
    material(game: MaterialGame, type: number) {
      return new Material(type, game.items[type])
    }
    setupTutorial() {
      return [this.setup.setup(this.options, { step: 0, stepComplete: false, popupClosed: false }), this.players]
    }
  }
  // The theme spreads the default one, which the stand-ins must therefore provide.
  const defaultTheme = { root: { background: {} }, dialog: {} }
  const exports: Record<string | symbol, unknown> = { MaterialTutorial, defaultTheme }
  const isExport = (key: string | symbol) => typeof key === 'string' && /^[A-Za-z]/.test(key) && key !== 'then'
  return new Proxy(exports, { get: (target, key) => (isExport(key) ? (target[key] ??= function () {}) : target[key]) })
})

/**
 * The tutorial is a script played on the real rules: a step that lets nothing through, or a move the
 * rules no longer offer, leaves the player stuck with a popup and no way forward. So the whole script
 * is played here, every step taking the first move it lets through, as the opponent does.
 */
describe('Tutorial', () => {
  it('can be played to its last step', () => {
    const tutorial = new Tutorial()
    wrapRulesWithTutorial(tutorial, HaatiRules)
    const [game] = tutorial.setupTutorial()
    const rules = new HaatiRules(game as MaterialGame)
    const play = (move: MaterialMove) => applyAutomaticMoves(rules, [move])
    const local = (type: LocalMoveType, step?: number) => ({ kind: MoveKind.LocalMove, type, step }) as MaterialMove

    // Applying the setup's own automatic moves, as the client does when the tutorial opens.
    applyAutomaticMoves(rules)
    let guard = 0
    while (game.tutorial!.step < tutorial.steps.length) {
      expect(guard++).toBeLessThan(500)
      const step = tutorial.steps[game.tutorial!.step]
      if (!step.move) {
        play(local(LocalMoveType.SetTutorialStep, game.tutorial!.step + 1))
        continue
      }
      const player = step.move.player ?? me
      const moves = rules.getLegalMoves(player).filter((move) => move.kind !== MoveKind.LocalMove)
      if (moves.length) {
        play(moves[0])
      } else {
        expect(game.tutorial!.interrupt?.length, `step ${game.tutorial!.step} lets nothing through`).toBeTruthy()
        play(local(LocalMoveType.CloseTutorialPopup))
      }
    }

    // The round went the way the texts tell it: "Votre total de Prestige est donc de 8 : 7 Faveurs + 1 Honneur".
    expect(countPrestige(rules, PrestigeSide.Favor, me)).toBe(7)
    expect(countPrestige(rules, PrestigeSide.Honor, me)).toBe(1)
  })
})
