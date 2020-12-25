import React from 'react'
import ReactDOM from 'react-dom'

import './app.css'
import './dag.css'
import Bread from './bread.js'
import Widget, { reduce } from './codemirror.js'
import DAG from './dag'
import { getCurrentChunk, computeAnchor, getChildren, getState, getPath } from './util'

function Slice(props) {
    var pointer = props.view.pointer || null,
        anchor = props.view.anchor || null

    var state = getState(reduce, props.store, pointer)
    var path = getPath(props.store, anchor)
    var pathIndex = path.indexOf(pointer)
    var chunk = getCurrentChunk(props.store, pointer, props.views, props.messages)

    var updatePointer = (id, shouldFork) => {
        const applyUpdate = e => (shouldFork ? props.fork(e) : props.update(e))
        if (path.includes(id)) {
            applyUpdate({ pointer: id })
        } else {
            applyUpdate({ pointer: id, anchor: computeAnchor(props.store, id) })
        }
    }

    var commit = delta => {
        var id = 'C' + Date.now()
        props.appendStore(id, {
            parent: pointer,
            delta: delta,
            date: Date.now(),
        })
        updatePointer(id)
    }

    var fork = () => props.fork()

    var save = () => {
        if (!props.messages[props.view.pointer]) {
            props.setMessage(props.view.pointer, 'r' + pathIndex)
        }
    }

    var compare
    if (props.viewIndex) {
        let view = props.getView(props.viewIndex)
        compare = getState(reduce, props.store, (view && view.pointer) || null)
    }

    var compareCommit = delta => {
        if (!compare) return
        let view = props.getView(props.viewIndex)

        if (!props.messages[view.pointer]) {
            var viewPath = getPath(props.store, view.anchor)
            var viewPathIndex = viewPath.indexOf(view.pointer)
            props.setMessage(view.pointer, 'r' + viewPathIndex)
        } else if (props.messages[view.pointer] === 'Merge') {
            props.setMessage(view.pointer, undefined)
        }

        var id = 'C' + Date.now()
        props.appendStore(id, {
            parent: (view && view.pointer) || null,
            delta: delta,
            date: Date.now(),
        })

        props.updateView(props.viewIndex, {
            pointer: id,
            anchor: id,
        })

        if (!props.messages[id]) {
            props.setMessage(id, 'Merge')
        }

        props.setMergePreview(null)
    }

    let title
    let widget

    return (
        <div
            className={
                'slice ' +
                (props.isDragging ? 'dragging ' : '') +
                (props.viewIndex
                    ? props.viewIndex == props.view.id
                        ? 'reference '
                        : 'other '
                    : '')
            }
        >
            <div className="header" onMouseDown={props.beginDrag}>
                <div
                    className={'button-toggle ' + (props.view.hideFooter ? 'inactive' : 'active')}
                    title="Toggle revision timeline"
                    onClick={e => props.update({ hideFooter: !props.view.hideFooter })}
                >
                    {props.view.hideFooter ? '▼' : '▲'}
                </div>

                <input
                    type="text"
                    ref={e => (title = e)}
                    className="title"
                    value={props.messages[chunk] || ''}
                    placeholder={pointer == null ? 'blank' : 'no description'}
                    disabled={pointer == null}
                    onChange={e => props.setMessage(chunk, e.target.value)}
                    onKeyDown={e => {
                        if (e.keyCode === 13) {
                            e.preventDefault()
                            widget.focus()
                        }
                    }}
                />

                <div
                    className={
                        'button ' + (props.viewIndex == props.view.id ? 'active' : 'inactive')
                    }
                    onClick={e => props.toggleFocus(props.view.id)}
                    title="Show differences relative to this version."
                >
                    <i className="fa fa-bullseye" aria-hidden="true" />
                </div>

                <div className="button" onClick={fork} title="Fork this revision">
                    <i className="fa fa-code-fork" aria-hidden="true" />
                </div>

                <div className="button" onClick={props.close} title="Close this window">
                    <i className="fa fa-close" aria-hidden="true" />
                </div>
            </div>

            {props.view.hideFooter ? null : (
                <div className="footer">
                    <input
                        type="range"
                        className="time-slider"
                        min={0}
                        max={path.length - 1}
                        disabled={path.length < 2}
                        onChange={e => updatePointer(path[e.target.value])}
                        value={path.indexOf(pointer)}
                    />

                    <DAG
                        store={props.store}
                        view={props.view}
                        messages={props.messages}
                        views={props.views}
                        setPointer={updatePointer}
                    />
                </div>
            )}

            <Widget
                ref={e => (widget = e)}
                setMessage={e => title.focus()}
                undo={e => pathIndex > 0 && updatePointer(path[pathIndex - 1])}
                redo={e => pathIndex < path.length - 1 && updatePointer(path[pathIndex + 1])}
                fork={e => fork()}
                save={e => save()}
                compareCommit={compareCommit}
                mergePreview={props.viewIndex == props.view.id ? props.mergePreview : null}
                setMergePreview={props.setMergePreview}
                compare={compare}
                state={state}
                commit={commit}
            />
        </div>
    )
}

