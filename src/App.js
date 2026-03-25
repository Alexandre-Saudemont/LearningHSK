import './App.css';
import {useState} from 'react';
import {HomePage} from './components/Home/HomePage';
import {LevelSelect} from './components/LevelSelect/LevelSelect';
import Matchpair from './components/Matchpair/Matchpair';

function App() {
	const [screen, setScreen] = useState('home');
	const [gameConfig, setGameConfig] = useState(null);

	return (
		<div className='App'>
			{screen === 'home' && <HomePage onStart={() => setScreen('levels')} />}
			{screen === 'levels' && (
				<LevelSelect
					onBack={() => setScreen('home')}
					onPlay={(cfg) => {
						setGameConfig(cfg);
						setScreen('game');
					}}
				/>
			)}
			{screen === 'game' && gameConfig && (
				<Matchpair
					key={`${gameConfig.level}-${gameConfig.pairCount}-${gameConfig.translationLang ?? 'fr'}`}
					level={gameConfig.level}
					initialPairCount={gameConfig.pairCount}
					translationLang={gameConfig.translationLang ?? 'fr'}
					onBack={() => setScreen('levels')}
				/>
			)}
		</div>
	);
}

export default App;
