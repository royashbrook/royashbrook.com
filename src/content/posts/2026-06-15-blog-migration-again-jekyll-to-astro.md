---
title: "blog migration, again, jekyll to astro (and a little ai)"
date: 2026-06-15
path: "2026/06/15/blog-migration-again-jekyll-to-astro"
draft: true
---

so i moved the blog again. the last time i wrote one of these was [back in 2022](/2022/06/08/Blog-Migration-Update-and-GitHub-Codespaces/), when i came back to royashbrook.com and switched to a brutalist-ish jekyll theme. that served me fine for a few years, but it started to feel old, and honestly not like something i'd build today.

## why

a few things piled up:

- the site had no working metrics for *years* and i didn't even notice. turns out my google analytics was the old universal analytics tag, which google shut off in 2023. so i'd basically been writing into the void. =P
- all my newer projects live on cloudflare now, and i wanted the blog on the same stack instead of github pages.
- jekyll's been good to me, but i'm in svelte/js land these days, and the ruby toolchain had become a thing i maintained more than used.
- i wanted a real front door. the old site dropped you straight into the post archive. fine if you came for a post, not great if you just wanted to see what i'm up to.

## what

short version: jekyll to astro, github pages to cloudflare, and a fresh minimal look.

- **astro** for the site. it's built for markdown content, so all 247 posts came over as-is, and i kept every url exactly (`/year/month/day/title/`) so nothing anyone ever linked to breaks. i wrote a little porter script to convert the old jekyll posts, including the ~90 old github gist embeds so they still render.
- **cloudflare** for hosting, with cloudflare web analytics for metrics. cookieless, free, no banner, and it's the same thing i run on [lifescored.com](https://lifescored.com). so i can finally tell if anyone's out there. =)
- **the look**: monospace, lowercase, pretty sparse. terminal-ish, but with enough structure that you can actually find the projects and the writing. i went back and forth on a few directions and settled here. (also: dark mode, finally.)
- i moved the source to its own repo too. i only kept the old `royashbrook.github.io` name because github pages required it. now it can just be `royashbrook.com`, and private if i want.

## the ai part

i'll be honest, i didn't hand-type most of this. i did it with an ai, pairing the whole way, me deciding and steering, it doing a lot of the grunt work, like porting 247 posts and wiring up the build. that's increasingly how i work now, and it's a big enough topic that it's getting its own post.

so, a teaser: i've been building out my own little "agentic os", basically a setup for how i actually use ai day to day. i'll write that up soon. this site, and the new [for ai agents](/agents/) section with a couple skills and mcps i've made, is sort of the public tip of that iceberg.

anyway. same blog, same rambling, just a newer house. thanks for reading, whoever you are. i can see you now. =P
