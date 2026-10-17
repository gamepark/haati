/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { useTranslation } from 'react-i18next'
import { colors } from '../theme/colors'
import { fontDisplay } from '../theme'
import { RESERVE_TITLE_INSET } from './TableLayout'

/** The title of the reserve, in a cartouche as wide as the tokens, over the bottom of the Favor tokens. */
export const ReserveTitle = () => {
  const { t } = useTranslation()
  return <span css={titleCss}>{t('table.reserve')}</span>
}

const TITLE_SIZE = 0.9

const titleCss = css`
  position: absolute;
  left: ${RESERVE_TITLE_INSET / TITLE_SIZE}em;
  right: ${RESERVE_TITLE_INSET / TITLE_SIZE}em;
  bottom: ${RESERVE_TITLE_INSET / TITLE_SIZE}em;
  transform: translateZ(${3 / TITLE_SIZE}em);
  padding: 0.1em 0;
  text-align: center;
  border-radius: 0.3em;
  background: ${colors.plum};
  border: 0.08em solid ${colors.gold};
  box-shadow: 0 0.1em 0.3em rgba(0, 0, 0, 0.5);
  font-family: ${fontDisplay};
  font-size: ${TITLE_SIZE}em;
  line-height: 1.2;
  white-space: nowrap;
  color: ${colors.parchment};
  pointer-events: none;
`
