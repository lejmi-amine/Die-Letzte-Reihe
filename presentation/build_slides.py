import re

with open(r'c:\Users\amine\Desktop\Software Enginnering\Die-Letzte-Reihe\presentation\studybot_presentation.html', 'r', encoding='utf-8') as f:
    html = f.read()

KW  = 'color:#9b8cf7'
FN  = 'color:#72f4ff'
STR = 'color:#fbbf24'
NUM = 'color:#f87171'
CMT = 'color:#858097'
MUT = 'color:var(--muted)'

slide7 = (
    '  <!-- SLIDE 7 -- Code: stem() -->\n'
    '  <section class="slide"><div class="layout two">'
    '<div class="stack">'
    '<div class="eyebrow animate-in">Code Walkthrough 1 / 3</div>'
    '<h2 class="animate-in" style="--d:.12s">stem() &mdash;<br><span class="gradient-text">Sprache verstehen.</span></h2>'
    '<p class="animate-in" style="--d:.24s">Ohne Stemming z&auml;hlen &bdquo;Photosynthese&ldquo; und &bdquo;Photosynthesen&ldquo; als zwei verschiedene Begriffe. Der Stemmer fasst alle Flexionsformen unter einem Stamm zusammen &mdash; bevor TF-IDF sie bewertet.</p>'
    '<div class="glass panel animate-in" style="--d:.38s">'
    '<div style="display:grid;grid-template-columns:1fr 22px 1fr;gap:9px 6px;align-items:center;font-family:\'JetBrains Mono\',monospace;font-size:14px">'
    '<span style="' + NUM + '">Photosynthesen</span><span style="' + MUT + '">&rarr;</span><span class="green">Photosynthes</span>'
    '<span style="' + NUM + '">lernende</span><span style="' + MUT + '">&rarr;</span><span class="green">lern</span>'
    '<span style="' + NUM + '">Karteikarten</span><span style="' + MUT + '">&rarr;</span><span class="green">Karteikar</span>'
    '<span style="' + NUM + '">Schl&uuml;sselbegriffe</span><span style="' + MUT + '">&rarr;</span><span class="green">Schl&uuml;sselbegriff</span>'
    '<span style="' + NUM + '">Zusammenfassung</span><span style="' + MUT + '">&rarr;</span><span class="green">Zusammenfass</span>'
    '</div></div></div>'
    '<div class="glass big-panel animate-in" style="--d:.16s;overflow:hidden">'
    '<div class="code" style="font-size:13px;line-height:1.64">'
    '<span style="' + KW + '">export function</span> <span style="' + FN + '">stem</span>(word) {\n'
    '  <span style="' + KW + '">const</span> suffixes = [\n'
    '    <span style="' + STR + '">"ungen"</span>,  <span style="' + STR + '">"schaft"</span>, <span style="' + STR + '">"heit"</span>,  <span style="' + STR + '">"keit"</span>,\n'
    '    <span style="' + STR + '">"lich"</span>,   <span style="' + STR + '">"isch"</span>,   <span style="' + STR + '">"ung"</span>,   <span style="' + STR + '">"ern"</span>,   <span style="' + STR + '">"eln"</span>,\n'
    '    <span style="' + STR + '">"ster"</span>,   <span style="' + STR + '">"sten"</span>,   <span style="' + STR + '">"ende"</span>,  <span style="' + STR + '">"enden"</span>,\n'
    '    <span style="' + STR + '">"ender"</span>,  <span style="' + STR + '">"ens"</span>,    <span style="' + STR + '">"ers"</span>,   <span style="' + STR + '">"est"</span>,\n'
    '    <span style="' + STR + '">"em"</span>,     <span style="' + STR + '">"er"</span>,     <span style="' + STR + '">"es"</span>,    <span style="' + STR + '">"en"</span>,\n'
    '    <span style="' + STR + '">"e"</span>,      <span style="' + STR + '">"s"</span>,       <span style="' + CMT + '">// 23 Suffixmuster, strikt priorisiert</span>\n'
    '  ];\n'
    '  <span style="' + KW + '">for</span> (<span style="' + KW + '">const</span> suffix <span style="' + KW + '">of</span> suffixes) {\n'
    '    <span style="' + KW + '">if</span> (word.<span style="' + FN + '">endsWith</span>(suffix)\n'
    '        &amp;&amp; word.length - suffix.length &gt;= <span style="' + NUM + '">4</span>)\n'
    '      <span style="' + KW + '">return</span> word.<span style="' + FN + '">slice</span>(<span style="' + NUM + '">0</span>, -suffix.length);\n'
    '  }\n'
    '  <span style="' + KW + '">return</span> word;\n'
    '}'
    '</div></div></div></section>\n'
)

