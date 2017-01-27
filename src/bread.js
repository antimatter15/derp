// why did i name this bread
import React from 'react';
import ReactDOM from 'react-dom';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group' // ES6
import FlipMove from 'react-flip-move';

import './bread.css';
import 'font-awesome/css/font-awesome.css';


class Slice extends React.Component {
	render(){
		return <div className={"slice " + (this.props.isDragging ? 'dragging' : '')}>
			<div className="header" onMouseDown={this.props.beginDrag}>
				{this.props.thing.id}
				<div className="button" onClick={this.props.close}>
					<i className="fa fa-close" aria-hidden="true" /></div>
				<div className="button" onClick={this.props.fork}>
					<i className="fa fa-code-fork" aria-hidden="true" /></div>

			</div>
			<div className="body">
				{JSON.stringify(this.props.thing)}
			</div>
		</div>
	}
}


function sqr(x) { return x * x }
function dist2(v, w) { return sqr(v.x - w.x) + sqr(v.y - w.y) }
function distToSegmentSquared(p, v, w) {
  var l2 = dist2(v, w);
  if (l2 == 0) return dist2(p, v);
  var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return dist2(p, { x: v.x + t * (w.x - v.x),
                    y: v.y + t * (w.y - v.y) });
}
function distToSegment(p, v, w) { return Math.sqrt(distToSegmentSquared(p, v, w)); }

function uuid(){
	return Math.random().toString(36).slice(5, 10)
}


class Bread extends React.Component {
	constructor(){
		super()
		this.state = {
			// things: ['hello', 'darkness', 'my', 'old', 'friend'],
			rows: [
				// {id: 'a', elements: ['hello']},
				// {id: 'b', elements: ['darkness', 'my old']},
				// {id: 'c', elements: ['friend']}
			],
			dragThing: null
		}
		this.mouseMove = this.mouseMove.bind(this)
		this.mouseUp = this.mouseUp.bind(this)
	}
	beginDrag(thing, e){
		// console.log('begin drag', thing, e)
		this.setState({
			dragThing: thing
		})
		window.addEventListener('mousemove', this.mouseMove)
		window.addEventListener('mouseup', this.mouseUp)
	}
	mouseMove(e){
		if(this.state.dragThing){
			e.preventDefault()
		}
		var clientY = e.clientY;
		var el = ReactDOM.findDOMNode(this);
		var rows = el.querySelectorAll('.row');
		var thingRect;

		var lines = []
		for(var i = 0; i < rows.length; i++){
			var rect = rows[i].getBoundingClientRect()
			if(i === 0){
				lines.push({
					x0: rect.left, x1: rect.right,
					y0: rect.top, y1: rect.top,
					pos: 'top-' + i
				})
			}
			lines.push({
				x0: rect.left, x1: rect.right,
				y0: rect.bottom, y1: rect.bottom,
				pos: 'bottom-' + i
			})

			var slices = rows[i].querySelectorAll('.slice');
			for(var j = 0; j < slices.length; j++){
				var rect = slices[j].getBoundingClientRect()
				if(j === 0){
					lines.push({
						x0: rect.left, x1: rect.left,
						y0: rect.top, y1: rect.bottom,
						pos: 'left-' + i + '-' + j
					})	
				}
				lines.push({
					x0: rect.right, x1: rect.right,
					y0: rect.top, y1: rect.bottom,
					pos: 'right-' + i + '-' + j
				})

				if(this.state.dragThing == i + '-' + j){
					thingRect = rect;
				}
			}
		}

		


		lines.forEach(k => {
			k.dist = distToSegment(
				{ x: e.clientX, y: e.clientY }, 
				{ x: k.x0, y: k.y0 }, 
				{ x: k.x1, y: k.y1 })
		})

		var closestPos = lines.sort((a, b) => a.dist - b.dist)[0].pos
		var thing = this.state.dragThing.split('-');

		if(e.clientX > thingRect.left && e.clientX < thingRect.right
			&& e.clientY > thingRect.top && e.clientY < thingRect.bottom){

			closestPos = (+thing[1] == 0) ? 
				('left-' + thing.join('-')) : 
				('right-' + [thing[0], thing[1] - 1].join('-'))
		}
		// console.log(closestPos.pos)


		// console.log(i)
		if(this.state.activeRow !== i){
			this.setState({
				activeRow: closestPos
			})	
		}
		
		// console.log('moving', e, )
	}
	mouseUp(e){
		var nextRows = this.state.rows;
		if(this.state.activeRow){
			var pos = this.state.activeRow.split('-');
			var thing = this.state.dragThing.split('-');

			nextRows = JSON.parse(JSON.stringify(this.state.rows));
			

			if(pos[0] === 'top' || pos[0] === 'bottom'){
				if((nextRows[+thing[0]].elements.length == 1) &&
					((pos[0] === 'top'  && +thing[0] === +pos[1]) || 
					(pos[0] === 'bottom' && +thing[0] === parseInt(pos[1])+1) ||
					(pos[0] === 'bottom' && +thing[0] === +pos[1]) )
				){
				}else{
					var oldThing = nextRows[+thing[0]].elements.splice(+thing[1], 1)[0];
					var newRow = { id: uuid(), elements: [ oldThing ] }
					if(pos[0] === 'top'){
						nextRows.splice(+pos[1], 0, newRow)
					}else{
						nextRows.splice(1 + parseInt(pos[1]), 0, newRow)
					}	
				}
			}else if(pos[0] === 'left' || pos[0] === 'right'){
				// swap it with null
				var oldThing = nextRows[+thing[0]].elements.splice(+thing[1], 1, null)[0];

				if(pos[0] === 'left'){
					nextRows[+pos[1]].elements.splice(+pos[2], 0, oldThing)
				}else{
					nextRows[+pos[1]].elements.splice(1 +parseInt(pos[2]), 0, oldThing)
				}
				// actually remove the thing
				nextRows[+thing[0]].elements = nextRows[+thing[0]].elements.filter(k => k !== null)

			}

			nextRows = nextRows.filter(k => k.elements.length > 0)
		}



		this.setState({
			dragThing: null,
			activeRow: null,
			rows: nextRows
		})
		window.removeEventListener('mousemove', this.mouseMove)
		window.removeEventListener('mouseup', this.mouseUp)
	}

