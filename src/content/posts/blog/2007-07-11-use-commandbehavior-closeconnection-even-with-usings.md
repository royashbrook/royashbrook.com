---
title: "use commandbehavior closeconnection even with usings"
date: 2007-07-11
path: "2007/07/11/use-commandbehavior-closeconnection-even-with-usings"
---

---
layout: post
title: use CommandBehavior.CloseConnection even with usings
---

Recently I put together a SQL talk for developers and gave it at our local JAXDUG meeting. It went over well and one of the items I covered was utilizing CommandBehavior.CloseConnection with the command being used. While the implicit finally created by the using connection below will close the connection, in the interest of "open late close early" you should go ahead and implement this CommandBehavior setting. This will cause the connection to be closed as soon as you exit the reader using enclosure below. If you do not, the connection will remain open until you are out of the connection using. To simulate this you can use the code below with a table and a local db and just put response or writeline statements for the c.state at intervals within the code below. I typically haven't done this in the past because I knew it would be closed out, but since I am giving the same talk at the upcoming tampa codecamp, I was trying to be diligent and ensure I have all of my bases covered and I have reviewed everything I am speaking on. So I went ahead and ran some test code similar to below with some writelines in there and low and behold the connection (un-suprisingly) stays open. So be good and utilize using statements, but also be really good and close your connections as early as possible. If we were returning a scalar value, I would recommend immediately and explicitly closing your connection like the commented code below.

<script src="https://gist.github.com/royashbrook/e469617e216687d440e9220813467186.js"></script>

