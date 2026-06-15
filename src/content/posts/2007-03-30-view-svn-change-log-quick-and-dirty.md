---
title: "view svn change log, quick and dirty"
date: 2007-03-30
path: "2007/03/30/view-svn-change-log-quick-and-dirty"
---

if you have a "burning" need, as some do, to view the change log for a bunch of files in svn, here's a quick way in windows to do it. just save the following as showsvnlog.cmd or whatever cmd or bat you want in your sendto folder and highlight whatever files you want and send them to it. you can also just drag and drop files onto it. this script utilizes some basic looping, shift, and alternate data streams. nothing revolutionary, but it does the job. here's the code:

<script src="https://gist.github.com/royashbrook/fb9b3c48f324f5e76c8ca1ff11032ad4.js"></script>
