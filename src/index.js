import React from 'react';
import ReactDOM from 'react-dom';

import "./app.css"
import "./dag.css"
import Bread from './bread.js'
import Widget from './widget.js'

function reduce(prev, delta){
    if(!prev) return { version: 0, data: '' };

    return {
        version: prev.version + 1,
        data: delta.text
    }
}


function getState(store, id){
    var commit = store[id];
    if(!commit) return reduce(null, null);
    return reduce(getState(store, commit.parent), commit.delta);
}

function getPath(store, id){
    var commit = store[id];
    if(!commit) return [null];
    return getPath(store, commit.parent).concat([id])
}


var childStore = null,
    childMapping = {};

function getChildren(store, id){
    // return Object.keys(store).filter(k => store[k].parent === id);

    if(store !== childStore){
        childStore = store;
        childMapping = {}
        for(var k in store){
            var parent = store[k].parent;
            if(!childMapping[parent]){
                childMapping[parent] = [k];
            }else{
                childMapping[parent].push(k)
            }
        }
    }
    return childMapping[id] || [];
}


function computeAnchor(store, id){
    var children = getChildren.bind(this, store)
    var node = id;
    var ch = children(node);
    while(ch.length > 0){
        node = ch[0]
        ch = children(node)
    }
    return node;
}

function getCurrentChunk(store, id, views, messages){
    var children = getChildren.bind(this, store)
    var node = id;
    var ch = children(node);

    while(ch.length === 1 
        && node 
        // && !views.some(k => k.anchor == node)
        && !(messages[node])
        ){
        node = ch[0]
        // trail.push(node)
        ch = children(node)
    }
    return node;
}



var textNode = document.createElementNS("http://www.w3.org/2000/svg","text");
var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svg.setAttribute('class', 'measure')
svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
document.body.appendChild(svg);
svg.appendChild(textNode)

function measureText(text){
    if(!text.trim()) return 0;
    textNode.textContent = text;
    return textNode.getComputedTextLength();
}


export default function DAG(props){
    var store = props.store,
        view = props.view,
        messages = props.messages;

    const v_spacing = 25;
    const v_height = 20;

    const h_spacing = 10;

    var children = getChildren.bind(this, store)
    var path = getPath(store, view.anchor);

    var elements = [],
        lines = [];

    function recursive(node, x, y){
        var ch = children(node);
        var trail = [node]
        while(ch.length === 1 
            && node 
            && !(props.messages[node])
        ){
            node = ch[0]
            trail.push(node)
            ch = children(node)
        }

        if(!node){

        }else{
            // console.log(trail.includes(view.pointer))
            var rect_width = 10 * Math.sqrt(trail.length + 1)

            var label = messages[node] || '';

            rect_width = Math.max(rect_width, 5 + measureText(label))
        
            elements.push(<rect 
                key={'r-' + node}
                x={x} y={y - v_height/2} 
                rx={2} ry={2}
                width={rect_width} height={v_height} className={trail.includes(view.pointer) ? 'active' : (
                    path.includes(node) ? 'mainline' : 'inactive') }
                onClick={e => props.setPointer(node)}/>);

            if(trail.includes(view.pointer) && trail.length > 0){
                var trailIndex = trail.indexOf(view.pointer),
                    eps = 0.001;
                elements.push(<circle 
                    key={'c-' + node}
                    cx={x + rect_width * ((trailIndex + eps) / (trail.length - 1 + eps) )} 
                    cy={y} r={3} className="active" />)
            }

            elements.push(<text key={'t-'+node} x={2+x} y={y}>{label}</text>)

            x += rect_width;
        }

        var y1 = y;
        for(var i = 0; i < ch.length; i++){
            var child = ch[i]
            if(i > 0) y1 += v_spacing;

            // if(node) lines.push(<line 
            //     x1={x} y1={y} 
            //     x2={x + h_spacing} y2={y1}
            //     className={path.includes(child) ? 'mainline' : 'inactive'} />)

            if(node) lines.push(<path 
                key={'p-' + child}
                d={curvedHorizontal(x,y,x + h_spacing,y1)}
                className={path.includes(child) ? 'mainline' : 'inactive'} />)
            y1 = recursive(child, x + h_spacing, y1);
            
        }
        return y1;
    }

    var height = 10 + recursive(null, -h_spacing, 10);
    return <svg className="dag" height={height}>{lines}{elements}</svg>
}


