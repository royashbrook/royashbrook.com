---
title: "count lines with linq"
date: 2008-06-11
path: "2008/06/11/count-lines-with-linq"
---

so i needed to count the lines of a bunch of different filetypes in a folder. i decided to try using linq for this. here's what i came up with. basically a single linq statement 😛

you can tune the regex to taste. i just said (i think, i'm not a regex wizard) something that isn't a newline (.+) and the line terminators i'm using (\r\n).

<script src="https://gist.github.com/royashbrook/55377e88622ce28858fd968deb9bded3.js"></script>
