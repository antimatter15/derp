Derp Core
=========


Derp core consists of two databases: an append-only DAG for revisions, and a read/write database for commit metadata. 

```
class DerpDB {
	stateFromView(view){
		return new DerpState(view)
	}
}


class DerpState(){
	getState()
	getChunk()

	commit(change)
	save()


	setMessage()

}

class DerpView(){
	DerpCommitID anchor;
	DerpCommitID pointer;

	fork()

	prevCommit()
	nextCommit()

	prevChunk()
	nextChunk()
}


DerpLayoutManager (dag, meta-view)
DerpView (dag, view)
Application (state, view)



```