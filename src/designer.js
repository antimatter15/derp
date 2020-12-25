import React from 'react'
import ReactDOM from 'react-dom'
// import Designer, {Text, Rect} from 'react-designer';

export default function Widget(props) {
    var state = props.state
    console.log(require('react-color'))

    return <div>hi</div>
    // return <Designer width={500} height={500}
    //         objectTypes={{
    //           'text': Text,
    //           'rect': Rect
    //         }}
    //         onUpdate={(objects) => props.commit({ objects })}
    //         objects={state.objects} />
}

export function reduce(prev, delta) {
    if (!prev) return { version: 0, objects: [] }

    return {
        version: prev.version + 1,
        objects: delta.objects,
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
//                 save={props.save}

//                 compare={props.compare && props.compare.data}
//                 onChange={text => props.commit({ text: text })} />
//     </div>
// }
