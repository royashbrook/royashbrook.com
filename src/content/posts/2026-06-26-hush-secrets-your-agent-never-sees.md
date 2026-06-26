---
title: "hush: secrets your ai agent never sees"
date: 2026-06-26
path: "2026/06/26/hush-secrets-your-agent-never-sees"
draft: false
---

if you let an [ai agent](https://en.wikipedia.org/wiki/Intelligent_agent) run as you, it can already do almost anything. your [clis](https://en.wikipedia.org/wiki/Command-line_interface) are already logged in, so it can set a secret on a server, call an api, push a deploy, whatever. there's really only one thing it *can't* safely do: see a secret.

that's the whole problem hush solves. **hush is a tool for your ai agents**, and it does one thing, with one hard rule: **the agent never sees the [plaintext](https://en.wikipedia.org/wiki/Plaintext).**

it's open and MIT, and there are three ways in: clone the repo at [github.com/royashbrook/hush](https://github.com/royashbrook/hush), grab it from [npm](https://www.npmjs.com/package/@royashbrook/hush) with `npx @royashbrook/hush`, or point an agent at the [mcp endpoint](https://royashbrook.com/hush).

# the "go paste this token somewhere" dance

here's the situation that bugged me. i'm working with an agent and it's doing real things as me. at some point it needs a [credential](https://en.wikipedia.org/wiki/Credential) , a vendor [api key](https://en.wikipedia.org/wiki/API_key), a [token](https://en.wikipedia.org/wiki/Access_token), a [signing secret](https://en.wikipedia.org/wiki/HMAC). and every option for getting that secret into play is bad:

- paste it into the chat. super bad. it's in logs, maybe being pulled into training data, etc. total no-go. and even if you do, sometimes agents will immediately say 'hey, bro! why'd you do that, i won't use that because it's bad now' as they should. bad practice and a secret that's been in a chat window is a burned secret.
- drop it in a `.env` file. now it's plaintext on disk waiting to get committed by accident, and the agent or anyone else can read it whenever it wants. common, but not ideal in my opinion
- stop, switch to a terminal, and go set it by hand myself in the platform. most secure, but tedious and defeats the point of having the agent do the work. this also, in my experience, may involve multiple copy/pastes, leaving windows open. tokens and secrets end up in files and notes temporarily while they are moved into their final resting place.
- probably other non-ideal/annoying ways to do this...
  
the agent can already set the secret in github/cf/azure or whatever for me. if only there was someway it could get the secret without me having to paste it somewhere or put it in a temp file or something... well, the agent doesn't actually need to *see* the value. it needs to *use* it. it can run `wrangler secret put` or `gh secret set` or hit some api with an auth header all day long without ever looking at the string it's passing. we can just pipe it from somewhere else.

so hush is just the missing piece: get a secret in once, then inject it into commands forever, and never let it pass back through the agent.

# how it works

there's deliberately no `get`. a plain [getter](https://en.wikipedia.org/wiki/Mutator_method) is the leak , the moment you can read a value back out, it's going to end up printed somewhere. so hush only has the verbs that don't require the agent to see anything:

- `set` , the agent runs this and a little paste box pops up on *your* screen. you paste the value, it goes straight into your os [keychain](https://en.wikipedia.org/wiki/Keychain_%28software%29), and the agent [never sees it](https://github.com/royashbrook/hush/blob/1cabe523052bf1e048d6f1e2fc72e4501ad61476/hush#L110-L137). it just knows the name now.
- `mint` , for a secret that only needs to be strong and random (an operator key, a [webhook](https://en.wikipedia.org/wiki/Webhook) signing secret), the agent [generates it](https://github.com/royashbrook/hush/blob/1cabe523052bf1e048d6f1e2fc72e4501ad61476/hush#L194-L199) and stores it itself. nobody ever types it.
- `run` / `pipe` , [inject](https://github.com/royashbrook/hush/blob/1cabe523052bf1e048d6f1e2fc72e4501ad61476/hush#L215-L222) the stored value into a command. `run` puts it in the [env](https://en.wikipedia.org/wiki/Environment_variable), `pipe` sends it to [stdin](https://en.wikipedia.org/wiki/Standard_streams). either way it goes keychain → the command, never to the screen.
- `list` , [names only](https://github.com/royashbrook/hush/blob/1cabe523052bf1e048d6f1e2fc72e4501ad61476/hush#L101-L108), never values.

here's the thing though: as the human, you don't type any of these commands. you tell your agent to use hush, then just say something like "store my vendor key in hush" or "grab the gemini key from hush and set it on the worker", and it figures out the rest. the only prep on you is to have the key ready first , go generate it wherever you generate it, then kick the agent off, because that one paste is the single thing it needs from you.

if you're curious what it's actually doing under the hood (you don't have to care): `hush set my-vendor-key`, then `hush pipe my-vendor-key -- wrangler secret put MY_VENDOR_KEY`, and the value lands in your [cloudflare worker](https://developers.cloudflare.com/workers/) without ever being in the chat. or it mints one itself with `hush mint operator-key` and injects it via `hush run KEY=operator-key -- ./some-tool`. but really, you paste the key once and the agent handles all of that.

mac, linux, and windows all work , it just rides each one's built-in secret store (keychain, [libsecret](https://gnome.pages.gitlab.gnome.org/libsecret/), [dpapi](https://en.wikipedia.org/wiki/Data_Protection_API)).

# how i used it, aka dogfooding

my personal use case of this was validated the most when I started using cold agents use it.

i pointed a fresh agent, working on a completely different project, at the hush repo and basically said "use this skill." it installed itself from the url, read the docs, and then , on its own , walked right into the exact case hush is for: it needed a rotated api key it wasn't allowed to see. so it ran `hush set`, the paste box popped on my screen, i dropped the new key in, and it piped that straight into the deployed worker and confirmed it worked. the key it had just used was never printed, never in the transcript, never on disk. that's the entire loop, driven by an agent that had never heard of the tool ten minutes earlier.

since then, i use it all the time while publishing stuff. i needed a cloudflare token in a github secret, and instead of pasting it anywhere, the agent piped it from hush straight into `gh secret set`. the token did its job and i never saw it. dogfood complete.

now, i basically use it constantly. so why not share.

# it's not a vault

i want to be honest about what this is and isn't. hush is **not** a lock against a hostile process. an agent with [shell](https://en.wikipedia.org/wiki/Shell_%28computing%29) access can obviously use the store , that's the whole point, it's *for* the agent. what it does is keep plaintext out of the conversation and make "store it once, inject it everywhere" the easy, default path instead of the paste-into-chat path.

it's also only as durable as the machine it's on. it's a local keychain, not a hosted manager. so it's a great backstop and on-ramp, but don't make hush the only copy of a secret you can't regenerate , back the machine up, or sync it onward into a real secret manager. i created a little helper to use for apple icloud with an encrypted backup, but you can roll your own. i just had an agent write those helper scripts anyway.

# get it

- `npx @royashbrook/hush`, or `npm i -g @royashbrook/hush` for the `hush` command
- or clone it: [github.com/royashbrook/hush](https://github.com/royashbrook/hush)
- it's an agent skill, so you can also just point your agent at [royashbrook.com/hush](https://royashbrook.com/hush) , there's a little [mcp](https://modelcontextprotocol.io) endpoint there that hands it the whole playbook

that's the whole idea: your agent can keep doing everything it does as you, minus the one bad habit of needing to see your secrets to use them. and for a human, it also helps to avoid the "go paste this token somewhere" dance, which sometimes may mean you leave a secret somewhere you didn't mean to. hush is a simple tool, but it solves a real problem for both humans and agents.
