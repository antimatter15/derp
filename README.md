# derp

> I'm an egotistical bastard, and I name all my projects after myself. First Linux, now
> [git](https://www.merriam-webster.com/dictionary/git).
>
> — Linus Torvalds

Derp is a concept for version control reimagined for live multiplayer collaboration and rapid
experimentation.

## Beyond Files

Traditional version control systems like Git, CVS and Subversion operate on files. This allows them
to be used with nearly any desktop application— their greatest strength— but it also severely limits
the scope of what is possible. When operating out of a filesystem, a document needs to be saved
before it can be versioned— which makes versioned real-time collaboration impossible. Since a file
path can't have different contents at the same time, it's basically impossible to see and edit
different branches or versions side-by-side.

Rather than operating on files, Derp is meant to be integrated directly into applications.

## Immutable Commits and Mutable Messages

While the events in human history are fixed, our understanding of the past changes as we reflect on
its consequences. It would be ridiculous if our understanding of history were limited to what we
knew at the time events occurred. However, this is exactly the model that Git forces by embedding
commit messages into the merkle tree.

In Derp, the sequence of events .

## Lightweight Forks

## N-Way Merge

---

Derp is version control reimagined for experimentation and live collaboration in the internet age.

Rather than operating on files, it’s meant to be integrated into applications. It’s a state
management system like Flow/Redux for React.

It's designed for experimentation: you can make lightweight forks for experimenting with an idea
side-by-side with a stable implementation.

Edits are synchronized character-by-character over a network in real-time. You never have to worry
that someone's been working on some file and you're introducing a merge conflict, because you'll be
able to see everyone's edits as soon as it happens.

It blends the simplicity of undo/redo with the power and reliability of traditional distributed
version control systems like Git. You never have to worry about losing data by a series of undos,
redos, and edits. And you never have to worry about forgetting to commit code.

Commit messages are annotations of the commit tree which are stored separately, so commit messages
don’t have to be locked in when the edit is made. So when you inevitably forget to set a commit
message for several hours, you don't have to resort to setting the commit message to "changed stuff"
and have that immutably stored for eternity. You can visually annotate changes as they happen or
indefinitely afterwards while you're scanning through the revision history.

There's a playback timeline so you can scrub through the history of your code like a movie.
