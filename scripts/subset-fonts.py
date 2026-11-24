"""Builds the shipped body font from the variable original.

Instrument Sans is only ever rendered at weight 400, width 100% (checked with computed styles on every
page), so the variable font (57 KB) is instanced to that single static location (17 KB). That location
is the font's own default, so glyphs render identically. If the design ever needs another weight,
widen the location here and update the @font-face rule in src/styles/global.css.

Usage: python scripts/subset-fonts.py   (needs: pip install fonttools brotli)
"""
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

src = TTFont('assets/source/fonts/instrument-sans-wdth.woff2')
static = instancer.instantiateVariableFont(src, {'wght': 400, 'wdth': 100})
static.flavor = 'woff2'
static.save('src/assets/fonts/instrument-sans-400.woff2')
print('wrote src/assets/fonts/instrument-sans-400.woff2')
