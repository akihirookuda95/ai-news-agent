# Product Vision and MVP Direction

Created: 2026-05-03

## Purpose

This document clarifies the final product vision for `ai-news-agent` and the MVP direction derived from that vision.

It exists to reduce the cognitive load of the minimal multi-agent design discussion by clarifying the following first:

- what product this project ultimately aims to build
- what the most important user value is
- what the MVP should validate
- what the MVP should intentionally exclude

## Background

Earlier design documents leaned toward an MVP whose central value was "collect English AI primary sources, fully translate them, and output Markdown quickly."

However, the recent product discussion clarified that the higher user value is not full translation itself, but the following:

- reducing the chance of missing important AI primary information
- filtering noise and surfacing information relevant to the user
- helping the user decide what to read now and what to try next
- making English articles easier to understand in Japanese when needed

Therefore, future MVP requirements should not treat full translation as the highest-value feature by default. The core should be information discovery, noise reduction, and personalized relevance.

## Final Product Vision

`ai-news-agent` is an AI intelligence backend that continuously collects official updates and community signals based on the user's technologies and goals of interest, then generates and stores low-noise, theme-based research briefs.

A manager-led controlled multi-agent system selects sources, searches, evaluates results, and performs additional investigation when needed. The output should help the user decide what to read now and what to try next.

Important articles are translated in full when needed and delivered as Markdown, notifications, and searchable stored data. In the future, the system can expand into hosted DB, external notifications, Codex / Claude Code / app integrations, and audio digests.

## Final Value Definition

The final core value is:

> A personal AI research assistant that continuously collects AI primary information and related signals aligned with the user's interests, filters noise, and helps the user decide what to read now and what to try next.

The priority order is:

1. Low noise and high reading value
2. Avoiding major misses of important information
3. Helping the user decide what to read now or try next
4. Covering enough relevant information
5. Making important articles understandable in Japanese when needed
6. Speed matters, but it is not the highest priority

## Target User Experience

The final experience should not be a manually triggered CLI digest only. It should combine regular collection with on-demand deep dives.

- Information is collected regularly.
- Sources and search targets are selected based on the user's technologies and goals of interest.
- Theme-based research briefs are stored as Markdown.
- Digest generation is announced through external notifications such as Slack, Discord, or email.
- The user can request interactive deep dives from Codex or Claude Code when needed.
- In the future, collected data should be searchable.
- In the future, audio digests should be available for listening while walking.

## Final Source Scope

The final product should cover both official information and community signals.

Potential sources:

- Official blogs
- GitHub Releases / changelogs
- Official documentation updates
- Hacker News
- Reddit
- X
- Zenn / Qiita
- dev.to

How to treat these sources:

- Official information is used for facts, announcements, and specification changes.
- Community signals are used for reactions, temperature, practical pain points, and missed discoveries.
- Japanese sources are treated as supplementary.
- The system tracks fixed targets as well as adjacent technologies based on interest themes.

However, the MVP should not handle all of these at once.

## Final Output Vision

The final primary outputs are Markdown, notifications, and searchable stored data.

Research briefs should be organized by theme, not only by article.

They should include:

- theme overview
- official information
- community reactions
- impact on the user
- whether to read now
- whether to try next
- important links
- necessary translation of article content

Translation should target important articles, rather than always fully translating every article.

## Final Agent Design

The final agent design should be a controlled multi-agent system, not a fully autonomous agent.

The manager should eventually decide:

- source selection based on interest settings
- search query generation
- whether additional investigation is needed
- whether a deep dive is needed
- whether another source should be explored
- which items should be translated
- which items should be included in the output

Normal digest generation should run within controlled boundaries.

Multiple rounds of additional investigation or source exploration should be allowed only during deep dives.

When the agent is uncertain:

- low-cost decisions can proceed automatically
- decisions with large cost, time, or scope impact should ask the user
- reasoning should be recorded in the brief or execution logs

## Long-Term Positioning

Long term, this project aims to become an AI information collection backend, not just a personal CLI tool.

- Hosted DB / hosted service should remain possible in the future.
- External notifications such as Slack, Discord, and email should be supported eventually.
- The system should be callable from Codex, Claude Code, and other apps.
- It should leave room for use by close collaborators or small teams.
- It should not assume a public SaaS product from the beginning.

The state to avoid most is over-engineering before the product becomes useful for personal use.

## MVP Narrowing Direction

The final vision is broad, but the MVP should be heavily scoped down.

The central value to validate in the MVP is:

> Can the system collect important updates relevant to the user's technologies and goals of interest from a limited set of official information sources, then output them as a low-noise, theme-based research brief?

MVP direction:

- Start with official information.
- Keep sources limited.
- Do not include additional exploration, or limit it to at most one round.
- Prefer translation of important articles or necessary sections instead of full translation for all articles.
- Defer notifications, audio, hosted DB, and broad community sources.
- Keep the responsibility boundaries between manager, worker, judge, translation, and output.

## MVP Candidates

### MVP-0

The smallest unit to implement and validate first.

- Target only one official blog source family.
- `manager`
- `official_blog_worker`
- simple judge
- translation
- markdown output
- minimal shared memory schema only
- no additional exploration
- no notifications
- no audio
- no hosted DB

What to validate:

- whether the manager-led structure is excessive
- whether source worker output can use a common schema
- whether candidates relevant to interest themes can be collected from official information
- whether the output works as a theme-based research brief

### MVP

The next step after MVP-0.

- Official blogs
- GitHub Releases / changelogs
- Some official documentation updates
- simple judge / dedupe
- theme-based research brief
- translation of important articles
- Markdown storage
- execution logs and failure reasons

Hacker News, Reddit, X, Zenn, Qiita, dev.to, notifications, audio, and hosted DB should come after the MVP.

## Out of Scope for MVP

- Reddit
- X
- Zenn / Qiita
- dev.to
- broad Hacker News collection
- scheduled execution
- external notifications
- audio digests
- hosted DB
- Web UI
- deep autonomous exploration
- multi-round deep-dive investigation
- public SaaS assumptions

## Impact on Current Docs

Existing docs strongly emphasized full translation and Markdown output within 2-3 minutes.

When reflecting the current discussion, future docs should be reviewed with the following points in mind:

- Full translation is important, but it is not the highest-value feature.
- The highest-value features are information discovery, noise reduction, and personalized relevance judgment.
- Speed matters, but it should not always override quality.
- The final vision includes scheduled collection, notifications, storage, search, and deep dives.
- The MVP should not implement all of these, but should preserve them as future directions.

## Agent Design References

- Anthropic: Building effective agents
  - https://www.anthropic.com/engineering/building-effective-agents
  - Referenced for the principle of starting simple and adding agentic complexity only when needed.
- OpenAI Cookbook: Structured Outputs for Multi-Agent Systems
  - https://developers.openai.com/cookbook/examples/structured_outputs_multi_agent
  - Referenced for the importance of structured outputs in multi-agent handoffs.
- LangChain multi-agent docs
  - https://docs.langchain.com/oss/python/langchain/multi-agent
  - Referenced for comparing supervisor, handoff, and routing patterns.

## Next Decisions

Next, define the MVP purpose based on this final vision.

Candidate directions:

1. Validate whether the system can collect important updates relevant to interest technologies from official primary sources.
2. Validate whether a single official blog source family can produce a theme-based research brief.
3. Validate whether a small number of sources can be used to select low-noise "read now" information.

Recommended framing:

- `MVP-0`: Validate whether one official blog source family can produce a theme-based research brief.
- `MVP`: Validate whether a small number of official sources can collect important updates relevant to interest technologies.
