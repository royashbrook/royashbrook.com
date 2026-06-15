---
title: "chunking binary or xml into sql"
date: 2007-10-29
path: "2007/10/29/chunking-binary-or-xml-into-sql"
---

---
layout: post
title: chunking binary or xml into sql
---

this is a little unique of a setup. i'm having to update a varbin field, but the data that is coming in from the other sources is being cast from xml. so i'm sort of replicating the stupid thing we are doing on the other side, but it seems like a good code sample for this particular method. if you wanted to chunk up xml, you could use this method.

<script src="https://gist.github.com/royashbrook/49e54e89037ddd3a60dc0d554a7fd2f6.js"></script>

