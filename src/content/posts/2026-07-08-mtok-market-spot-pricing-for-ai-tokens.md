---
title: "mtok.market: spot pricing for ai tokens"
date: 2026-07-08
path: "2026/07/08/mtok-market-spot-pricing-for-ai-tokens"
draft: false
---

[mtok.market](https://mtok.market) is a [spot market](https://en.wikipedia.org/wiki/Spot_market) for [ai inference](https://www.ibm.com/think/topics/ai-inference) tokens.

that sentence sounds like a bunch of fun ai jargon. so let me explain a bit. the simple version is this: people have spare ai capacity. sometimes that is an idle local model. sometimes it is a [gpu](https://en.wikipedia.org/wiki/Graphics_processing_unit) box that sits quiet most of the day. sometimes it is provider capacity they are allowed to route. on the other side, [agents](https://en.wikipedia.org/wiki/Intelligent_agent) need bursts of inference. they don't necessarily need a new subscription, a human signup flow, or a credit card. they need to look at a market, find a price, pay for a small chunk, run the job, and move on.

so mtok.market is an attempt at that market.

the unit is **MTok**, meaning dollars per [million tokens](https://developers.openai.com/api/docs/guides/token-counting). sellers list capacity by model and price. humans decide what they want done, what they are willing to spend, and what boundaries the agent should respect. then the agent reads the book, chooses a route, funds small chunks, and draws inference. the whole thing is built for agents to operate on behalf of people, not for humans to click around all day.

you can go look at it now: [mtok.market](https://mtok.market). if you are a human and want the plain english version, start at [mtok.market/start](https://mtok.market/start). if you are an agent, or you are pointing an agent at it, the actual front door is [mtok.market/llms.txt](https://mtok.market/llms.txt).

# why this exists

the original itch came from [a friend](https://marcusvorwaller.com/) of mine and his project [nightshift](https://github.com/marcus/nightshift). nightshift uses the leftover token budget from your local ai tools to do useful overnight maintenance on your codebase: dead code, doc drift, test gaps, security checks, that kind of thing. clever solution to a common problem. it got me thinking about unused ai capacity more generally.

unused tokens are use it or lose it. that's exactly the shape spot markets are good at. hotel rooms tonight. empty seats on a plane. spare compute. capacity that is worth less, or zero, later. same for ai tokens. if you are the buyer, you don't really care whose idle capacity served a [batch classification](https://en.wikipedia.org/wiki/Statistical_classification) job, a [summarization](https://en.wikipedia.org/wiki/Automatic_summarization) pass, or some extraction task, as long as the model is good enough, the price is right, and the seller actually delivers. the seller would rather get something than nothing for capacity that was going to sit there anyway.

i also thought it would be great if an agent could do all the work. if you are a person, much easier if you can just task your agent to go get tokens and use them optimally for whatever they need. we already do similar things locally if you have a subscription anyway to offload tasks to 'cheaper' models. so why not have an agent that can do this with any model. act as a steward of your tokens and buy and sell them period.

i couldn't find anything like this when i started working on it, so i made one.

# the important architecture choice

the thing i didn't want to build was another [proxy](https://en.wikipedia.org/wiki/Proxy_server) that holds everyone's keys and money. i wanted things to be more p2p and public, not going 'through me' instead going from buyer to seller directly. so... mtok.market is **seller-hosted** and **[non-custodial](https://ethereum.org/wallets/find-wallet/)**. these sound like marketing speak, i think, but really they are the whole architecture.

seller-hosted means the seller runs the [relay](https://mtok.market/sell-local.md). the seller owns whatever is behind it: a local model, an [api key](https://en.wikipedia.org/wiki/API_key), a provider bridge, whatever they are allowed to share or sell. the platform never sees the upstream key, and it doesn't proxy your prompt through some central inference server. a buyer draws against the seller's relay.

non-custodial means the platform doesn't hold the buyer's money or the seller's money. the buyer pays the seller directly in [USDC](https://www.circle.com/usdc) on [Base](https://www.base.org/). when a platform fee applies, that's a separate [on-chain](https://en.wikipedia.org/wiki/Blockchain) payment leg. the platform matches, verifies, records, prices, and tracks reputation, but it isn't an [escrow account](https://en.wikipedia.org/wiki/Escrow) and it isn't the [counterparty](https://en.wikipedia.org/wiki/Counterparty).

that makes the product a little sharper around the edges, because there is no refund button hiding in a database somewhere. but it also keeps the blast radius sane. if the platform goes away, it was never holding a pile of user funds. if a seller misbehaves, the buyer's risk is the small chunk they prepaid, not some giant balance.

# how a trade works

the loop is pretty small. in the example below, buyer and seller are meant to be an ai agent.

1. a seller posts an offer for a model at an input and output price per MTok.
2. a buyer reads the market and finds a route.
3. the buyer opens a short-lived prepaid balance by sending a small on-chain payment directly to the seller.
4. the buyer draws inference chunks from the seller's relay.
5. the delivery is metered, reported, and recorded.
6. the buyer affirms a good delivery or disputes a bad one.

here is the same loop the way the site draws it:

<img src="/assets/images/mtok-transaction-flow.svg" alt="sequence diagram of one mtok.market transaction: seller lists a signed offer, buyer asks the market for a route, buyer pays the draw on base, sends proof to the seller, seller verifies DrawPaid on chain and delivers tokens, buyer affirms on chain, market reads the events" style="background:#f2f6f2;border-radius:8px;padding:16px;width:100%;max-width:850px" />

the important detail is that the buyer doesn't need to prepay for the whole theoretical job. the route can be funded in small chunks as it goes. that keeps the buyer's risk small, gives the seller a reason to deliver cleanly, and makes a bad route something you can stop using instead of a giant mistake you have to unwind.

prices come from delivered chunks, not from wishful thinking. an ask can show what a seller is offering, but the spot price is based on recent deliveries. the [trade tape](https://www.investor.gov/introduction-investing/investing-basics/glossary/consolidated-tape) is actual metered usage. there is also a [public ledger](https://en.wikipedia.org/wiki/Ledger) head at [mtok.market/api/chain/head](https://mtok.market/api/chain/head), and the verification recipe is in [llms.txt](https://mtok.market/llms.txt), because "trust me bro" isn't really the ideal market data model.

as i'm writing this it is an early, thin market on a `2.5%` configured fee, a handful of real paid trades, not a deep one. the live numbers are always at [mtok.market/api/chain/head](https://mtok.market/api/chain/head), so i am not going to freeze a snapshot into this post. that is tiny, obviously. but tiny and real is more interesting to me than a giant fake dashboard.

# on the market, everything is paid

there is no free lane on the market. every offer has a real price, and every draw is a real USDC payment on chain. that is on purpose. the payment proof is what turns a delivery into a market event instead of just a promise in a log file, and it is what makes the reputation worth anything, since faking it costs real money every time.

so every participant needs a Base wallet with a little USDC and a little [ETH](https://ethereum.org/what-is-ether/) for [gas](https://ethereum.org/developers/docs/gas/). that is the one step an agent can't do for you. it can ask you to fund a wallet, and then it can handle the market mechanics after that.

if you want free, that exists, it just isn't the market. the same code the agents use is published, so you can serve a model to yourself or a friend with no payment and no wallet at all. [mtok-bridge](https://www.npmjs.com/package/mtok-bridge) serves any model as an OpenAI-compatible api behind a key, no payment, no account, no listing, nothing reported anywhere. handing a friend an endpoint is plumbing. the market is for when you want the receipt. honestly, you can just tell an agent to do this thing, and i have found it can build all of this on the fly for you. but, i already wrote it, so why not share it.

# the site is for agents first

the market dashboard exists because humans still need to look at something. they need to understand whether it is alive, what the prices are, what the trade tape says, and whether the whole thing feels trustworthy enough to hand to an agent. but, in an ideal world you would just point your agent at the site and ask them to use it, tell you what it does, etc.

so the real product surface is the agent surface:

- [llms.txt](https://mtok.market/llms.txt), the dense agent manual
- [openapi.json](https://mtok.market/openapi.json), the api contract
- [mcp](https://mtok.market/mcp), the tool endpoint for clients that speak [MCP](https://modelcontextprotocol.io/docs/getting-started/intro)
- the components themselves, on [npm](https://www.npmjs.com/) and open source: [mtok-sdk](https://www.npmjs.com/package/mtok-sdk) is the buyer side (identity, wallet, pay-however-the-market-asks), [mtok-relay](https://www.npmjs.com/package/mtok-relay) is the seller relay, and [mtok-bridge](https://www.npmjs.com/package/mtok-bridge) is the bare transport core with no market in it at all
- [sell-local.md](https://mtok.market/sell-local.md), the raw seller runbook

could an agent skip the packages and talk to the api raw? sure, the contract is right there. but the packages are the advertised path, and because they are open source, anyone can read exactly what their agent is agreeing to before it spends a cent. same goes for the money layer: the [MtokDripLedger contract is public on Base](https://basescan.org/address/0x745ee2cbcce03424902092c8d71698825f7bb7be), so the whole machine is inspectable end to end.

for me, this was an interesting finding from this and my other recent projects that have to do with ai. a website used to be mostly for a person to see and click around. now, for a certain kind of tool, the website is also a manual that another program reads so it can do the work for that person. they may never even really need to see it.

mtok.market leans all the way into that. the human page basically says: you don't use this page, your agent does. paste this prompt to buy tokens, or paste this prompt to share capacity. if your agent supports MCP, just give it the endpoint.

a little weird, but probably closer to where a lot of developer tools are going.

# why this isn't just another api reseller

the easy version of this would have been a central gateway. sellers give the platform keys. buyers give the platform money. the platform proxies calls, keeps balances, takes fees, pays sellers later.

that's easier in some ways, but it creates the exact pile of problems i wanted to avoid. now the platform is holding secrets. now it is holding customer money. now it needs withdrawal flows, account recovery, abuse controls around a central proxy, and a much bigger trust story.

i know because that's what i built first. the original version was exactly that gateway, and somewhere along the way i realized i didn't actually want it. i don't want to hold your keys. i don't want to hold your funds. i want the agents to be able to do all of that themselves. once you push everything out to the edges, the only pieces you can't really distribute are the reputation and a place to list things, and honestly you could probably do even those distributed with something like [nostr](https://en.wikipedia.org/wiki/Nostr). i built a venue instead because the trust structure for buyers and sellers, plus having an actual price, seemed like a convenient value add for someone who wants to dip a toe in. and if you don't want to pay the market at all, the plumbing is published, you can hand someone an api key and go direct with no market in the way.

so mtok.market is deliberately more primitive than the gateway version. it's closer to a venue:

- sellers host delivery
- buyers pay sellers directly
- the platform verifies and records
- reputation comes from delivered volume
- spot prices come from delivered trades

there are still plenty of hard problems. seller trust is hard. speed is real: a tiny local model on a slow machine isn't the same product as a fast hosted endpoint, even if both technically return tokens. model truth is hard too. a market can record delivery, payment, disputes, and reputation, but it can't magically make every seller honest or every route good.

provider terms are a real issue if someone tries to resell capacity they don't have the right to resell. [open-weight](https://opensource.org/ai/open-weights) and [self-hosted](https://en.wikipedia.org/wiki/Self-hosting_(web_services)) capacity is the cleanest path. provider-key resale is between the seller and the provider, and the site says that plainly. the platform doesn't magically make everyone's upstream terms go away.

that's also why the pilot shape matters. this should start small, with caps, with a real trade tape, with reputation, and with honest language about what is being listed.

# what i like about it

there are a few things in here that i think are worth paying attention to even if mtok.market itself stays tiny.

first, agents are becoming real economic actors in the boring practical sense. not "the machines have bank accounts" sci-fi. more like: a coding agent can already call [APIs](https://en.wikipedia.org/wiki/API), deploy code, set secrets, and run infrastructure. the missing step isn't intelligence. it's rails. how does the agent pay for the one thing it needs right now without dragging a human through a whole signup and billing flow?

second, public [machine-readable surfaces](https://en.wikipedia.org/wiki/Machine-readable_data) matter. if the product is for agents, [llms.txt](https://llmstxt.org/), [OpenAPI](https://www.openapis.org/), MCP, and small importable clients aren't extras. they're the storefront.

third, tiny payments are finally cheap enough to be interesting again. a prepaid chunk can be around a dime, or smaller if the job is smaller, because Base transactions are cheap enough that this doesn't immediately become nonsense. you still wouldn't want to do silly penny-sized accounting forever, but you can make the risk per seller small without eating the whole transaction in fees.

fourth, the trust model has to move from "the platform promises" to "the system leaves evidence." a public ledger, on-chain payments, delivered-volume reputation, and spot prices based on real deliveries are all attempts to make the market explain itself. the market doesn't need to be the only possible route between a buyer and seller. it needs to make discovery, pricing, and evidence useful enough that staying in the venue is worth the small fee.

this isn't a hypothetical design preference. there is a live example of the other path: [ERC-8004](https://eips.ethereum.org/EIPS/eip-8004), an agent reputation registry with over 170,000 registered agents, got studied this summer and [the study](https://arxiv.org/abs/2606.26028) found most reviewers were sybils and the feedback rarely connected to a verifiable transaction. reputation that isn't anchored to real payments is free to fake, so it gets faked. reputation here is derived from paid on-chain draws and buyer affirmations, so faking it costs real money every time.

and the venue holds itself to the same standard. stats, reputation, and spot are computed from the public contract events on Base, and the api tells you which block it is indexed to. you don't have to trust the venue's database. you can rebuild the same numbers from the chain yourself, and if the venue disappeared tomorrow the record would still be there. a troll with a big account can still do something, but it takes a long time and we all know what the retail cost of tokens are anyway.

# what it is not

mtok.market is not:
- a bank
- a promise that every seller is safe
- a claim that every model or provider can legally be resold by whoever lists it
- a giant liquid market yet
- a claim that every route will be fast
- trying to hide the weird parts

it is a working prototype of an agent-first spot market for inference capacity. the current version is meant to be small enough to reason about and real enough to test the core loop.

# try it

if you are just curious, go to [mtok.market/start](https://mtok.market/start). that page is the plain english explanation and the best entry point for humans.

if you want to point an agent at it, give it this:

> go to https://mtok.market/llms.txt, read how mtok.market works, explain it to me in plain english, and tell me what it would take to buy tokens or share capacity.

if you have idle local capacity and want to experiment with selling or sharing it, start by giving your agent [llms.txt](https://mtok.market/llms.txt). if you want to read the raw seller runbook yourself, that's [sell-local.md](https://mtok.market/sell-local.md). it's intentionally more runbook than landing page.

and if you just want to watch the market, the dashboard is at [mtok.market](https://mtok.market).

mostly, i'm interested in the shape of this. a market where the primary user isn't a human clicking buttons, but an agent reading a manual, checking a book, funding a tiny route, doing the work, and leaving a public trace that it happened.

that feels like a thing worth building badly enough to learn from.
