---
title: "waterbear: keep a claude session alive through anything"
date: 2026-07-05
path: "2026/07/05/waterbear-keep-a-claude-session-alive-through-anything"
draft: true
---

if you run an [ai agent](https://en.wikipedia.org/wiki/Intelligent_agent) as a long-lived thing (a persona, an always-on helper, something you talk to for days), you eventually hit an annoying wall: the session is mortal. the app pushes an update and restarts. your mac reboots. the process crashes. and when it comes back, if it comes back at all, it comes back blank. everything it was in the middle of is gone.

that's the whole problem waterbear solves. **waterbear keeps a `claude --remote-control` session alive through crashes, patches, quits, and reboots**, and (optionally) brings it back resuming the exact same conversation, mid-thought.

it's open and MIT: [github.com/royashbrook/waterbear](https://github.com/royashbrook/waterbear).

# the name

a [tardigrade](https://en.wikipedia.org/wiki/Tardigrade), the "water bear", is the little animal that survives basically everything: boiling, freezing, vacuum, radiation. under stress it dries itself out into a suspended state called [cryptobiosis](https://en.wikipedia.org/wiki/Cryptobiosis), does nothing, waits, and then revives when conditions come back. that's exactly the trick i wanted for a session. get killed, wait, come back as yourself. so, waterbear.

# why a session is so easy to kill

the thing that makes a [claude code](https://docs.claude.com/en/docs/claude-code/overview) session reachable from your phone and the desktop app and claude.ai at the same time is [remote control](https://docs.claude.com/en/docs/claude-code/remote-control) mode. it's great, but it's a live process. anything that ends the process ends the session: an app update (this is the big one: patches happen constantly and every one is a little death), a reboot, a crash, closing the terminal. there's no built-in "and then start yourself back up." you notice hours later that the thing you thought was running has been dark the whole time.

i wanted the opposite: a session that treats getting killed as a nap.

# how it works

it's four small pieces, each doing one job:

1. **remote control** keeps the session reachable from phone / desktop / web. but it needs a real terminal ([tty](https://en.wikipedia.org/wiki/Computer_terminal)) to run in.
2. **[tmux](https://en.wikipedia.org/wiki/Tmux)** supplies that terminal, a detached, always-there home the session lives in that you can attach to any time.
3. **a [launchd](https://en.wikipedia.org/wiki/Launchd) [agent](https://en.wikipedia.org/wiki/Daemon_%28computing%29)** (macos's "keep this running" mechanism) starts a little guard when you log in and restarts it the instant the session dies. this is the "come back on its own" part.
4. **the wake.** launchd has no keyboard, and the first prompt doesn't auto-run on its own, so once the ui settles the guard types it in for you. two flavors: a *fresh* wake that re-establishes who the agent is (a role or persona bootstrap), or a *resume* that relaunches the session `--resume`-ing its own on-disk transcript, so it comes back as itself with full context, then types a short cue to re-arm anything that died with the process (a background watcher, a monitor).

that resume path is the fun one. the transcript survives the crash on disk, so the agent doesn't start over. it wakes up mid-conversation, knowing everything it knew a second before it got killed.

the smallest version is one line:

```bash
CLAUDE_RC_NAME=myagent curl -fsSL \
  https://raw.githubusercontent.com/royashbrook/waterbear/main/scripts/waterbear-install | bash
```

# dogfooding: i killed it to prove it

the real test was the obvious mean one. i had an agent waterbear *itself*, set up its own durable body around the conversation we were having, and then i killed its session on purpose. launchd caught the death, relaunched it, it resumed its own transcript, re-armed its background watcher, and picked the thread back up like nothing happened. then i did it again with an actual app patch, the thing that kills every session on the machine at once. same result: it came back on its own, as itself.

that's the whole point. a patch used to mean "go find every session and wake it back up by hand." now the session just handles its own resurrection.

# it's an agent skill, so the agent sets it up

waterbear ships as a [claude code skill](https://docs.claude.com/en/docs/claude-code/skills). you don't wire tmux and launchd by hand: you point an agent at the repo and tell it to "waterbear yourself," and it reads the instructions and sets up its own durable body. the only thing you provide is the one-line wake prompt that says who it should be when it comes back.

```bash
git clone https://github.com/royashbrook/waterbear ~/.claude/skills/waterbear
```

# the honest caveats

a couple things worth saying plainly:

- **it's local to one machine.** waterbear is launchd + tmux + a `claude` process on *your* computer. it keeps that body alive on that mac; it doesn't follow you to another machine or run in the cloud. it's for a session running on hardware you own.
- **it's a macos reference implementation.** the pattern ports cleanly: swap launchd for a [systemd](https://en.wikipedia.org/wiki/Systemd) user service on linux and keep the same guard logic, but the installer i'm shipping is mac.
- **resume grows.** replaying the full transcript every time means context keeps growing across respawns. resume is for surviving a crash, not for accumulating forever. periodically start clean to shed the weight.

none of that is a surprise once you see what it is: a small, honest wrapper that turns "your session died" into "your session took a nap." if you keep an agent running for real work, that's the difference between it being always-on and it being always-on until the next update.

# get it

- clone it: [github.com/royashbrook/waterbear](https://github.com/royashbrook/waterbear)
- or point an agent at the repo and say "waterbear yourself"

it's MIT, it's one script plus a skill, and it's named after the toughest animal i could find. seemed fitting for the thing whose entire job is to not stay dead.
