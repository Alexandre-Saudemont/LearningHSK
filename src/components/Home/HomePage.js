import React, {useState} from 'react';
import './HomePage.css';

export function HomePage({onStart}) {
	const [howToOpen, setHowToOpen] = useState(false);

	return (
		<div className='hero'>
			<div className='hero-glow' aria-hidden />
			<div className='hero-card'>
				<p className='hero-eyebrow'>Apprendre le mandarin</p>
				<h1 className='hero-title'>LearningHSK</h1>
				<p className='hero-tagline'>Associe. Retiens. Progresse.</p>
				<p className='hero-lede'>Un jeu de paires pour mémoriser les caractères, le pinyin et le sens — du niveau HSK 1 au 3.</p>

				<div className='hero-actions'>
					<button type='button' className='ink-btn ink-btn--primary hero-cta' onClick={onStart}>
						Commencer
					</button>
					<button type='button' className='ink-btn ink-btn--ghost' onClick={() => setHowToOpen(true)}>
						Comment jouer ?
					</button>
				</div>
			</div>

			{howToOpen && (
				<div className='howto-backdrop' role='presentation' onClick={() => setHowToOpen(false)}>
					<div
						className='howto-dialog'
						role='dialog'
						aria-modal='true'
						aria-labelledby='howto-title'
						onClick={(e) => e.stopPropagation()}>
						<h2 id='howto-title' className='howto-title'>
							Comment jouer
						</h2>
						<ol className='howto-steps'>
							<li>
								<strong>Choisis</strong> un niveau HSK et le nombre de paires par manche.
							</li>
							<li>
								<strong>Sur ordinateur</strong>, glisse une carte sur sa traduction. <strong>Sur mobile</strong>, touche d’abord un caractère puis la traduction.
							</li>
							<li>
								<strong>Termine</strong> toutes les paires, puis valide <em>Manche suivante</em> pour continuer avec de nouveaux mots.
							</li>
						</ol>
						<button type='button' className='ink-btn ink-btn--primary howto-close' onClick={() => setHowToOpen(false)}>
							Compris
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
