# LLM-DocKit

A reusable documentation scaffold for LLM-assisted software projects. This template provides a complete workflow for managing projects where humans collaborate with LLMs (like Claude, ChatGPT, or others), ensuring consistent documentation, version control, and knowledge handoff between sessions.

## Why LLM-DocKit?

When working with LLMs on software projects, you need:
- ✅ **Clear rules** for how LLMs should work (language, commits, versioning)
- ✅ **Session continuity** so the next LLM knows what happened before
- ✅ **Documentation discipline** that keeps context synchronized
- ✅ **Version management** that prevents breaking changes
- ✅ **Handoff protocol** for multi-LLM or human+LLM collaboration

LLM-DocKit solves this by providing battle-tested templates and workflows.

## Quick Start

### 1. Get the Scaffold
```bash
# Fork on GitHub (recommended) or clone directly
git clone https://github.com/<your-username>/LLM-DocKit.git my-new-project
cd my-new-project
```

### 2. Follow the Setup Guide
Read **[HOW_TO_USE.md](HOW_TO_USE.md)** for complete instructions.

**5-minute version:**
1. Replace `<PROJECT_NAME>` in all files with your project name
2. Update [docs/PROJECT_CONTEXT.md](docs/PROJECT_CONTEXT.md) with your project vision
3. Customize [LLM_START_HERE.md](LLM_START_HERE.md) rules
4. Remove optional folders you don't need (src/, scripts/, tests/)
5. Start your first LLM session!

### 3. Share with Your LLM
Before each work session, give your LLM this file: **[LLM_START_HERE.md](LLM_START_HERE.md)**

## What's Included

### Core Documentation
- **[LLM_START_HERE.md](LLM_START_HERE.md)** - Mandatory reading for all LLMs (rules, workflow, policies)
- **[HOW_TO_USE.md](HOW_TO_USE.md)** - Setup guide for humans after forking
- **[docs/PROJECT_CONTEXT.md](docs/PROJECT_CONTEXT.md)** - Template for project vision, architecture, and status
- **[docs/STRUCTURE.md](docs/STRUCTURE.md)** - Document your repository organization
- **[docs/VERSIONING_RULES.md](docs/VERSIONING_RULES.md)** - Semantic versioning guidelines

### LLM Handoff System
- **[docs/llm/HANDOFF.md](docs/llm/HANDOFF.md)** - Current work state and priorities (updated every session)
- **[docs/llm/HISTORY.md](docs/llm/HISTORY.md)** - Chronological log of all changes (append-only)

### Operations & Runbooks
- **[docs/operations/](docs/operations/)** - Placeholder for operational procedures, deployment guides, incident response

### Optional Boilerplate
- **src/** - Source code (remove if not needed)
- **tests/** - Test suites (remove if not needed)
- **scripts/** - Utility scripts (remove if not needed)
- **.github/** - GitHub issue/PR templates (remove if not using GitHub)

## Features

### 🤖 Multi-LLM Collaboration
Different LLMs can work on the same project by reading [docs/llm/HANDOFF.md](docs/llm/HANDOFF.md) to understand current state.

### 📝 Automatic Documentation
Every LLM session must update documentation, ensuring nothing is lost between sessions.

### 🔢 Version Management
Semantic versioning rules prevent breaking changes and keep components synchronized.

### 🚫 "Do Not Touch" Zones
Mark critical code areas that shouldn't be modified without explicit permission.

### 🌍 Language Flexibility
Configure conversation language (Spanish, English, etc.) while keeping code/docs in English.

### 📋 Commit Message Standards
Every LLM response includes suggested commit info (title + description) for consistency.

## Typical Workflows

### For Web Applications
```
src/
  frontend/    # React, Vue, etc.
  backend/     # API server
tests/
docs/
```

### For Infrastructure Projects
```
infrastructure/
  terraform/
  kubernetes/
scripts/        # Deployment automation
docs/
  operations/   # Critical runbooks
```

### For Python Libraries
```
src/
  package_name/
tests/
docs/
```

### For CLI Tools
```
cli/           # Renamed from src/
  commands/
scripts/       # Build/release
docs/
```

See [HOW_TO_USE.md](HOW_TO_USE.md#common-scenarios) for detailed examples.

## Documentation Philosophy

This scaffold enforces documentation discipline through:

1. **Mandatory updates** - LLMs must update HANDOFF and HISTORY after every change
2. **Single source of truth** - HANDOFF.md contains current state, HISTORY.md contains the full timeline
3. **Clear rules** - LLM_START_HERE.md defines non-negotiable policies
4. **Context preservation** - New LLMs (or humans) can quickly understand project state

## Real-World Example

This scaffold was extracted from [PiHA-Deployer](https://github.com/cdchushig/PiHA-Deployer), a home automation infrastructure project. After successfully using this workflow across multiple LLM sessions (Claude, ChatGPT, Codex), the structure was generalized into LLM-DocKit.

## Who Should Use This?

- ✅ Developers working with LLM assistants (Claude, ChatGPT, etc.)
- ✅ Teams collaborating with multiple LLMs on the same project
- ✅ Projects requiring strict documentation discipline
- ✅ Long-running projects where context must be preserved across sessions
- ✅ Solo developers who want better documentation habits

## Getting Help

- 📖 Read the [complete setup guide](HOW_TO_USE.md)
- 🐛 [Report issues](https://github.com/cdchushig/LLM-DocKit/issues)
- 💡 [Suggest improvements](https://github.com/cdchushig/LLM-DocKit/pulls)
- 🌟 Check the [PiHA-Deployer example](https://github.com/cdchushig/PiHA-Deployer)

## Contributing

This scaffold is meant to be forked and adapted. If you develop improvements that could benefit others:
1. Fork this repository
2. Make your enhancements
3. Submit a pull request with a clear description

## License

Released under the MIT License. See [LICENSE](LICENSE) for details.

---

**Ready to start?** Read [HOW_TO_USE.md](HOW_TO_USE.md) and launch your first LLM-assisted project!