slide8 = (
    '  <!-- SLIDE 8 -- Code: TF-IDF -->\n'
    '  <section class="slide"><div class="layout two">'
    '<div class="glass big-panel animate-in" style="--d:.12s;overflow:hidden">'
    '<div class="eyebrow" style="font-size:11px;margin-bottom:14px">extractKeyTerms() &mdash; Scoring-Kern</div>'
    '<div class="code" style="font-size:12.5px;line-height:1.58">'
    '<span style="' + CMT + '">// 1. W&ouml;rter nach Stamm gruppieren</span>\n'
    'words.<span style="' + FN + '">forEach</span>(w <span style="' + KW + '">=&gt;</span> {\n'
    '  <span style="' + KW + '">const</span> s = <span style="' + FN + '">stem</span>(w);\n'
    '  <span style="' + KW + '">if</span> (!stemGroups[s])\n'
    '    stemGroups[s] = { count: <span style="' + NUM + '">0</span>, forms: {} };\n'
    '  stemGroups[s].count++;\n'
    '  stemGroups[s].forms[w] = (stemGroups[s].forms[w] || <span style="' + NUM + '">0</span>) + <span style="' + NUM + '">1</span>;\n'
    '});\n\n'
    '<span style="' + CMT + '">// 2. Wie viele S&auml;tze enthalten diesen Stamm?</span>\n'
    'sentences.<span style="' + FN + '">forEach</span>(sentence <span style="' + KW + '">=&gt;</span> {\n'
    '  <span style="' + KW + '">const</span> lower = sentence.<span style="' + FN + '">toLowerCase</span>();\n'
    '  Object.<span style="' + FN + '">entries</span>(stemGroups)\n'
    '    .<span style="' + FN + '">forEach</span>(([s, { forms }]) <span style="' + KW + '">=&gt;</span> {\n'
    '      <span style="' + KW + '">if</span> (Object.<span style="' + FN + '">keys</span>(forms).<span style="' + FN + '">some</span>(f <span style="' + KW + '">=&gt;</span> lower.<span style="' + FN + '">includes</span>(f)))\n'
    '        docFreq[s] = (docFreq[s] || <span style="' + NUM + '">0</span>) + <span style="' + NUM + '">1</span>;\n'
    '    });\n'
    '});\n\n'
    '<span style="' + CMT + '">// 3. TF-IDF &times; L&auml;ngebonus &rarr; Score</span>\n'
    '<span style="' + KW + '">const</span> idf = Math.<span style="' + FN + '">log</span>((totalSentences + <span style="' + NUM + '">1</span>) / df);\n'
    '<span style="' + KW + '">const</span> lengthBonus =\n'
    '  <span style="' + NUM + '">1</span> + Math.<span style="' + FN + '">log</span>(Math.<span style="' + FN + '">max</span>(bestForm.length, <span style="' + NUM + '">4</span>) / <span style="' + NUM + '">4</span>);\n'
    '<span style="' + KW + '">return</span> [bestForm, count * idf * lengthBonus];\n'
    '<span style="' + CMT + '">// &rarr; .sort().slice(0,20) &mdash; Top 20 Begriffe</span>'
    '</div></div>'
    '<div class="stack">'
    '<div><div class="eyebrow animate-in">Code Walkthrough 2 / 3</div>'
    '<h2 class="animate-in" style="--d:.12s">TF-IDF &mdash;<br><span class="gradient-text">Das Gehirn.</span></h2></div>'
    '<div class="glass panel animate-in" style="--d:.26s">'
    '<p style="font-size:16px;color:#fff;font-family:\'JetBrains Mono\',monospace;margin-bottom:16px">score = count &times; idf &times; lengthBonus</p>'
    '<div style="display:flex;flex-direction:column;gap:11px;font-size:14px">'
    '<div style="display:flex;gap:12px;align-items:baseline"><span style="' + FN + ';font-family:\'JetBrains Mono\',monospace;min-width:108px">count</span><span style="' + MUT + '">Wie oft das Wort im Text auftaucht</span></div>'
    '<div style="display:flex;gap:12px;align-items:baseline"><span style="' + FN + ';font-family:\'JetBrains Mono\',monospace;min-width:108px">idf</span><span style="' + MUT + '">log((S+1)/df) &mdash; je seltener, desto besser</span></div>'
    '<div style="display:flex;gap:12px;align-items:baseline"><span style="' + FN + ';font-family:\'JetBrains Mono\',monospace;min-width:108px">lengthBonus</span><span style="' + MUT + '">1 + log(len/4) &mdash; Komposita bevorzugen</span></div>'
    '</div></div>'
    '<div class="glass panel animate-in" style="--d:.40s">'
    '<p style="font-size:14px;color:var(--muted)"><span style="color:#fff">&bdquo;Photosynthese&ldquo;</span> &mdash; 13 Zeichen, 4&times; im Text, selten in S&auml;tzen &rarr; <span class="green">hoher Score</span></p>'
    '<p style="font-size:14px;color:var(--muted);margin-top:10px"><span style="color:#fff">&bdquo;wichtig&ldquo;</span> &rarr; generisch &rarr; <span style="color:#f87171">manuell blockiert</span><br><span style="color:#fff">&bdquo;die&ldquo;</span> &rarr; Stopword &rarr; <span style="color:#f87171">herausgefiltert</span></p>'
    '</div></div></div></section>\n'
)

