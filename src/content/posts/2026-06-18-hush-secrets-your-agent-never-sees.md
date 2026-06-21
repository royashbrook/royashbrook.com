---
title: "hush: secrets your ai agent never sees"
date: 2026-06-18
path: "2026/06/18/hush-secrets-your-agent-never-sees"
draft: true
---

if you let an ai agent run as you, it can already do a lot, set a secret on a server, call an api, deploy a thing, because your clis are already authed. the one thing it can't safely do is *see* a secret. the usual workarounds are all bad: paste the token into the chat (now it's in the transcript forever), drop it in a temp file, or go set it by hand.

hush fixes exactly that, and only that. one hard rule: **the agent never sees the plaintext.** you get a value into your os keychain once (a hidden paste box the agent pops on your screen, or it mints a random one itself), and from then on it injects that value straight into the commands it runs, never printed, never in the chat, never committed to a repo. there's deliberately no `get`, because a getter is the leak.

mac, linux, and windows backends are built in. it's not a vault (an agent with shell access can use the store), it's structure that keeps plaintext out of the conversation and makes "store once, use forever" the easy path: [github.com/royashbrook/hush](https://github.com/royashbrook/hush).

(this is the stub, the full "why i built it" write-up is coming.)
