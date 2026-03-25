import React, {useState, useMemo, useEffect} from 'react';
import HSK1 from '../../data/hsk1-data.json';
import HSK2 from '../../data/hsk2-data.json';
import HSK3 from '../../data/hsk3-data.json';
import HSK4 from '../../data/hsk4-data.json';
import HSK5 from '../../data/hsk5-data.json';
import HSK6 from '../../data/hsk6-data.json';
import transformHSKdata from '../../utils/transformHSKdata';
import {DndContext} from '@dnd-kit/core';
import {Card} from '../Card/Card';
import './Matchpair.css';

const LEVEL_LABELS = {
	HSK1: 'HSK 1',
	HSK2: 'HSK 2',
	HSK3: 'HSK 3',
	HSK4: 'HSK 4',
	HSK5: 'HSK 5',
	HSK6: 'HSK 6',
};

/** Points retirés à chaque erreur (association incorrecte). Le score ne passe pas sous 0. */
const SCORE_PENALTY_WRONG = 5;

const PAIR_MIN = 5;
const PAIR_MAX = 10;

function clampPairCount(n) {
	const x = Number(n);
	if (Number.isNaN(x)) return PAIR_MIN;
	return Math.min(PAIR_MAX, Math.max(PAIR_MIN, x));
}

function Matchpair({level, initialPairCount = 5, translationLang = 'fr', onBack}) {
	const lang = translationLang === 'en' ? 'en' : 'fr';
	const itemsHSK1 = useMemo(() => transformHSKdata(HSK1, lang), [lang]);
	const itemsHSK2 = useMemo(() => transformHSKdata(HSK2, lang), [lang]);
	const itemsHSK3 = useMemo(() => transformHSKdata(HSK3, lang), [lang]);
	const itemsHSK4 = useMemo(() => transformHSKdata(HSK4, lang), [lang]);
	const itemsHSK5 = useMemo(() => transformHSKdata(HSK5, lang), [lang]);
	const itemsHSK6 = useMemo(() => transformHSKdata(HSK6, lang), [lang]);

	const [pairCount, setPairCount] = useState(() => clampPairCount(initialPairCount));
	const [matchedPairs, setMatchedPairs] = useState([]);
	const [showNextButton, setShowNextButton] = useState(false);
	const [gameRound, setGameRound] = useState(0);
	const [currentPairs, setCurrentPairs] = useState([]);
	const [translationCardsFrozen, setTranslationCardsFrozen] = useState([]);
	const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
	const [selectedCharacter, setSelectedCharacter] = useState(null);
	const [selectedTranslation, setSelectedTranslation] = useState(null);
	const [wrongCardIds, setWrongCardIds] = useState([]);
	const [score, setScore] = useState(0);
	const [streak, setStreak] = useState(0);

	const allPairs = useMemo(() => {
		let items = [];
		if (level === 'HSK1') items = itemsHSK1;
		if (level === 'HSK2') items = itemsHSK2;
		if (level === 'HSK3') items = itemsHSK3;
		if (level === 'HSK4') items = itemsHSK4;
		if (level === 'HSK5') items = itemsHSK5;
		if (level === 'HSK6') items = itemsHSK6;

		const pairsMap = new Map();
		items.forEach((item) => {
			const hanzi = item.id.replace('-combined', '');
			if (!pairsMap.has(hanzi)) {
				pairsMap.set(hanzi, {
					hanzi,
					characterCard: items.find((i) => i.id === hanzi),
					translationCard: items.find((i) => i.id === `${hanzi}-combined`),
				});
			}
		});
		return Array.from(pairsMap.values());
	}, [level, itemsHSK1, itemsHSK2, itemsHSK3, itemsHSK4, itemsHSK5, itemsHSK6]);

	function shuffleArray(array) {
		const newArray = [...array];
		for (let i = newArray.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[newArray[i], newArray[j]] = [newArray[j], newArray[i]];
		}
		return newArray;
	}

	useEffect(() => {
		const selectedPairs = shuffleArray(allPairs).slice(0, pairCount);
		setCurrentPairs(selectedPairs);

		const translations = selectedPairs.map((pair) => pair.translationCard);
		setTranslationCardsFrozen(shuffleArray(translations));
		setShowNextButton(false);
	}, [level, pairCount, gameRound, allPairs]);

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth <= 768);
		};
		checkMobile();
		window.addEventListener('resize', checkMobile);
		return () => {
			window.removeEventListener('resize', checkMobile);
		};
	}, []);

	useEffect(() => {
		if (selectedCharacter && selectedTranslation) {
			const charId = selectedCharacter.id;
			const transId = selectedTranslation.id.replace('-combined', '');

			if (charId === transId) {
				const newMatchedPairs = [...matchedPairs, charId];
				setMatchedPairs(newMatchedPairs);
				setScore((s) => s + 10 + Math.min(10, streak * 2));
				setStreak((st) => st + 1);

				setCurrentPairs((prevPairs) =>
					prevPairs.map((pair) =>
						pair.hanzi === charId
							? {
									...pair,
									characterCard: {...pair.characterCard, matched: true},
									translationCard: {...pair.translationCard, matched: true},
							  }
							: pair,
					),
				);

				setTranslationCardsFrozen((prev) => prev.map((card) => (card.id === `${charId}-combined` ? {...card, matched: true} : card)));

				const allMatched = currentPairs.every((pair) => newMatchedPairs.includes(pair.hanzi));
				setShowNextButton(allMatched);
			} else {
				setStreak(0);
				setScore((s) => Math.max(0, s - SCORE_PENALTY_WRONG));
				setWrongCardIds([selectedCharacter.id, selectedTranslation.id]);
				setTimeout(() => setWrongCardIds([]), 420);
			}

			setTimeout(() => {
				setSelectedCharacter(null);
				setSelectedTranslation(null);
			}, 300);
		}
	}, [selectedCharacter, selectedTranslation, matchedPairs, currentPairs, streak]);

	function handleDragEnd({active, over}) {
		if (!over || active.id === over.id) return;

		const activeId = active.id.endsWith('-combined') ? active.id.replace('-combined', '') : active.id;
		const overId = over.id.endsWith('-combined') ? over.id.replace('-combined', '') : over.id;

		if (activeId === overId) {
			const newMatchedPairs = [...matchedPairs, activeId];
			setMatchedPairs(newMatchedPairs);
			setScore((s) => s + 10 + Math.min(10, streak * 2));
			setStreak((st) => st + 1);

			setCurrentPairs((prevPairs) =>
				prevPairs.map((pair) =>
					pair.hanzi === activeId
						? {
								...pair,
								characterCard: {...pair.characterCard, matched: true},
								translationCard: {...pair.translationCard, matched: true},
						  }
						: pair,
				),
			);

			setTranslationCardsFrozen((prev) => prev.map((card) => (card.id === `${activeId}-combined` ? {...card, matched: true} : card)));

			const allCurrentPairsMatched = currentPairs.every((pair) => newMatchedPairs.includes(pair.hanzi));
			setShowNextButton(allCurrentPairsMatched);
		} else {
			setStreak(0);
			setScore((s) => Math.max(0, s - SCORE_PENALTY_WRONG));
			setWrongCardIds([active.id, over.id]);
			setTimeout(() => setWrongCardIds([]), 420);
		}
	}

	function handlePairCountChange(event) {
		setMatchedPairs([]);
		setPairCount(clampPairCount(event.target.value));
		setGameRound((prev) => prev + 1);
	}

	function handleNextRound() {
		setMatchedPairs([]);
		setGameRound((prev) => prev + 1);
	}

	const progress = currentPairs.length > 0 ? Math.round((matchedPairs.length / currentPairs.length) * 100) : 0;

	return (
		<div className='matchpair'>
			<div className='matchpair-topbar'>
				<div className='matchpair-topbarSide'>
					<button type='button' className='ink-btn ink-btn--ghost matchpair-backBtn' onClick={onBack}>
						{lang === 'en' ? '← Levels' : '← Niveaux'}
					</button>
				</div>
				<div className='matchpair-topbarCenter'>
					<span className='matchpair-levelBadge'>
						{LEVEL_LABELS[level] ?? level}
						<span className='matchpair-langTag' aria-hidden>
							{' · '}
							{lang === 'en' ? 'EN' : 'FR'}
						</span>
					</span>
				</div>
				<div className='matchpair-topbarSide matchpair-topbarSide--end' aria-hidden />
			</div>

			<header className='matchpair-intro'>
				<p className='matchpair-subtitle matchpair-instructions'>
					{lang === 'en'
						? isMobile
							? 'Tap a 汉字 card, then its English meaning.'
							: 'Drag a card onto its English meaning, or click to select.'
						: isMobile
							? 'Tape une carte 汉字 puis sa carte en français.'
							: 'Glisse une carte sur le sens en français ou clique pour sélectionner.'}
				</p>
			</header>

			<div
				className='matchpair-statsRow'
				aria-label={
					lang === 'en'
						? 'Score, streak and pairs. Correct match raises score and streak. Wrong match: minus five points, minimum zero.'
						: 'Score, série et paires. Bonne paire augmente le score et la série. Erreur : moins cinq points, minimum zéro.'
				}
				title={
					lang === 'en'
						? 'Correct match: +10 + streak bonus · Wrong match: −5 pts · Score cannot go below 0'
						: 'Bonne paire : +10 + bonus de série · Erreur (mauvaise association) : −5 pts · Le score ne descend pas sous 0'
				}>
				<span className='matchpair-stat'>
					Score <strong>{score}</strong>
				</span>
				<span className='matchpair-statDot' aria-hidden>
					·
				</span>
				<span className='matchpair-stat'>
					{lang === 'en' ? 'Streak ' : 'Série '}
					<strong>{streak}</strong>
				</span>
				<span className='matchpair-statDot' aria-hidden>
					·
				</span>
				<span className='matchpair-stat'>
					{matchedPairs.length}/{currentPairs.length}
					{lang === 'en' ? ' matched' : ' trouvées'}
				</span>
			</div>

			<div className='matchpair-progressWrap'>
				<div className='progress' aria-label={lang === 'en' ? 'Progress' : 'Progression'}>
					<div className='progressFill' style={{width: `${progress}%`}} />
				</div>
			</div>

			<div className='controls' role='group' aria-label={lang === 'en' ? 'Round settings' : 'Paramètres de la manche'}>
				<div className='control-group'>
					<label htmlFor='pair-count'>{lang === 'en' ? 'Pairs' : 'Paires'}</label>
					<select id='pair-count' className='count-selector' value={pairCount} onChange={handlePairCountChange}>
						<option value={5}>5</option>
						<option value={10}>10</option>
					</select>
				</div>
			</div>

			<DndContext onDragEnd={handleDragEnd}>
				<div className={`game-board${pairCount >= 10 ? ' game-board--dense' : ''}`}>
					<div className='cards-column'>
						<h3>汉字</h3>
						<div className='cards-container'>
							{currentPairs.map((pair) => (
								<Card
									key={pair.characterCard.id}
									item={pair.characterCard}
									type='character'
									matched={matchedPairs.includes(pair.hanzi)}
									wrong={wrongCardIds.includes(pair.characterCard.id)}
									onClick={() => setSelectedCharacter(pair.characterCard)}
									selected={selectedCharacter?.id === pair.characterCard.id}
								/>
							))}
						</div>
					</div>

					<div className='cards-column'>
						<h3>{lang === 'en' ? 'English' : 'Français'}</h3>
						<div className='cards-container'>
							{translationCardsFrozen.map((pair) => (
								<Card
									key={pair.id}
									item={pair}
									type='translation'
									matched={matchedPairs.includes(pair.id.replace('-combined', ''))}
									wrong={wrongCardIds.includes(pair.id)}
									onClick={() => setSelectedTranslation(pair)}
									selected={selectedTranslation?.id === pair.id}
								/>
							))}
						</div>
					</div>
				</div>
			</DndContext>

			{showNextButton && (
				<div className='next-button-container'>
					<button type='button' onClick={handleNextRound} className='next-button ink-btn ink-btn--primary'>
						{lang === 'en' ? 'Next round' : 'Manche suivante'}
					</button>
				</div>
			)}
		</div>
	);
}

export default Matchpair;
