// why did i name this bread
import React from 'react';
import ReactDOM from 'react-dom';

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
      window.alert( // eslint-disable-line no-alert
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



const Dustbin = DropTarget('BOX', {
  drop() {
    return { name: 'Dustbin' };
  },
}, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop(),
}))(class Dustbin extends React.Component {
  render() {
    const { canDrop, isOver, connectDropTarget } = this.props;
    const isActive = canDrop && isOver;

    let backgroundColor = '#222';
    if (isActive) {
      backgroundColor = 'darkgreen';
    } else if (canDrop) {
      backgroundColor = 'darkkhaki';
    }



    return connectDropTarget(
      <div style={{ backgroundColor }}>
        {isActive ?
          'Release to drop' :
          'Drag a box here'
        }
      </div>,
    );
  }
})

import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

function Container(){
	// console.log(Dustbin, Box, DragDropContextProvider)
	// return <div>hi</div>
	return <div>
        <div>
          <div style={{ overflow: 'hidden', clear: 'both' }}>
            <Dustbin />
          </div>
          <div style={{ overflow: 'hidden', clear: 'both' }}>
            <Box name="Glass" />
            <Box name="Banana" />
            <Box name="Paper" />
          </div>
        </div>
     </div>
}


export default DragDropContext(HTML5Backend)(Container)