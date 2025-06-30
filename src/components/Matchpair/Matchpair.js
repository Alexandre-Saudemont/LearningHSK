import React, {useState, useMemo, useEffect} from 'react';
import HSK1 from '../../data/hsk1-data.json';
import HSK2 from '../../data/hsk2-data.json';
import HSK3 from '../../data/hsk3-data.json';
import transformHSKdata from '../../utils/transformHSKdata';
import {DndContext} from '@dnd-kit/core';
import {Card} from '../Card/Card';
import './Matchpair.css';

function Matchpair() {
	// États initiaux
	const [itemsHSK1, setItemsHSK1] = useState(transformHSKdata(HSK1));
	const [itemsHSK2, setItemsHSK2] = useState(transformHSKdata(HSK2));
	const [itemsHSK3, setItemsHSK3] = useState(transformHSKdata(HSK3));
	const [level, setLevel] = useState('');
	const [pairCount, setPairCount] = useState(5);
	const [matchedPairs, setMatchedPairs] = useState([]);
	const [showNextButton, setShowNextButton] = useState(false);
	const [gameRound, setGameRound] = useState(0);
	const [currentPairs, setCurrentPairs] = useState([]);
	const [translationCardsFrozen, setTranslationCardsFrozen] = useState([]);
	const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
	const [selectedCharacter, setSelectedCharacter] = useState(null);
	const [selectedTranslation, setSelectedTranslation] = useState(null);
	const allPairs = useMemo(() => {
		let items = [];
		if (level === 'HSK1') items = itemsHSK1;
		if (level === 'HSK2') items = itemsHSK2;
		if (level === 'HSK3') items = itemsHSK3;

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
	}, [level, itemsHSK1, itemsHSK2, itemsHSK3]);

	// Mélanger un tableau
	function shuffleArray(array) {
		const newArray = [...array];
		for (let i = newArray.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[newArray[i], newArray[j]] = [newArray[j], newArray[i]];
		}
		return newArray;
	}

	// Sélectionner les paires pour la manche actuelle
	useEffect(() => {
		if (!level) return;

		const availablePairs = allPairs.filter((pair) => !matchedPairs.includes(pair.hanzi));
		const selectedPairs = shuffleArray(availablePairs).slice(0, pairCount);
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
			}

			// Reset sélection
			setTimeout(() => {
				setSelectedCharacter(null);
				setSelectedTranslation(null);
			}, 300);
		}
	}, [selectedCharacter, selectedTranslation]);

	// Gérer le drag and drop
	function handleDragEnd({active, over}) {
		if (!over || active.id === over.id) return;

		const activeId = active.id.endsWith('-combined') ? active.id.replace('-combined', '') : active.id;
		const overId = over.id.endsWith('-combined') ? over.id.replace('-combined', '') : over.id;

		if (activeId === overId) {
			const newMatchedPairs = [...matchedPairs, activeId];
			setMatchedPairs(newMatchedPairs);

			//  Met à jour l'état matched dans currentPairs
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

			// Vérifie si tous les pairs sont trouvés
			const allCurrentPairsMatched = currentPairs.every((pair) => newMatchedPairs.includes(pair.hanzi));
			setShowNextButton(allCurrentPairsMatched);
		}
	}

	function handleLevelChange(event) {
		setLevel(event.target.value);
		setMatchedPairs([]);
		setGameRound((prev) => prev + 1);
	}

	function handlePairCountChange(event) {
		setPairCount(Number(event.target.value));
		setGameRound((prev) => prev + 1);
	}

	function handleNextRound() {
		setMatchedPairs([]);
		setGameRound((prev) => prev + 1);
	}

	return (
		<div className='matchpair'>
			<h1 className='matchpair-title'>Chinese Match Pair Game</h1>
			<p className='matchpair-subtitle'>Match characters with their translations</p>

			<div className='controls'>
				<div className='control-group'>
					<label htmlFor='level-select'>HSK Level:</label>
					<select id='level-select' className='level-selector' value={level} onChange={handleLevelChange}>
						<option value=''>Select Level</option>
						<option value='HSK1'>HSK 1</option>
						<option value='HSK2'>HSK 2</option>
						<option value='HSK3'>HSK 3</option>
					</select>
				</div>

				<div className='control-group'>
					<label htmlFor='pair-count'>Number of Pairs:</label>
					<select id='pair-count' className='count-selector' value={pairCount} onChange={handlePairCountChange}>
						<option value={5}>5 pairs</option>
						<option value={10}>10 pairs</option>
						<option value={15}>15 pairs</option>
						<option value={20}>20 pairs</option>
						<option value={25}>25 pairs</option>
					</select>
				</div>
			</div>

			<div className='stats'>
				<p>
					Matched: {matchedPairs.length}/{currentPairs.length} pairs
				</p>
			</div>

			<DndContext onDragEnd={handleDragEnd}>
				<div className='game-board'>
					<div className='cards-column'>
						<h3>汉字 (Characters)</h3>
						<div className='cards-container'>
							{currentPairs.map((pair) => (
								<Card
									key={pair.characterCard.id}
									item={pair.characterCard}
									type='character'
									matched={matchedPairs.includes(pair.hanzi)}
									onClick={() => setSelectedCharacter(pair.characterCard)}
									selected={selectedCharacter?.id === pair.characterCard.id}
								/>
							))}
						</div>
					</div>

					<div className='cards-column'>
						<h3>Translation</h3>
						<div className='cards-container'>
							{translationCardsFrozen.map((pair) => (
								<Card
									key={pair.id}
									item={pair}
									type='translation'
									matched={matchedPairs.includes(pair.id.replace('-combined', ''))}
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
					<button onClick={handleNextRound} className='next-button'>
						Next Round
					</button>
				</div>
			)}
		</div>
	);
}

export default Matchpair;
