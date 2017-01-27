import React from 'react';
import ReactDOM from 'react-dom';


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
            }
        })
        this.cm = cm;
        
        cm.on('change', (cm, ch) => {
            if(ch.origin !== 'setValue' && cm.getValue() !== this.props.value){
                this.props.onChange(cm.getValue())
            }
            cm.getAllMarks()
                .filter(k => k.__result && k.__lineText.trim() !== cm.getLine(k.find().line).trim())
                .forEach(k => k.clear());
            // console.log(cm.getValue(), ch)
            // this.props.onChange(cm.getValue())
        })
        this.updateDiff()
    }
    updateDiff(){
        this.cm.getAllMarks()
            .filter(k => k.__diff)
            .forEach(k => k.clear());
        if(typeof this.props.compare === 'string'){

            var changes = dmp.diff_main(this.props.compare, this.props.value);
            dmp.diff_cleanupSemantic(changes)

            var offset = 0;
            for(var i = 0; i < changes.length; i++){
                let [type, text] = changes[i];
                if(type < 0){ // delete
                    let thing = document.createElement('span')
                    thing.className = 'deleted'
                    thing.innerText = text;
                    let mark = this.cm.setBookmark(this.cm.posFromIndex(offset), {
                        widget: thing
                    })
                    mark.__diff = true;
                }else if(type > 0){ // insert
                    let mark = this.cm.markText(this.cm.posFromIndex(offset), this.cm.posFromIndex(offset + text.length), {
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
        if(!this.cm.curOp && this.props.value !== this.cm.getValue()){
            var selections = this.cm.getSelections()
            this.cm.setValue(this.props.value)
            try {
                this.cm.setSelections(selections)
            } catch (err) {}
        }
        this.updateDiff()
    }
    render(){ return <div className="editor" /> }
}


export default function Widget(props){
    var state = props.state;
    if(!state){
        return <div>(no state)</div>
    }
    return <div className="widget">
            <CodeEditor 
                value={state.data}
                
                undo={props.undo} 
                redo={props.redo}
                fork={props.fork}
                save={props.save}

                compare={props.compare && props.compare.data}
                onChange={text => props.commit({ text: text })} />
    </div>
}