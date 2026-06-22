---
title: "sql-spider: map any sql database by handing the agent queries"
date: 2026-06-09
path: "2026/06/09/sql-spider-map-any-sql-database"
draft: true
---

sql-spider is a tool used to crawl dependencies in a database given a root object. so if you have a table and you need to see what all reads and writes to it. sql-spider will find it. this tool is meant to be used to feed a [knowledge graph](https://en.wikipedia.org/wiki/Knowledge_graph) in a format for another tool, graphify, so ai agents can efficiently infer information about a database. it will also produce pretty graphs for people to look at, and you can do it yourself, but it is really meant to save tokens during db analysis by ai agents. it spiders out from one seed object until the whole graph is closed, one [connected component](https://en.wikipedia.org/wiki/Component_(graph_theory)), zero orphans. point an agent at it, or run it yourself: [github.com/royashbrook/sql-spider](https://github.com/royashbrook/sql-spider).

# why i built it

i've spent a lot of time working with databases and vendor systems. and unfortunately, one thing i have encountered repeatedly over the years is that vendors do not understand their own systems. this isn't universal, but it is very common. especially with niche systems, and especially with old systems. while crawling a database is not always the answer, it is frequently one part that is important. this problem is not actually why i built this but it is a part of it. why i really built this is i was playing with graphify, and i had a little app i was playing with, not big, but when running graphify, i found out it had no support for sql files, or migration files or things like that. that was a little bit annoying, so i was looking for a way to incorporate it figuring surely someone has already built something like this. but if it's out there, i couldn't find it. i saw there was an open pr on the graphify repo, but it wasn't quite what i needed, so i decided to build sql-spider.

so it also just so happened that as i was wanting to add this for a personal project, i happened to have an issue with a work system where it exactly fit this bill. a database process that had dozens of tables and procs and triggers that was really documented no where that was producing unexpected results. i already had a bit of a corpus built up on this system for my agents to use for analysis, but not this portion which i had deliberately avoided not wanting to crawl all of the objects myself to double check assumptions an agent may make. so i also had a great use case to make it to bring some further value for that part of my life.

# how it works

in all honesty, the idea here is that you don't need to know anything about how it works.

however, that being said, let's talk about how it works because it is pretty simple.

## get the data to analyze

you first need a root object you want to start with. there are some examples, but it could be anything. let's say you have a database with a customers table. you want to know what all reads/writes to that table or connects to it in some way with [FKs](https://en.wikipedia.org/wiki/Foreign_key) etc. you just tell the tool that you want to start with that. it will produce sql to run that will get those answers for the objects from the db. you pass that in and run it again, it will look at that sql as the input, and look for dependencies on those things, and on and on. you can stop cycling at any time, or you can follow it all the way. if you are doing it manually, you just stop whenever you want. if you are using an agent, just tell the agent how many passes or ask it to stop every so often to show you results or whatever you want.

you really do not even need to have access to the database as long as someone with access can run the queries and send you the output. but if you have access to run it or let an agent run it for you, that's definitely faster.

once the graph is closed you can just look at it, but it can also export straight into the format [graphify](https://github.com/safishamsi/graphify) uses , an open-source knowledge-graph tool for agents , so you get [community detection](https://en.wikipedia.org/wiki/Community_structure) and path/explain queries on top. then you can ask "what actually touches this table" and trace it, instead of guessing.

the tool is also built so that you could add other adapters in to speak different dialects of sql. we are using [microsoft's own parser for tsql](https://learn.microsoft.com/en-us/dotnet/api/microsoft.sqlserver.transactsql.scriptdom?view=sql-transactsql-161) so we can deal with ancient forms of sql that i happened to have. but we are also using a more modern adapter that handles things like sqlite or postgresql or whatever. i tested that with sqlite and with some of the tsql and it worked fine. i just couldn't parse everything with it because i had beauties like `*=` joins and other nonsense in my database that any modern validator will fail. =P

## analyze the data

the maps it outputs will show the dependency objects, and also link and show the create code for that object, so you can validate any claims that your agent makes about it.

a nice thing about it is that it's fully [deterministic](https://en.wikipedia.org/wiki/Deterministic_algorithm). you don't ask your ai agent to guess what references what, it parses the sql into an [ast](https://en.wikipedia.org/wiki/Abstract_syntax_tree) and reads the dependencies right off the tree. so the agent isn't really doing anything clever here, it's just the adapter that shuttles queries out and results back in. [other dialects are a small adapter](https://github.com/royashbrook/sql-spider/blob/c06334e9a88eb9b82193d89cc6387df042c6e9dc/src/core/Dialect.cs#L1-L10). well, i mean that and it saves you from having to trace through all the code. and if, in fact, you really want it to trace line by line and show you things like that, it can use the graph to do that. without having to read all the code into tokens.

sql-spider *will* output its own graph, and a visual representation of the dependencies it has discovered. if that works for you, you can use that. but the real money, at least for me, is feeding it into graphify. so that's the last step that it will do is convert the knowledge graph it produces, to the one that graphify needs. in my use, graphify seemed to be pretty easy to just 'stack' up other graphs. i could analyze code, and then just tell my agent to add the graph from sql-spider, and then i could query across both seamlessly. but ymmv depending on your ai agent i guess. i mostly used claude for this, but i did test it with other agents and various models and they all worked fine with graphify.

maybe that doesn't help you understand the 'analyze' the data. i will leave the 'tell me how graphify helps' for the graphify folks. but suffice it to say, that you can use graphify to interrogate codebases, and this lets you add sql to it. so you can tell your agent to use graphify to figure out the process chain by which a certain field gets updated in your database and it can track those things. it's possible that your sql code doesn't have enough detail for that, so it can just analyze the data that it has. but graphify isn't meant to imagine answers, so it expects you to give it code and that's what it will analyze. =)

# but why would i use it?

like most tools, to save tokens. since i had already built a corpus of data based on analyzing the raw sql, i could already tell you i spent about 500k tokens just reading in the data i needed to build some of the narratives. using this process and graphify, i could do it in about 10-20k tokens. it was a massive efficiency boost. this is really a graphify thing. but that was what i was trying to do. in my case, i had a multitude of narratives based on analyzing sql, but inefficiently by reading in all that sql code. i spun up agents to build similar narratives to answer the same questions i had previously produced and they could do it way more efficiently. then i could also take and validate my previous work against the knowledge graph as well to check that things produced by prior agents reading the sql, matched with what we saw in the knowledge graph now that we had that.

in my testing, the ai agent could actually work off the graph sql-spider produced, but graphify had other features i really liked, so generally i was working with the output it generated so that i could just leverage one tool for the code analysis. i didn't spend a ton of time fiddling with that graph because i was really just trying to get it into graphify. =)

# wrap

for me, this has been an issue i have had for decades really where there is a vendor db and it becomes clear after working with them that they really don't have a good understanding of how to trace triggers and procs and things through their system. whether it should be written that way to begin with is a completely different question, but probably i'm not the only one that has had this issue.

and in this case, you don't even really have to know or do anything. just point the agent at this, and they should be able to do the rest including installing graphify if you don't have it and guiding you through the process.