import { applyAutomaticMoves, ItemMoveType, MaterialGame, MaterialMove } from '@gamepark/rules-api'
import { describe, expect, it } from 'vitest'
import { HaatiRules } from './HaatiRules'
import { HaatiSetup } from './HaatiSetup'
import { Animal, beats, hasCollection } from './material/Animal'
import { CHARACTER_HAND_LIMIT } from './material/Character'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { gainPrestige, prestigeLocation } from './material/Prestige'
import { RuleId } from './rules/RuleId'

type Game = MaterialGame<number, MaterialType, LocationType, RuleId>

const MOVES_PER_GAME = 2000

const card = (animal: Animal, value: number) => animal * 10 + value

/**
 * Whole games played at random, from the setup to the victory: the rules must always offer a legal
 * move, never lose a card, and always reach the end of the game.
 */
const playRandomGame = (): { game: Game; moves: number } => {
  const game: Game = new HaatiSetup().setup({ players: 2 })
  let moves = 0
  while (game.rule && moves < MOVES_PER_GAME) {
    const rules = new HaatiRules(game)
    const active = game.rule.player !== undefined ? [game.rule.player] : (game.rule.players ?? [])
    expect(active, `no active player on rule ${game.rule.id}`).not.toHaveLength(0)
    const player = active[Math.floor(Math.random() * active.length)]
    const legal = rules.getLegalMoves(player)
    expect(legal, `no legal move for player ${player} on rule ${game.rule.id}`).not.toHaveLength(0)
    applyAutomaticMoves(rules, [legal[Math.floor(Math.random() * legal.length)] as MaterialMove])
    moves++
    check(game)
  }
  return { game, moves }
}

const check = (game: Game) => {
  const rules = new HaatiRules(game)
  expect(rules.material(MaterialType.AnimalCard).length).toBe(24)
  expect(rules.material(MaterialType.CharacterCard).length).toBe(8)
  expect(rules.material(MaterialType.RoundVictoryToken).getQuantity()).toBe(2)
  for (const player of game.players) {
    const characters = rules.material(MaterialType.CharacterCard).location(LocationType.PlayerHand).player(player).length
    if (game.rule?.id !== RuleId.DiscardCharacter) expect(characters).toBeLessThanOrEqual(CHARACTER_HAND_LIMIT)
    expect(rules.material(MaterialType.AnimalCard).location(LocationType.PlayerHand).player(player).length).toBeLessThanOrEqual(2)
    // Prestige is always held in the fewest tokens: at most one 3 and two 1.
    for (const type of [MaterialType.Favor, MaterialType.Honor]) {
      const tokens = rules.material(type).location(LocationType.PlayerPrestige).player(player)
      expect(tokens.id(3).getQuantity()).toBeLessThanOrEqual(1)
      expect(tokens.id(1).getQuantity()).toBeLessThanOrEqual(2)
    }
  }
}

describe('Haati', () => {
  it('decides duels', () => {
    expect(beats(card(Animal.Elephant, 1), card(Animal.Tiger, 8))).toBe(true)
    expect(beats(card(Animal.Tiger, 1), card(Animal.Mouse, 8))).toBe(true)
    expect(beats(card(Animal.Mouse, 1), card(Animal.Elephant, 8))).toBe(true)
    expect(beats(card(Animal.Tiger, 8), card(Animal.Elephant, 1))).toBe(false)
    expect(beats(card(Animal.Mouse, 5), card(Animal.Mouse, 4))).toBe(true)
    expect(beats(card(Animal.Mouse, 4), card(Animal.Mouse, 5))).toBe(false)
  })

  it('finds collections of 4 consecutive values', () => {
    expect(hasCollection([card(Animal.Mouse, 3), card(Animal.Tiger, 1), card(Animal.Elephant, 4), card(Animal.Mouse, 2)])).toBe(true)
    expect(hasCollection([card(Animal.Mouse, 3), card(Animal.Tiger, 3), card(Animal.Elephant, 4), card(Animal.Mouse, 2)])).toBe(false)
    expect(hasCollection([card(Animal.Mouse, 5), card(Animal.Tiger, 8), card(Animal.Elephant, 6), card(Animal.Mouse, 7), card(Animal.Mouse, 1)])).toBe(true)
  })

  it('exchanges three 1 for a 3, taking before giving back', () => {
    const game: Game = new HaatiSetup().setup({ players: 2 })
    const rules = new HaatiRules(game)
    const player = game.players[0]
    game.items[MaterialType.Favor] = [{ id: 1, location: prestigeLocation(player), quantity: 2 }]
    expect(gainPrestige(rules, MaterialType.Favor, player, 1)).toMatchObject([
      { type: ItemMoveType.Create, item: { id: 3, location: prestigeLocation(player), quantity: 1 } },
      { type: ItemMoveType.Delete, itemIndex: 0, quantity: 2 }
    ])
  })

  it('plays whole random games to their end', { timeout: 30_000 }, () => {
    for (let i = 0; i < 200; i++) {
      const { game, moves } = playRandomGame()
      expect(game.rule, `game not over after ${moves} moves`).toBeUndefined()
      const rules = new HaatiRules(game)
      const scores = game.players.map((player) => rules.getScore(player))
      expect(Math.max(...scores)).toBe(2)
      expect(scores.reduce((a, b) => a + b)).toBe(2)
    }
  })
})
