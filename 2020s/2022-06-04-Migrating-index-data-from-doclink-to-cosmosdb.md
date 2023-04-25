---
layout: post
published: true
title: Migrating index data from doclink to cosmosdb
subtitle: One! More! Time!
date: '2022-06-04'
---

After [moving all of our documents into blob storage]({{site.baseurl}}/2022/04/18/Moving-15-million-documents-to-the-cloud/) and [creating an application to search the index for these documents and download them]({{site.baseurl}}/2022/05/20/Creating-an-app-to-search-and-retrieve-documents-from-azure/), I discovered some gaps in my original export. I'm going to document the process to correct that here. The main issue seemed to just be some missing data in the export that I filtered out somewhere. I just walked through the process to export and import again down below, and while doing so I checked to make sure all of the data I was missing before, was in fact exported. I didn't check the counts in my original process at every step because ultimately I was pretty sure I might need to do it at least one more time, and.... well that's where this article comes in. 😀

## What happened?

Well, nothing terrible. I moved everything and it all worked fine. But while testing with *another* stakeholder who wasn't engaged in the original discussion, we discovered some of the index data that was not moved, was something that they used. So I decided to go back and basically rebuild the cosmos db. Not delete the existing one, but just import a new one and update the keys and links to use the new one.

Since I'm having to do this once, I don't really want to have to fiddle with the old SQL 2008 box (R1, yuck) anymore, so I wanted to go ahead and get this database just restored into a local docker container. I could put it on Azure like I did last time, but would be nice to just dev locally using docker.

To this end, I'll refer to [this page](https://docs.microsoft.com/en-us/sql/linux/tutorial-restore-backup-in-sql-server-container?view=sql-server-ver15) on the MS site to see what to do.

## What I did

unfortunately, after reading a little bit, i see this:

