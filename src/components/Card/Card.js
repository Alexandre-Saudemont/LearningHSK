import {useDraggable, useDroppable} from '@dnd-kit/core';
import './Card.css';
export function Card({item}) {
	const {
		attributes,
		listeners,
		setNodeRef: setDraggableRef,
		transform,
	} = useDraggable({
		id: item.id,
		disabled: item.matched,
	});

	const {setNodeRef: setDroppableRef, isOver} = useDroppable({
		id: item.id,
	});

	const setRef = (node) => {
		setDraggableRef(node);
		setDroppableRef(node);
	};
	// Pour le faire sans passer par un fichier CSS, on peut faire comme suit :
	// const style = {
	// 	transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
	// 	border: '2px solid ' + (isOver ? '#007bff' : '#ccc'),
	// 	backgroundColor: item.matched ? '#d4edda' : '#fff',
	// 	padding: '10px',
	// 	margin: '10px',
	// 	display: 'inline-block',
	// 	cursor: item.matched ? 'not-allowed' : 'grab',
	// 	opacity: item.matched ? 0.5 : 1,
	// 	minWidth: '80px',
	// 	textAlign: 'center',
	// };

	return (
		<div
			className={`card ${item.matched ? 'matched' : ''} ${isOver ? 'is-over' : ''}`}
			style={{transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined}}
			ref={setRef}
			{...listeners}
			{...attributes}>
			{item.content}
		</div>
	);
}
