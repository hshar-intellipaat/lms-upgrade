# LearnPath Backend Developer Handoff

## 1. Purpose

This document specifies the backend behavior required to turn the current LearnPath prototype into a production LMS for a BTech cohort.

The prototype currently stores progression in `localStorage` through `gamification.js`. That implementation is useful for demonstrating interactions, but production data must be server-authoritative. The client must never decide or directly persist XP, ratings, streaks, unlocks, league scores, or assessment results.

## 2. Product Scope

The current learning hierarchy is:

```text
Program
  -> Subject/Track
    -> Topic
      -> Difficulty level
        -> Exercise
          -> Exercise steps
```

Current example:

```text
BTech Program
  -> Web Development
    -> HTML
      -> Beginner
        -> Exercise 1: Tags, elements and attributes
```

The production model should also support:

- Multiple BTech batches and graduation years
- Semesters
- Sections and campuses
- Subjects and modules
- Beginner, Intermediate, and Advanced difficulty levels
- Lessons, exercises, projects, quizzes, and assessments
- Prerequisites and unlock rules
- Semester batch, subject, section, and weekly leaderboards
- Instructor-authored content and versioning

## 3. Current Prototype Rules

These rules exist in the prototype and should be treated as initial product defaults, not immutable business rules.

### XP

- Base XP for first exercise completion: `100`
- Star bonus: `25 XP` per star
- Total award:

```text
earned_xp = 100 + (stars * 25)
```

- A 3-star first completion awards `175 XP`.
- Replaying an exercise awards no duplicate completion XP.
- A replay can improve the learner's rating and personal bests.
- Comeback bonus: `50 XP`, claimable once when eligible.

Maintain three separate XP counters derived from the XP ledger:

- `total_xp`: lifetime XP used for learner levels and long-term progression
- `weekly_xp`: XP earned inside the active weekly league period
- `semester_xp`: XP earned inside the active academic semester and used for the primary batch leaderboard

When a semester closes, reset only `semester_xp` for the new period. Do not reset lifetime XP, learner level, ratings, personal bests, or completed learning content.

### Learner levels

- Each learner level currently requires `250 XP`.
- Level calculation:

```text
level_number = floor(total_xp / 250) + 1
level_progress_xp = total_xp mod 250
```

- Current titles:

| Level | Title |
|---|---|
| 1 | Explorer |
| 2 | Builder |
| 3 | Creator |
| 4 | Specialist |
| 5+ | Master |

Production recommendation: store level thresholds and titles in configuration rather than hard-coding them.

### Exercise ratings

The prototype awards stars using:

| Result | Rating |
|---|---|
| No hints and no failed checks | 3 stars |
| Up to 2 hints and up to 3 failed checks | 2 stars |
| Anything else that completes successfully | 1 star |

Only the highest rating is retained.

Production recommendation: rating rules should be configurable by exercise type. Time should not reduce a rating unless the exercise is explicitly timed.

### Personal bests

For each exercise, retain:

- Fastest valid completion time
- Fewest hints used
- Fewest failed checks/mistakes
- Highest star rating

These values may come from different attempts. If the product needs a "best single run," store that separately.

### Streak

The current prototype updates the streak on first exercise completion:

- First recorded activity starts or preserves at least a 1-day streak.
- Activity exactly one calendar day after the previous active date increments the streak.
- A gap greater than one calendar day resets it to 1.
- Multiple activities on the same day do not increment it.
- `best_streak` stores the historical maximum.

Production recommendation: define qualifying activity centrally. Suggested qualifying events:

- Complete an exercise
- Pass a quiz
- Submit a project
- Complete the daily goal

Opening the app should not count as learning activity.

### Weekly league

The prototype ranks learners by weekly XP. Production leagues should:

- Group learners into comparable cohorts or league pools.
- Reset at a configured weekly boundary.
- Display promotion, retention, and relegation zones if used.
- Preserve weekly snapshots for history and audit.

### Semester batch leaderboard

The implemented primary batch leaderboard ranks all students in the active BTech cohort by `semester_xp`.

