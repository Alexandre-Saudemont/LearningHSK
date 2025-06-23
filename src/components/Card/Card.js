import {useDraggable, useDroppable} from '@dnd-kit/core';
import './Card.css';
export function Card({item, onClick, type, selected, matched}) {
	const isMobile = window.innerWidth <= 768;

	const {
		attributes,
		listeners,
		setNodeRef: setDraggableRef,
		transform,
	} = useDraggable({
		id: item.id,
		disabled: matched || isMobile, // Désactiver drag sur mobile
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
			className={`card ${matched ? 'matched' : ''} ${isOver ? 'is-over' : ''} ${selected ? 'selected' : ''} ${type}`}
			style={{
				transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
			}}
			ref={setRef}
			onClick={onClick}
			{...(isMobile ? {} : listeners)}
			{...(isMobile ? {} : attributes)}>
			{item.content}
		</div>
	);
}
