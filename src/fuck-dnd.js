
import { DropTarget } from 'react-dnd';
import { DragSource } from 'react-dnd';

const Box = DragSource('BOX', {
  beginDrag(props) {
    return {
      name: props.name,
    };
  },

  endDrag(props, monitor) {
    const item = monitor.getItem();
    const dropResult = monitor.getDropResult();

    if (dropResult) {
      console.log( // eslint-disable-line no-alert
        `You dropped ${item.name} into ${dropResult.name}!`,
      );
    }
  },
}, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging(),
}))(class Box extends React.Component {
  
  render() {

    const { isDragging, connectDragSource } = this.props;
    const { name } = this.props;
    const opacity = isDragging ? 0.4 : 1;

    return (
      connectDragSource(
        <div style={{ opacity }}>
          {name}
        </div>,
      )
    );
  }
})




import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';


const Slice = DropTarget('SLICE', {
  drop() {
    return { name: 'Another bread slice' };
  },
  hover(props, monitor, component) {
    const hoverBoundingRect = ReactDOM.findDOMNode(component).getBoundingClientRect();
    const hoverMiddleX = (hoverBoundingRect.left - hoverBoundingRect.right) / 2;
    const clientOffset = monitor.getClientOffset();
    const hoverClientX = hoverBoundingRect.left - clientOffset.x;

    // monitor.getItem().insertLeft = 
    // console.log(monitor.getItem().insertLeft)
    // component.setState({ insertLeft: hoverClientX > hoverMiddleX })
    console.log('set state', component)
  }
}, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver({ shallow: true }),
  canDrop: monitor.canDrop(),
  insertLeft: monitor.canDrop() && monitor.getItem().insertLeft
}))(DragSource('SLICE', {
  beginDrag(props) {
    return {
      name: props.name,
    };
  },
  endDrag(props, monitor) {
    const item = monitor.getItem();
    const dropResult = monitor.getDropResult();
    const hasDroppedOnChild = monitor.didDrop();
    
    // if (hasDroppedOnChild) return;

    if (dropResult) {
      console.log( // eslint-disable-line no-alert
        `You dropped ${item.name} into ${dropResult.name}!`,
      );
    }
  },
}, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging(),
  connectDragPreview: connect.dragPreview(),

}))(class _Slice extends React.Component {
	constructor(){
		super()
		this.state = {}
	}
	render(){
		const { isDragging, connectDragSource, connectDragPreview } = this.props;
    	const opacity = isDragging ? 0.4 : 1;

    	const { canDrop, isOver, connectDropTarget, row } = this.props;
    	const { insertLeft } = this.state;
    	const isActive = canDrop && isOver;

    	var style = {}
    	if(isActive){
    		console.log("il", insertLeft)
    		if(insertLeft){
    			style.borderLeft = '5px solid orange'
    		}else{
    			style.borderRight = '5px solid orange'
    		}
	    	
	    	// style.marginLeft = '-5px'
	    }

		return connectDropTarget(connectDragPreview(<div className="slice" style={{ ...style, opacity }}>
			{connectDragSource(<div className="header">
				wumbo
			</div>)}
			<div className="body">
				{this.props.thing}
			</div>
		</div>))
	}
}))



const BreadRow = DropTarget('SLICE', {
  drop() {
    return { name: 'BreadRow' };
  },
}, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver({ shallow: true }),
  canDrop: monitor.canDrop(),
}))(class BreadRow extends React.Component {
  render() {
    const { canDrop, isOver, connectDropTarget, row } = this.props;
    const isActive = canDrop && isOver;
    var style = {}
    // let backgroundColor = 'white';
    // if (isActive) {
    //   backgroundColor = 'darkgreen';
    // } else if (canDrop) {
    //   backgroundColor = 'blue';
    // }

    if(isActive){
    	style.borderTop = '5px solid orange'
    	style.marginTop = '-5px'
    }

    return connectDropTarget(
      <div className="row" style={{ ...style }}>{row.map((thing, i) => 
			<Slice thing={thing} key={i} />
		)}</div>
    );
  }
})

// class BreadRow extends React.Component {
//   render() {
//     const { row } = this.props;
//     return <div className="row">{row.map((thing, i) => 
// 			<Slice thing={thing} key={i} />
// 		)}</div>
//   }
// }

class Bread extends React.Component {
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


// function Container(){
// 	// console.log(Dustbin, Box, DragDropContextProvider)
// 	// return <div>hi</div>
// 	return <div>
//         <div>
//           <div style={{ overflow: 'hidden', clear: 'both' }}>
//             <Dustbin />
//           </div>
//           <div style={{ overflow: 'hidden', clear: 'both' }}>
//             <Box name="Glass" />
//             <Box name="Banana" />
//             <Box name="Paper" />
//           </div>
//         </div>
//      </div>
// }




export default DragDropContext(HTML5Backend)(Bread)
