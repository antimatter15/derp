We should version small independent modules. How do we do this when our interface isn't fixed? Changing interfaces ends up simultaneously changing several bits of code. 

One way to deal with this is to treat different interfaces as different repositories, but that doesn't let us preserve relevant history. 

Actually, it seems like the best approach is to version the entire repository if possible. As long as our branches remain short and simple, it'll probably be easy to merge any given feature. 