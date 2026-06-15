---
title: "how do i tell how big my xml docs or"
date: 2007-06-15
path: "2007/06/15/how-do-i-tell-how-big-my-xml-docs-or"
---

---
layout: post
title: how do i tell how big my xml docs (or vars) are in sql?
---

q: how do i tell how big my xml docs (or vars) are in sql?

a: datalength

from BOL - "Returns the number of bytes used to represent any expression." 

the individual that asked me about this recently started using some much larger xml objects in their xml datatype column. it threw off sql because the stats weren't being updated and caused some performance issues which an update statistics and a clustered index rebuild corrected.

this also works with the xml datatype variables. so you can do something like the following:

<script src="https://gist.github.com/royashbrook/edbdf6da5b3bd5c03b72f2df45395251.js"></script>

