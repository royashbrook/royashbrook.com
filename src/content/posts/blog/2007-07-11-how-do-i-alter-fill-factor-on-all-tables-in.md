---
title: "how do i alter fill factor on all tables in"
date: 2007-07-11
path: "2007/07/11/how-do-i-alter-fill-factor-on-all-tables-in"
---

---
layout: post
title: how do i alter fill factor on all tables in a database or for a whole server
---

Recently we had an issue at work where nightly MS SQL Server DB index defrags were taking a long time. Upon looking at the logs it appeared that almost all of the tables were fragmented quite often. It didn't take long to ask if anyone ever modified the [fill factor](https://learn.microsoft.com/en-us/sql/relational-databases/indexes/specify-fill-factor-for-an-index) from the default of 0. Nope. If you can't set it in a wider fashion for the whole server due to permissions, controls, politics, solar flares, whatever, here's a script that will set the fill factor to 90 on each table and show the table it's processing.

`sp_MSforeachtable @command1="print '?' alter index all on ? rebuild with (pad_index=on,fillfactor=90,sort_in_tempdb = on)"`

If you don't know what fill factor is, consult BOL. Here's a quote: "When an index is created or rebuilt, the fill factor value determines the percentage of space on each leaf level page to be filled with data, therefore reserving a percentage of free space for future growth." So basically, if you leave it at the default 0, it means the same thing as 100 or 100% full on each leaf level page, aka no room for growth. So if you grow at all, you have fragmentation. 90 is a fairly standard setting in most environments I've been in.

You can change the fill factor default on the server using the following SQL:

```SQL
sp_configure 'show advanced options', 1
GO

RECONFIGURE
GO

sp_configure 'fill factor', 90
GO

RECONFIGURE
GO
```

