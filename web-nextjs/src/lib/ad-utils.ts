// src/lib/ad-utils.ts
// Ad slot utilities: presets, device targeting, schedule, code selection

import type { AdSlot, SizePreset, SizePresetMap } from '@/types';

// ─────────────────────────────────────────────
// Ad Size Presets (CLS Prevention Reference)
// ─────────────────────────────────────────────

export const AD_PRESETS: SizePresetMap = {
  MOBILE_BANNER_50: { width: 320, height: 50, minHeight: 50 },
  MOBILE_BANNER_100: { width: 320, height: 100, minHeight: 100 },
  MREC: { width: 300, height: 250, minHeight: 250 },
  LARGE_MREC: { width: 336, height: 280, minHeight: 280 },
  LEADERBOARD: { width: 728, height: 90, minHeight: 90 },
  LARGE_LEADERBOARD: { width: 970, height: 90, minHeight: 90 },
  BILLBOARD: { width: 970, height: 250, minHeight: 250 },
  WIDE_SKYSCRAPER: { width: 160, height: 600, minHeight: 600 },
  HALF_PAGE: { width: 300, height: 600, minHeight: 600 },
};

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

// ─────────────────────────────────────────────
// Helper: is slot scheduled to be active now?
// ─────────────────────────────────────────────

function isScheduleActive(slot: AdSlot): boolean {
  const now = Date.now();

  if (slot.scheduleStart) {
    const start = new Date(slot.scheduleStart).getTime();
    if (now < start) return false;
  }

  if (slot.scheduleEnd) {
    const end = new Date(slot.scheduleEnd).getTime();
    if (now > end) return false;
  }

  return true;
}

// ─────────────────────────────────────────────
// Helper: is slot targeting the current device?
// ─────────────────────────────────────────────

function isDeviceTargeted(slot: AdSlot, breakpoint: Breakpoint): boolean {
  if (slot.deviceTarget === 'all') return true;
  return slot.deviceTarget === breakpoint;
}

// ─────────────────────────────────────────────
// Get Active Preset for a Slot + Breakpoint
// ─────────────────────────────────────────────

/**
 * Returns the effective SizePreset for a slot given the current breakpoint.
 * Priority: responsiveSizes override → sizePreset default → MREC fallback.
 *
 * Returns null if:
 * - slot is disabled
 * - schedule is not active
 * - device is not targeted
 */
export function getActivePreset(
  slot: AdSlot,
  breakpoint: Breakpoint
): SizePreset | null {
  if (!slot.enabled) return null;
  if (!isScheduleActive(slot)) return null;
  if (!isDeviceTargeted(slot, breakpoint)) return null;

  // Check responsive size override
  if (slot.responsiveSizes && slot.responsiveSizes[breakpoint]) {
    const overrideKey = slot.responsiveSizes[breakpoint];
    const override = AD_PRESETS[overrideKey];
    if (override) return override;
  }

  // Fall back to sizePreset
  const preset = slot.sizePreset ? AD_PRESETS[slot.sizePreset] : null;
  if (preset) return preset;

  // Ultimate fallback
  return AD_PRESETS.MREC;
}

// ─────────────────────────────────────────────
// Filter In-Article Slots
// ─────────────────────────────────────────────

/**
 * Returns only enabled in_article ad slots, sorted by slotKey.
 */
export function getInArticleSlots(allSlots: AdSlot[]): AdSlot[] {
  return allSlots
    .filter((s) => s.placement === 'in_article' && s.enabled)
    .sort((a, b) => a.slotKey.localeCompare(b.slotKey));
}

// ─────────────────────────────────────────────
// Random Code Selector (client-side safe)
// ─────────────────────────────────────────────

/**
 * Returns a random code from an AdUnit's codes array.
 * MUST be called in useEffect to avoid hydration mismatch (R4).
 */
export function getRandomCode(codes: string[]): string | null {
  if (!codes || codes.length === 0) return null;
  const idx = Math.floor(Math.random() * codes.length);
  return codes[idx];
}

// ─────────────────────────────────────────────
// Min-Height CSS Value Helper
// ─────────────────────────────────────────────

/**
 * Returns a CSS min-height value string for CLS prevention.
 */
export function getMinHeightStyle(presetKey: string): string {
  const preset = AD_PRESETS[presetKey];
  if (!preset) return '90px'; // default to leaderboard height
  return `${preset.minHeight}px`;
}

/**
 * Returns Tailwind class for min-height based on preset.
 */
export function getMinHeightClass(presetKey: string): string {
  const map: Record<string, string> = {
    MOBILE_BANNER_50: 'min-h-[50px]',
    MOBILE_BANNER_100: 'min-h-[100px]',
    MREC: 'min-h-[250px]',
    LARGE_MREC: 'min-h-[280px]',
    LEADERBOARD: 'min-h-[90px]',
    LARGE_LEADERBOARD: 'min-h-[90px]',
    BILLBOARD: 'min-h-[250px]',
    WIDE_SKYSCRAPER: 'min-h-[600px]',
    HALF_PAGE: 'min-h-[600px]',
  };
  return map[presetKey] ?? 'min-h-[90px]';
}

// ─────────────────────────────────────────────
// Get Slot by Key
// ─────────────────────────────────────────────

export function getSlotByKey(
  slots: AdSlot[],
  key: string
): AdSlot | undefined {
  return slots.find((s) => s.slotKey === key);
}