![image](https://user-images.githubusercontent.com/7390156/169074369-20b76fbd-cb01-4e52-8f28-7a2005694af0.png)

i'm not a docker expert, so let's go ahead and open up docker and maybe do some updates, etc.:

updates!

![image](https://user-images.githubusercontent.com/7390156/169074269-c0f75b76-ca91-4ba1-8ed8-aaccebe3a0e9.png)

do it!

![image](https://user-images.githubusercontent.com/7390156/169085945-0c48d8e6-1b6d-49e1-9a9c-2537ecd85184.png)

ummmm... hmmm... well.... i... guess we'll see?

<img width="240" alt="image" src="https://user-images.githubusercontent.com/7390156/169088699-cd2090ed-ad2b-497c-a328-044c2a916f80.png">

so, instead i did a brew upgrade docker.... ? No daemon running... ok, so reinstalling we go. 😀 I'm leaving this in because I like to record how many silly things you run into when you want to do some 'simple' thing.

![image](https://user-images.githubusercontent.com/7390156/169121688-95b67505-a0da-437a-8535-02d46fadc1da.png)

So now that docker is up and running and seemly all patched, let's... mount a volume or something so we can restore from backup. First will start copying this file from the server:

![image](https://user-images.githubusercontent.com/7390156/169122141-522fbac3-896f-4da2-95db-9c194fe6c087.png)


noooo...... why so slow. my connection is good and it's only 80GB. not the tiniest thing in the world, but not that big. 1.5MB/s i believe is what that works out to....

ah well, that's what's up I suppose, so we'll just see how it goes for now.

since I'm using M1 mac, I'll run the following as we need to use a different image. So.. if you're following along you'll need to install that image as well. I *believe* the command needs to be modified something like this. my bak file is in the downloads folder right now. I have a random password below, feel free to sub in your own!

```txt
sudo docker run -e 'ACCEPT_EULA=Y' -e 'MSSQL_SA_PASSWORD=NdFe!Vtb' \
   --name 'sql1' -p 1401:1433 \
   -v sql1data:/var/opt/mssql \
   -v Downloads:/Users/roy/Downloads \
   -d mcr.microsoft.com/azure-sql-edge
```

after some fiddling, i seem to have my -v commands working backwards. i trashed my containers and ran this instead:

```txt
sudo docker run -e 'ACCEPT_EULA=Y' -e 'MSSQL_SA_PASSWORD=NdFe!Vtb' \
   --name 'sql1' -p 1401:1433 \
   -v sql1data:/var/opt/mssql \
   -v /Users/roy/Downloads:/Downloads \
   -d mcr.microsoft.com/azure-sql-edge
```

excellent! i got prompted for access to the downloads folder this time and was able to open up the cli and navigate and see my files. if this file was smaller, i could just copy it into my docker container as noted in the ms article with `docker cp`, but i'm just going to mount that folder and restore it from there. For this I just used the steps here:

https://docs.microsoft.com/en-us/sql/linux/tutorial-restore-backup-in-sql-server-container?view=sql-server-ver15#restore-the-database

While I wait for my file to copy, I'm going to go ahead and test my mounting/restore setup with the file from MS.

```txt
sudo docker exec -it sql1 /opt/mssql-tools/bin/sqlcmd -S localhost \
   -U SA -P 'NdFe!Vtb' \
   -Q 'RESTORE FILELISTONLY FROM DISK = "/Downloads/wwi.bak"' \
   | tr -s ' ' | cut -d ' ' -f 1-2
```

well, good thing I'm testing as I get this as the output: 

<img width="915" alt="image" src="https://user-images.githubusercontent.com/7390156/169139601-8bd5a235-dfea-434c-9dab-78fdbc50e789.png">

i also noticed that i can't connect to the server running that that machine like i did the other day. hmm... ok, let's start over a little as i know i was able to run and connect to this the other day. docker is freshly instealled, so i am wipe the images, containers, and volumes. now we should be fresh.

per my documentation the other day i ran the following in powershell and was able to connect with no issues:

```txt
docker pull mcr.microsoft.com/azure-sql-edge
PS /Users/roy/gh/d> sudo docker run -e "ACCEPT_EULA=1" -e "MSSQL_SA_PASSWORD=NdFe!Vtb" `
>> -p 1433:1433 --name sqledge --hostname sqledge `
>> -d mcr.microsoft.com/azure-sql-edge
```

let's try and run closer to that. i can see i stuck with 1433 instead of mapping and included a hostname. let's see if adding that allows us to get moving. we'll add our volumes in as well and cross our fingers. i did *previously* download the regular sql2019 image and that was removed between these attempts. maybe there was a part of that that was supporting this image. not sure, but we'll know shortly.

<img width="581" alt="image" src="https://user-images.githubusercontent.com/7390156/169141164-f2268aa3-306c-4081-aa1d-8beb5963764c.png">

```txt
sudo docker run -e 'ACCEPT_EULA=Y' -e 'MSSQL_SA_PASSWORD=NdFe!Vtb' \
   -p 1433:1433 --name sqledge --hostname sqledge \
   -v sqledgedata:/var/opt/mssql \
   -v /Users/roy/Downloads:/Downloads \
   -d mcr.microsoft.com/azure-sql-edge:latest
```

Huzzah... maybe? I also used the 'latest' image.

<img width="922" alt="image" src="https://user-images.githubusercontent.com/7390156/169141388-a9ab3752-efa7-4877-893a-09507899e9d0.png">

Apparently not. Maybe I can just connect to the machine like before?

![image](https://user-images.githubusercontent.com/7390156/169141500-ab6fc8e2-e4fd-48a7-9a88-ae4cbb3cd183.png)

yay! 🎉

![image](https://user-images.githubusercontent.com/7390156/169141636-4a95c777-c2b2-4a81-81cf-c415fbf7b2e6.png)

double yay! 🎉🎉

![image](https://user-images.githubusercontent.com/7390156/169142124-769c8a53-f07b-469c-b5cb-992f944bd47f.png)

triple yay! 🎉🎉🎉

and finally, as expected, i can select some data. so that's nice.

![image](https://user-images.githubusercontent.com/7390156/169142370-f71a4960-956d-455b-8317-a72f58d89166.png)

I guess that sqlcmd must not be part of the m1 image. That's ok! Sadly, after about 10 hours, the copy failed because the backups ran for that night. I was concerned this might happen, but figured I would just start the copy that evening, and instead use rsync this time.

<img width="452" alt="image" src="https://user-images.githubusercontent.com/7390156/169307466-f6bfc1e6-965a-4472-ada4-0b1bd78adb59.png">

This is working, but also very slow. But should be finished with plenty of time today. I believe this same issue happened last time and due to this I ended up fiddling around on the original server..... guess what? it's starting to look like that's what's about to happen again. 😀

At least it *was!* until I got tied up doing some other stuff. So now it's finished, yay!

<img width="454" alt="image" src="https://user-images.githubusercontent.com/7390156/169404357-9ff0f3d6-dfb0-4658-8779-6b74f5ddbc4e.png">

I tried restoring but didn't have enough space on my docker image. I tried restoring out to my /Downloads volume, but that didn't seem to work either. I'm guessing there is a way to fix that, but I decided to simply tackle the space issue on the container itself. I searched for the error and docker and found somewhere that said that sql on linux will not expand anything, so you just get an error that is related to that.

Error:

<img width="748" alt="image" src="https://user-images.githubusercontent.com/7390156/169568914-f012f093-0698-44c2-9f25-61551b77f9c1.png">

https://docs.microsoft.com/en-us/troubleshoot/sql/linux/database-restore-operation-fails-linux-server

I fixed this by bumping my space up. below is my 'post' restore space used.

![image](https://user-images.githubusercontent.com/7390156/169546402-c9fbd602-e33f-47b9-a727-f7937b530fbc.png)

After this, I ran `RESTORE FILELISTONLY FROM DISK = '/Downloads/FRTLDoclink2_backup_2022_05_18_210005_2488013.bak'` and after I got the file list back, I ran this:

```sql
RESTORE DATABASE fuzzy FROM DISK = '/Downloads/FRTLDoclink2_backup_2022_05_18_210005_2488013.bak'
WITH REPLACE
    , MOVE 'FRTLDoclink2_Data' TO '/var/opt/mssql/data/fuzzy.mdf'
    , MOVE 'FRTLDoclink2_Log' TO '/var/opt/mssql/data/fuzzy.ldf'
```

and after a little bit...

<img width="733" alt="image" src="https://user-images.githubusercontent.com/7390156/169546511-1ac627db-cf31-495f-883b-5f942fb1de7c.png">

Now we're golden! I think for this next part, I am just going to annotate a bunch of sql while I get the data staged.

```sql

--figure out how much data total by years

-- select year(v.created), count(*)
-- from PropertyCharValues v
-- group by year(v.created)

-- 2006	13531207
-- 2007	4012284
-- 2008	11492899
-- 2009	9677578
-- 2010	8999829
-- 2011	8740727
-- 2012	9159711
-- 2013	10260930
-- 2014	11444854
-- 2015	11867259
-- 2016	12205902
-- 2017	11532989
-- 2018	9152719
-- 2019	386814
-- 2020	61737
-- 2021	56459
-- 2022	8730

-- so let's cover the last 6 years, that should cover most of the 'relevant' data
--  i'll revisit prior years after that



--let's create a table to hold it and add an index before we put data in there

-- CREATE TABLE [dbo].[_a] (
--     [id] INT          NOT NULL,
--     [k]  INT          NOT NULL,
--     [v]  VARCHAR (50) NOT NULL,
--     CONSTRAINT [PK__a] PRIMARY KEY NONCLUSTERED ([id] ASC, [k] ASC, [v] ASC)
-- );


--when i did this last time, i basically extracted all of the data in a single query, but this time i'm not going to do that
-- i think i'll stage everything into a table so that i am not searching secondary copies while troubleshooting. i'm going
-- to go year by year and just gab all of the properties. there can be multiples of the same value, so we need to do some
-- rownumber stuff to get only the latest value
-- insert _a 
-- select id,k,v
-- from (
--     select
--           [id] = ParentId
--         , [k]  = PropertyID
--         , [v]  = cast(trim(PropertyCharValue) as varchar(50))
--         , [rn] = row_number() over (partition by ParentId,PropertyID order by modified DESC)
--     from PropertyCharValues v
--     where year(v.created) = 2022
--     ) as a
-- where rn = 1
-- Started executing query at Line 1
-- Commands completed successfully.
-- Total execution time: 00:00:19.853

-- cool, that was pretty quick, let's do the other years
-- insert _a 
-- select id,k,v
-- from (
--     select
--           [id] = ParentId
--         , [k]  = PropertyID
--         , [v]  = cast(trim(PropertyCharValue) as varchar(50))
--         , [rn] = row_number() over (partition by ParentId,PropertyID order by modified DESC)
--     from PropertyCharValues v
--     where year(v.created) = 2017
--     ) as a
-- where rn = 1
--2021
-- (55425 rows affected)
-- Total execution time: 00:00:19.040
--2020
-- (61708 rows affected)
-- Total execution time: 00:00:18.647
--2019
-- (356414 rows affected)
-- Total execution time: 00:00:22.052
--2018, our first hoss of a year, not too bad
-- (8732458 rows affected)
-- Total execution time: 00:01:05.284
--2017, bigger and not bad
-- (11003295 rows affected)
-- Total execution time: 00:01:24.543

-- we can go back and follow this same process for older years, but we'll do that in a second round
--  first we need to do this same process for the date and float values there aren't many of those,
--  but we do still need to grab that data

-- insert _a 
-- select id,k,v
-- from (
--     select
--           [id] = ParentId
--         , [k]  = PropertyID
--         , [v]  = cast(PropertyFloatValue as varchar(50))
--         , [rn] = row_number() over (partition by ParentId,PropertyID order by modified DESC)
--     from PropertyFloatValues v
--     where year(v.created) between 2017 and 2022
--     ) as a
-- where rn = 1
--(1169 rows affected)
--Total execution time: 00:00:00.233
-- insert _a 
-- select id,k,v
-- from (
--     select
--           [id] = ParentId
--         , [k]  = PropertyID
--         -- last time i converted these to utc, but in the UI, these are not doing anything related to 
--         --  being a date, so i'm going to treat them as text and pick this format as a middle ground
--         , [v]  = convert(varchar, PropertyDateValue, 23) --formatted as yyyy-mm-dd
--         , [rn] = row_number() over (partition by ParentId,PropertyID order by modified DESC)
--     from PropertyDateValues v
--     where year(v.created) between 2017 and 2022
--     ) as a
-- where rn = 1
-- (79403 rows affected)
-- Total execution time: 00:00:05.286

-- ok, now we need to actually add our file names to all of these things. to do this i'm going to create
--  a custom property id. i'm going to just use the same ones i used last time, for the file name, it's 74
--  let's see how many documents we are working with currently
--select count(distinct id) from _a
--2050039

-- let's see if we have actualy files for all of these, sometimes there are bogus scans
-- select count(distinct DocumentStoreFileID) from documentfiles df join _a on _a.id = df.ParentId
--2049969

--that's comforting, not many index values for files that have no actual file to reference
-- so we'll just join these tables and insert a 74 record for the name on each match
-- insert _a 
-- select id,k,v
-- from (
--     select
--           [id] = ParentId
--         , [k]  = 74
--         , [v]  = cast(DocumentStoreFileID as varchar(50))
--         , [rn] = row_number() over (partition by ParentId order by version,modified DESC)
--     from documentfiles v
--     join _a on _a.id = v.ParentId
--     ) as a
-- where rn = 1
-- (2050039 rows affected)
-- Total execution time: 00:00:33.897

-- i'm just going ignore that number diff and assume it's for a good reason for now 😀

-- that diff count probably has to do with versions or rescans of some sort, but good to see we have a
--  file name for every actual id so far

-- in my original extract, i also included values on the document itself, these are not part of
--  the index, and weren't searchable originally, but they were visible in some views of the
--  search results. so i'm going to add those properties here. in the previous queries i have referenced
--  the 'parentid' value, this is actually the id from the document table itself as that document
--  record owns these properties and the files associated with the document.

-- as the parentid is the master, there is only one, so we don't need to check for rownums
--  i am just going to merge all of these property queries from that one table pull. but first
--  let's check our count
-- select count(*) from Documents where exists (select 1 from _a where id = DocumentId)
-- 2050039
-- that's what we expect, every parent has an actual parent record 😀

-- insert the records, we'll convert the date to yyyy-mm-dd as we don't need times for this purpose
--  we definitely need documenttypeid, but pagecount is probably not needed. i thought it was nice
--  to show in the ouptut as it was there before, so we'll keep it
-- ;with d as (
-- 	select [id] = DocumentId, Created, DocumentTypeId, [PageCount]
-- 	from Documents where exists (select 1 from _a where id = DocumentId)
-- )
-- , p70 as ( select [id], [k] = 70, [v] = convert(varchar, Created, 23) from d)
-- , p72 as ( select [id], [k] = 72, [v] = cast(DocumentTypeId as varchar(50)) from d)
-- , p73 as ( select [id], [k] = 73, [v] = cast(PageCount as varchar(50)) from d)
-- , m as (
-- select * from p70 union all
-- select * from p72 union all
-- select * from p73
-- )
-- insert _a 
-- select id,k,v from m
-- (6150117 rows affected)
-- Total execution time: 00:01:06.733
-- our id count above *3, exactly what we expect

--ok, let's check our final property count
-- select count(*) from _a
-- 28498743

--now to convert this to a bunch of json

```

I already did this process once before. At that time I exported the data to CSV and then converted that to JSON. At that time, I was working on a remote server, so I just did things that way. For this I am working on a local docker copy of sql, so I am just going to do attach directly and convert it using powershell locally. That looks like this:

```ps1
# get data from sql
Import-Module SqlServer -Cmdlet "Invoke-Sqlcmd"
$cs = "Server=.;User ID=sa;Password=NdFe!Vtb;"
$q = "select * from fuzzy.dbo._a order by id,k,v"
$dt = Invoke-Sqlcmd -ConnectionString $cs -Query ($q)

# group sql data on id
$xg = $dt |
  Select-Object $dt.Columns.ColumnName |
  Group-Object id

# convert to hash table
$ht = foreach($g in $xg){
  $values = @{}
  $values["id"] = $g.name
  foreach ($gv in $g.Group) {
    $values["$($gv.k)"] = $gv.v
  }
  $values
}

#convert hash table to json file
$ht |
  ConvertTo-Json -Depth 4 | # -Compress |
  Set-Content .\_a.json
```

The query needs to be adjusted to fit, and you can change the name of the output file, but this is the way. This basically converts the table structure like this:

```txt
     id  k v
      --  - -
 1234567 12 xxxx
 1234567 13 xxxx
 1234567 16 xxxx
 1234567 17 xxxx
 1234567 74 file.txt
```

to this json:

```json
{
  "12": "xxxx",
  "13": "xxxx",
  "16": "xxxx",
  "17": "xxxx",
  "74": "file.txt",
  "id": "1234567"
}
```

which we can just import right into cosmos. 😀 you don't *have* to have the id mapped in here as you can generate them on the inbound, but i had some id values to use already. these id values don't have any real value, but since they are there, i figured i would just use those for now. last time I did this, I simply ran this a year at a time, but this time I figured I would give it a whirl just converting all of the 2017plus data at once. selecting it was fine and only seemed to take a couple of minutes. the hash to json process took a little bit longer though. about 25min i think. and it wasn't too huge when completed.

<img width="643" alt="image" src="https://user-images.githubusercontent.com/7390156/169609681-a5d5bdc1-e155-44fd-8bd6-2ce56d7ecf40.png">

Unfortunately, when I tried to upload this file, i got an error. but i can't tell what is wrong because there is no notification and the error seems to run off the page.

![image](https://user-images.githubusercontent.com/7390156/169610541-18981b56-6451-48db-b709-6162addd6db7.png)

So fine... we'll do less data at a time and see how that goes.

2022 only!

```sql
-- select count(*) from fuzzy.dbo._a where exists (select 1 from documents where documentid = id and year(created)=2022)
-- 19886
```

```ps1
# get data from sql
Import-Module SqlServer -Cmdlet "Invoke-Sqlcmd"
$cs = "Server=.;database=fuzzy;User ID=sa;Password=NdFe!Vtb;"
$q = "select * from _a where exists (select 1 from documents where documentid = id and year(created)=2022)"
$dt = Invoke-Sqlcmd -ConnectionString $cs -Query ($q)

# group sql data on id
$xg = $dt |
  Select-Object $dt.Columns.ColumnName |
  Group-Object id

# convert to hash table
$ht = foreach($g in $xg){
  $values = @{}
  $values["id"] = $g.name
  foreach ($gv in $g.Group) {
    $values["$($gv.k)"] = $gv.v
  }
  $values
}

#convert hash table to json file
$ht |
  ConvertTo-Json -Depth 4 -Compress |
  Set-Content .\2022.json
```

definitely a more reasonable size. 😛

![image](https://user-images.githubusercontent.com/7390156/169611161-944219fc-6119-44c0-8fcb-ebddd9325d43.png)

and this worked like a champ

![image](https://user-images.githubusercontent.com/7390156/169611229-81f262e5-0ee5-40ef-b83b-c15ce25ace3c.png)

maybe there is a size limit or something i didn't hit previously as last time i did a year at a time.

2021... bigger....

![image](https://user-images.githubusercontent.com/7390156/169611380-039fc352-a777-4983-8313-d6e9b9f24a06.png)

worked like a champ, but took a couple of minutes this time instead of a couple of seconds. still, not bad and working as expected.

![image](https://user-images.githubusercontent.com/7390156/169611615-ed3ca745-7c02-4c8d-8418-0b190468e81b.png)

2020.... about the same as 2021 as expected

![image](https://user-images.githubusercontent.com/7390156/169611828-894ecc90-aed9-45eb-93d2-62bc22c92e51.png)

![image](https://user-images.githubusercontent.com/7390156/169612080-9cf49cbd-5d8e-46cd-9eb2-8ee0458f46e3.png)

also, the extractions from the db were pretty near instant with these three years. 2019 was more than triple at 9.3MB in for the file. while the export from the db was quite quick, the import took longer. but still it's linear, so it took about 3 times as long. but that is still pretty fast.

![image](https://user-images.githubusercontent.com/7390156/169613342-0caaf3c4-5376-45d3-83db-9583e1e10e0e.png)

quite a jump on 2018 in size and it took about 5 or 6 minutes to export instead of like a minute.

![image](https://user-images.githubusercontent.com/7390156/169615320-be4cce5a-8abf-4b92-808b-d37fed250224.png)

quite a lot more to import and it took quite a bit longer. almost 2.5 hours. still not too bad.

![image](https://user-images.githubusercontent.com/7390156/169625886-0adf27c4-1f7a-483f-ac56-3b744f3082d5.png)

I'm not going to post screenshots, but 2017 was similar. 265MB file instead of 210, so about that much longer i'd imagine. i just fired it and checked to make sure it was good that night. edit: i wrote the previous sentence because that was what i was expecting. but i was incorrect.

![image](https://user-images.githubusercontent.com/7390156/169650204-985bf48e-e2b7-4d99-90f6-ac714153d974.png)

not way way more documents, but it seems like it took more like 5 hours. maybe a bandwidth thing?

I'd say the lesson learned here is that smaller uploads seem to work way better. there are other ways to get the data into cosmos, but since this is just a one time thing, i didn't really go down that road. someone who has read the multiple articles about this might say that this isn't a one time thing because i have already done this a few times. but i mostly meant this isn't feeding from a system so there isn't a need to create any kind of robust automated import process. As of writing this, it appears that [this](https://docs.microsoft.com/en-us/azure/cosmos-db/sql/tutorial-sql-api-dotnet-bulk-import) page on MS describes how to do this via code.

After this, the documents showed up as expected and all was well with the world. 😁










