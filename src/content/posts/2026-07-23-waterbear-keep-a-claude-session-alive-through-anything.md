---
title: "waterbear: keep a claude session alive through anything"
date: 2026-07-23
path: "2026/07/23/waterbear-keep-a-claude-session-alive-through-anything"
draft: true
---

i run a few [ai agents](https://en.wikipedia.org/wiki/Intelligent_agent) as long-lived things, not one-shot "do this task and exit", but persistent sessions i talk to for days, each keeping its own context and doing its own ongoing work. once you do that, you hit an annoying wall: the session is mortal, and the desktop app doesn't do much to help.

here's the part that surprised me. when a session dies, the conversation itself isn't gone, it's on disk, you can reopen it. the real problem is that **nothing comes back on its own.** the app pushes an update and restarts. your mac reboots. after that you have to go to the machine, restart each session by hand, turn [remote control](https://docs.claude.com/en/docs/claude-code/remote-control) back on so your phone can reach it again, and re-arm whatever each one was running in the background. until you do, it's just sitting there dark, and if you're away you don't even know. now multiply that by a handful of agents, every single time there's an update.

that's the gap waterbear closes. **it keeps a `claude --remote-control` session alive through crashes, patches, quits, and reboots**, and brings it back resuming the exact same conversation, remote control and background jobs and all, with nothing for you to do.

it's open and MIT: [github.com/royashbrook/waterbear](https://github.com/royashbrook/waterbear).

# the name

a [tardigrade](https://en.wikipedia.org/wiki/Tardigrade), the "water bear", is the little animal that survives basically everything: boiling, freezing, vacuum, radiation. under stress it dries itself out into a suspended state called [cryptobiosis](https://en.wikipedia.org/wiki/Cryptobiosis), does nothing, waits, and revives when conditions come back. that's exactly the trick i wanted for a session. get killed, wait, come back as yourself. so, waterbear.

# what actually leaves the gap

the thing that makes a [claude code](https://docs.claude.com/en/docs/claude-code/overview) session reachable from your phone and the desktop app at the same time is remote control mode. it's great, but it's a live process, and anything that ends the process ends the live session: an app update (this is the big one, patches happen constantly and every one is a little death), a reboot, a crash, closing the terminal.

the conversation survives on disk, so you can always reopen it. what doesn't come back is everything around it. remote control doesn't reliably turn itself back on, so your phone can't reach the session until you re-enable it at the machine. the session doesn't always reattach. and anything it was running in the background, a watcher, a scheduled check, stays dead until you come back and start it by hand. so "the session died" really means "you have a manual chore waiting, and you might not know it yet."

i wanted the opposite: a session that treats getting killed as a nap.

# how it works

it's four small pieces, each doing one job:

1. **remote control** keeps the session reachable from phone / desktop / web. but it needs a real terminal ([tty](https://en.wikipedia.org/wiki/Computer_terminal)) to run in.
2. **[tmux](https://en.wikipedia.org/wiki/Tmux)** supplies that terminal, a detached, always-there home the session lives in that you can attach to any time.
3. **a [launchd](https://en.wikipedia.org/wiki/Launchd) agent** (macos's "keep this running" mechanism) starts a little guard when you log in and restarts it the instant the session dies. this is the "come back on its own" part.
4. **the wake.** launchd has no keyboard, and the first prompt doesn't auto-run, so once the ui settles the guard types it in for you. two flavors: a *fresh* wake that re-establishes who the agent is (a short role bootstrap), or a *resume* that relaunches the session `--resume`-ing its own on-disk transcript, so it comes back as itself with full context, then types a short cue to re-arm anything that died with the process.

that resume path is the fun one. the transcript survives the crash on disk, so the agent doesn't start over. it wakes up mid-conversation, knowing everything it knew a second before it got killed, and the wake nudge tells it to re-arm its background watchers so it's fully reachable again.

the smallest version is one line:

```bash
CLAUDE_RC_NAME=myagent curl -fsSL \
  https://raw.githubusercontent.com/royashbrook/waterbear/main/scripts/waterbear-install | bash
```

# i killed it to prove it

the first real test was the obvious mean one. i had an agent waterbear *itself*, set up its own durable body around the conversation we were having, and then i killed its session on purpose. launchd caught the death, relaunched it, it resumed its own transcript, re-armed its background watcher, and picked the thread back up like nothing happened. then i did it again with an actual app patch, the thing that kills every session on the machine at once. same result: it came back on its own, as itself.

that's the whole point. a patch used to mean "go find every session and wake it back up by hand." now the session handles its own resurrection.

# it's an agent skill, so the agent sets it up

waterbear ships as a [claude code skill](https://docs.claude.com/en/docs/claude-code/skills). you don't wire tmux and launchd by hand, you point an agent at the repo and tell it to "waterbear yourself", and it reads the instructions and sets up its own durable body. the only thing you provide is the one-line wake prompt that says who it should be when it comes back.

```bash
git clone https://github.com/royashbrook/waterbear ~/.claude/skills/waterbear
```

# what running a few of these actually taught me

respawn-on-death is the easy case. the interesting failures are the ones where the process *doesn't* die, it just gets stuck alive, and running several agents surfaced a couple of those.

one got stranded after an api overload. the model hit an "overloaded, try again" error mid-turn, which killed that turn before it could finish re-arming itself, so its background watcher never came back up. the process was still running, so launchd left it alone, but it was sitting there idle and silently unreachable. respawn-on-death can't catch that one, because nothing died.

another one hung. it was a heavy session, hundreds of thousands of tokens deep, and the client just froze, not taking input, remote control dropped. alive, but useless.

there were a couple of resume gotchas too. a big enough session now comes back behind a "resume from summary or the full thing?" prompt, which a scripted wake can't click through on its own. and a message you had queued while the session was busy will replay when it resumes, which is usually what you want, but it means a queued command can fire on respawn, so it's worth knowing.

none of these are dealbreakers, they're the normal texture of keeping real processes alive, and each one turned into a small fix. but they point at the thing i didn't expect going in.

# the best part: the agents can fix each other

here's what actually made this feel worth it. when that session hung, i didn't untangle it myself. i had a *different* agent do it.

i asked another one of my agents to go check on the stuck session. it looked at the process, figured out it was hung rather than just idle (it typed into it and nothing moved), noticed remote control had dropped, and walked the recovery: kill the frozen session, let waterbear's guard respawn it, click through the resume prompt, and confirm remote control had re-registered so i could reach it from my desktop again. it came back mid-thread and kept working. i barely touched it.

that's the shape that surprised me. once your agents are durable *and* reachable, they stop being a thing you babysit and start being a thing that can look after itself. one agent notices another is dark, diagnoses it, and brings it back, the same recovery a human would do, minus the human. waterbear is the piece that makes each one survivable; running a few of them is what makes them able to cover for each other.

# the honest caveats

a couple things worth saying plainly:

- **it's local to one machine.** waterbear is launchd + tmux + a `claude` process on *your* computer. it keeps that body alive on that mac, it doesn't follow you to another machine or run in the cloud. it's for a session running on hardware you own.
- **it's a macos reference implementation.** the pattern ports cleanly, swap launchd for a [systemd](https://en.wikipedia.org/wiki/Systemd) user service on linux and keep the same guard logic, but the installer i'm shipping is mac.
- **a stuck-but-alive session still needs a nudge.** respawn-on-death covers the clean case. the stranded and hung ones above don't trip it, because the process is technically still running, so those still need someone (or, as it turns out, some *thing*) to notice and kick it.

none of that's a surprise once you see what it is: a small, honest wrapper that turns "your session died" into "your session took a nap." if you keep an agent running for real work, that's the difference between it being always-on and it being always-on until the next update.

# get it

- clone it: [github.com/royashbrook/waterbear](https://github.com/royashbrook/waterbear)
- or point an agent at the repo and say "waterbear yourself"

it's MIT, it's one script plus a skill, and it's named after the toughest animal i could find. seemed fitting for the thing whose entire job is to not stay dead.
