# AGENTS.md

## Purpose

`ai-news-agent` is a manager-led minimal multi-agent system for collecting English AI primary sources, translating them into Japanese without breaking technical terms, and helping AI practitioners judge important changes quickly.

## Current Phase

The repository is currently in:

- design for the minimal multi-agent architecture
- technical selection for that architecture
- implementation is not the current source of truth yet

Current source-of-truth documents:

- `docs/specs/ai-news-agent-spec.md`
- `docs/design/minimal-multi-agent-design-items.md`
- `docs/design/minimal-multi-agent-design-guidelines.md`
- GitHub Issue `#11`
- GitHub Issue `#12`

If code or older notes conflict with these, follow the documents and Issues above.

## Product Constraints

- Primary use case is reading, not audio-first consumption.
- Priority sources are:
  - official blogs
  - GitHub Releases / changelogs
  - official documentation updates
  - Hacker News as a secondary source
- Reddit, X, dev.to, and Zenn are not in the current minimal scope.
- Full translation scope is:
  - body
  - headings
  - bullet lists
- Do not translate:
  - tables
  - code blocks
- Performance target is:
  - 5 articles within 2 minutes
  - 10 articles within 3 minutes
  - measured from command start to Markdown generation complete
  - no cache
  - no audio

## Design Principles

- Keep the architecture manager-led.
- Prefer structured shared state over free-form text passing between agents.
- Keep source adapters, normalization, ranking, translation, and output responsibilities separate.
- Prefer primary sources over secondary sources.
- Keep the implementation aligned with the minimal multi-agent scope before adding advanced autonomy.
- Do not introduce speculative features unless they are reflected in the spec or Issues.

## Working Rules

- Before changing architecture or scope, update the relevant docs or Issues first.
- Treat `docs/specs/ai-news-agent-spec.md`, `docs/design/minimal-multi-agent-design-items.md`, and `docs/design/minimal-multi-agent-design-guidelines.md` as the current design baseline.
- Do not commit unrelated files such as `.claude/` unless explicitly requested.
- Do not resurrect old `Phase 1 MVP CLI` assumptions if they conflict with the current minimal multi-agent direction.
- When implementing, optimize for clarity of responsibilities, testability, and performance constraints.
- During the design phase, always reference `docs/design/minimal-multi-agent-design-guidelines.md` while discussing or refining architecture.

## Implementation Direction

Near-term expected components:

- `manager agent`
- `source worker agents`
- `judge / dedupe agent`
- `translation agent`
- `markdown output layer`

Expected design topics before major implementation:

- manager responsibilities
- source worker boundaries
- shared memory schema
- normalization / content extraction boundaries
- stop conditions / success conditions
- orchestration flow
- error handling
- parallelism strategy