- All cohort students begin the semester at `0 semester_xp`.
- Rankings refresh whenever qualifying XP is awarded or reversed.
- The leaderboard closes and becomes immutable when the semester is finalized.
- A new leaderboard period starts at `0 semester_xp` for the next semester.
- Lifetime XP and learner levels continue across semesters.
- Previous-semester rankings remain available as historical snapshots.
- The current prototype uses XP-only ranking. Production may adopt a balanced academic score after academic approval, but the scoring formula must remain fixed and explainable within a semester.

### Comeback bonus

The prototype exposes a one-time `50 XP` claim.

Production eligibility recommendation:

- Learner previously completed at least one qualifying activity.
- Learner has been inactive for 3-14 days.
- Bonus is available once per configured cooling period.
- Claim expires after a defined period, such as 72 hours after return.
- Claiming must be idempotent.

## 4. Core Domain Model

Use UUIDs unless the existing platform has another standard.

### Academic structure

#### `institutions`

- `id`
- `name`
- `timezone`
- `status`

#### `programs`

- `id`
- `institution_id`
- `name`
- `degree_type`
- `duration_semesters`

#### `cohorts`

- `id`
- `program_id`
- `name`
- `start_date`
- `graduation_year`
- `status`

#### `sections`

- `id`
- `cohort_id`
- `name`
- `campus_id` nullable

#### `semesters`

- `id`
- `program_id`
- `number`
- `starts_at`
- `ends_at`
- `status`

### Users and enrollment

#### `users`

- `id`
- `email`
- `display_name`
- `avatar_url`
- `timezone`
- `status`
- authentication fields managed by the identity provider

#### `enrollments`

- `id`
- `user_id`
- `program_id`
- `cohort_id`
- `section_id`
- `current_semester_id`
- `role` (`student`, `instructor`, `admin`)
- `enrolled_at`
- `status`

### Learning content

#### `subjects`

- `id`
- `semester_id`
- `code`
- `name`
- `description`
- `sort_order`
- `status`

#### `topics`

- `id`
- `subject_id`
- `name`
- `description`
- `sort_order`
- `status`

#### `difficulty_levels`

- `id`
- `topic_id`
- `key` (`beginner`, `intermediate`, `advanced`)
- `name`
- `sort_order`
- `unlock_rule_id` nullable

#### `exercises`

- `id`
- `difficulty_level_id`
- `slug`
- `title`
- `description`
- `exercise_type`
- `version`
- `base_xp`
- `sort_order`
- `estimated_minutes`
- `status`
- `published_at`

#### `exercise_steps`

- `id`
- `exercise_id`
- `step_number`
- `title`
- `instruction_content`
- `starter_code`
- `hint_content`
- `validation_config`
- `version`

#### `prerequisites`

- `id`
- `content_type`
- `content_id`
- `required_content_type`
- `required_content_id`
- `minimum_rating` nullable
- `minimum_score` nullable

### Attempts and progress

#### `exercise_attempts`

- `id`
- `user_id`
- `exercise_id`
- `exercise_version`
- `started_at`
- `submitted_at`
- `completed_at` nullable
- `status` (`in_progress`, `submitted`, `passed`, `failed`, `abandoned`)
- `submitted_answer` or secured object-storage reference
- `hints_used`
- `failed_checks`
- `duration_seconds`
- `score`
- `stars`
- `validation_result`
- `client_request_id` for idempotency

#### `exercise_progress`

One row per user and exercise.

- `user_id`
- `exercise_id`
- `first_completed_at`
- `last_completed_at`
- `attempt_count`
- `best_score`
- `best_stars`
- `fastest_seconds`
- `fewest_hints`
- `fewest_failed_checks`
- `completion_xp_awarded`
- `status`

#### `content_progress`

Aggregated topic/level/subject completion.

- `user_id`
- `content_type`
- `content_id`
- `completed_items`
- `total_items`
- `completion_percent`
- `status`
- `completed_at` nullable

This can be materialized asynchronously if real-time calculation is expensive.

### Gamification

#### `xp_ledger`

Use an append-only ledger. Do not store only a mutable total.

- `id`
- `user_id`
- `amount`
- `source_type`
- `source_id`
- `reason`
- `academic_period_id` nullable
- `league_period_id` nullable
- `idempotency_key` unique
- `created_at`
- `reversed_by_id` nullable

Examples of `source_type`:

- `exercise_completion`
- `assessment`
- `project`
- `comeback_bonus`
- `daily_goal`
- `manual_adjustment`
- `reversal`

