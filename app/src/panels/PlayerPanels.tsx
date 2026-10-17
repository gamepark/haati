/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { HaatiRules } from '@gamepark/haati/HaatiRules'
import { LocationType } from '@gamepark/haati/material/LocationType'
import { MaterialType } from '@gamepark/haati/material/MaterialType'
import { countPrestige, PrestigeType } from '@gamepark/haati/material/Prestige'
import { StyledPlayerPanel, useFocusContext, usePlay, usePlayers, useRules } from '@gamepark/react-game'
import { MaterialMove, MaterialMoveBuilder } from '@gamepark/rules-api'
import { useTranslation } from 'react-i18next'
import { PanelArea, PLAYER_BAND_BOTTOM, PLAYER_PANEL_HEIGHT, PLAYER_PANEL_WIDTH, PLAYER_PANEL_X, TABLE_HEIGHT, TABLE_WIDTH } from '../locators/TableLayout'
import { colors } from '../theme/colors'
import { fontDisplay } from '../theme'
import { getTurn } from './RoundProgress'
import characterBack from '../images/cards/CharacterBack.jpg'
import favor from '../images/tokens/prestige/Favor1.png'
import honor from '../images/tokens/prestige/Honor1.png'

/** The width of a StyledPlayerPanel in its own em. */
const PANEL_EM_WIDTH = 28

/**
 * The Prestige token lying along the tiles of the Favor and Honor totals: wider than the tile, and long
 * enough for the value printed at its top to fall beyond the right edge.
 */
const TOKEN_WIDTH = 2.6
const TOKEN_LENGTH = (TOKEN_WIDTH * 5.76) / 1.63

/**
 * Each panel lies on the table, in the top corner of its owner's side: the viewer on the left, the
 * opponent on the right. Under the name of the player, the turn in progress beside their time left, the value of their Favor and of their Honor
 * tokens, then their Prestige, the sum of both, which wins the round. A click on any of them opens
 * its help.
 */
export const PlayerPanels = () => {
  const { t } = useTranslation()
  const players = usePlayers<number>({ sortFromMe: true })
  const rules = useRules<HaatiRules>()
  const play = usePlay<MaterialMove>()
  const { focus } = useFocusContext()
  if (!rules) return null
  // During a focus of the tutorial, a panel is darkened like the material, but for the areas the focus is on.
  const litAreas = (player: number): PanelArea[] =>
    !focus?.highlight
      ? [PanelArea.Whole]
      : (focus.locations ?? [])
          .filter((location) => location.type === LocationType.PlayerPrestige && location.player === player)
          .map((location) => location.id as PanelArea)
  const prestigeHelp = (type: PrestigeType, player: number) =>
    play(MaterialMoveBuilder.displayMaterialHelp(type, { id: 1, location: { type: LocationType.PlayerPrestige, player } }), { local: true })
  return (
    <>
      {players.map((player, index) => {
        const favorTotal = countPrestige(rules, MaterialType.Favor, player.id)
        const honorTotal = countPrestige(rules, MaterialType.Honor, player.id)
        const lit = litAreas(player.id)
        const isLit = (area: PanelArea) => lit.includes(area)
        const turnCounter = {
          image: '',
          value: t('panel.turn', { turn: getTurn(rules) }),
          imageCss: noImageCss,
          extraCss: [turnCounterCss, isLit(PanelArea.Turn) && litTurnCss]
        }
        return (
          <div key={player.id} css={[blockCss, blockPlace(index === 0), !isLit(PanelArea.Whole) && playedDownCss]}>
            <StyledPlayerPanel player={player} activeRing mainCounter={turnCounter} css={panelCss} />
            <div css={[tilesCss, isLit(PanelArea.Tiles) && litAreaCss]}>
              <button css={[tileCss, favorCss]} onClick={() => prestigeHelp(MaterialType.Favor, player.id)} aria-label={t('help.prestige.favor.title')}>
                <span css={figureCss}>{favorTotal}</span>
              </button>
              <button css={[tileCss, honorCss]} onClick={() => prestigeHelp(MaterialType.Honor, player.id)} aria-label={t('help.prestige.honor.title')}>
                <span css={figureCss}>{honorTotal}</span>
              </button>
            </div>
            <button
              css={[tileCss, prestigeCss, isLit(PanelArea.Prestige) && litAreaCss]}
              onClick={() => play(MaterialMoveBuilder.displayLocationHelp({ type: LocationType.PlayerPrestige, player: player.id }), { local: true })}
            >
              <span css={prestigeTextCss}>{t('panel.prestige', { count: favorTotal + honorTotal })}</span>
            </button>
          </div>
        )
      })}
    </>
  )
}

