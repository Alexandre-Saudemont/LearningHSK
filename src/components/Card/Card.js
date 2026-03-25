import {useDraggable, useDroppable} from '@dnd-kit/core';
import './Card.css';

function CardContent({item, type}) {
	if (type === 'translation' && typeof item.content === 'string') {
		const sep = ' - ';
		const idx = item.content.indexOf(sep);
		if (idx !== -1) {
			const pinyin = item.content.slice(0, idx);
			const meaning = item.content.slice(idx + sep.length);
			return (
				<span className='card-translationInner'>
					<span className='card-pinyinLine'>{pinyin}</span>
					<span className='card-meaningLine'>{meaning}</span>
				</span>
			);
		}
	}
	return item.content;
}

export function Card({item, onClick, type, selected, matched, wrong}) {
	const isMobile = window.innerWidth <= 768;

	const {
		attributes,
		listeners,
		setNodeRef: setDraggableRef,
		transform,
		isDragging,
	} = useDraggable({
		id: item.id,
		disabled: matched || isMobile,
	});

	const {setNodeRef: setDroppableRef, isOver} = useDroppable({
		id: item.id,
	});

	const setRef = (node) => {
		setDraggableRef(node);
		setDroppableRef(node);
	};

	return (
		<div
			className={`card ${matched ? 'matched' : ''} ${wrong ? 'wrong' : ''} ${isOver ? 'is-over' : ''} ${selected ? 'selected' : ''} ${isDragging ? 'is-dragging' : ''} ${type}`}
			style={{
				transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
			}}
			ref={setRef}
			onClick={onClick}
			{...(isMobile ? {} : listeners)}
			{...(isMobile ? {} : attributes)}>
			<CardContent item={item} type={type} />
		</div>
	);
}
