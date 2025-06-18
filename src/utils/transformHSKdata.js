function transformHSKdata(data) {
	const cards = [];

	for (const [hanzi, info] of Object.entries(data)) {
		const english = info.translations.en;
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
				content: `${pinyin} - ${english}`,
				matched: false,
				type: 'translation',
			},
		);
	}
	return cards;
}

export default transformHSKdata;
