---
sidebar_position: 5
---

# 📸 Snapshots

As events pile up in your event stores, the performances and costs of your commands can become an issue.

One solution is to periodially persist **snapshots** of your aggregates (e.g. through a message bus listener), and only fetch them plus the subsequent events instead of all the events.

Snapshots are not implemented in Castore yet, but we have big plans for them, so stay tuned 🙂
