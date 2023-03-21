import { useRef, useState } from 'react'
import { available, DataType } from './data'
import CardSvg from "./assets/card.svg";
function App() {
	const [data, setData] = useState(available);
	const [isDragging, setIsDragging] = useState(undefined as number | undefined);
	const containerRef = useRef<HTMLDivElement>(null);
	const detectLeftButton = (e: React.PointerEvent) => {
		e = e || window.event;
		if ("buttons" in e) {
			return e.buttons === 1;
		}
		return false
		// let button  = e.which || e.button;
		// console.log(button)
		// return button === 1
	}
	const dragStart = (e: React.PointerEvent, index: number) => {
		if (!detectLeftButton(e)) return; //only accept for left mouse click

		setIsDragging(index);

		const container = containerRef.current;
		const items = [...container?.childNodes!];
		const dragItem = items[index]
		const itemsBelowDragItem = items.slice(index + 1);
		const notDragItems = items.filter((_, i) => i !== index)

		const dragData = data[index];
		let newData: DataType[];
		//getBoundingClientRect of item
		const dragBoundingRect = (dragItem as HTMLElement).getBoundingClientRect();

		//distance between two card
		const space = (items[1] as HTMLElement).getBoundingClientRect().top - (items[0] as HTMLElement).getBoundingClientRect().bottom;

		//set style for dragItem when mouse down
		//#region style for dragitem
		(dragItem as HTMLElement).style.position = "fixed";
		(dragItem as HTMLElement).style.zIndex = "5000";
		(dragItem as HTMLElement).style.width = `${dragBoundingRect.width}px`;
		(dragItem as HTMLElement).style.height = `${dragBoundingRect.height}px`;
		(dragItem as HTMLElement).style.top = `${dragBoundingRect.top}px`;
		(dragItem as HTMLElement).style.left = `${dragBoundingRect.left}px`;
		(dragItem as HTMLElement).style.cursor = "grabbing";
		//#endregion


		//create alternative div element when dragItem postion is fixed
		//#region Create a new div for element drag
		const div = document.createElement("div");
		div.id = "div-temp";
		div.style.width = `${dragBoundingRect.width}px`;
		div.style.height = `${dragBoundingRect.height}px`;
		div.style.pointerEvents = "none";
		container?.appendChild(div);
		//#endregion


		//move the elements below dragItem
		//distance to be moved.
		const distance = dragBoundingRect.height + space;


		itemsBelowDragItem.forEach(item => {
			(item as HTMLElement).style.transform = `translateY(${distance}px)`;
		})

		//get the original coordinates of the mouse pointer
		let x = e.clientX;
		let y = e.clientY;
		//perform the function on hover
		document.onpointermove = (e) => {
			//Calculate the distance the mouse pointer has traveled
			//original coordinates minus current coordinates
			const posX = e.clientX - x;
			const posY = e.clientY - y;
			//move item
			(dragItem as HTMLElement).style.transform = `translate(${posX}px, ${posY}px)`;

			//swap position and data
			notDragItems.forEach(item => {
				//check two element is overlapping
				const rect1 = (dragItem as HTMLElement).getBoundingClientRect();
				const rect2 = (item as HTMLElement).getBoundingClientRect();

				let isOverlapping = rect1.y < rect2.y + (rect2.height / 2) &&
					rect1.y + (rect1.height / 2) > rect2.y;
				if (isOverlapping) {
					if ((item as HTMLElement).getAttribute("style")) {
						(item as HTMLElement).style.transform = "";
						index++;
					} else {
						(item as HTMLElement).style.transform = `translateY(${distance}px)`;
						index--;
					}

					//swap data
					newData = data.filter(item => item.id !== dragData.id);
					newData.splice(index, 0, dragData);
				}
			})
		}

		document.onpointerup = () => {
			//#region Reset data

			document.onpointerup = null;
			document.onpointermove = null;

			setIsDragging(undefined);
			(dragItem as HTMLElement).style.position = "";
			(dragItem as HTMLElement).style.zIndex = "";
			(dragItem as HTMLElement).style.width = ``;
			(dragItem as HTMLElement).style.height = ``;
			(dragItem as HTMLElement).style.top = ``;
			(dragItem as HTMLElement).style.left = ``;
			(dragItem as HTMLElement).style.cursor = "";
			container?.removeChild(div);

			items.forEach(item => {
				(item as HTMLElement).style.transform = ``;
			})
			setData(newData)
			//#endregion
		}
	}

	return (
		<>
			<h1 style={{ position: "fixed", top: "5%", left: "50%", transform: "translateX(-50%)" }}>React Drag and Drop Example</h1>
			<div className="container" ref={containerRef}>
				{
					data && data.map((item, index) => (
						<div key={item.id} onPointerDown={e => dragStart(e, index)}>
							<div className={`card ${isDragging === index ? "dragging" : ""}`}>
								<div className="img-container">
									<img src={CardSvg} alt="" />
								</div>
								<div className="box">
									<h4>{item.subtitle}</h4>
									<h2>{item.title}</h2>
								</div>
							</div>
						</div>
					))
				}
			</div>
		</>

	)
}

export default App
