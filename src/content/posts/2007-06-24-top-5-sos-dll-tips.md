---
title: "top 5 sos dll tips"
date: 2007-06-24
path: "2007/06/24/top-5-sos-dll-tips"
---

---
layout: post
title: Top 5 SOS.dll Tips
---

5 things I wish I had known or done prior to attempting to work with SOS.dll and windbg.exe: 

1. sos.dll needs to be in the path for windbg in order to load it
2. you can .load %full path to sos.dll% instead of .load sos mscorwks or other statements
3. SOS for .NET 2.0 does *NOT* have all the commands the .NET 1.x version does (a source)
4. review http://msdn2.microsoft.com/en-us/library/bb190764(vs.80).aspx and use !help %command% often
5. where these two articles were: [one](http://mtaulty.com/communityserver/blogs/mike_taultys_blog/archive/2004/08/03/4671.aspx), [two](http://blogs.msdn.com/mvstanton/archive/2005/10/11/479861.aspx).

I experienced an extreme amount of pain first working with SOS.dll because of some of the problems above. I also found that there were LOTS of articles about using it, but some were more detailed then others about carrying through to the end of the process. i found many articles along the way that utilized a variety of different tools. i think the links above were the most useful in shedding immediate light on sos.dll and how it is used in the debugging process.

