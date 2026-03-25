/** @param {'fr' | 'en'} lang */
function glossFromTranslations(translations, lang) {
	if (!translations) return '';
	const fr = String(translations.fr ?? '').trim();
	const en = String(translations.en ?? '').trim();
	if (lang === 'en') {
		if (en) return en;
		return fr;
	}
	if (fr) return fr;
	return en;
}

/**
 * @param {Record<string, { pinyin?: string, translations?: { fr?: string, en?: string } }>} data
 * @param {'fr' | 'en'} [translationLang]
 */
function transformHSKdata(data, translationLang = 'fr') {
	const lang = translationLang === 'en' ? 'en' : 'fr';
	const cards = [];

	for (const [hanzi, info] of Object.entries(data)) {
		const gloss = glossFromTranslations(info.translations, lang);
		const pinyin = info.pinyin;

		cards.push(
			{
				id: `${hanzi}`,
				content: hanzi,
				matched: false,
				type: 'character',
			},
			{
				id: `${hanzi}-combined`,
				content: `${pinyin} - ${gloss}`,
				matched: false,
				type: 'translation',
			},
		);
	}
	return cards;
}

export default transformHSKdata;
