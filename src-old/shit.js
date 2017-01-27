
class Slice extends React.Component {
	constructor(){
		super()
		this.state = { isDragging: false }
	}
	beginDrag(){
		this.setState({ isDragging: true })

	    window.addEventListener('mousemove', this.handleMouseMove);
	    window.addEventListener('mouseup', this.handleMouseUp);
	},

	handleMouseMove() {
		
	},

	handleMouseUp() {
		
	},

	render(){
		return <div className="slice" style={{ opacity: this.state.isDragging ? 0.5 : 1 }}>
			<div className="header" onMouseDown={this.beginDrag.bind(this)}>
				wumbo
			</div>
			<div className="body">
				{this.props.thing}
			</div>
		</div>
	}
}

class BreadRow extends React.Component {
  render() {
    const { row } = this.props;
    return <div className="row">{row.map((thing, i) => 
			<Slice thing={thing} key={i} />
		)}</div>
  }
}

export default class Bread extends React.Component {
	constructor(){
		super()
		this.state = {
			// things: ['hello', 'darkness', 'my', 'old', 'friend'],
			rows: [
				['hello'],
				['darkness', 'my old'],
				['friend']
			]
		}
	}
	render(){
		return <div className="bread">{this.state.rows.map((row, i) => 
			<BreadRow row={row} key={i} />
		)}</div>
	}
}
