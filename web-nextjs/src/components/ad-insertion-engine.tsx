// src/components/ad-insertion-engine.tsx
// Inserts ad slots into Strapi blocks content at strategic positions
// Rules: every 4 paragraphs, min 2-paragraph gap, skip <6 paragraphs, no ad after heading/image
'use client';

import { Fragment } from 'react';
import type { BlocksContent, AdSlot } from '@/types';
import { ContentRenderer } from './content-renderer';
import { AdSlotComponent } from './ad-slot';

interface AdInsertionEngineProps {
  content: BlocksContent;
  inArticleSlots: AdSlot[];
  className?: string;
}

const AD_EVERY_N_PARAGRAPHS = 4;
const MIN_PARAGRAPH_GAP = 2;
const MIN_PARAGRAPHS_REQUIRED = 6;

/**
 * AdInsertionEngine:
 * - Splits content blocks and inserts ad slots according to rules
 * - Alternates between available in-article slots
 * - Rules enforced:
 *   1. Insert after every 4 paragraphs
 *   2. Minimum 2-paragraph gap between consecutive ads
 *   3. Skip if total paragraphs < 6
 *   4. Never insert immediately after a heading or image
 *   5. Never insert before a heading or image (lookahead)
 */
export function AdInsertionEngine({
  content,
  inArticleSlots,
  className = '',
}: AdInsertionEngineProps) {
  // Handle empty content
  if (!content || content.length === 0) {
    return <ContentRenderer content={[]} className={className} />;
  }

  // Count total paragraphs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const paragraphCount = content.filter((block: any) => block.type === 'paragraph').length;

  // Skip ad insertion for short articles or no slots available
  if (paragraphCount < MIN_PARAGRAPHS_REQUIRED || inArticleSlots.length === 0) {
    return <ContentRenderer content={content} className={className} />;
  }

  // Build interleaved output: array of block groups + ads
  type OutputItem =
    | { kind: 'block'; block: BlocksContent[number]; index: number }
    | { kind: 'ad'; slot: AdSlot; adIndex: number };

  const output: OutputItem[] = [];
  let paragraphCounter = 0;
  let adSlotIndex = 0;
  let lastAdParagraphPosition = -(MIN_PARAGRAPH_GAP + 1); // ensures first insertion is valid

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

      // Check all conditions for ad insertion
      const meetsFrequency = paragraphCounter % AD_EVERY_N_PARAGRAPHS === 0;
      const meetsGap = paragraphCounter - lastAdParagraphPosition >= MIN_PARAGRAPH_GAP;
      const hasSlots = adSlotIndex < inArticleSlots.length;

      // Lookahead: don't insert before a heading or image
      const nextBlock = content[blockIndex + 1];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nextBlockType = nextBlock ? (nextBlock as any).type : null;
      const nextIsHeadingOrImage = nextBlockType === 'heading' || nextBlockType === 'image';

      if (meetsFrequency && meetsGap && hasSlots && !nextIsHeadingOrImage) {
        const slot = inArticleSlots[adSlotIndex % inArticleSlots.length];
        output.push({ kind: 'ad', slot, adIndex: adSlotIndex });
        adSlotIndex++;
        lastAdParagraphPosition = paragraphCounter;
      }
    }

    // Lookback rule: if current block is heading or image, don't place ad before it.
    // This is handled above via lookahead — no need to remove here.
    if (isHeading || isImage) {
      // Intentionally no-op: lookahead in paragraph handler prevents adjacent ads.
    }
  });

  return (
    <div className={className}>
      {output.map((item, idx) => {
        if (item.kind === 'ad') {
          return (
            <div
              key={`ad-${item.adIndex}-${idx}`}
              className="my-8 flex justify-center"
              role="complementary"
              aria-label="Advertisement"
            >
              <AdSlotComponent slot={item.slot} />
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
