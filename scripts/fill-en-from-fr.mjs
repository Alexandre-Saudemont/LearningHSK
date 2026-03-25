/**
 * Remplit translations.en à partir du français (Google Translate via google-translate-api-x)
 * pour toutes les entrées hsk1-data.json … hsk6 où en est vide.
 *
 * Cache : scripts/cache-en-from-fr.json (reprise si coupure, clé = texte FR exact).
 * Usage :
 *   node scripts/fill-en-from-fr.mjs
 *   node scripts/fill-en-from-fr.mjs --apply-only   (applique le cache sans appeler le réseau)
 */
import {translate} from 'google-translate-api-x';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'src', 'data');
const CACHE_PATH = path.join(__dirname, 'cache-en-from-fr.json');

const APPLY_ONLY = process.argv.includes('--apply-only');
const DELAY_MS = 180;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function loadCache() {
	try {
		return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
	} catch {
		return {};
	}
}

function saveCache(cache) {
	fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), 'utf8');
}

async function translateWithRetry(text, retries = 5) {
	let lastErr;
	for (let i = 0; i < retries; i++) {
		try {
			const res = await translate(text, {from: 'fr', to: 'en'});
			const out = (res.text || '').trim();
			if (out) return out;
		} catch (e) {
			lastErr = e;
			const wait = 1500 * (i + 1);
			console.warn(`  (!) ${e.message || e} — pause ${wait}ms`);
			await sleep(wait);
		}
	}
	throw lastErr || new Error('Traduction vide');
}

function loadAllData() {
	return [1, 2, 3, 4, 5, 6].map((n) => {
		const fp = path.join(DATA_DIR, `hsk${n}-data.json`);
		const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
		return {n, fp, data};
	});
}

function collectNeededFrench(files) {
	const needed = new Set();
	for (const {data} of files) {
		for (const v of Object.values(data)) {
			const fr = (v.translations?.fr ?? '').trim();
			const en = (v.translations?.en ?? '').trim();
			if (fr && !en) needed.add(fr);
		}
	}
	return needed;
}

function applyCacheToFiles(files, cache, {quiet} = {}) {
	for (const f of files) {
		let n = 0;
		for (const v of Object.values(f.data)) {
			const fr = (v.translations?.fr ?? '').trim();
			const en = (v.translations?.en ?? '').trim();
			if (fr && !en && cache[fr]) {
				v.translations.en = cache[fr];
				n++;
			}
		}
		fs.writeFileSync(f.fp, `${JSON.stringify(f.data, null, 2)}\n`, 'utf8');
		if (!quiet) console.log(`hsk${f.n}-data.json : +${n} traductions EN écrites`);
	}
}

async function main() {
	const files = loadAllData();
	const neededFr = collectNeededFrench(files);
	const cache = loadCache();

	const missing = [...neededFr].filter((fr) => !cache[fr]);
	console.log(`FR uniques à traduire : ${neededFr.size} · déjà en cache : ${neededFr.size - missing.length} · restantes : ${missing.length}`);

	if (!APPLY_ONLY && missing.length > 0) {
		let i = 0;
		for (const fr of missing) {
			i++;
			console.log(`[${i}/${missing.length}] ${fr.slice(0, 72)}${fr.length > 72 ? '…' : ''}`);
			const en = await translateWithRetry(fr);
			cache[fr] = en;
			saveCache(cache);
			if (i % 80 === 0) applyCacheToFiles(files, cache, {quiet: true});
			await sleep(DELAY_MS);
		}
	}

	if (APPLY_ONLY && missing.length > 0) {
		console.warn('Mode --apply-only : des entrées manquent encore dans le cache. Lance sans ce flag pour traduire.');
		process.exitCode = 1;
	}

	applyCacheToFiles(files, cache);

	let stillEmpty = 0;
	for (const {data} of files) {
		for (const v of Object.values(data)) {
			const fr = (v.translations?.fr ?? '').trim();
			const en = (v.translations?.en ?? '').trim();
			if (fr && !en) stillEmpty++;
		}
	}
	if (stillEmpty > 0) {
		console.warn(`Attention : ${stillEmpty} entrées ont encore en vide (FR sans entrée cache).`);
		process.exitCode = 1;
	} else {
		console.log('Terminé : toutes les entrées avec FR ont un EN.');
	}
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
