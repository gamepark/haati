import { css, keyframes } from '@emotion/react'
import { defaultTheme, GameTheme } from '@gamepark/react-game'
import background from '../images/background.jpg'
import { colors } from './colors'

// Yatra One echoes the Devanagari-inspired lettering of the box; Nunito stays for body text.
export const fontDisplay = `'Yatra One', Georgia, serif`
export const fontBody = `'Nunito', 'Segoe UI', sans-serif`

const buttonBase = css`
  background: ${colors.plum} !important;
  color: ${colors.parchment} !important;
  border: 0.12em solid ${colors.gold} !important;
  border-radius: 0.4em !important;
  padding: 0.3em 1em !important;
  font-family: ${fontDisplay};
  letter-spacing: 0.02em;
  cursor: pointer;
  box-shadow: 0 0.15em 0.35em rgba(62, 18, 48, 0.4);
  outline: none !important;
  transition:
    background 150ms ease,
    color 150ms ease;

  &:hover:not(:disabled),
  &:focus:hover:not(:disabled) {
    background: ${colors.gold} !important;
    color: ${colors.plumDeep} !important;
  }

  &:focus:not(:hover):not(:disabled) {
    background: ${colors.plum} !important;
    color: ${colors.parchment} !important;
    border-color: ${colors.goldLight} !important;
  }

  &:active:not(:disabled) {
    background: ${colors.plumDeep} !important;
    color: ${colors.goldLight} !important;
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`

const headerBar = css`
  background: rgba(62, 18, 48, 0.94);
  border-bottom: 0.12em solid ${colors.gold};
  color: ${colors.parchment};
  box-shadow: 0 0.2em 0.5em rgba(0, 0, 0, 0.35);

  h1 {
    color: ${colors.parchment};
    font-weight: 600;
  }

  b,
  strong {
    color: ${colors.goldLight};
  }
`

const headerButtons = css`
  background: ${colors.parchment} !important;
  color: ${colors.plumDeep} !important;
  border: 0.08em solid ${colors.gold} !important;
  border-radius: 0.3em !important;
  font-family: ${fontDisplay};
  padding: 0 0.5em !important;
  box-shadow: none !important;
  outline: none !important;

  &:hover:not(:disabled),
  &:focus:hover:not(:disabled) {
    background: ${colors.goldLight} !important;
    color: ${colors.plumDeep} !important;
  }

  &:focus:not(:hover):not(:disabled) {
    background: ${colors.parchment} !important;
    color: ${colors.plumDeep} !important;
  }
`

/** The help dialogs open and close almost at once: the framework's 0.3 s felt like a delay. */
const dialogFadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`

const dialogFadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`

const dialogOpen = css`
  animation: ${dialogFadeIn} 0.08s ease-out forwards;
`

const dialogClose = css`
  animation: ${dialogFadeOut} 0.08s ease-in forwards;
`

const dialogContainer = css`
  border: 0.1em solid ${colors.gold};
  box-shadow: 0 0.6em 1.5em rgba(62, 18, 48, 0.45);
`

const menuPanel = css`
  background: ${colors.parchment};
  color: ${colors.ink};
  border: 0.08em solid ${colors.gold};
  box-shadow: 0 0.6em 1.5em rgba(62, 18, 48, 0.45);

  h2 {
    color: ${colors.plum};
    font-family: ${fontDisplay};
    border-bottom: 0.1em solid ${colors.gold};
    padding-bottom: 0.3em;
  }
`

/**
 * The round buttons of the platform, the menu top right and the journal top left: only the colours
 * change, their shape and size stay the framework's.
 */
const menuMainButton = css`
  background: ${colors.plum} !important;
  color: ${colors.parchment} !important;
  border: 0.1em solid ${colors.gold} !important;
  outline: none !important;

  &:hover:not(:disabled) {
    background: ${colors.plumLight} !important;
  }

  &:focus:not(:hover):not(:disabled) {
    background: ${colors.plum} !important;
  }

  &:active:not(:disabled) {
    background: ${colors.plumDeep} !important;
  }
`

const playerPanelDataBadge = css`
  background: rgba(62, 18, 48, 0.88) !important;
  color: ${colors.parchment} !important;
  border: 0.08em solid ${colors.gold} !important;
`

export const theme: GameTheme = {
  ...defaultTheme,
  root: {
    ...defaultTheme.root,
    fontFamily: fontBody,
    background: {
      ...defaultTheme.root.background,
      image: background,
      overlay: 'rgba(252, 243, 214, 0.25)'
    }
  },
  palette: {
    primary: colors.plum,
    primaryHover: colors.plumLight,
    primaryActive: colors.plumDeep,
    primaryLight: colors.parchment,
    primaryLighter: colors.goldLight,
    surface: colors.parchment,
    onSurface: colors.ink,
    onSurfaceFocus: colors.parchmentDeep,
    onSurfaceActive: colors.sand,
    danger: '#C0392B',
    dangerHover: '#A93226',
    dangerActive: '#7B241C',
    disabled: '#9B8F80'
  },
  buttons: buttonBase,
  dialog: {
    ...defaultTheme.dialog,
    backgroundColor: colors.parchment,
    color: colors.ink,
    container: dialogContainer,
    buttons: buttonBase,
    openAnimation: dialogOpen,
    closeAnimation: dialogClose
  },
  header: {
    bar: headerBar,
    buttons: headerButtons
  },
  menu: {
    panel: menuPanel,
    mainButton: menuMainButton
  },
  playerPanel: {
    activeRingColors: [colors.gold, colors.plumLight],
    dataBadge: playerPanelDataBadge
  }
}
