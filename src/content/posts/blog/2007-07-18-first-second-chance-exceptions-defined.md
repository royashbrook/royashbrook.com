---
title: "first second chance exceptions defined"
date: 2007-07-18
path: "2007/07/18/first-second-chance-exceptions-defined"
---

---
layout: post
title: First/Second Chance Exceptions Defined
---

> A debugger attached to a process can receive two types of notifications for each thrown exception: first and second chance. The debugger gets the first chance to handle the exception. If the debugger allows the execution to continue and does not handle the exception, the application will see the exception as usual. If the application does not handle the exception, the debugger gets a second chance to see the exception. In this case the application would normally crash if the debugger was not present.

http://msdn.microsoft.com/msdnmag/issues/05/07/Debugging/