The learner's total XP is the sum of valid ledger entries. A cached total is acceptable but must be reconcilable.

#### `learner_gamification_profiles`

- `user_id`
- `total_xp_cache`
- `weekly_xp_cache`
- `semester_xp_cache`
- `current_level`
- `current_streak`
- `best_streak`
- `last_qualifying_activity_date`
- `updated_at`

#### `streak_events`

- `id`
- `user_id`
- `activity_date`
- `qualifying_event_type`
- `qualifying_event_id`
- `timezone`
- unique constraint on the logical streak day if only one increment is allowed

#### `comeback_offers`

- `id`
- `user_id`
- `xp_amount`
- `eligible_at`
- `expires_at`
- `claimed_at` nullable
- `status`
- `idempotency_key`

#### `league_periods`

- `id`
- `type` (`weekly`, `semester_batch`, `subject`, `section`)
- `starts_at`
- `ends_at`
- `status`
- `cohort_id` nullable
- `semester_id` nullable
- `subject_id` nullable

#### `league_memberships`

- `id`
- `league_period_id`
- `user_id`
- `group_key`
- `score`
- `rank`
- `promotion_status`
- `updated_at`

#### `leaderboard_snapshots`

- `id`
- `league_period_id`
- `generated_at`
- immutable ranking payload or normalized snapshot rows

## 5. API Contract

Exact naming may follow the existing backend conventions. All mutation endpoints require authentication, authorization, idempotency, and server-side validation.

### Dashboard

`GET /api/v1/me/dashboard`

Recommended response:

```json
{
  "learner": {
    "id": "uuid",
    "displayName": "Rahul",
    "avatarUrl": null
  },
  "gamification": {
    "totalXp": 515,
    "weeklyXp": 355,
    "semesterXp": 515,
    "level": {
      "number": 3,
      "title": "Creator",
      "currentXp": 15,
      "requiredXp": 250,
      "progressPercent": 6
    },
    "streak": {
      "current": 6,
      "best": 8,
      "lastActiveDate": "2026-06-10"
    }
  },
  "comebackOffer": null,
  "currentLearning": {},
  "personalBests": [],
  "leagueSummary": {}
}
```

### Learning journey

`GET /api/v1/me/subjects/{subjectId}/journey`

Return:

- Topics in display order
- Topic lock state and reason
- Difficulty levels
- Exercise summaries
- Completion percentages
- Best ratings
- Recommended next item

The API should return explicit state instead of requiring the frontend to infer it:

```json
{
  "status": "locked",
  "lockReason": {
    "type": "prerequisite",
    "message": "Complete HTML Beginner Exercise 1",
    "requiredContentId": "uuid"
  }
}
```

### Start attempt

`POST /api/v1/exercises/{exerciseId}/attempts`

Request:

```json
{
  "clientRequestId": "uuid"
}
```

Response includes attempt ID, content version, steps, starter content, server start time, and policy configuration.

### Save draft

`PUT /api/v1/attempts/{attemptId}/draft`

Use throttling/debouncing client-side. The backend should retain the latest draft and reject updates to closed attempts.

### Use hint

`POST /api/v1/attempts/{attemptId}/hints/{hintId}/use`

The server records hint usage. Do not trust a client-provided hint count.

### Validate step

`POST /api/v1/attempts/{attemptId}/validate`

Request:

```json
{
  "stepId": "uuid",
  "answer": "<h1>Rahul</h1>"
}
```

Response:

```json
{
  "passed": false,
  "feedback": "Add content inside the paragraph tag.",
  "failedCheckCount": 1
}
```

For code execution, use an isolated sandbox with strict CPU, memory, time, file-system, process, and network limits.

### Complete attempt

`POST /api/v1/attempts/{attemptId}/complete`

The backend:

1. Confirms every required step has passed.
2. Calculates duration from server timestamps.
3. Calculates rating.
4. Updates personal bests.
5. Awards first-completion XP through the ledger.
6. Records qualifying streak activity.
7. Updates unlocks and progress.
8. Updates weekly league and semester batch leaderboard aggregates.
9. Returns the complete result.

Response:

