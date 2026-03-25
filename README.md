# GitHub Guide for CSC1034 Coursework Group052

Welcome to the comprehensive guide for using GitHub for your coursework in CSC1034. This guide includes essential information on branching strategy, commit conventions, and basic Git CLI commands that every student should be familiar with.

## Table of Contents
1. [Branching Strategy](#branching-strategy)
2. [Commit Conventions](#commit-conventions)
3. [Basic Git CLI Commands](#basic-git-cli-commands)

## Branching Strategy
Branching is a crucial part of working with Git and GitHub. It allows you to work on features or fixes separately without affecting the main codebase.

### Main Branch
- **`main`**: This is the primary branch where the stable version of your code resides. Always keep this branch functional.

### Feature Branches
- **Naming**: Use clear, descriptive names for feature branches.
- **Creation**: Create a new branch from the `main` branch for each new feature or bug fix.

### Merging
- Once your feature is complete and tested, create a pull request (PR) to merge your changes back into the `main` branch.
- Ensure the PR is reviewed by at least one other team member before merging.

## Commit Conventions
Following a consistent commit message format is essential for maintaining a clear project history.

### Example
```bash
git checkout -b roman/feature(code): bla bla bla
````

### Merge flow

1. Push branch
2. Open PR → `main`
3. Get 1 review
4. Merge

---

## Commits

### Format

```
<type>(scope): short description
```

### Types

* `feat` — new feature
* `fix` — bug fix
* `refactor` — code change (no behavior change)
* `docs` — documentation
* `test` — tests

### Examples

```bash
feat(auth): add JWT login
fix(api): handle null response
refactor(db): simplify query builder
```

---

## Core Git Commands

### Setup

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

### Workflow

```bash
git clone <repo>
git checkout -b feature/x

git add .
git commit -m "feat(x): description"

git push origin feature/x
```

### Sync

```bash
git pull origin main
```

---

## Quick Rules

* No direct commits to `main`
* One feature = one branch
* Small, atomic commits
* Always pull before pushing
* PR required for merge

---

## Example Full Flow

```bash
git checkout main
git pull

git checkout -b feature/payment-api
# work...

git add .
git commit -m "feat(payment): add endpoint"

git push origin feature/payment-api
# → open PR → review → merge
```

---

Keep it simple, consistent, and reviewable.
