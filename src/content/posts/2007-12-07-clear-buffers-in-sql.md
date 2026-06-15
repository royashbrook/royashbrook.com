---
title: "clear buffers in sql"
date: 2007-12-07
path: "2007/12/07/clear-buffers-in-sql"
---

---
layout: post
title: clear buffers in sql
---

```SQL
DBCC FREESESSIONCACHE
DBCC FREEPROCCACHE
DBCC FREESYSTEMCACHE('ALL')
CHECKPOINT
DBCC DROPCLEANBUFFERS
```

