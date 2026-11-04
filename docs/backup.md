# Backing up player data

Do this before any change that touches saves or storage (Phase 0 merges, and again before the Phase 3 storage migration). There are three layers; use all that apply.

## 1. Players: "Export my campaigns"

Settings and the Active Experiences tab both have **Export my campaigns** and **Import**.

- Export downloads `zeroroll-backup-<date>.json` with every campaign this browser holds (guest, signed-in and legacy keys) and, when signed in, every campaign in the account's cloud copy, plus non-secret preferences. API keys are never included.
- Import is additive. It never deletes, and it never replaces a local or cloud copy that is newer than the one in the file. When signed in, restored campaigns are also uploaded to the account.

Guest campaigns live only in the player's browser, so this is the only backup that covers them.

## 2. Project owner: admin dump script

Needs a service-account key for the Firebase project (`mentalmedic-82280`). Keep it on your machine; `service-account*.json` and `backups/` are git-ignored.

1. Firebase console → Project settings → Service accounts → Generate new private key.
2. Run:

```sh
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json npm run backup:firestore
```

This reads every collection and subcollection (including `users/{uid}` and `users/{uid}/experiences/{id}`) and writes `backups/<timestamp>/users.jsonl`, `users.experiences.jsonl` and `counts.json`. It is read-only.

To restore (dry run first, then with `--confirm`):

```sh
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json npm run restore:firestore -- --from backups/<timestamp>
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json npm run restore:firestore -- --from backups/<timestamp> --confirm
```

Restore never deletes and skips documents that already exist. `--overwrite-older` replaces an existing document only when the dump's `updatedAt` is newer. `--only users.experiences` limits it to one bucket.

## 3. Project owner: managed export (Blaze plan only)

```sh
gcloud firestore export gs://mentalmedic-82280-backups/$(date +%F) --project=mentalmedic-82280
gcloud firestore databases update --database='(default)' --enable-pitr --project=mentalmedic-82280
```

Point-in-time recovery keeps the last seven days restorable into a new database. On the free Spark plan exports are unavailable; use layer 2.

## Migration rules (Phase 3)

Write the new shape first, verify counts and the last turn of every campaign, then mark the old document read-only. Never delete `experiences` documents or localStorage campaigns in the first release.