```json
{
  "attemptId": "uuid",
  "completed": true,
  "stars": 3,
  "earnedXp": 175,
  "totalXp": 515,
  "weeklyXp": 355,
  "semesterXp": 515,
  "level": {
    "number": 3,
    "leveledUp": true
  },
  "semesterLeaderboard": {
    "rank": 9,
    "previousRank": 11,
    "rankChange": 2
  },
  "personalBestUpdates": {
    "fastestTime": true,
    "fewestHints": true,
    "fewestMistakes": true,
    "highestRating": true
  },
  "newUnlocks": [
    {
      "type": "exercise",
      "id": "uuid",
      "title": "Lists, links and images"
    }
  ]
}
```

### Claim comeback offer

`POST /api/v1/me/comeback-offers/{offerId}/claim`

Return the awarded XP and updated level. A repeated request with the same idempotency key must return the original result without awarding XP again.

### Leaderboards

- `GET /api/v1/leaderboards/weekly`
- `GET /api/v1/leaderboards/semesters/{semesterId}/batch`
- `GET /api/v1/leaderboards/subjects/{subjectId}`

Recommended query parameters:

- `scope=batch|section|campus`
- `period=current|previous`
- `cursor`
- `limit`
- `aroundMe=true`

Return:

- Top entries
- Current learner's rank
- A window of nearby ranks
- Score definition
- Period start/end
- Time remaining
- Privacy-safe display name
- Tie status

Semester leaderboard response should include:

```json
{
  "period": {
    "semesterId": "uuid",
    "name": "Semester 1",
    "startsAt": "2026-07-01T00:00:00Z",
    "endsAt": "2026-12-15T23:59:59Z",
    "status": "active"
  },
  "cohort": {
    "id": "uuid",
    "name": "BTech CSE 2026",
    "studentCount": 30
  },
  "currentLearner": {
    "rank": 9,
    "semesterXp": 515,
    "topPercent": 30,
    "xpToNextRank": 11
  },
  "entries": []
}
```

## 6. Ranking Rules

Because BTech learners start each semester together, the primary long-term competitive view is a semester batch leaderboard. It resets at the start of every semester while preserving immutable historical results.

Recommended leaderboard types:

### Weekly activity league

- Score: XP earned during the weekly period
- Purpose: short-term motivation and recovery
- Reset: weekly in institution timezone

### Semester batch leaderboard

Current prototype score:

```text
semester_score = semester_xp
```

Production option after academic approval:

```text
50% assessment/exercise performance
25% learning consistency
15% projects and advanced challenges
10% peer/code-review contribution
```

If the balanced formula is adopted:

- Apply it only from the start of a new semester.
- Version the formula.
- Store each component score and the final score.
- Never change the formula retroactively during an active semester.
- Freeze and snapshot results after semester finalization.

### Tie-breaking

Suggested order:

1. Higher quality/assessment score
2. More completed required content
3. Fewer total hints on passed work
4. Earlier achievement of the tied score

Do not use fastest completion as a primary tie-breaker for academic work.

## 7. Unlock Logic

Unlocks must be evaluated on the server.

Supported rule types:

- Previous exercise completed
- Entire difficulty level completed
- Minimum star rating
- Minimum assessment score
- Instructor release date
- Manual instructor override
- Multiple prerequisites using `all` or `any`

The frontend receives:

- `available`
- `locked`
- `completed`
- `in_progress`
- `coming_soon`

Every locked response should include a human-readable reason and machine-readable prerequisite.

## 8. Transactions and Idempotency

Exercise completion should be one logical transaction.

At minimum, atomically protect:

- Attempt status transition
- First-completion detection
- XP ledger insertion
- Progress update
- Streak event insertion
- Unlock calculation trigger

Use unique constraints such as:

```text
(user_id, exercise_id, source_type = exercise_completion)
```

or a unique ledger idempotency key:

```text
exercise-completion:{user_id}:{exercise_id}
```

Retries caused by network errors must not duplicate XP or bonuses.

## 9. Time Zones and Scheduled Jobs

Store timestamps in UTC. Resolve calendar-day behavior using the institution timezone unless product requirements allow each learner's timezone.

Scheduled jobs:

- Open and close weekly league periods
- Open the next semester batch leaderboard with all scores at zero
- Recalculate/finalize rankings
- Create leaderboard snapshots
- Promote/relegate league members
- Detect comeback eligibility
- Expire unclaimed comeback offers
- Reconcile XP ledger totals
- Rebuild content progress aggregates
- Archive semester leaderboards

