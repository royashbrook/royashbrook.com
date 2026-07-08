---
title: "mtok.market: spot pricing for ai tokens"
date: 2026-07-08
path: "2026/07/08/mtok-market-spot-pricing-for-ai-tokens"
draft: false
---

[mtok.market](https://mtok.market) is a [spot market](https://en.wikipedia.org/wiki/Spot_market) for [ai inference](https://www.ibm.com/think/topics/ai-inference) tokens.

that sentence is weird enough that it probably needs a minute.

the simple version is this: people have spare ai capacity. sometimes that is an idle local model. sometimes it is a [gpu](https://en.wikipedia.org/wiki/Graphics_processing_unit) box that sits quiet most of the day. sometimes it is provider capacity they are allowed to route. on the other side, [agents](https://en.wikipedia.org/wiki/Intelligent_agent) need bursts of inference. they do not necessarily need a new subscription, a human signup flow, or a credit card. they need to look at a market, find a price, pay for a small chunk, run the job, and move on.

so mtok.market is an attempt at that market.

the unit is **MTok**, meaning dollars per [million tokens](https://developers.openai.com/api/docs/guides/token-counting). sellers list capacity by model and price. humans decide what they want done, what they are willing to spend, and what boundaries the agent should respect. then the agent reads the book, chooses a route, funds small chunks, and draws inference. the whole thing is built for agents to operate on behalf of people, not for humans to click around all day.

you can go look at it now: [mtok.market](https://mtok.market). if you are a human and want the plain english version, start at [mtok.market/start](https://mtok.market/start). if you are an agent, or you are pointing an agent at it, the actual front door is [mtok.market/llms.txt](https://mtok.market/llms.txt).

# why this exists

the original itch came from my friend [Marcus Vorwaller](https://marcusvorwaller.com/blog/) and his project [Nightshift](https://github.com/marcus/nightshift). Nightshift uses the leftover token budget from your local ai tools to do useful overnight maintenance on your codebase: dead code, doc drift, test gaps, security checks, that kind of thing. which is clever, and it got me thinking about unused ai capacity more generally.

unused capacity is perishable inventory. if you do not use it, it disappears.

that is exactly the shape spot markets are good at. hotel rooms tonight. empty seats on a plane. spare compute. capacity that is worth less later than it is right now.

ai tokens have the same basic smell. the buyer does not necessarily care whose idle capacity served a [batch classification](https://en.wikipedia.org/wiki/Statistical_classification) job, a [summarization](https://en.wikipedia.org/wiki/Automatic_summarization) pass, or some extraction task, as long as the model is good enough, the price is right, and the seller actually delivers. the seller would rather get something than nothing for capacity that was going to sit there anyway.

so the market asks a pretty direct question:

what if an agent could buy a little inference the same way software already buys a little compute?

the version of this i keep coming back to is not just buyer and seller. it is an agent acting as a steward of token cost. it can buy cheap capacity when it needs it, use local or self-hosted capacity when that makes more sense, and maybe sell surplus when it would otherwise sit idle. that is the shape that felt worth making real enough to poke.

not by opening a billing portal. not by making the human create another account. not by storing a giant prepaid balance inside some new platform. just read the book, pick a route, pay the seller, get the tokens.

# the important architecture choice

the thing i did not want to build was another [proxy](https://en.wikipedia.org/wiki/Proxy_server) that holds everyone's keys and money.

mtok.market is **seller-hosted** and **[non-custodial](https://ethereum.org/wallets/find-wallet/)**. those are not marketing words here, they are the whole architecture.

seller-hosted means the seller runs the [relay](https://mtok.market/sell-local.md). the seller owns whatever is behind it: a local model, an [api key](https://en.wikipedia.org/wiki/API_key), a provider bridge, whatever they are allowed to share or sell. the platform never sees the upstream key, and it does not proxy your prompt through some central inference server. a buyer draws against the seller's relay.

non-custodial means the platform does not hold the buyer's money or the seller's money. the buyer pays the seller directly in [USDC](https://www.circle.com/usdc) on [Base](https://www.base.org/). when a platform fee applies, that is a separate [on-chain](https://en.wikipedia.org/wiki/Blockchain) payment leg. the platform matches, verifies, records, prices, and tracks reputation, but it is not an [escrow account](https://en.wikipedia.org/wiki/Escrow) and it is not the [counterparty](https://en.wikipedia.org/wiki/Counterparty).

that makes the product a little sharper around the edges, because there is no refund button hiding in a database somewhere. but it also keeps the blast radius sane. if the platform goes away, it was never holding a pile of user funds. if a seller misbehaves, the buyer's risk is the small chunk they prepaid, not some giant balance.

# how a trade works

the loop is pretty small.

1. a seller posts an offer for a model at an input and output price per MTok.
2. a buyer's agent reads the market and finds a route.
3. the buyer opens a short-lived prepaid balance by sending a small on-chain payment directly to the seller.
4. the buyer draws inference chunks from the seller's relay.
5. the delivery is metered, reported, and recorded.
6. the buyer affirms a good delivery or disputes a bad one.

the important detail is that the buyer does not need to prepay for the whole theoretical job. the route can be funded in small chunks as it goes. that keeps the buyer's risk small, gives the seller a reason to deliver cleanly, and makes a bad route something you can stop using instead of a giant mistake you have to unwind.

prices come from delivered chunks, not from wishful thinking. an ask can show what a seller is offering, but the spot price is based on recent deliveries. the [trade tape](https://www.investor.gov/introduction-investing/investing-basics/glossary/consolidated-tape) is actual metered usage. there is also a [public ledger](https://en.wikipedia.org/wiki/Ledger) head at [mtok.market/api/chain/head](https://mtok.market/api/chain/head), and the verification recipe is in [llms.txt](https://mtok.market/llms.txt), because "trust me bro" is not really the ideal market data model.

as i am writing this it is an early, thin market on a `2.5%` configured fee, a handful of real paid trades, not a deep one. the live numbers are always at [mtok.market/api/chain/head](https://mtok.market/api/chain/head), so i am not going to freeze a snapshot into this post. that is tiny, obviously. but tiny and real is more interesting to me than a giant fake dashboard.

# free is gas-only

there is a thing on the site called free, but it is worth being precise about it.

free on mtok.market means **[gas-only](https://ethereum.org/developers/docs/gas/)**, not "no wallet." a free listing is [dust-priced](https://mtok.market/llms.txt). the seller is basically donating the capacity, but the buyer still needs a [funded wallet](https://ethereum.org/wallets/) because each chunk still needs a real on-chain payment proof. that is how a delivery becomes a real market event instead of just a promise in a log file.

so every participant needs a Base wallet with a little USDC and a little [ETH](https://ethereum.org/what-is-ether/) for gas. that is the one step an agent cannot do for you. it can ask you to fund a wallet, and then it can handle the market mechanics after that.

this is why the site looks a little strange if you approach it like a normal web app. humans do not really operate it. humans approve, fund, and set boundaries. agents operate it.

# the site is for agents first

one of the stranger parts of building this was realizing that the most important page is not the pretty page.

the market dashboard exists because humans still need to look at something. they need to understand whether it is alive, what the prices are, what the trade tape says, and whether the whole thing feels trustworthy enough to hand to an agent.

but the real product surface is the agent surface:

- [llms.txt](https://mtok.market/llms.txt), the dense agent manual
- [openapi.json](https://mtok.market/openapi.json), the api contract
- [mcp](https://mtok.market/mcp), the tool endpoint for clients that speak [MCP](https://modelcontextprotocol.io/docs/getting-started/intro)
- [client.mjs](https://mtok.market/client.mjs) and [sdk.mjs](https://mtok.market/sdk.mjs), the small client surfaces
- [sell-local.md](https://mtok.market/sell-local.md), the raw seller runbook

that is the part i keep finding interesting lately. a website used to be mostly for a person with eyes and a mouse. now, for a certain kind of tool, the website is also a manual that another program reads so it can do the work for you.

mtok.market leans all the way into that. the human page basically says: you do not use this page, your agent does. paste this prompt to buy tokens, or paste this prompt to share capacity. if your agent supports MCP, just give it the endpoint.

that feels weird, but it is also probably closer to where a lot of developer tools are going.

# why this is not just another api reseller

the easy version of this would have been a central gateway. sellers give the platform keys. buyers give the platform money. the platform proxies calls, keeps balances, takes fees, pays sellers later.

that is easier in some ways, but it creates the exact pile of problems i wanted to avoid. now the platform is holding secrets. now it is holding customer money. now it needs withdrawal flows, account recovery, abuse controls around a central proxy, and a much bigger trust story.

mtok.market is deliberately more primitive than that. it is closer to a venue:

- sellers host delivery
- buyers pay sellers directly
- the platform verifies and records
- reputation comes from delivered volume
- spot prices come from delivered trades

there are still plenty of hard problems. seller trust is hard. speed is real: a tiny local model on a slow machine is not the same product as a fast hosted endpoint, even if both technically return tokens. model truth is hard too. a market can record delivery, payment, disputes, and reputation, but it cannot magically make every seller honest or every route good.

provider terms are a real issue if someone tries to resell capacity they do not have the right to resell. [open-weight](https://opensource.org/ai/open-weights) and [self-hosted](https://en.wikipedia.org/wiki/Self-hosting_(web_services)) capacity is the cleanest path. provider-key resale is between the seller and the provider, and the site says that plainly. the platform does not magically make everyone's upstream terms go away.

that is also why the pilot shape matters. this should start small, with caps, with a real trade tape, with reputation, and with honest language about what is being listed.

# what i like about it

there are a few things in here that i think are worth paying attention to even if mtok.market itself stays tiny.

first, agents are becoming real economic actors in the boring practical sense. not "the machines have bank accounts" sci-fi. more like: a coding agent can already call [APIs](https://en.wikipedia.org/wiki/API), deploy code, set secrets, and run infrastructure. the missing step is not intelligence. it is rails. how does the agent pay for the one thing it needs right now without dragging a human through a whole signup and billing flow?

second, public [machine-readable surfaces](https://en.wikipedia.org/wiki/Machine-readable_data) matter. if the product is for agents, [llms.txt](https://llmstxt.org/), [OpenAPI](https://www.openapis.org/), MCP, and small importable clients are not extras. they are the storefront.

third, tiny payments are finally cheap enough to be interesting again. a prepaid chunk can be around a dime, or smaller if the job is smaller, because Base transactions are cheap enough that this does not immediately become nonsense. you still would not want to do silly penny-sized accounting forever, but you can make the risk per seller small without eating the whole transaction in fees.

fourth, the trust model has to move from "the platform promises" to "the system leaves evidence." a public ledger, on-chain payments, delivered-volume reputation, and spot prices based on real deliveries are all attempts to make the market explain itself. the market does not need to be the only possible route between a buyer and seller. it needs to make discovery, pricing, and evidence useful enough that staying in the venue is worth the small fee.

this is not a hypothetical design preference. there is a live example of the other path: [ERC-8004](https://eips.ethereum.org/EIPS/eip-8004), an agent reputation registry with over 170,000 registered agents, got studied this summer and [the study](https://arxiv.org/abs/2606.26028) found most reviewers were sybils and the feedback rarely connected to a verifiable transaction. reputation that is not anchored to real payments is free to fake, so it gets faked. reputation here is derived from paid on-chain draws and buyer affirmations, so faking it costs real money every time.

and the venue holds itself to the same standard. stats, reputation, and spot are computed from the public contract events on Base, and the api tells you which block it is indexed to. you do not have to trust the venue's database. you can rebuild the same numbers from the chain yourself, and if the venue disappeared tomorrow the record would still be there.

# what it is not

it is not a bank.

it is not a promise that every seller is safe.

it is not a claim that every model or provider can legally be resold by whoever lists it.

it is not a giant liquid market yet.

it is not a claim that every route will be fast.

it is not trying to hide the weird parts.

it is a working prototype of an agent-first spot market for inference capacity. the current version is meant to be small enough to reason about and real enough to test the core loop.

# try it

if you are just curious, go to [mtok.market/start](https://mtok.market/start). that page is the plain english explanation and the least weird entry point.

if you want to point an agent at it, give it this:

> go to https://mtok.market/llms.txt, read how mtok.market works, explain it to me in plain english, and tell me what it would take to buy tokens or share capacity.

if you have idle local capacity and want to experiment with selling or sharing it, start by giving your agent [llms.txt](https://mtok.market/llms.txt). if you want to read the raw seller runbook yourself, that is [sell-local.md](https://mtok.market/sell-local.md). it is intentionally more runbook than landing page.

and if you just want to watch the market, the dashboard is at [mtok.market](https://mtok.market).

mostly, i am interested in the shape of this. a market where the primary user is not a human clicking buttons, but an agent reading a manual, checking a book, funding a tiny route, doing the work, and leaving a public trace that it happened.

that feels like a thing worth building badly enough to learn from.
