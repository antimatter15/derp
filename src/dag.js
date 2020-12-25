import React from 'react'
import ReactDOM from 'react-dom'
import { getPath, getChildren } from './util'

var textNode = document.createElementNS('http://www.w3.org/2000/svg', 'text')
var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
svg.setAttribute('class', 'measure')
svg.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xlink', 'http://www.w3.org/1999/xlink')
document.body.appendChild(svg)
svg.appendChild(textNode)

function measureText(text) {
    if (!text.trim()) return 0
    textNode.textContent = text
    return textNode.getComputedTextLength()
}

export default function DAG(props) {
    var store = props.store,
        view = props.view,
        messages = props.messages

    const v_spacing = 25
    const v_height = 20

    const h_spacing = 10

    var children = getChildren.bind(this, store)
    var path = getPath(store, view.anchor)

    var elements = [],
        lines = []

    function recursive(node, x, y) {
        var ch = children(node)
        var trail = [node]
        while (ch.length === 1 && node && !props.messages[node]) {
            node = ch[0]
            trail.push(node)
            ch = children(node)
        }

        if (!node) {
        } else {
            // console.log(trail.includes(view.pointer))
            var rect_width = 10 * Math.sqrt(trail.length + 1)

            var label = messages[node] || ''

            rect_width = Math.max(rect_width, 5 + measureText(label))

            elements.push(
                <rect
                    key={'r-' + node}
                    x={x}
                    y={y - v_height / 2}
                    rx={2}
                    ry={2}
                    width={rect_width}
                    height={v_height}
                    className={
                        trail.includes(view.pointer)
                            ? 'active'
                            : path.includes(node)
                            ? 'mainline'
                            : 'inactive'
                    }
                    onClick={e =>
                        props.setPointer(node, e.metaKey || e.altKey || e.shiftKey || e.ctrlKey)
                    }
                />
            )

            if (trail.includes(view.pointer) && trail.length > 0) {
                var trailIndex = trail.indexOf(view.pointer),
                    eps = 0.001
                elements.push(
                    <circle
                        key={'c-' + node}
                        cx={x + rect_width * ((trailIndex + eps) / (trail.length - 1 + eps))}
                        cy={y}
                        r={3}
                        className="active"
                    />
                )
            }

            elements.push(
                <text key={'t-' + node} x={2 + x} y={y}>
                    {label}
                </text>
            )

            x += rect_width
        }

        var y1 = y
        for (var i = 0; i < ch.length; i++) {
            var child = ch[i]
            if (i > 0) y1 += v_spacing

            // if(node) lines.push(<line
            //     x1={x} y1={y}
            //     x2={x + h_spacing} y2={y1}
            //     className={path.includes(child) ? 'mainline' : 'inactive'} />)

            if (node)
                lines.push(
                    <path
                        key={'p-' + child}
                        d={curvedHorizontal(x, y, x + h_spacing, y1)}
                        className={path.includes(child) ? 'mainline' : 'inactive'}
                    />
                )
            y1 = recursive(child, x + h_spacing, y1)
        }
        return y1
    }

    var height = 10 + recursive(null, -h_spacing, 10)
    return (
        <svg className="dag" height={height}>
            {lines}
            {elements}
        </svg>
    )
}

// https://github.com/hughsk/svg-line-curved/blob/master/index.js
function curvedHorizontal(x1, y1, x2, y2) {
    var line = []
    var mx = x1 + (x2 - x1) / 2

    line.push('M', x1, y1)
    line.push('C', mx, y1, mx, y2, x2, y2)

    return line.join(' ')
}
