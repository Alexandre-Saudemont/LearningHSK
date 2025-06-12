import React, {useState} from 'react';
import HSK1 from '../data/hsk1-data.json';
import HSK2 from '../data/hsk2-data.json';
import HSK3 from '../data/hsk3-data.json';
import transformHSK1Data from '../utils/transformHSKdata';
import {DndContext} from '@dnd-kit/core';
import {Card} from './Card';
function Matchpair() {
	const [itemsHSK1, setItemsHSK1] = useState(transformHSK1Data(HSK1));
	const [itemsHSK2, setItemsHSK2] = useState(transformHSK1Data(HSK2));
	const [itemsHSK3, setItemsHSK3] = useState(transformHSK1Data(HSK3)); // Placeholder for HSK3 data
	const [level, setLevel] = useState('');

	function handleDragEnd({active, over}) {
		if (!over || active.id === over.id) return;

		const activeBase = active.id.split('-')[0];
		const overBase = over.id.split('-')[0];

		if (activeBase === overBase) {
			const updateItems = (items, setItems) => {
				setItems((prevItems) =>
					prevItems.map((item) => {
						if (item.id === active.id || item.id === over.id) {
							return {...item, matched: true};
						}
						return item;
					}),
				);
			};

			if (level === 'HSK1') {
				updateItems(itemsHSK1, setItemsHSK1);
			} else if (level === 'HSK2') {
				updateItems(itemsHSK2, setItemsHSK2);
			} else if (level === 'HSK3') {
				updateItems(itemsHSK3, setItemsHSK3);
			}
		} else {
			console.log(`Pas de match entre: ${activeBase} et ${overBase}`);
		}
	}

	function handleLevelChange(event) {
		setLevel(event.target.value);
	}

	const getCurrentItems = () => {
		if (level === 'HSK1') return itemsHSK1;
		if (level === 'HSK2') return itemsHSK2;
		if (level === 'HSK3') return itemsHSK3;
		return [];
	};
	return (
		<div className='matchpair'>
			<p className='matchpair-title'>Welcome to the Match Pair Game! Try to find all matching pairs.</p>
			<select className='level-selector' value={level} onChange={handleLevelChange}>
				<option value='HSK1'>HSK1</option>
				<option value='HSK2'>HSK2</option>
				<option value='HSK3'>HSK3</option>
			</select>
			<DndContext onDragEnd={handleDragEnd}>
				<div className='cards-container'>
					{getCurrentItems().map((item) => (
						<Card key={item.id} item={item} />
					))}
				</div>
			</DndContext>
		</div>
	);
}

export default Matchpair;