const blockPlace = (left: boolean) => css`
  left: ${(left ? -PLAYER_PANEL_X - PLAYER_PANEL_WIDTH : PLAYER_PANEL_X) + TABLE_WIDTH / 2}em;
  top: ${PLAYER_BAND_BOTTOM + TABLE_HEIGHT / 2}em;
  transform: translateY(-100%);
`

/** The whole block wears the parchment and the gold rim the panel alone wore before. */
const blockCss = css`
  position: absolute;
  width: ${PLAYER_PANEL_WIDTH}em;
  height: ${PLAYER_PANEL_HEIGHT}em;
  box-sizing: border-box;
  padding: 0.25em;
  display: flex;
  flex-direction: column;
  gap: 0.25em;
  border-radius: 0.6em;
  background: linear-gradient(160deg, ${colors.parchment} 0%, ${colors.sand} 100%);
  border: 0.1em solid ${colors.gold};
  box-shadow: 0 0.15em 0.4em rgba(0, 0, 0, 0.35);

  /* A veil over the whole block, as dark as the material out of the focus (playedDownCss): the areas of the
     panel the focus is on rise above it (litAreaCss). It lies above the layers of the framework's panel (z-index up to 3). */
  &::after {
    content: '';
    position: absolute;
    inset: -0.1em;
    z-index: 10;
    border-radius: inherit;
    background: rgba(0, 0, 0, 0.55);
    opacity: 0;
    transition: opacity 0.6s;
    pointer-events: none;
  }
`

const playedDownCss = css`
  &::after {
    opacity: 1;
  }
`

const litAreaCss = css`
  position: relative;
  z-index: 11;
`

/**
 * The turn counter is a flex item of the framework's panel: its z-index applies as it is. Made relative, it would
 * move by the offsets the framework gives it (top: 1.7em).
 */
const litTurnCss = css`
  z-index: 11;
`

const panelCss = css`
  position: relative;
  flex: none;
  font-size: ${(PLAYER_PANEL_WIDTH - 0.7) / PANEL_EM_WIDTH}em;
  background: transparent;
  border: none;
  box-shadow: none;
  --gp-ring-color-1: ${colors.gold};
  --gp-ring-color-2: ${colors.plumLight};

  /* A bigger avatar than the framework's, with its turn ring: the ring is the block just before the name. */
  > div:first-of-type,
  > div:has(+ h2) {
    width: 7.2em;
    height: 7.2em;
  }
`

/** The turn, in the badge style of the timer, on its left: the framework puts the main counter on its right. */
const turnCounterCss = css`
  order: -1;
  width: auto;

  > span {
    width: auto;
  }
`

const noImageCss = css`
  display: none;
`

/** Below the name, the row of the Favor and Honor tiles and the Prestige band share the height left equally. */
const tilesCss = css`
  flex: 1;
  display: flex;
  gap: 0.25em;
`

const tileCss = css`
  position: relative;
  flex: 1;
  min-height: 0;
  padding: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.35em;
  border: 0.08em solid ${colors.gold};
  font-size: 1em;
  cursor: pointer;

  &:hover {
    border-color: ${colors.goldLight};
    box-shadow: 0 0 0.3em ${colors.goldLight};
  }
`

/**
 * A Prestige token laid along the tile: its hands on the left, the value printed at its top cut off on
 * the right. A veil of its own colour keeps the figure readable.
 */
const lyingToken = (image: string, veil: string) => css`
  background-color: ${veil};

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: calc(50% - ${TOKEN_WIDTH / 2}em);
    width: ${TOKEN_WIDTH}em;
    height: ${TOKEN_LENGTH}em;
    background: url(${image}) center / 100% 100% no-repeat;
    transform-origin: top left;
    transform: translateX(${TOKEN_LENGTH}em) rotate(90deg);
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: ${veil};
    opacity: 0.45;
  }
`

const favorCss = css`
  ${lyingToken(favor, '#fffdf6')};
  color: ${colors.ink};
`

const honorCss = css`
  ${lyingToken(honor, '#1d1712')};
  color: ${colors.goldLight};
`

const figureCss = css`
  position: relative;
  z-index: 1;
  font-family: ${fontDisplay};
  font-size: 1.3em;
  line-height: 1;
  text-box: trim-both cap alphabetic;
`

/** The plum back of the Character cards, zoomed in past its white border and darkened. */
const prestigeCss = css`
  background: url(${characterBack}) center / 160% auto no-repeat;
  color: ${colors.parchment};

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: ${colors.plumDeep};
    opacity: 0.35;
  }
`

const prestigeTextCss = css`
  position: relative;
  z-index: 1;
  font-family: ${fontDisplay};
  font-size: 1.1em;
  line-height: 1;
  text-box: trim-both cap alphabetic;
  white-space: nowrap;
  text-shadow: 0 0.05em 0.2em rgba(0, 0, 0, 0.6);
`
