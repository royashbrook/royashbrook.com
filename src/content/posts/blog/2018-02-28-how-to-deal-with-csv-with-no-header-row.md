---
title: "How to deal with CSV with no header row"
date: 2018-02-28
path: "2018/02/27/how-to-deal-with-csv-with-no-header-row"
---

Sometimes I need to work with CSV data that has no header row. If you don't have the column names to pass as a list, or you just don't care and need to generate some fake names quickly, you can use this method. I am just generating fields up to however many fields there are, and this will break for more than 99 fields, but it's easy to fix.

<script src="https://gist.github.com/royashbrook/8285c8511854e60ffe22958c98dfe0e5.js"></script>