slide9 = (
    '  <!-- SLIDE 9 -- Code: generateFlashcards() -->\n'
    '  <section class="slide"><div class="layout two">'
    '<div class="glass big-panel animate-in" style="--d:.12s;overflow:hidden">'
    '<div class="eyebrow" style="font-size:11px;margin-bottom:14px">generateFlashcards() &mdash; Kernlogik</div>'
    '<div class="code" style="font-size:12.5px;line-height:1.58">'
    '<span style="' + KW + '">export function</span> <span style="' + FN + '">generateFlashcards</span>(text, count = <span style="' + NUM + '">6</span>) {\n'
    '  <span style="' + KW + '">const</span> sentences = <span style="' + FN + '">extractSentences</span>(text);\n'
    '  <span style="' + KW + '">const</span> terms     = <span style="' + FN + '">extractKeyTerms</span>(text); <span style="' + CMT + '">// top 20</span>\n'
    '  <span style="' + KW + '">const</span> usedSentences = <span style="' + KW + '">new</span> <span style="' + FN + '">Set</span>();\n\n'
    '  <span style="' + KW + '">for</span> (<span style="' + KW + '">const</span> term <span style="' + KW + '">of</span> terms) {\n'
    '    <span style="' + KW + '">if</span> (cards.length &gt;= count) <span style="' + KW + '">break</span>;\n'
    '    <span style="' + KW + '">const</span> matches = <span style="' + FN + '">findSentencesWith</span>(sentences, term);\n\n'
    '    <span style="' + KW + '">for</span> (<span style="' + KW + '">const</span> match <span style="' + KW + '">of</span> matches) {\n'
    '      <span style="' + KW + '">if</span> (usedSentences.<span style="' + FN + '">has</span>(match)) <span style="' + KW + '">continue</span>; <span style="' + CMT + '">// kein Duplikat</span>\n'
    '      usedSentences.<span style="' + FN + '">add</span>(match);\n'
    '      cards.<span style="' + FN + '">push</span>({\n'
    '        front: questionVariants[cards.length % <span style="' + NUM + '">6</span>],\n'
    '        back:  match.<span style="' + FN + '">slice</span>(<span style="' + NUM + '">0</span>, <span style="' + NUM + '">200</span>),\n'
    '      });\n'
    '      <span style="' + KW + '">break</span>;\n'
    '    }\n'
    '  }\n'
    '  <span style="' + KW + '">return</span> cards;\n'
    '}'
    '</div></div>'
    '<div class="stack">'
    '<div><div class="eyebrow animate-in">Code Walkthrough 3 / 3</div>'
    '<h2 class="animate-in" style="--d:.12s">generateFlashcards() &mdash;<br><span class="gradient-text">Vom Begriff zur Karte.</span></h2>'
    '<p class="animate-in" style="--d:.22s">Jeder Top-Begriff bekommt genau einen passenden Satz. Sechs Fragetypen rotieren. Kein Satz wird zweimal verwendet.</p></div>'
    '<div class="glass panel animate-in" style="--d:.34s">'
    '<div style="display:flex;flex-direction:column;gap:8px;font-family:\'JetBrains Mono\',monospace;font-size:13px">'
    '<div><span style="' + MUT + '">1.</span> <span style="' + STR + '">&bdquo;Was versteht man unter &hellip;?&ldquo;</span></div>'
    '<div><span style="' + MUT + '">2.</span> <span style="' + STR + '">&bdquo;Welche Rolle spielt &hellip;?&ldquo;</span></div>'
    '<div><span style="' + MUT + '">3.</span> <span style="' + STR + '">&bdquo;Erkl&auml;re den Begriff &hellip;&ldquo;</span></div>'
    '<div><span style="' + MUT + '">4.</span> <span style="' + STR + '">&bdquo;Was ist &hellip; und warum wichtig?&ldquo;</span></div>'
    '<div><span style="' + MUT + '">5.</span> <span style="' + STR + '">&bdquo;Beschreibe &hellip; in eigenen Worten.&ldquo;</span></div>'
    '<div><span style="' + MUT + '">6.</span> <span style="' + STR + '">&bdquo;Wie l&auml;sst sich &hellip; definieren?&ldquo;</span></div>'
    '</div></div>'
    '<div class="row animate-in" style="--d:.46s"><span class="pill">No Duplicates</span><span class="pill">6 Fragetypen</span><span class="pill">max 200 Zeichen</span></div>'
    '</div></div></section>\n'
)

