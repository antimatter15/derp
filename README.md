# derp

Derp is version control reimagined for experimentation and live collaboration in the internet age.

Rather than operating on files, it’s meant to be integrated into applications. It’s a state management system like Flow/Redux for React.

It's designed for experimentation: you can make lightweight forks for experimenting with an idea side-by-side with a stable implementation.

Edits are synchronized character-by-character over a network in real-time. You never have to worry that someone's been working on some file and you're introducing a merge conflict, because you'll be able to see everyone's edits as soon as it happens. 

It blends the simplicity of undo/redo with the power and reliability of traditional distributed version control systems like Git. You never have to worry about losing data by a series of undos, redos, and edits. And you never have to worry about forgetting to commit code. 

Commit messages are annotations of the commit tree which are stored separately, so commit messages don’t have to be locked in when the edit is made. So when you inevitably forget to set a commit message for several hours, you don't have to resort to setting the commit message to "changed stuff" and have that immutably stored for eternity. You can visually annotate changes as they happen or indefinitely afterwards while you're scanning through the revision history. 

There's a playback timeline so you can scrub through the history of your code like a movie. 




