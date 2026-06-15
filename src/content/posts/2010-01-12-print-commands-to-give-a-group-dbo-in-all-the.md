---
title: "print commands to give a group dbo in all the sql dbs"
date: 2010-01-12
path: "2010/01/12/print-commands-to-give-a-group-dbo-in-all-the"
---

something silly i need to do every once in a while and i forget how to do it. the double double single quotes always mess me up 😛

```sql
sp_msforeachdb '
    print ''
        EXEC ?.dbo.sp_addrolemember N''''db_owner'''', N''''<GROUPNAME>''''
    ''
'

