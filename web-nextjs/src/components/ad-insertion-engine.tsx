// src/components/ad-insertion-engine.tsx
// Inserts banner ads and a native ad into Strapi blocks content at strategic positions
// Rules: banner every 4 paragraphs, native once near bottom (~70%), min 2-paragraph gap
'use client';

import { Fragment } from 'react';
import type { BlocksContent, AdSlot } from '@/types';
import { ContentRenderer } from './content-renderer';
import { AdBanner } from './ad-banner';
import { NativeAdCard } from './native-ad-card';

interface AdInsertionEngineProps {
  content: BlocksContent;
  inArticleBannerSlot: AdSlot | null;
  inArticleNativeSlot: AdSlot | null;
  className?: string;
}

const AD_EVERY_N_PARAGRAPHS = 4;
const MIN_PARAGRAPH_GAP = 2;
const MIN_PARAGRAPHS_REQUIRED = 6;
const NATIVE_AD_PARAGRAPH_THRESHOLD = 0.7; // insert native after ~70% of paragraphs

/**
 * AdInsertionEngine:
 * - Splits content blocks and inserts banner ads every 4 paragraphs
 * - Inserts native ad once near bottom of article (after ~70% of paragraphs)
 * - Rules enforced:
 *   1. Insert banner after every 4 paragraphs
 *   2. Minimum 2-paragraph gap between consecutive banner ads
 *   3. Skip if total paragraphs < 6
 *   4. Never insert immediately after a heading or image
 *   5. Never insert before a heading or image (lookahead)
 *   6. Native ad inserted once, near the bottom
 */
export function AdInsertionEngine({
  content,
  inArticleBannerSlot,
  inArticleNativeSlot,
  className = '',
}: AdInsertionEngineProps) {
  // Handle empty content
  if (!content || content.length === 0) {
    return <ContentRenderer content={[]} className={className} />;
  }

  // Count total paragraphs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const paragraphCount = content.filter((block: any) => block.type === 'paragraph').length;

  // Skip ad insertion for short articles or no ad slots available
  const hasBannerSlot = inArticleBannerSlot !== null;
  const hasNativeSlot = inArticleNativeSlot !== null;

  if (paragraphCount < MIN_PARAGRAPHS_REQUIRED || (!hasBannerSlot && !hasNativeSlot)) {
    return <ContentRenderer content={content} className={className} />;
  }

  // Native ad insertion target — after this paragraph count (70% mark)
  const nativeInsertAfterParagraph = Math.floor(paragraphCount * NATIVE_AD_PARAGRAPH_THRESHOLD);

  // Build interleaved output: array of block groups + ads
  type OutputItem =
    | { kind: 'block'; block: BlocksContent[number]; index: number }
    | { kind: 'banner'; adIndex: number }
    | { kind: 'native' };

  const output: OutputItem[] = [];
  let paragraphCounter = 0;
  let bannerAdIndex = 0;
  let lastAdParagraphPosition = -(MIN_PARAGRAPH_GAP + 1); // ensures first insertion is valid
  let nativeInserted = false;

  content.forEach((block, blockIndex) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blockType = (block as any).type as string;
    const isHeading = blockType === 'heading';
    const isImage = blockType === 'image';
    const isParagraph = blockType === 'paragraph';

    // Always push the block itself
    output.push({ kind: 'block', block, index: blockIndex });

    if (isParagraph) {
      paragraphCounter++;

      // Lookahead: don't insert before a heading or image
      const nextBlock = content[blockIndex + 1];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nextBlockType = nextBlock ? (nextBlock as any).type : null;
      const nextIsHeadingOrImage = nextBlockType === 'heading' || nextBlockType === 'image';

      // Check conditions for banner ad insertion
      if (hasBannerSlot) {
        const meetsFrequency = paragraphCounter % AD_EVERY_N_PARAGRAPHS === 0;
        const meetsGap = paragraphCounter - lastAdParagraphPosition >= MIN_PARAGRAPH_GAP;

        if (meetsFrequency && meetsGap && !nextIsHeadingOrImage) {
          output.push({ kind: 'banner', adIndex: bannerAdIndex });
          bannerAdIndex++;
          lastAdParagraphPosition = paragraphCounter;
        }
      }

      // Check conditions for native ad insertion (once, near bottom)
      if (hasNativeSlot && !nativeInserted && paragraphCounter >= nativeInsertAfterParagraph && !nextIsHeadingOrImage) {
        output.push({ kind: 'native' });
        nativeInserted = true;
      }
    }

    // Lookback rule handled via lookahead above — no-op for heading/image
    if (isHeading || isImage) {
      // Intentionally no-op
    }
  });

  return (
    <div className={className}>
      {output.map((item, idx) => {
        if (item.kind === 'banner') {
          return (
            <div
              key={`ad-banner-${item.adIndex}-${idx}`}
              className="my-8 flex justify-center"
              role="complementary"
              aria-label="Advertisement"
            >
              <AdBanner slot={inArticleBannerSlot} className="w-full max-w-2xl" />
            </div>
          );
        }

        if (item.kind === 'native') {
          return (
            <div
              key={`ad-native-${idx}`}
              className="my-8"
              role="complementary"
              aria-label="Sponsored content"
            >
              <NativeAdCard slot={inArticleNativeSlot} />
            </div>
          );
        }

        // Single block rendered via ContentRenderer
        return (
          <Fragment key={`block-${item.index}`}>
            <ContentRenderer content={[item.block]} className="" />
          </Fragment>
        );
      })}
    </div>
  );
}
