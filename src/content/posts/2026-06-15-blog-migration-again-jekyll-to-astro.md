---
title: "blog migration, again, jekyll to astro (and a little ai)"
date: 2026-06-15
path: "2026/06/15/blog-migration-again-jekyll-to-astro"
draft: false
---

so i moved the blog again. the last time i wrote one of these was [back in 2022](/2022/06/08/Blog-Migration-Update-and-GitHub-Codespaces/), when i came back to royashbrook.com and switched to a brutalist-ish jekyll theme. that served me fine for a few years, but it started to feel old, and honestly not like something i'd build today.

## why

a few things piled up:

- the site had no working metrics. i had google analytics on, but it was the old universal analytics tag, which google shut off in 2023. i was not really worried about this, but didn't notice, so something nice to fix.
- all my newer projects live on cloudflare now, and i wanted the blog on the same stack instead of github pages. automatically gave me metrics, plus consistency with other personal stuff.
- jekyll's been good to me, but i have been in svelte/js land for many years. astro is more in line with this, so again, just more consistent on personal stuff.
- i wanted to redesign the layout of the site anyway. i wanted to add a landing page, not just drop only into the blog. most of the content was blog data, but i thought it would be nice to have some links to some other projects instead of just to my blog or having to hope people went to github to find those.
- it was time for a change. sometimes, you just want to change things a little. =)

## what

short version: jekyll to astro, github pages to cloudflare, and a fresh minimal look.

- **astro** for the site. it's built for markdown content, so all old posts came over as-is, and i kept every url exactly (`/year/month/day/title/`) so nothing anyone ever linked to breaks. i wrote a little porter script to convert the old jekyll posts, including the ~90 old github gist embeds so they still render.
- **cloudflare** for hosting, with cloudflare web analytics for metrics. cookieless, free, no banner, and it's the same thing i run my latest personal sites on. so i can finally tell if anyone's out there. =)
- **the look**: monospace, lowercase, pretty sparse. terminal-ish, but with enough structure that you can actually find the projects and the writing. i went back and forth on a few directions and settled here. it's not so far off my old site, but has dark/light mode.
- all the source in it's own repo named royashbrook.com, which is what i used to use. since moving to github pages it has been in the mandated one. also, i could make it private if i wanted since it builds and sends out to cloudflare.

## the ai part

another big reason was ai is out now. makes porting something like this trivial. easy to a/b test, fiddle, and avoid much typing/grunt work for me. like porting 247 posts and wiring up the build. that's increasingly how i work now. so more posts coming on that for sure. like everyone else in the world, i have my own little custom "agentic os", basically a setup for how i actually use ai day to day. i'll probably write about it soon. this site, and the new [for ai agents](/agents/) section with a couple skills and mcps i've made, is sort of the tip of that iceberg.

anyway. same blog, same rambling, just a newer house. thanks for reading, whoever you are. i can see you now. =P
