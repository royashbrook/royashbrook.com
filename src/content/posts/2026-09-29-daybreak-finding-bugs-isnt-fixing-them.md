---
title: "we pointed daybreak at everything. finding bugs isn't fixing them."
date: 2026-09-29
path: "2026/09/29/daybreak-finding-bugs-isnt-fixing-them"
draft: true
---

openai gave me access to [daybreak](https://openai.com/daybreak/), their security push. for me that meant [codex security](https://learn.chatgpt.com/docs/security) with the "daybreak blue" [trusted access](https://developers.openai.com/codex/concepts/cyber-safety) turned on. so i did the obvious thing. i pointed it at basically everything i run.

my gut said we scanned a million things. the real number is smaller and more interesting.

- 37 repos, across my public apps, games, tools, and a chunk of work code.
- 33 completed scans, all on sol (gpt-5.6-sol).
- 263 reported findings. not 263 distinct bugs, a couple of repos got scanned twice.
- 42 findings fixed and shipped, plus one fix pattern rolled out at work.
- about 4 billion tokens, 95% of them cached.
- 1,907 agents. yes really. more on that below.

the short version: the scanner is good, and it's the cheap half. the fixes are where the value is, and fixing is a second budget you have to plan for.

# how i ran it

i run codex as a handful of long-lived sessions, one per area of my stuff. public apps in one, games in another, tools in another, work in a couple more. so on september 19 i gave each of them basically the same prompt:

> we have access to daybreak which is codex security scanning tool. create an issue on next sprint to track this, but we will go ahead and work ahead. run daybreak against {these repos} and see what it finds.

that's it. the variations were small. for the work feeds i added "if you can identify patterns, just scan some representative repos instead of all of them." for the public apps it was "see what kind of stuff we get to fix." for the tools it was a `/goal` to scan everything and "open issues to track all of the findings so we can resolve them afterwards."

notice what's not in any of those. no scan mode. no budget. no stop rule. no worker count. i left all of that to the agents. that turns out to matter a lot.

one bit of setup friction: daybreak only worked on sol at the time, not on the newer model i normally run. so every session had to get switched to sol for the scan and switched back to do real work afterward.

# what a scan does

i assumed "the scanner" was some remote service. it isn't. it's a local plugin, and the codex session drives it. there are two modes.

standard is the session doing the audit itself, following the plugin's workflow, with a handful of helper agents:

![a standard scan: the session starts the scan, spawns a few reviewer agents, validates what they find, and seals the report](/assets/daybreak/standard-scan.svg)

standard scans took 5 to 42 minutes each. four to ten agents per scan.

deep hands the work to the plugin, and it runs its own fleet. each reviewer is basically a full standard scan with three sub-agents. four reviewers run at a time. reducers merge the results. it keeps going until a stop rule says done:

![a deep scan: the plugin runs rolling batches of reviewers with sub-agents and dedup reducers while the session polls for status every thirty seconds](/assets/daybreak/deep-scan.svg)

deep scans took 12 minutes to almost 2 hours each. the tools area ran 21 of them back to back for about 21 hours of wall clock.

see that loop at the bottom, where the session checks "still running?" every 30 seconds? hold that thought.

# the token burn

here's everything, from the local session logs:

| | scans | agents | tokens | per scan |
|---|---:|---:|---:|---:|
| standard (4 areas) | 12 | 61 | 264M | ~22M |
| deep (tools) | 21 | 1,599 | 2.39B | ~114M |
| deep, the one that never finished | 1 | 199 | 1.28B | n/a |
| deep, the one that hit the limit | 1 | 48 | 42M | n/a |
| total | 35 started, 33 done | 1,907 | 3.97B | |

a few things to know about those numbers:

1. 95% of it is cached input. every agent re-reads the same context over and over, and the cache makes that cheap. new input was about 195 million tokens. output was about 37 million. so "4 billion tokens" is true and also kind of misleading.
2. it's not a bill. these are usage counters from the session logs. i don't have a dollar figure and i'm not going to make one up.
3. it's not nothing either. i'm on a plan with a weekly allowance. the scans used four weekly limits in one week. so about a month's worth in 4 working days. after the last one ran out, nothing ran for 8 days.

the deep scans are 93% of the whole thing. and a third of the total went to one run that never finished. it ran all its reviewers, the workers all reported success, and then it never registered a final report. the session kept saying "running" for hours. i finally asked what it was doing, turned it off, and cancelled it. 1.28 billion tokens for zero findings.

and the polling. while a deep scan runs, the session asks "done yet?" every 30 seconds, and every time it re-reads its whole context (about 185k tokens). across the deep scans that was 1,670 checks and about 446 million tokens of doing nothing but waiting. cached, sure. but still.

# deep vs standard, by accident

i didn't plan a comparison. the agents made different choices on their own. four areas picked standard. the tools area picked deep for everything.

so: deep cost about 5x per scan (114M vs 22M tokens). it found more per scan, about 9 vs 6. but per token, standard found about 3x as much. it's not a controlled test. different repos, different sizes, different languages. but it's the closest thing i have.

the extreme case was a tiny markdown-only repo that got 8 deep review runs and zero findings. another small module got 16 runs for three low findings. nobody told it to stop, because nobody told it when to stop.

two repos got scanned both ways, standard from the public apps side and deep from the tools side. that's a nice side-by-side, and also why 263 findings isn't 263 separate bugs.

# what it found (the good stuff)

only fixed things here. if a finding is still open, it's not going in a blog post, even vaguely.

first, the reward fountain. [craftrush](https://github.com/royashbrook/craftrush) is a little browser game with shareable saves. it already capped how big an imported save could be, and it bounded decompression. but the level number *inside* the save was only checked for being a positive integer. after a boss win the game creates `8 + level * 2` reward objects. so a tiny save with a huge level could ask the browser to allocate millions of objects.

i love this one because it's so easy to miss. the input was bounded. the *work the input asked for* wasn't. the fix caps the real objects at 64 and carries the rest as a weighted count, so nobody loses rewards. importing level one trillion now makes 64 objects worth two trillion reward units, and it all saves correctly. ([issue and fix receipt](https://github.com/royashbrook/craftrush/issues/142#issuecomment-5746538045), shipped in 1.11.3.)

the other public apps turned up a pattern. almost every real bug was a guarantee that was claimed wider than it held.

- one process vs every replica. a payment check that made sure a paid request was only redeemed once... on one machine. several relays could each accept the same payment. the fix moved the claim somewhere shared. the hard part was the migration. an old worker was still answering 88 seconds after it had been deleted, so "i deployed the new one" wasn't the same as "the old one is gone."
- a byte estimate vs the real token count. a prompt priced by its size in bytes could cost way more in model tokens. 4,000 repeated digits is at least 4,000 tokens, and the estimate said 1,259. the fix counts the real model input before taking payment.
- one relay vs the truth. [blame.today](https://blame.today) took the biggest count any relay reported and saved it. so one relay could say "nine quadrillion" and own the leaderboard. now it uses the second highest fresh count from distinct relays, so one liar can't win. ([closure notes](https://github.com/blame-today/blame-web/issues/41#issuecomment-5745594284))
- one signed release vs a trusted build. [neveraway](https://github.com/neveraway/neveraway)'s release pulled in a dependency before signing. it could also fall back to ad-hoc signing if credentials were missing. now tagged releases fail closed. inputs are pinned and verified. the windows installer checks a detached signature. ([release notes](https://github.com/neveraway/neveraway/issues/25#issuecomment-5876133246))

and some fixes weren't code at all. a couple of docs promised more than the system did, like a kill switch that couldn't stop on-chain settlement. the fix was to make the claim honest. that counts.

plus a pile of boring, useful stuff. pinning ci actions to exact commits. putting limits on request sizes and fanout. that kind of thing.

# the work code

a chunk of the scanning was on systems i run at my day job. no names, but here's the shape.

- two internal web apps. svelte front ends on microsoft's cloud, .net and powershell serverless functions, a document database, an on-prem sql source. about 18k lines.
- eleven data feed repos, a representative slice of a bigger fleet. powershell and sql on a self-hosted ci runner, moving files over sftp, email, and vendor apis. about 12k lines of real code, sitting in a lot of generated data files.

three standard scans. 28 findings: 3 high, 17 medium, 8 low, nothing critical. the themes were ci and supply chain hygiene, session and credential handling, and file transfer settings.

one fix pattern shipped right away: pinning every ci action to a full commit hash, with automated update prs. the rest are sitting with the people who own those decisions. a few were accepted as deliberate tradeoffs. that's normal, and it's the honest state of things.

# when "no" is the answer

[sortit](https://github.com/royashbrook/sortit) got scanned right after a long investigation into a webkit networking crash. there was an old library bug in the test tooling that *looked* like it could be the cause. very tempting to call it a vulnerability and ship a workaround.

the scan came back with zero findings. the test tooling wasn't the shipped game, and there was no real attacker path. so we left production alone and [wrote down why](https://github.com/royashbrook/sortit/issues/74#issuecomment-5742714334). i think that's a good result. a scanner that tells you not to touch something is worth something too.

# finding isn't fixing

this is the lesson.

| area | findings | fixed |
|---|---:|---:|
| public apps | 41 | 40 |
| games | 2 | 2 |
| tools | 192 | 0 |
| work | 28 | one fix pattern |

that looks like some areas cared and some didn't. nope. the public apps had a short list, so i said "ok, fix everything you found" while the other scans were still grinding away. the games were small, so we fixed them the same night. the tools area was 21 deep scans and 192 findings filed as issues, which is a backlog, not an afternoon.

the scanner is the cheap half. every one of those 42 fixes needed a real change, a regression test that fails on the old code, and a release. some needed live checks. that took way longer than the scans did. and it was a different model in a different mode.

so fixing is a second budget. if you spend your whole allowance scanning, you end up with a nice pile of issues and nothing to spend on closing them.

# the unglamorous lessons

1. export the evidence the day you get it. ten days later the scan tool says "requested artifact is unavailable" for the original reports. the findings index and our notes survived, but the full sealed reports are gone. if you want receipts, save them right away.
2. don't trust "running". the run that burned 1.28 billion tokens said running for hours after its workers had finished. check the thing underneath, not the status line.
3. pick the mode yourself. i didn't specify standard or deep, and one area picked the 5x option for everything. that's on me, not the agent.
4. set a ceiling and a stop rule before you start. a token budget per repo, and "stop when a pass finds nothing new". without those, a small repo can soak up 8 deep runs for zero findings.
5. count fixes, not findings. 263 findings sounds great in a tweet. 42 fixes is the number that made anything safer.

# would i do it again

yeah. but bounded. standard scans by default. deep only where standard finds something worth chasing. a token cap and a stop rule written into the prompt. fixing budgeted in from the start, not left for whatever's left.

the finds were real. the reward fountain alone was worth it. i just want the next round to spend more on fixing and a lot less on asking "done yet?" every 30 seconds =P
