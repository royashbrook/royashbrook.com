---
title: "alter column dbcc cleantable"
date: 2007-07-24
path: "2007/07/24/alter-column-dbcc-cleantable"
---

---
layout: post
title: alter column dbcc cleantable
---

if you have to perform an alter column on a large blob column, sometimes all your space doesn't come back, you may want to issue a [dbcc cleantable](https://learn.microsoft.com/en-us/sql/t-sql/database-console-commands/dbcc-cleantable-transact-sql?view=sql-server-ver17) command on the table. 

i meant to write a long post about this but i never did.
