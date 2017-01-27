
A `git` is defined as an "ignorant, childish person". `derp` follows this venerable tradition and strives to be even stupider and more foolish. 




## Object Store

At its core is a version control system inspired by git. 

There's an object store where each object is essentially a git commit, 
containing some set of patches and a parent commit id.


    var store = {
        "0000001": {
            parent: "[genesis block]",
            delta: "x"
        },
        "0000002": {
            parent: "0000001",
            delta: "xy"
        },
    }

To get the state at any particular version, we walk the tree backwards until
we reach the genesis block and we apply each delta with some reducer function. 


