import React, {useState} from 'react';
import './LevelSelect.css';

const LEVELS = [
	{
		id: 'HSK1',
		label: 'HSK 1',
		blurb: 'Bases · premiers caractères et mots du quotidien.',
		accent: 'jade',
	},
	{
		id: 'HSK2',
		label: 'HSK 2',
		blurb: 'Essentiel · vocabulaire courant pour dialogues simples.',
		accent: 'porcelain',
	},
	{
		id: 'HSK3',
		label: 'HSK 3',
		blurb: 'Intermédiaire · phrases plus longues et thèmes variés.',
		accent: 'vermillion',
	},
	{
		id: 'HSK4',
		label: 'HSK 4',
		blurb: 'Avancé · textes et conversations du quotidien plus riches.',
		accent: 'lotus',
	},
	{
		id: 'HSK5',
		label: 'HSK 5',
		blurb: 'Lecture fluide · registres variés et nuances.',
		accent: 'amber',
	},
	{
		id: 'HSK6',
		label: 'HSK 6',
		blurb: 'Maîtrise · vocabulaire étendu pour usages avancés.',
		accent: 'frost',
	},
];

const PAIR_OPTIONS = [5, 10];

const TRANSLATION_LANG = [
	{id: 'fr', label: 'FR'},
	{id: 'en', label: 'EN'},
];

export function LevelSelect({onBack, onPlay}) {
	const [pairCount, setPairCount] = useState(5);
	const [translationLang, setTranslationLang] = useState('fr');

	return (
		<div className='level-page'>
			<div className='level-shell'>
				<button type='button' className='ink-btn ink-btn--ghost level-back' onClick={onBack}>
					← Accueil
				</button>

				<h1 className='level-heading'>Choisir un niveau</h1>

				<div className='level-pairsRow'>
					<span className='level-pairsLabel'>Paires par manche</span>
					<div className='level-segment' role='group' aria-label='Nombre de paires'>
						{PAIR_OPTIONS.map((n) => (
							<button
								key={n}
								type='button'
								className={`level-segBtn ${pairCount === n ? 'is-active' : ''}`}
								onClick={() => setPairCount(n)}>
								{n}
							</button>
						))}
					</div>
				</div>

				<div className='level-pairsRow level-langRow'>
					<span className='level-pairsLabel'>Langue des sens</span>
					<div className='level-segment' role='group' aria-label='Langue affichée sur les cartes sens'>
						{TRANSLATION_LANG.map(({id, label}) => (
							<button
								key={id}
								type='button'
								className={`level-segBtn ${translationLang === id ? 'is-active' : ''}`}
								onClick={() => setTranslationLang(id)}>
								{label === 'FR' ? 'Français' : 'English'}
							</button>
						))}
					</div>
				</div>

				<ul className='level-grid'>
					{LEVELS.map((lv) => (
						<li key={lv.id}>
							<button
								type='button'
								className={`level-card level-card--${lv.accent}`}
								onClick={() => onPlay({level: lv.id, pairCount, translationLang})}>
								<span className='level-card-num'>{lv.label.replace('HSK ', '')}</span>
								<span className='level-card-title'>{lv.label}</span>
								<span className='level-card-blurb'>{lv.blurb}</span>
								<span className='level-card-cta'>Jouer →</span>
							</button>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
