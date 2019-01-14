import React from 'react';
import ReactDOM from 'react-dom';


import CodeMirror from 'codemirror';
import 'codemirror/mode/javascript/javascript'
import 'codemirror/lib/codemirror.css'
import 'codemirror/keymap/sublime'

import "codemirror/addon/edit/closebrackets"
import 'codemirror/addon/edit/matchbrackets'
import "codemirror/addon/comment/comment"
import "./codemirror.css"

var DiffMatchPatch = require('diff-match-patch');
var dmp = new DiffMatchPatch();
global.dmp = dmp

var JsDiff = require('diff');


export default class CodeEditor extends React.Component {
    componentDidMount(){
        var el = ReactDOM.findDOMNode(this).querySelector('.editor');

        var state = this.props.state;


        var cm = CodeMirror(el, {
            value: this.props.state.data,
            mode: 'plain',

            matchBrackets: true,
            lineNumbers: false,
            keyMap: 'sublime',
            autoCloseBrackets: true,
            lineWrapping: true,
            undoDepth: 0,
            viewportMargin: Infinity,
            
            tabSize: 4,
            indentUnit: 4,
            indentWithTabs: false,

            extraKeys: {
                "Cmd-Enter"(cm){
                    cm.getAllMarks()
                        .filter(k => k.__result)
                        .forEach(k => k.clear());

                    function log(value){
                        var match = /\<anonymous\>:(\d+)/.exec((new Error()).stack);
                        if(match){
                            var line = parseInt(match[1], 10)
                            var thing = document.createElement('span')
                            thing.className = 'result'
                            thing.innerText = JSON.stringify(value)
                            var mark = cm.setBookmark({ line: line - 1, ch: 1e8 }, {
                                widget: thing,
                                insertLeft: true
                            })
                            mark.__lineText = cm.getLine(line - 1)
                            mark.__result = true;
                        }
                    }
                    eval(cm.getValue())
                },
                "Cmd-Z": (cm) => requestAnimationFrame(k => this.props.undo()),
                "Shift-Cmd-Z": (cm) => requestAnimationFrame(k => this.props.redo()),
                "Cmd-K": (cm) => requestAnimationFrame(k => this.props.fork()),
                "Cmd-S": (cm) => requestAnimationFrame(k => this.props.save()),
                "Cmd-M": (cm) => {
                    this.props.setMessage()
                }
            }
        })
        this.cm = cm;
        
        cm.on('change', (cm, ch) => {
            if(ch.origin !== 'setValue' && cm.getValue() !== this.props.state.data){
                // this.props.onChange(cm.getValue())
                this.props.commit({ text: cm.getValue() })
            }
            cm.getAllMarks()
                .filter(k => k.__result && k.__lineText.trim() !== cm.getLine(k.find().line).trim())
                .forEach(k => k.clear());
            // console.log(cm.getValue(), ch)
            // this.props.onChange(cm.getValue())
        })
        this.updateDiff()
    }
    focus(){
        this.cm.focus()
    }
    updateDiff(){

        var cm = this.cm;
        cm.getAllMarks()
            .filter(k => k.__diff)
            .forEach(k => k.clear());
        if(cm.lineWidgets) cm.lineWidgets.forEach(k => k.clear());
        cm.lineWidgets = []
        cm.eachLine(line => {
            cm.removeLineClass(line, 'background', 'line-inserted')
            cm.removeLineClass(line, 'background', 'line-changed')
        })

        if(typeof this.props.compare === 'string'){

            var changes = dmp.diff_main(this.props.compare, this.props.state.data);
            dmp.diff_cleanupSemantic(changes)
            var choffset = 0;
            for(var j = 0; j < changes.length; j++){
                let [type, text] = changes[j];
                if(type < 0){ // delete
                    let thing = document.createElement('span')
                    thing.className = 'deleted'
                    thing.innerText = text;
                    let mark = cm.setBookmark(cm.posFromIndex(choffset), {
                        widget: thing
                    })
                    mark.__diff = true;
                }else if(type > 0){ // insert
                    let mark = cm.markText(cm.posFromIndex(choffset), cm.posFromIndex(choffset + text.length), {
                        className: 'inserted'
                    })
                    mark.__diff = true;

                    choffset += text.length;
                    
                }else{
                    choffset += text.length;
                }
            }

        }
    }
    componentDidUpdate(){
        if(!this.cm.curOp && this.props.state.data !== this.cm.getValue()){
            var selections = this.cm.getSelections()
            this.cm.setValue(this.props.state.data)
            try {
                this.cm.setSelections(selections)
            } catch (err) {}
        }
        this.updateDiff()
    }
    render(){ 
        return <div className="widget">
            <div className="editor" />
        </div> 
    }
}


export function reduce(prev, delta){
    if(!prev) return { version: 0, data: '' };

    return {
        version: prev.version + 1,
        data: delta.text
    }
}

// export default function Widget(props){
//     var state = props.state;
//     if(!state){
//         return <div>(no state)</div>
//     }
//     return <div className="widget">
//             <CodeEditor 
//                 value={state.data}
                
//                 undo={props.undo} 
//                 redo={props.redo}
//                 fork={props.fork}
//                 setMessage={props.setMessage}
//                 save={props.save}

//                 compare={props.compare && props.compare.data}
//                 onChange={text => props.commit({ text: text })} />
//     </div>
// }