const DEFAULT_STATE = {
    store: {},
    viewIndex: null,
    messages: {
        null: '',
    },
    layout: {
        rows: [],
    },
}

class App extends React.Component {
    constructor() {
        super()
        try {
            this.state = JSON.parse(localStorage.state)
            console.log(this.state.layout.rows.length)
        } catch (e) {
            this.state = JSON.parse(JSON.stringify(DEFAULT_STATE))
        }
        // window.onstorage = () => {
        //     var latest = JSON.parse(localStorage.state);
        //     if(JSON.stringify(latest.store) != JSON.stringify(this.state.store) ||
        //         JSON.stringify(latest.messages) != JSON.stringify(this.state.messages)){
        //         this.setState({ store: latest.store, messages: latest.messages })
        //     }
        // }
    }
    componentDidUpdate() {
        localStorage.state = JSON.stringify(this.state)

        document.body.classList.toggle('merge', !!this.state.viewIndex)
    }

    render() {
        global.App = this

        return (
            <div>
                <div className="main-header">
                    <h1>derp version control prototype</h1>

                    <div className="toolbar">
                        <div
                            className="button"
                            onClick={e => {
                                if (
                                    window.confirm(
                                        'Are you sure you want to clear all history and start over? This can not be undone.'
                                    )
                                ) {
                                    localStorage.state = null
                                    this.setState(JSON.parse(JSON.stringify(DEFAULT_STATE)))
                                }
                            }}
                            title="Clear everything"
                        >
                            <i className="fa fa-trash" aria-hidden="true"></i>
                        </div>
                    </div>
                </div>
                <div className="main-header">
                    <div>
                        <p>
                            <b>Derp</b> is <b>version control</b> reimagined for{' '}
                            <b>experimentation</b> and <b>live collaboration</b> in the internet
                            age.
                        </p>
                        <p>
                            Rather than operating on files, it’s integrated into an application's
                            state management system. Coupled with a projectional window management
                            system, you can create <b>lightweight forks</b> to try new ideas while
                            referencing other versions. Edits are synchronized
                            character-by-character over the internet in <b>real-time</b>. It blends
                            the simplicity of <b>undo/redo</b> with the power and reliability of
                            modern distributed version control systems like Git. You never have to
                            worry about losing data by a series of undos, redos, and edits. And you
                            never have to worry about forgetting to commit code.
                        </p>
                    </div>
                </div>
                <Bread
                    Slice={Slice}
                    layout={this.state.layout}
                    updateLayout={data => this.setState({ layout: data })}
                    store={this.state.store}
                    messages={this.state.messages}
                    viewIndex={this.state.viewIndex}
                    mergePreview={this.state.mergePreview}
                    toggleFocus={id =>
                        this.setState({
                            viewIndex: this.state.viewIndex == id ? null : id,
                            mergePreview: null,
                        })
                    }
                    appendStore={(id, value) =>
                        this.setState({
                            store: Object.assign({}, this.state.store, { [id]: value }),
                        })
                    }
                    setMergePreview={data => {
                        if (this.state.mergePreview !== data) this.setState({ mergePreview: data })
                    }}
                    setMessage={(id, message) =>
                        this.setState({
                            messages: Object.assign({}, this.state.messages, { [id]: message }),
                        })
                    }
                />
            </div>
        )
    }
}

ReactDOM.render(<App />, document.getElementById('root'))