	render(){
		var drag = {
			begin: this.beginDrag.bind(this),
			thing: this.state.dragThing
		}
		return <div className="bread" style={{ cursor: this.state.dragThing ? 'move' : 'default' }}>
		<FlipMove>
		{this.state.rows.map((row, rowi) => 
			<div className={"row " + (
				(this.state.activeRow === ('top-' + rowi) ? 'insert-top ' : '') +
				(this.state.activeRow === ('bottom-' + rowi) ? 'insert-bottom ' : '') +
				('row-' + row.elements.length + ' ')
			)} key={row.id}>
			<ReactCSSTransitionGroup
	          transitionName="example"
	          transitionEnterTimeout={300}
	          transitionLeaveTimeout={300}>

			{row.elements.map((data, coli) => 
				<div className={"col " + (
					(this.state.activeRow === ('left-' + rowi + '-' + coli) ? 'insert-left ' : '') +
					(this.state.activeRow === ('right-' + rowi + '-' + coli) ? 'insert-right ' : '')
				)} key={data.id}>
					<Slice thing={data} 
					isDragging={this.state.dragThing === [rowi, coli].join('-')}
					fork={e => {
						var newRows = JSON.parse(JSON.stringify(this.state.rows));
						newRows[rowi].elements.splice(coli + 1, 0, { id: uuid() })
						this.setState({ rows: newRows })
					}}
					close={e => {
						var newRows = JSON.parse(JSON.stringify(this.state.rows));
						newRows[rowi].elements.splice(coli, 1)
						this.setState({ rows: newRows.filter(k => k.elements.length > 0) })
					}}
					beginDrag={
						e => this.beginDrag([rowi, coli].join('-'), e)
					} />
				</div>
			)}
			</ReactCSSTransitionGroup>
			</div>
		)}

		<div className="fake-row row-1" onClick={e => this.setState({ rows: 
			this.state.rows.concat([{ id: uuid(), elements: [{ id: uuid() }] }])
		})}>
			<span>
				<div className="col">
					<div className="fake-slice">+</div>
				</div>
			</span>
		</div>

		</FlipMove>
		</div>
	}
}

export default function App(){


	return <div>
		<div className="main-header">
			<h1>notebook layout</h1>
		</div>
		<Bread />
	</div>
}