# Find boundaries
old_start = html.find('  <!-- SLIDE 7')
old_end   = html.find('  <!-- SLIDE 9 — Features')
print(f'Replacing chars {old_start} to {old_end} ({old_end - old_start} chars)')

new_block = slide7 + '\n' + slide8 + '\n' + slide9 + '\n'
html_new = html[:old_start] + new_block + html[old_end:]

# Renumber subsequent slides (+2 each)
fixes = [
    ('<!-- SLIDE 9 — Features',          '<!-- SLIDE 10 — Features'),
    ('<!-- SLIDE 9 — Demo',               '<!-- SLIDE 11 — Demo'),
    ('<!-- SLIDE 10 — Testing',           '<!-- SLIDE 12 — Testing'),
    ('<!-- SLIDE 11 — CI/CD',             '<!-- SLIDE 13 — CI/CD'),
    ('<!-- SLIDE 12 — Big Fail',          '<!-- SLIDE 14 — Big Fail'),
    ('<!-- SLIDE 13 — Lessons Learned',   '<!-- SLIDE 15 — Lessons Learned'),
    ('<!-- SLIDE 14 — Tech Stack',        '<!-- SLIDE 16 — Tech Stack'),
    ('<!-- SLIDE 15 — Deployed',          '<!-- SLIDE 17 — Deployed'),
    ('<!-- SLIDE 16 — Final / Memorial',  '<!-- SLIDE 18 — Final / Memorial'),
]
for old, new in fixes:
    if old in html_new:
        html_new = html_new.replace(old, new, 1)
        print(f'OK: {new[:45]}')
    else:
        print(f'MISS: {old[:60]}')

with open(r'c:\Users\amine\Desktop\Software Enginnering\Die-Letzte-Reihe\presentation\studybot_presentation.html', 'w', encoding='utf-8') as f:
    f.write(html_new)

slide_count = len(re.findall(r'<section class="slide"', html_new))
print(f'\nTotal slides: {slide_count}  |  File: {len(html_new)} chars')
