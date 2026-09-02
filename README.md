# Tether

Tether pairs someone working on a hard personal goal (a **doer**) with one person who supports them (a **supporter**). The pair share a private space with goals, a timeline of what happened, a journal the supporter can comment on, weekly reviews, and a "struggle" button that sends a high-priority signal plus a guided routine in the moment it is needed.

The app is a single-page React client talking directly to Firebase; there is no backend server of our own, so **Firestore and Storage security rules are the entire authorization layer**.

## Repository layout

| Path | Contents |
| --- | --- |
| `tether_app/` | The React app — see [`tether_app/README.md`](tether_app/README.md) for setup and architecture |
| `firestore.rules` | Firestore authorization, scoped to relationship membership |
| `storage.rules` | Storage authorization for journal images |
| `firestore.indexes.json` | Composite indexes required by the app's queries |
| `firebase.json` | Rules/indexes wiring and emulator ports |
| `docs/` | Feature documentation (journal, reviews) |

## Quick start

```bash
cd tether_app
npm install
cp .env.example .env.local   # fill in your Firebase web config
npm run dev
```

## Security rules

`firestore.rules` and `storage.rules` in this directory are the source of truth. Do not paste rules from feature docs or the Firebase console into a project — edit these files, run the tests, and deploy:

```bash
cd tether_app
npm run test:rules   # 41 tests against the Firestore emulator, no credentials needed
firebase deploy --only firestore:rules,firestore:indexes,storage
```

Until that deploy runs against a live project, the database is unprotected regardless of what is committed here.

## Documentation

- [`tether_app/README.md`](tether_app/README.md) — setup, scripts, collections, rules and indexes, deployment
- [`docs/journal.md`](docs/journal.md) — journal entries, image uploads, comments
- [`docs/reviews.md`](docs/reviews.md) — goal reviews, custom strategies, progress analytics
