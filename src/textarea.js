import React from 'react'
import ReactDOM from 'react-dom'

export default function Widget(props) {
    var state = props.state
    return (
        <textarea
            style={{ border: 0, padding: 10 }}
            className="widget"
            value={state.wumbo}
            onChange={e => props.commit({ stuff: e.target.value })}
        />
    )
}

export function reduce(prev, delta) {
    if (!prev) return { version: 0, wumbo: '' }

    return {
        version: prev.version + 1,
        wumbo: delta.stuff,
    }
}
