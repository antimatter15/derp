import React from 'react';
import ReactDOM from 'react-dom';
// import App from './App';
import './index.css';




function reduce(prev, delta){
    if(!prev) return { version: 0, data: '' };

    return {
        version: prev.version + 1,
        data: delta.text
    }
}


function getState(store, id){
    var commit = store[id];
    if(!commit) return null;
    return reduce(getState(store, commit.parent), commit.delta);
}

function getPath(store, id){
    var commit = store[id];
    if(!commit) return [];
    return getPath(store, commit.parent).concat([id])
}

function getChildren(store, id){
    return Object.keys(store).filter(k => store[k].parent == id);
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

    while(ch.length == 1 
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

import CodeMirror from 'codemirror';
import 'codemirror/mode/javascript/javascript'
import 'codemirror/lib/codemirror.css'
import 'codemirror/keymap/sublime'

import "codemirror/addon/edit/closebrackets"
import 'codemirror/addon/edit/matchbrackets'
import "codemirror/addon/comment/comment"

var DiffMatchPatch = require('diff-match-patch');
var dmp = new DiffMatchPatch();
global.dmp = dmp

class CodeEditor extends React.Component {
    componentDidMount(){
        var el = ReactDOM.findDOMNode(this);
        var cm = CodeMirror(el, {
            value: this.props.value,
            mode: 'javascript',

            matchBrackets: true,
            lineNumbers: true,
            keyMap: 'sublime',
            autoCloseBrackets: true,
            lineWrapping: true,
            undoDepth: 0,
            
            tabSize: 4,
            indentUnit: 4,
            indentWithTabs: false,
        })
        this.cm = cm;
        
        cm.on('change', (cm, ch) => {
            if(ch.origin != 'setValue' && cm.getValue() != this.props.value){
                this.props.onChange(cm.getValue())
            }
            // console.log(cm.getValue(), ch)
            // this.props.onChange(cm.getValue())
        })
        this.updateDiff()
    }
    updateDiff(){

        this.cm.getAllMarks()
            .filter(k => k.__diff)
            .forEach(k => k.clear());
        if(typeof this.props.compare == 'string'){

            var changes = dmp.diff_main(this.props.compare, this.props.value);
            dmp.diff_cleanupSemantic(changes)

            var offset = 0;
            for(var i = 0; i < changes.length; i++){
                let [type, text] = changes[i];
                if(type < 0){ // delete
                    var thing = document.createElement('span')
                    thing.className = 'deleted'
                    thing.innerText = text;
                    var mark = this.cm.setBookmark(this.cm.posFromIndex(offset), {
                        widget: thing
                    })
                    mark.__diff = true;

                    
                }else if(type > 0){ // insert
                    var mark = this.cm.markText(this.cm.posFromIndex(offset), this.cm.posFromIndex(offset + text.length), {
                        className: 'inserted'
                    })
                    mark.__diff = true;

                    offset += text.length;
                    
                }else{
                    offset += text.length;
                }
            }
        }
    }
    componentDidUpdate(){
        if(!this.cm.curOp && this.props.value != this.cm.getValue()){
            this.cm.setValue(this.props.value)
        }
        this.updateDiff()
    }
    render(){ return <div className="editor" /> }
}


function Interface(props){
    var state = props.state;
    if(!state){
        return <div>(no state)</div>
    }
    return <div>
        <div>
            <CodeEditor 
                value={state.data} 
                compare={props.compare && props.compare.data}
                onChange={text => props.commit({ text: text })} />
        </div>
    </div>
}



function DAG(props){
    var store = props.store,
        view = props.view,
        messages = props.messages;

    const v_spacing = 30;
    const v_height = 20;

    const h_spacing = 10;

    var children = getChildren.bind(this, store)
    var path = getPath(store, view.anchor);

    var elements = [],
        lines = [];

    function recursive(node, x, y){
        var ch = children(node);
        var trail = [node]
        while(ch.length == 1 
            && node 
            // && view.anchor != node
            // && !props.views.some(k => k.anchor == node)

            && !(props.messages[node])
            // && view.pointer != node 
            // && store[ch[0]].date - store[trail[trail.length - 1]].date < 1000
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

            rect_width = Math.max(rect_width, label.length*7)
        
            elements.push(<rect 
                x={x} y={y - v_height/2} 
                rx={2} ry={2}
                width={rect_width} height={v_height} className={trail.includes(view.pointer) ? 'active' : (
                    path.includes(node) ? 'mainline' : 'inactive') }
                onClick={e => props.setPointer(node)}/>);

            if(trail.includes(view.pointer) && trail.length > 0){
                var trailIndex = trail.indexOf(view.pointer),
                    eps = 0.001;
                elements.push(<circle cx={x + rect_width * ((trailIndex + eps) / (trail.length - 1 + eps) )} cy={y} r={3} className="active" />)
            }

            elements.push(<text x={2+x} y={y}>{label}</text>)

            x += rect_width;
        }

        var y1 = y;
        for(var i = 0; i < ch.length; i++){
            var child = ch[i]
            if(i > 0) y1 += v_spacing;

            if(node) lines.push(<line 
                x1={x} y1={y} 
                x2={x + h_spacing} y2={y1}
                className={path.includes(child) ? 'mainline' : 'inactive'} />)
            y1 = recursive(child, x + h_spacing, y1);
            
        }
        return y1;
    }

    var height = 10 + recursive(null, -h_spacing, 10);
    return <svg className="dag" height={height}>{lines}{elements}</svg>
}



function TimeSlice2(props){
    var state = getState(props.store, props.view.pointer);

    var commit = (delta) => {
        var id = 'C' + Date.now();
        props.appendStore(id, { 
            parent: props.view.pointer, 
            delta: delta,
            date: Date.now()
        })
        updatePointer(id)
    }

    var path = getPath(props.store, props.view.anchor);

    var updatePointer = (id) => {
        if(path.includes(id)){
            props.updateView({ pointer: id })    
        }else{
            // TODO: find a suitable end-of-line for anchor
            
            props.updateView({ pointer: id, anchor: computeAnchor(props.store, id) })

        }
    }

    var pathIndex = path.indexOf(props.view.pointer);


    var chunk = getCurrentChunk(props.store, props.view.pointer, props.views, props.messages);


    return <div className={"artboard" + (props.isFocused ? ' focused': '')}>
        <div className="titlebar">
            <input type="text" className="title" value={props.messages[chunk] || ''} placeholder="(type message)" 
                onChange={e => props.setMessage(chunk, e.target.value) }/>

            <div className="title-controls">

            <button disabled={props.messages[props.view.pointer]} onClick={e => props.setMessage(props.view.pointer, 'r' + pathIndex)}>Split Commit</button>
            <button disabled={!props.messages[chunk]} onClick={e => props.setMessage(chunk, '')}>Join Commit</button>

        </div>
        </div>
        <div className="title-controls" style={{marginBottom: 10}}>
            <label disabled={props.views.length < 2}><input type="checkbox" checked={props.isFocused} 
                disabled={props.views.length < 2}
                onChange={e => e.target.checked ? props.setFocus() : props.clearFocus() } /> Merge</label>

            <div style={{float: 'right'}}>
            <button 
                disabled={pathIndex <= 0}
                onClick={e => updatePointer(path[pathIndex - 1])}>↺</button>
            <button 
                disabled={pathIndex >= path.length - 1}
                onClick={e => updatePointer(path[pathIndex + 1])}>↻</button>
            <button onClick={e => props.fork()}>Fork</button>
            
            <button disabled={props.views.length == 1} onClick={e => props.close()}>&times;</button>
            </div>
        </div>

        <Interface state={state} compare={props.activeState} commit={commit} />

        <input type="range" className="linear" min={0} max={path.length - 1} 
            disabled={path.length < 2}
            onChange={e => updatePointer(path[e.target.value])}
            value={path.indexOf(props.view.pointer)} />

        <DAG 
            store={props.store} 
            view={props.view} 
            messages={props.messages}
            views={props.views}
            setPointer={updatePointer} />
        
    </div>
}

const DEFAULT_STATE = {
    store: {
        '0': {
            parent: null,
            delta: { },
            date: 0
        }
    },
    viewIndex: -1,
    messages: {},
    views: [{
        title: 'Default',
        pointer: '0',
        anchor: '0'
    }]
};




class StateKeeper extends React.Component {
    constructor(){
        super()
        try {
            this.state = JSON.parse(localStorage.state)
        }catch(e){
            this.state = JSON.parse(JSON.stringify(DEFAULT_STATE))
        }
        
    }
    componentDidUpdate(){
        localStorage.state = JSON.stringify(this.state)
    }
    render(){
        var views = this.state.views;
        var activeState;

        if(views[this.state.viewIndex]){
            activeState = getState(this.state.store, views[this.state.viewIndex].pointer)
        }

        return <div>
            <div className="container">{
                views.map((view, index) => 
                    <TimeSlice2 
                        store={this.state.store}
                        appendStore={(id, value) => this.setState({ store: 
                            Object.assign({}, this.state.store, { [id]: value }) })}
                        view={view}
                        views={views}
                        messages={this.state.messages}

                        activeState={activeState}
                        isFocused={this.state.viewIndex == index}
                        setFocus={() => this.setState({ viewIndex: index })}
                        clearFocus={() => this.setState({ viewIndex: -1 })}

                        setMessage={(id, message) => this.setState({ messages: 
                            Object.assign({}, this.state.messages, { [id]: message })})}
                        updateView={data => this.setState({ views: 
                            views.slice(0, index)
                            .concat([Object.assign({}, view, data)], 
                            views.slice(index + 1)) })}
                        fork={e => this.setState({ views: views.concat([ Object.assign({}, view, { id: 'V' + Date.now() }) ]) })}
                        close={e => this.setState({ views: views.slice(0, index).concat(views.slice(index+1)) })}
                    />)
            }</div>
            <div className="controls">
                <button onClick={e => this.setState(DEFAULT_STATE)}>Tabula Rasa</button>
                <button onClick={e => this.setState(require('./fibonacci.json'))}>Fibonacci</button>
                <button onClick={e => this.setState(require('./merge.json'))}>Merge</button>
            </div>
        </div>
    }
}



function App(props){
    return <div className="app">
        <div className="header">
            <h1>derp <span>kinda like version control or something</span></h1>
        </div>
        <StateKeeper />
    </div>
}



ReactDOM.render(
    <App />,
    document.getElementById('root')
);
