/**
 * Garante spacing e radius mesmo se theme/spacing.js estiver incompleto no Snack.
 */
import * as raw from './spacing';

const FALLBACK_SPACING = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 };
const FALLBACK_RADIUS = { sm: 6, md: 8, lg: 12, pill: 9999 };

const d = raw.default;
const baseSpacing = raw.spacing ?? d?.spacing ?? FALLBACK_SPACING;
const baseRadius = raw.radius ?? d?.radius ?? FALLBACK_RADIUS;

export const spacing = { ...FALLBACK_SPACING, ...baseSpacing };
export const radius = { ...FALLBACK_RADIUS, ...baseRadius };
