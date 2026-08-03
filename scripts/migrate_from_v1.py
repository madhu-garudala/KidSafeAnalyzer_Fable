"""One-off migration: old KidSafe-Analyzer data -> structured products.json for the new app."""
import csv, json, re, sys, unicodedata
from datetime import datetime, timezone

OLD = '/Users/madhu_clawdia/Desktop/Code/KidSafe-Analyzer'
NEW = '/Users/madhu_clawdia/Desktop/Code/KidSafeAnalyzer_Fable'

def slugify(name):
    s = unicodedata.normalize('NFKD', name).encode('ascii', 'ignore').decode()
    s = re.sub(r"[^a-zA-Z0-9]+", '-', s).strip('-').lower()
    return s

def section(text, num):
    """Extract the body of '### N. Title' up to the next ### or ## header."""
    m = re.search(rf'^###\s*{num}\.[^\n]*\n(.*?)(?=^###?\s|\Z)', text, re.M | re.S)
    return m.group(1).strip() if m else ''

def parse_bullets(body):
    """Parse '- **Name**: note' bullets, handling nested rating bullets."""
    items = []
    lines = body.splitlines()
    i = 0
    while i < len(lines):
        line = lines[i]
        m = re.match(r'^\s*(?:[-*]|\d+\.)\s+\*\*(.+?)\*\*\s*[:–—-]?\s*(.*)$', line)
        if m and not re.match(r'^\s{2,}', line):
            name, note = m.group(1).strip().rstrip(':'), m.group(2).strip()
            # collect nested sub-bullets as part of the note
            j = i + 1
            subs = []
            while j < len(lines) and (re.match(r'^\s{2,}', lines[j]) or lines[j].strip() == ''):
                sub = lines[j].strip()
                if sub:
                    sm = re.match(r'^[-*]\s+\*\*(.+?)\*\*\s*[:–—-]?\s*(.*)$', sub)
                    if sm:
                        subs.append((sm.group(1).strip().rstrip(':'), sm.group(2).strip()))
                    else:
                        subs.append((None, re.sub(r'^[-*]\s+', '', sub)))
                j += 1
            if not note and subs:
                # nested form: rating label is the sub-bullet bold
                label, subnote = subs[0]
                note = ' '.join(filter(None, [f"{label}: {subnote}" if label else subnote] +
                                       [f"{l}: {n}" if l else n for l, n in subs[1:]]))
            elif subs:
                note = note + ' ' + ' '.join(f"{l}: {n}" if l else n for l, n in subs)
            items.append({'name': name, 'note': clean(note)})
            i = j
        else:
            i += 1
    return items

def clean(s):
    s = re.sub(r'\*\*(.+?)\*\*', r'\1', s)          # strip bold
    s = re.sub(r'\s+', ' ', s).strip()
    return s

def infer_rating(note):
    n = note.lower()
    if re.match(r'^(harmful|avoid|bad)\b', n) or 'major concern' in n:
        return 'avoid'
    if re.match(r'^(good|excellent|beneficial|healthy)\b', n):
        return 'good'
    if re.match(r'^(neutral)\b', n):
        return 'neutral'
    if any(k in n for k in ('concern', 'caution', 'not ideal', 'should be limited',
                            'linked to', 'sensitivit', 'allerg', 'artificial', 'excess')):
        return 'caution'
    if re.match(r'^generally (safe|recognized)', n):
        return 'neutral'
    return 'neutral'

def parse_list_items(body):
    """Numbered or bulleted list -> list of cleaned strings; fall back to paragraph."""
    items = [clean(m.group(1)) for m in re.finditer(r'^\s*(?:\d+\.|[-*])\s+(.+(?:\n(?!\s*(?:\d+\.|[-*]|#)).+)*)', body, re.M)]
    if not items and body.strip():
        items = [clean(body)]
    return [i for i in items if i]

def parse_analysis(md):
    vm = re.search(r'VERDICT:\s*(GOOD|MODERATE|BAD)', md)
    verdict = vm.group(1).lower() if vm else 'moderate'
    sm = re.search(r'\*\*Quick Summary:?\*\*:?\s*(.+?)(?=\n\s*\n|---)', md, re.S)
    summary = clean(sm.group(1)) if sm else ''

    red_flags = [{'name': it['name'], 'note': it['note']} for it in parse_bullets(section(md, 2))]
    # drop "Not present." entries — they're noise in the old GOOD analyses
    red_flags = [f for f in red_flags if not re.match(r'^not present\b', f['note'].lower())]

    breakdown = [{'name': it['name'], 'rating': infer_rating(it['note']), 'note': it['note']}
                 for it in parse_bullets(section(md, 4))]

    # conclusion: text after section 6's list (starts with "In conclusion"/"Overall")
    concl = ''
    cm = re.search(r'^(?:In conclusion|Overall|In summary)[,:]?\s*(.+?)\Z', md, re.M | re.S)
    if cm:
        concl = clean(cm.group(0))

    pos_body = section(md, 6)
    positives = parse_list_items(re.split(r'^(?:In conclusion|Overall|In summary)', pos_body, flags=re.M)[0])

    return {
        'verdict': verdict,
        'summary': summary,
        'overallAssessment': clean(section(md, 1)),
        'redFlags': red_flags,
        'addedSugar': clean(re.sub(r'^\s*[-*]\s+', '', section(md, 3), flags=re.M)),
        'ingredientBreakdown': breakdown,
        'keyConcerns': parse_list_items(section(md, 5)),
        'positives': positives,
        'conclusion': concl,
        'source': 'migrated',
    }

products = []
with open(f'{OLD}/backend/Data/products_categorized.csv') as f:
    rows = list(csv.DictReader(f))
pre = json.load(open(f'{OLD}/frontend/public/precomputed-analyses.json'))

missing = []
for row in rows:
    name = row['Brand_Name'].strip()
    entry = pre.get(name)
    analysis = None
    generated_at = None
    if entry:
        analysis = parse_analysis(entry['analysis'])
        ts = entry.get('timestamp')
        if isinstance(ts, (int, float)):
            generated_at = datetime.fromtimestamp(ts, tz=timezone.utc).isoformat()
        elif ts:
            generated_at = str(ts)
    else:
        missing.append(name)
    products.append({
        'id': slugify(name),
        'name': name,
        'category': row['Category'].strip(),
        'ingredients': row['Ingredients'].strip(),
        'analysis': analysis,
        'analyzedAt': generated_at,
    })

out = {
    'generatedAt': datetime.now(timezone.utc).isoformat(),
    'products': products,
}
import os
os.makedirs(f'{NEW}/src/data', exist_ok=True)
with open(f'{NEW}/src/data/products.json', 'w') as f:
    json.dump(out, f, indent=1, ensure_ascii=False)

# sanity report
n_an = sum(1 for p in products if p['analysis'])
print(f"{len(products)} products, {n_an} with analysis; missing: {missing}")
verd = {}
empty_fields = {}
for p in products:
    a = p['analysis']
    if not a: continue
    verd[a['verdict']] = verd.get(a['verdict'], 0) + 1
    for k in ('summary','overallAssessment','addedSugar','ingredientBreakdown','positives'):
        if not a[k]:
            empty_fields.setdefault(k, []).append(p['name'])
print('verdicts:', verd)
print('empty fields:', {k: len(v) for k, v in empty_fields.items()}, dict(list(empty_fields.items())[:3]))
avg_ing = sum(len(p['analysis']['ingredientBreakdown']) for p in products if p['analysis']) / n_an
print(f'avg ingredients parsed per product: {avg_ing:.1f}')
