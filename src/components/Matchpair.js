import React, {useState} from 'react';
import HSK1 from '../data/hsk1-data.json';
import transformHSK1Data from '../utils/transformHSKdata';
import {DndContext} from '@dnd-kit/core';
import {Card} from './Card';
function Matchpair() {
	const [items, setItems] = useState(transformHSK1Data(HSK1));

	function handleDragEnd({active, over}) {
		if (!over || active.id === over.id) return;

		const activeBase = active.id.split('-')[0];
		const overBase = over.id.split('-')[0];

		if (activeBase === overBase) {
			setItems((prevItems) => prevItems.map((item) => (item.id === active.id || item.id === over.id ? {...item, matched: true} : item)));
		} else {
			console.log(`Pas de match entre: ${activeBase} et ${overBase}`);
		}
	}

	return (
		<div className='matchpair'>
			<p>Welcome to the Match Pair Game! Try to find all matching pairs.</p>
			<DndContext onDragEnd={handleDragEnd}>
				<div className='cards-container'>
					{items.map((item) => (
						<Card key={item.id} item={item} />
					))}
				</div>
			</DndContext>
		</div>
	);
}

export default Matchpair;
