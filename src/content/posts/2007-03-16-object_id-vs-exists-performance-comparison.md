---
title: "object_id vs exists performance comparison"
date: 2007-03-16
path: "2007/03/16/object_id-vs-exists-performance-comparison"
---

i previously blogged about using the object_id function in a drop statement instead of the usual way. i wondered how it did performance wise. it may be prettier, but is it faster? slower? the short answer is it appears to be faster to use the function than the default drops. 

<script src="https://gist.github.com/royashbrook/d161b00ff2809a3faeafb63a7603646e.js"></script>

you can pick another proc or table or whatever object you want for analysis. the results were the same for me. enjoy!
