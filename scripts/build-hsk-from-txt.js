/**
 * Parse src/data/HSK_VOCABULARY_.txt (Unige / syllabus 2015) → hsk1-data.json … hsk6-data.json
 * Sortie : { translations: { fr, en }, pinyin } — en complété depuis les anciens JSON si présent.
 *
 * Usage : node scripts/build-hsk-from-txt.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const TXT = path.join(ROOT, 'src', 'data', 'HSK_VOCABULARY_.txt');
const OUT_DIR = path.join(ROOT, 'src', 'data');

function hasHan(s) {
	return /[\u3400-\u9FFF]/.test(s);
}

function hasLatin(s) {
	return /[a-zA-Z]/.test(s);
}

function looksLikePinyinToken(s) {
	return /^[a-zA-ZāáǎàēéěèīíǐìōóǒòūúǔùüǖǘǚǜńňḿĀÁǍÀĒÉĚÈĪÍǏÌŌÓǑÒŪÚǓÙÜǕǗǙǛ·\s\-]+$/u.test(s);
}

function normalizePinyin(s) {
	return s.replace(/\s+/g, ' ').trim();
}

/** Dernière colonne souvent la traduction FR (sans hanzi) pour les lignes HSK4 « sales » */
function pickFrench(parts, frStartDefault) {
	const last = parts[parts.length - 1];
	if (parts.length >= 6 && last && !hasHan(last) && hasLatin(last)) {
		return last.replace(/\s+/g, ' ').trim();
	}
	return parts.slice(frStartDefault).join(' ').replace(/\s+/g, ' ').trim();
}

function parseRowParts(parts, pending) {
	if (parts.length < 5 || !/^\d+$/.test(parts[0])) return null;
	const key = parts[1];
	if (!key || !hasHan(key)) return null;

	// Format principal : N° 简化字 正体字 拼音 cat. FR
	if (parts.length >= 6 && hasHan(parts[2]) && looksLikePinyinToken(parts[3])) {
		const pinyin = normalizePinyin(parts[3]);
		const fr = pickFrench(parts, 5);
		if (!fr) return null;
		return { key, pinyin, fr };
	}

	// Format 重组 / 减字 / certaines lignes : N° mot pinyin … FR
	if (parts.length >= 6 && looksLikePinyinToken(parts[2])) {
		const pinyin = normalizePinyin(parts[2]);
		const fr = pickFrench(parts, 5);
		if (!fr) return null;
		return { key, pinyin, fr };
	}

	// 特例 (4–5 colonnes) : N° mot pinyin … FR
	if (parts.length >= 5 && looksLikePinyinToken(parts[2])) {
		const pinyin = normalizePinyin(parts[2]);
		const fr = pickFrench(parts, parts.length >= 6 ? 4 : 3);
		if (!fr || hasHan(fr)) return null;
		return { key, pinyin, fr };
	}

	return null;
}

function loadExistingEnglish() {
	const enByKey = new Map();
	for (let n = 1; n <= 6; n++) {
		const fp = path.join(OUT_DIR, `hsk${n}-data.json`);
		if (!fs.existsSync(fp)) continue;
		try {
			const j = JSON.parse(fs.readFileSync(fp, 'utf8'));
			for (const [k, v] of Object.entries(j)) {
				const en = v.translations?.en;
				if (en && String(en).trim() && !enByKey.has(k)) enByKey.set(k, String(en).trim());
			}
		} catch (_) {
			/* ignore */
		}
	}
	return enByKey;
}

function main() {
	const raw = fs.readFileSync(TXT, 'utf8');
	const lines = raw.replace(/\r/g, '').split('\n');

	const enFallback = loadExistingEnglish();

	const byLevel = {1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {}};
	let level = 1;
	let lastEntry = null; // { level, key } continuation FR

	const skipLine = (line) => {
		const t = line.trim();
		if (!t) return true;
		if (/^http:\/\//i.test(t)) return true;
		if (/^\d+\s+http:\/\//.test(t)) return true;
		if (/^序号|^N°|^Simplifié|Traduction,\s*annotation|^Traduction$/i.test(t)) return true;
		if (/^Mots du syllabus|^Catégorie|^Pinyin$/i.test(t)) return true;
		if (/^INSTITUT CONFUCIUS|^FACULTÉ DES LETTRES|^VOCABULAIRE HSK|^INDICE$/i.test(t)) return true;
		if (/^Les listes de vocabulaire|^Le document ci-dessous|^La liste actuelle|^Cette mise à jour/i.test(t))
			return true;
		if (/^重组默认词\s+大纲词|^减字默认词\s+大纲词|^默认词重组/i.test(t)) return true;
		if (/单词|译注\s*$/i.test(t) && t.length < 40) return true;
		return false;
	};

	for (const line of lines) {
		const mLvl = line.match(/Vocabulaire HSK\s+HSK\s*([1-6])\s*$/i);
		if (mLvl) {
			level = parseInt(mLvl[1], 10);
			lastEntry = null;
			continue;
		}

		if (skipLine(line)) {
			lastEntry = null;
			continue;
		}

		if (/大纲词|MOTS DU SYLLABUS|重组默认词|MOTS IMPLICITES RECOMPOSÉS|减字默认词|MOTS IMPLICITES RÉDUITS|特例词|MOTS DE CAS SPÉCIAUX/i.test(line)) {
			lastEntry = null;
			continue;
		}

		const parts = line
			.trim()
			.split(/\s{2,}/u)
			.map((s) => s.trim())
			.filter(Boolean);

		const row = parseRowParts(parts, lastEntry);
		if (row) {
			const { key, pinyin, fr } = row;
			if (!byLevel[level][key]) {
				const en = enFallback.get(key) || '';
				byLevel[level][key] = {
					translations: { fr, en },
					pinyin,
				};
			} else {
				const prev = byLevel[level][key].translations.fr;
				if (fr.length > prev.length) byLevel[level][key].translations.fr = fr;
				if (!byLevel[level][key].translations.en && enFallback.get(key)) {
					byLevel[level][key].translations.en = enFallback.get(key);
				}
			}
			lastEntry = { level, key };
			continue;
		}

		// Ligne de suite (traduction coupée sur 2 lignes)
		if (lastEntry && /^\s{8,}\S/.test(line) && !/^\s*\d+\s/.test(line)) {
			const frag = line.trim();
			if (frag && !hasHan(frag)) {
				const o = byLevel[lastEntry.level][lastEntry.key];
				if (o) o.translations.fr = `${o.translations.fr} ${frag}`.replace(/\s+/g, ' ').trim();
			}
		} else if (lastEntry && parts.length < 4 && line.trim() && !/^\d+\s/.test(line)) {
			const frag = line.trim();
			if (frag && !hasHan(frag) && hasLatin(frag)) {
				const o = byLevel[lastEntry.level][lastEntry.key];
				if (o) o.translations.fr = `${o.translations.fr} ${frag}`.replace(/\s+/g, ' ').trim();
			} else lastEntry = null;
		} else lastEntry = null;
	}

	for (let n = 1; n <= 6; n++) {
		const data = byLevel[n];
		const keys = Object.keys(data).sort((a, b) => a.localeCompare(b, 'zh'));
		const ordered = {};
		for (const k of keys) ordered[k] = data[k];
		const out = path.join(OUT_DIR, `hsk${n}-data.json`);
		fs.writeFileSync(out, JSON.stringify(ordered, null, 2), 'utf8');
		console.error(`Wrote ${out} (${Object.keys(ordered).length} entries)`);
	}
	console.error('\nPour compléter les traductions EN à partir du FR : npm run fill:en');
}

main();
