---
title: "sql-spider: map any sql database by handing the agent queries"
date: 2026-06-09
path: "2026/06/09/sql-spider-map-any-sql-database"
draft: true
---

sql-spider builds a map of what depends on what in a database, every table, view, proc, function, trigger, and all the edges between them. the twist is it never opens a connection. it just hands you read-only queries, you run them however you can reach the db and feed the results back, and it spiders out from one seed object until the whole graph is closed, one connected component, zero orphans. point an agent at it, or run it yourself: [github.com/royashbrook/sql-spider](https://github.com/royashbrook/sql-spider).

# why i built it

i've spent a *lot* of my life in databases, and i kept running into the same thing. before you can safely change anything in a big database, you really want to see how it all hangs together first, what depends on what. and the tools that show you that usually want a live connection, or something installed, or access i don't always have. you definitely can't always just point an agent at a production database and tell it to go poke around.

<!-- SEED (your story): the actual moment / the gnarly database that finally made you build this. that's the part only you can tell, and it's what makes the post yours. =) -->

# how it works

so i flipped it around. instead of connecting to anything, sql-spider just *emits* queries, read-only ones, and you run them however you can reach the db. a sql tool, a query bridge, or honestly just hand them to whoever does have access. then you feed the results back and it keeps going, spidering out from your seed object, asking for the next thing it needs, until there's nothing left dangling.

the part i actually like is that it's fully [deterministic](https://en.wikipedia.org/wiki/Deterministic_algorithm). it isn't asking an ai to guess what references what, it parses the sql into an [ast](https://en.wikipedia.org/wiki/Abstract_syntax_tree) and reads the dependencies right off the tree. so the agent isn't really doing anything clever here, it's just the adapter that shuttles queries out and results back in. t-sql and sqlite work today, [other dialects are a small adapter](https://github.com/royashbrook/sql-spider/blob/c06334e9a88eb9b82193d89cc6387df042c6e9dc/src/core/Dialect.cs#L1-L10).

# what you do with the map

once the graph is closed you can just look at it, but it can also export straight into the format [graphify](https://github.com/safishamsi/graphify) uses , an open-source knowledge-graph tool for agents , so you get community detection and path/explain queries on top. then you can ask "what actually touches this table" and trace it, instead of guessing.

<!-- SEED (your story): a sentence or two on where this has actually saved you , the kind of "i needed this and didn't have it" moment that justifies the whole thing. -->

# wrap

<!-- SEED (your closer): why a deterministic, connection-less mapper was worth building, who it's for, and the warm/self-deprecating sign-off you'd actually write. =) -->

