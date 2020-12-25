var childStore = null,
    childMapping = {}

export function getChildren(store, id) {
    if (store !== childStore) {
        childStore = store
        childMapping = {}
        for (var k in store) {
            var parent = store[k].parent
            if (!childMapping[parent]) {
                childMapping[parent] = [k]
            } else {
                childMapping[parent].push(k)
            }
        }
    }
    return childMapping[id] || []
}

export function getState(reduceFn, store, id) {
    var commit = store[id]
    if (!commit) return reduceFn(null, null)
    return reduceFn(getState(reduceFn, store, commit.parent), commit.delta)
}

export function getPath(store, id) {
    var commit = store[id]
    if (!commit) return [null]
    return getPath(store, commit.parent).concat([id])
}

export function computeAnchor(store, id) {
    var children = getChildren.bind(this, store)
    var node = id
    var ch = children(node)
    while (ch.length > 0) {
        node = ch[0]
        ch = children(node)
    }
    return node
}

export function getCurrentChunk(store, id, views, messages) {
    var children = getChildren.bind(this, store)
    var node = id
    var ch = children(node)

    while (
        ch.length === 1 &&
        node &&
        // && !views.some(k => k.anchor == node)
        !messages[node]
    ) {
        node = ch[0]
        // trail.push(node)
        ch = children(node)
    }
    return node
}
