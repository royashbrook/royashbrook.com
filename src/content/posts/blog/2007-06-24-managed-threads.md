---
title: "managed threads"
date: 2007-06-24
path: "2007/06/24/managed-threads"
---

---
layout: post
title: managed threads
---

I found this while in my surfing and thought it was a noteworthy point on .net multi-threading.

quoted from http://msdn2.microsoft.com/en-us/library/ms998547.aspx (bold is mine):

> The [CLR](https://en.wikipedia.org/wiki/Common_Language_Runtime) exposes managed threads, which are distinct from Microsoft Win32(R) threads. The logical thread is the managed representation of a thread, and the physical thread is the Win32 thread that actually executes code. __You cannot guarantee that there will be a one-to-one correspondence between a managed thread and a Win32 thread.__
> 
> If you create a managed thread object and then do not start it by calling its Start method, a new Win32 thread is not created. When a managed thread is terminated or it completes, the underlying Win32 thread is destroyed. __The managed representation (the Thread object) is cleaned up only during garbage collection some indeterminate time later.__
> 
> The .NET Framework class library provides the ProcessThread class as the representation of a Win32 thread and the System.Threading.Thread class as the representation of a managed thread.
> 
> Poorly-written multithreaded code can lead to numerous problems including deadlocks, race conditions, thread starvation, and thread affinity. All of these issues can negatively impact application performance, scalability, resilience, and correctness.

