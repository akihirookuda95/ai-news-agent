# ai-news-agent

AI news and research brief agent that tracks official updates and community signals based on personal interests.

`ai-news-agent` is a project for collecting AI-related information based on a user's technologies and goals of interest, filtering noise, and generating theme-based research briefs.

The long-term goal is to build an AI intelligence backend that tracks official updates and community signals, then helps users decide what to read now and what to try next.

## Current Status

This repository is currently in the product design phase before implementation.

The current focus is:

- narrowing MVP / MVP-0 scope from the final product vision
- defining MVP functional and non-functional requirements
- minimizing the manager-led controlled multi-agent architecture

Implementation code is not yet the source of truth.

## Product Direction

The highest-value goals are not full translation by itself, but the following:

- reducing the chance of missing important AI updates
- filtering noise and surfacing information relevant to personal interests
- making it easier to decide what to read now and what to try next

The intended long-term experience is:

- collect information regularly based on the user's technologies and goals of interest
- track both official updates and community signals
- generate and store theme-based research briefs as Markdown
- translate important articles when needed
- later expand into notifications, searchable stored data, interactive deep dives, and audio digests

## MVP Direction

MVP / MVP-0 will not implement the full product vision.

The initial goal is to constrain sources and autonomy, then validate:

- whether the agent can find important updates relevant to the user's interests from a limited set of official sources
- whether it can generate low-noise, theme-based research briefs
- whether the manager / worker / judge / translation / output boundaries are useful without becoming over-engineered

In the early MVP, Reddit, X, Zenn, Qiita, dev.to, notifications, audio, hosted DB, and deep autonomous exploration are out of scope.

## Source of Truth

The current product direction is defined by:

- [`docs/README.md`](docs/README.md)
- [`docs/design/product-vision-and-mvp-direction.md`](docs/design/product-vision-and-mvp-direction.md)

Older specifications and design notes have been moved under `docs/archive/`. Archive documents are useful for historical context, but they are not the current source of truth.

## Repository Notes

- This repository is currently focused on product and architecture design.
- The old `Phase 1 MVP CLI` premise should not be restored.
- Before major implementation work, the MVP purpose, functional requirements, and non-functional requirements should be defined first.