// https://github.com/hughsk/svg-line-curved/blob/master/index.js
function curvedHorizontal(x1, y1, x2, y2) {
    var line = []
    var mx = x1 + (x2 - x1) / 2

    line.push('M', x1, y1)
    line.push('C', mx, y1, mx, y2, x2, y2)

    return line.join(' ')
}


function Slice(props){
    var pointer = props.view.pointer || null,
        anchor = props.view.anchor || null;

    var state = getState(props.store, pointer);
    var path = getPath(props.store, anchor);
    var pathIndex = path.indexOf(pointer);
    var chunk = getCurrentChunk(props.store, pointer, props.views, props.messages);

    var updatePointer = (id) => {
        if(path.includes(id)){
            props.update({ pointer: id })    
        }else{
            // TODO: find a suitable end-of-line for anchor
            props.update({ pointer: id, anchor: computeAnchor(props.store, id) })
        }
    }

    var commit = (delta) => {
        var id = 'C' + Date.now();
        props.appendStore(id, { 
            parent: pointer, 
            delta: delta,
            date: Date.now()
        })
        updatePointer(id)
    }

    var fork = () => {
        props.fork()
        if(!props.messages[props.view.pointer]){
            props.setMessage(props.view.pointer, 'r' + pathIndex)
        }
    }

    var save = () => {
        if(!props.messages[props.view.pointer]){
            props.setMessage(props.view.pointer, 'r' + pathIndex)
        }
    }

    /*
    <div className="body">
        <pre>{JSON.stringify(props.view)}</pre>
        <pre>{JSON.stringify(state)}</pre>

        <textarea 
            value={state.data} 
            onChange={e => commit({ text: e.target.value }) } />
    </div>


    */

    var compare;
    if(props.viewIndex){
        compare = getState(props.store, props.getView(props.viewIndex).pointer || null)
    }

    return <div className={"slice " + (props.isDragging ? 'dragging ' : '') + (props.viewIndex == props.view.id ? 'reference ' : '')}>
        <div className="header" onMouseDown={props.beginDrag}>
            <input type="text" className="title" value={props.messages[chunk] || ''} placeholder="(no commit message)" 
                onChange={e => props.setMessage(chunk, e.target.value) }/>

            

            <div className={"button " + (props.viewIndex == props.view.id ? 'active' : 'inactive')} 
                onClick={e => props.toggleFocus(props.view.id)}>
                <i className="fa fa-compress" aria-hidden="true" /></div>

            <div className={"button " + (props.view.showFooter?'active':'inactive')} 
                onClick={e => props.update({ showFooter: !props.view.showFooter })}>
                <i className="fa fa-history" aria-hidden="true" /></div>

            <div className="button" onClick={fork}>
                <i className="fa fa-code-fork" aria-hidden="true" /></div>

            <div className="button" onClick={props.close}>
                <i className="fa fa-close" aria-hidden="true" /></div>


        
        </div>

        {props.view.showFooter ? <div className="footer"> 
            <input type="range" className="time-slider" min={0} max={path.length - 1} 
                disabled={path.length < 2}
                onChange={e => updatePointer(path[e.target.value])}
                value={path.indexOf(pointer)} />

            <DAG 
                store={props.store} 
                view={props.view} 
                messages={props.messages}
                views={props.views}
                setPointer={updatePointer} />
        </div> : null}
        
        <Widget 
            undo={e => (pathIndex > 0) && updatePointer(path[pathIndex - 1])}
            redo={e => (pathIndex < path.length - 1) && updatePointer(path[pathIndex + 1])}
            fork={e => fork()}
            save={e => save()}

            compare={compare}
            state={state} 
            commit={commit} />
        
    </div>
}



class App extends React.Component {
    constructor(){
        super()
        this.state = {
            store: {
            },
            messages: {},
        }
    }
    render(){
        return <div>
            <div className="main-header">
                <h1>derp notebook</h1>
            </div>
            <Bread 
                Slice={Slice} 
                
                store={this.state.store}
                messages={this.state.messages}
                viewIndex={this.state.viewIndex}

                toggleFocus={id => this.setState({ viewIndex: this.state.viewIndex == id ? null : id })}
                appendStore={(id, value) => this.setState({ store: 
                            Object.assign({}, this.state.store, { [id]: value }) })}
                setMessage={(id, message) => this.setState({ messages: 
                            Object.assign({}, this.state.messages, { [id]: message })})} />
        </div>    
    }
}


ReactDOM.render(
    <App />,
    document.getElementById('root')
);
