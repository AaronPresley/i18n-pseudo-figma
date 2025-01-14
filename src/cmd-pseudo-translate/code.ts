import { PseudoFormat, PseudoFormatOptions } from 'i18n-pseudo';
import { gatherTextNodes } from '../utils/gather-text-nodes';
import { getValue } from '../utils/storage';

export default async () => {
  // Doing this here to address an annoying race
  // condition I can't figure out at the moment
  // https://github.com/AaronPresley/figma-g11n-utils/issues/2
  const doExpand = await getValue<boolean>('pseudoTranslate.doExpand');
  
  const pseudo = new PseudoFormat({
    doExpand: doExpand === undefined ? true : doExpand,
    prependChars: await getValue('pseudoTranslate.prependChars'),
    appendChars: await getValue('pseudoTranslate.appendChars'),
  });
  
  const textNodes = gatherTextNodes(figma.currentPage.selection);
  
  if (!textNodes.length) {
    figma.closePlugin('🚨 No text layers found in your selection')
  }
  
  const loadedFonts:FontName[] = [];
  const missingFontLayers:TextNode[] = [];
  
  for (let x = 0; x < textNodes.length; x += 1) {
    const thisNode = textNodes[x];
  
    if (thisNode.hasMissingFont) {
      console.warn(`Missing font for layer ${thisNode.name}`);
      missingFontLayers.push(thisNode);
      continue;
    }
  
    if (!loadedFonts.includes(thisNode.fontName as FontName)) {
      try {
        await figma.loadFontAsync(thisNode.fontName as FontName);
      } catch (err) {
        console.error(`Problem loading font for layer ${thisNode.name}`);
      }
    }

    const ogText = thisNode.characters;
    const newText = pseudo.format(ogText);
    thisNode.deleteCharacters(0, ogText.length);
    thisNode.insertCharacters(0, newText, 'AFTER');
  }

  if (missingFontLayers.length) {
    figma.closePlugin(`⚠️ Done, but couldn't translate ${missingFontLayers.length} layers with missing fonts.`);
  } else {
    figma.closePlugin(`✅ Done!`);
  }
}