Jobs must be re-runnable and idempotent.

## 10. Security and Abuse Prevention

- Require authenticated users for all progress endpoints.
- Confirm the user owns the attempt.
- Never accept client-calculated XP, stars, duration, hint count, or mistakes.
- Sign or version content payloads to prevent submitting against altered rules.
- Rate-limit validation, attempt creation, and bonus claims.
- Run code in an isolated execution service.
- Sanitize HTML before rendering previews or store only source and render in a sandboxed iframe.
- Record audit events for XP adjustments and instructor overrides.
- Detect impossible attempt durations, automated submissions, repeated payloads, and suspicious completion rates.
- Apply role-based access control for content publishing, grading, overrides, and leaderboard administration.
- Minimize personally identifiable information in leaderboard responses.

## 11. Privacy and Student Controls

Support:

- Leaderboard aliases or initials
- Opt-out/hide-name policy if institution permits
- Section-only visibility
- Blocking public/global exposure by default
- Data retention and deletion policies
- Auditability of scores and XP
- Student access to an explanation of their ranking components

Academic grades and gamification XP must remain separate concepts.

## 12. Events and Analytics

Publish domain events through an outbox pattern or equivalent:

- `attempt.started`
- `hint.used`
- `step.validation_failed`
- `step.passed`
- `exercise.completed`
- `rating.improved`
- `personal_best.updated`
- `xp.awarded`
- `learner.level_changed`
- `streak.incremented`
- `streak.reset`
- `comeback_offer.created`
- `comeback_offer.claimed`
- `content.unlocked`
- `league.period_closed`
- `leaderboard.rank_changed`

Useful product analytics:

- Exercise start-to-completion rate
- Drop-off by step
- Hint usage by exercise
- Average failed checks before success
- Rating distribution
- Time to first completion
- Streak retention
- Comeback offer conversion
- Weekly active learners
- Ranking movement and league participation

Do not use analytics events as the source of truth for rewards.

## 13. Error Contract

Use consistent error responses:

```json
{
  "error": {
    "code": "PREREQUISITE_NOT_MET",
    "message": "Complete the previous exercise first.",
    "details": {
      "requiredExerciseId": "uuid"
    },
    "requestId": "uuid"
  }
}
```

Important codes:

- `ATTEMPT_ALREADY_COMPLETED`
- `ATTEMPT_EXPIRED`
- `CONTENT_VERSION_CHANGED`
- `VALIDATION_FAILED`
- `PREREQUISITE_NOT_MET`
- `BONUS_ALREADY_CLAIMED`
- `BONUS_EXPIRED`
- `RATE_LIMITED`
- `LEADERBOARD_UNAVAILABLE`

## 14. Testing Requirements

### Unit tests

- XP calculations
- Level boundaries
- Star thresholds
- Streak same-day, next-day, and missed-day behavior
- Personal-best comparisons
- Unlock predicates
- Comeback eligibility
- Ranking and tie-breaking

### Integration tests

- First completion awards XP once
- Repeated completion improves records without duplicate XP
- Concurrent completion requests remain idempotent
- Bonus claim race condition
- Streak update transaction
- Exercise version mismatch
- Leaderboard period rollover
- Semester rollover resets semester XP but preserves lifetime XP
- Previous-semester snapshots remain readable after rollover

### End-to-end tests

- Home -> Journey -> Level -> Exercise -> Completion -> updated Dashboard
- Level-up result
- Exercise unlock
- Comeback claim
- Weekly league rank movement
- Offline/retry behavior

### Load tests

- Leaderboard reads around weekly and semester deadlines
- Bulk ranking calculation
- Concurrent exercise submissions
- Dashboard fan-out queries

## 15. Production Acceptance Criteria

- XP cannot be duplicated through retries or concurrency.
- Client-modified XP or star values are ignored.
- Streak calculations are correct at timezone and daylight-saving boundaries.
- Every leaderboard has a documented scoring formula and period.
- Learners can see why content is locked.
- Exercise history and rewards are auditable.
- Replays can improve personal bests without farming completion XP.
- Weekly and semester resets preserve immutable historical results.
- Starting a new semester resets only period-specific semester XP.
- Dashboard data can be returned in one or a small bounded number of requests.
- All ranking and reward mutations are covered by automated tests.
