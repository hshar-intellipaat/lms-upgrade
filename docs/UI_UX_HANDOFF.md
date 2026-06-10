# LearnPath UI/UX Handoff

## 1. Purpose

This document defines the UI/UX requirements for evolving the LearnPath prototype into a production BTech learning platform.

It covers:

- Information architecture
- Primary user flows
- Page and component requirements
- Gamification behavior
- Loading, empty, error, locked, and completed states
- Responsive design
- Accessibility
- Design-system handoff
- Research and validation requirements

The current prototype is available through:

- `index.html`: Home/dashboard concept
- `lms_learning_journey_mockup.html`: topic, level, and exercise navigation
- `html_exercise1_structure_basics.html`: interactive exercise experience

## 2. Product Principles

### Learning comes first

Gamification should clarify progress and encourage consistent study. It must not distract from lessons, reward meaningless activity, or make academic ability look equivalent to XP.

### Progress must be understandable

Learners should always know:

- Where they are
- What is complete
- What is available next
- Why something is locked
- What action will unlock it
- How XP, stars, streaks, and ranks were calculated

### Competition needs safeguards

The product serves a BTech cohort whose students begin each semester together. The primary batch leaderboard therefore resets every semester, while weekly leagues provide short-term competition. The interface should:

- Emphasize improvement and nearby ranks, not only top performers
- Provide aliases/privacy options where policy allows
- Avoid public shame states
- Separate academic grades from gamification scores
- Offer comeback paths after inactivity

### Do not reward speed over learning

Completion time can be a personal best, but should not dominate ratings or rankings unless an activity is explicitly timed.

## 3. Primary Users

### Student

Goals:

- Continue the next required learning activity
- Understand progress through subjects and levels
- Complete exercises and receive useful feedback
- Track XP, streak, ratings, and personal improvement
- Compare progress with the cohort without losing motivation

Needs:

- Clear next action
- Reliable autosave and progress recovery
- Accessible code editor and feedback
- Mobile-friendly progress views
- Transparent reward and ranking rules

### Instructor

Goals:

- Publish and organize learning content
- Monitor completion and problem areas
- Review submissions and projects
- Override locks or rewards when justified
- Understand class-level engagement

Instructor interfaces are not in the current prototype but should be included in future IA.

### Program administrator

Goals:

- Configure cohorts, semesters, subjects, scoring, privacy, and leaderboards
- View aggregate engagement
- Manage exceptions and audits

## 4. Recommended Information Architecture

The Home page is currently carrying both immediate learning actions and detailed performance modules. Split it into:

### Home

Purpose: resume learning quickly.

Content:

- Welcome and daily context
- Continue learning CTA
- Current subject/topic
- Daily goal
- Short streak status
- Recommended next exercise
- Important announcements

### Dashboard

Purpose: understand progress and performance.

Content:

- Total XP and learner level
- Level progress
- Current and best streak
- Comeback offer
- Weekly activity
- Topic/subject completion
- Personal bests
- Exercise ratings
- Recent achievements
- Weekly league summary
- Current semester batch rank
- Link to the full semester leaderboard

### Learning Journey

Purpose: browse curriculum and unlock path.

Hierarchy:

```text
Subject -> Topic -> Beginner/Intermediate/Advanced -> Exercises
```

### Leaderboards

Purpose: compare progress within meaningful academic groups.

Tabs/filters:

- Weekly League
- Semester Batch
- Previous Semesters
- Subject
- Section

### Profile

Content:

- Identity/avatar
- Achievement history
- Streak calendar
- Level history
- Privacy and leaderboard preferences
- Accessibility preferences

### Settings

Content:

- Notifications
- Theme
- Language
- Reduced motion
- Editor preferences
- Privacy

Recommended sidebar order:

```text
Home
Dashboard
Learning Journey
Leaderboards
Profile
Settings
```

## 5. Core Navigation Flow

```text
Home
  -> Continue learning
    -> Exercise

Learning Journey
  -> HTML
    -> Beginner
      -> Exercise list
        -> Exercise 1
          -> Completion result
            -> Next exercise or View progress
```

Expected back navigation:

- Exercise -> Beginner exercise list
- Beginner exercise list -> HTML levels
- HTML levels -> Learning Journey
- Browser Back should match visible state

Production recommendation: use real routes instead of hash-only state.

Example:

```text
/home
/dashboard
/subjects/web-development/journey
/topics/html
/topics/html/levels/beginner
/exercises/html-tags-elements
/leaderboards/semesters/current
```

## 6. Home Screen Requirements

### Primary hierarchy

1. Continue learning
2. Current topic and next activity
3. Daily goal/streak
4. Announcements
5. Lightweight progress summary

The primary CTA must be visible without scrolling at common laptop dimensions.

### Continue learning card

Show:

- Subject/topic
- Level
- Exercise title
- Estimated time
- Progress if already started
- CTA: `Continue`, `Start`, or `Review`

States:

- New learner
- In progress
- Exercise completed
- No assigned content
- Current content unavailable

## 7. Dashboard Requirements

### Level and XP

Show:

- Current level number and title
- Total XP
- XP earned this week
- XP earned in the current semester
- Progress to next level
- Clear explanation link: "How XP works"

Do not show a progress bar without numerical values.

### Persistent player status

Desktop screens should include a compact game-style player status panel in the left navigation.

Show:

- Current player title
- Level number
- Progress to the next level
- Current semester rank
- Current streak

The current prototype places this panel at the bottom of the sidebar. On small screens, move it to a compact header/profile surface rather than reducing the text to unreadable sizes.

The status panel is informational, not a second navigation menu. Selecting it may open the Dashboard or Profile in a later iteration.

### Streak

Show:

- Current streak
- Personal best
- Today's qualifying activity state
- Weekly calendar
- Time remaining to maintain the streak, where appropriate

States:

- Active today
- Not yet active today
- Streak at risk
- Broken streak
- New personal best

Avoid aggressive loss language. Prefer:

- "Complete one activity today to continue your streak."

### Comeback bonus

Show only when eligible.

Required information:

- Reward amount
- Why it is available
- Expiry
- Claim CTA
- Claimed confirmation

Do not permanently reserve space for an unavailable offer.

### Personal bests

Show:

- Highest rating
- Fastest valid completion
- Fewest hints
- Fewest failed checks
- Date achieved

Clearly label that metrics can come from separate attempts unless showing "best single attempt."

### Activity visualization

Recommended:

- Seven-day XP/activity bar chart
- Semester consistency heatmap
- Subject completion bars

All charts need text equivalents and accessible labels.

## 8. Learning Journey Requirements

### Topic roadmap

Each topic card needs:

- Topic name
- Brief description
- Completion percentage
- State
- Lock reason if locked
- Optional estimated effort

States:

- Not started
- Available
- In progress
- Completed
- Locked
- Coming soon

Avoid using opacity alone for locked state. Include icon, label, and reason.

### Difficulty levels

Each level card needs:

- Beginner, Intermediate, or Advanced title
- Learning outcomes
- Exercise count
- Completion count
- Estimated time
- Best aggregate rating or mastery
- Availability state

Locked card interaction should open a small explanation rather than doing nothing.

Example:

```text
Intermediate is locked
Complete all 3 Beginner exercises to unlock this level.
```

### Exercise list

Each exercise row needs:

- Sequence number
- Title
- Short objective
- Estimated time
- Status
- Best rating
- Attempts, optionally
- CTA

CTA labels:

- `Start`
- `Continue`
- `Replay`
- `Review`
- `Coming soon`

Do not label an unimplemented exercise as unlocked.

## 9. Exercise Experience

### Desktop layout

Current split-screen direction is valid:

- Left: concept, examples, task, hints
- Right: editor, preview, validation feedback
- Footer: step navigation and attempt metrics

Requirements:

- Adjustable panel widths if feasible
- Editor remains usable at 1280x720
- Preview should not push primary controls off-screen
- Clear save status
- Keyboard shortcuts documented

### Mobile layout

Avoid placing a full code editor and lesson side by side.

Recommended patterns:

- Tabs: `Lesson`, `Code`, `Preview`
- Sticky step navigation
- Persistent save state
- Full-screen editor option

### Feedback

Validation feedback must be:

- Specific
- Actionable
- Located near the editor/submit action
- Announced to screen readers
- Not communicated through color alone

Examples:

Good:

```text
Add text between the opening and closing <p> tags.
```

Avoid:

```text
Incorrect.
```

### Hints

Hints should:

- Explain the concept progressively
- Record usage only when intentionally revealed
- Clearly indicate possible rating impact before use
- Never insert code unexpectedly without confirmation

Consider three tiers:

1. Conceptual clue
2. Syntax example
3. Partial solution

### Completion result

Show:

- Successful completion
- Stars earned
- XP earned
- Level-up state
- Time, hints, and failed checks
- New personal best indicators
- Newly unlocked content
- Primary CTA to next exercise
- Secondary CTA to progress/dashboard

When completion causes a level change, present the level-up celebration before the standard completion summary.

If replaying:

- Explain that completion XP is not awarded twice.
- Highlight improved personal bests or rating.

### Level-up celebration

The level-up cue should feel game-like but remain short and accessible.

Show:

- `Level up` label
- New level number
- Previous title
- New title
- Confirmation that the title is active across the app
- One clear Continue action

Initial configurable title ladder:

| Level | Working title |
|---|---|
| 1 | Explorer |
| 2 | Builder |
| 3 | Code Captain |
| 4 | Boss Coder |
| 5 | Code Architect |
| 6+ | Tech Legend |

These are working names. Designs must support longer localized titles without breaking.

Behavior:

- Display once per earned level-up event.
- Queue multiple reward events rather than overlaying them.
- Do not interrupt active typing or validation.
- Show after the learner completes the triggering action.
- Continue to the normal completion result afterward.
- Respect reduced-motion settings.
- Do not require animation to understand the reward.

## 10. Exercise Rating Design

Stars currently represent performance quality, not user-generated feedback.

UI must label them clearly:

- `Exercise performance: 3 stars`

Avoid language that implies the learner is rating the exercise.

Display criteria through an information tooltip:

```text
3 stars: complete without hints or failed checks
2 stars: complete with limited help
1 star: complete successfully
```

Use icons plus text for accessibility. Do not rely on gold vs gray alone.

## 11. Leaderboard Experience

### Weekly League

Purpose: short-term motivation.

Show:

- Period and countdown
- Current learner rank
- Weekly XP
- Nearby learners
- Top positions
- Promotion zone
- Scoring explanation

### Semester Batch

Purpose: show the learner's overall standing in the batch for the active semester.

The current implementation ranks all students using semester XP. The ranking resets when the next semester begins.

Show:

- Active semester name
- Cohort and graduation year
- Total number of students
- Learner's batch rank
- Semester XP
- Top-percent standing
- XP needed to reach the next rank
- Top three learners
- Full batch ranking with the current learner highlighted
- Clear message that rankings reset next semester

The page must distinguish:

- **Lifetime XP:** continues across the degree and drives learner level
- **Semester XP:** resets each semester and drives batch rank
- **Weekly XP:** resets weekly and drives the weekly league

### Previous semesters

Provide an archive selector for finalized semester results. Historical pages should be read-only and visibly labeled `Final`.

Show:

- Final rank
- Final semester XP or approved score
- Cohort size
- Change compared with the previous semester, if meaningful

### Subject and section filters

Provide filters for:

- Subject
- Section
- Campus, if applicable

### Privacy

Support:

- Full name, initials, or alias based on institution policy
- Hide-me option if allowed
- No email or student ID exposure

### Healthy competition

- Default to "around me" plus top ranks.
- Celebrate rank improvement, consistency, and personal milestones.
- Do not use humiliating labels for bottom positions.
- Avoid infinite red/green rank-change alerts.

## 12. Gamification State Matrix

### XP mutation

| State | UI response |
|---|---|
| XP awarded | Toast/result summary with amount |
| No XP on replay | Explain "Completion XP already earned" |
| Level up | Dedicated celebration, level title, next target |
| API pending | Disable duplicate action, show progress |
| API failed | Preserve result locally, offer retry without implying reward was saved |
| Level threshold crossed | Queue a level-up celebration, then show the normal result |
| Multiple rewards pending | Present one at a time in earned order |
| Reward already acknowledged | Do not show it again |

### Semester leaderboard

| State | UI response |
|---|---|
| Active semester | Show live rank, semester XP, and next-rank gap |
| Semester ending soon | Show end date without alarmist countdown behavior |
| Finalizing | Temporarily label rankings as provisional |
| Final | Freeze the table and label it as final |
| New semester | Reset displayed semester XP/rank and explain that lifetime XP is unchanged |
| No cohort assignment | Show an administrative empty state |

### Comeback offer

| State | UI response |
|---|---|
| Eligible | Offer card with expiry |
| Claiming | Disabled CTA and spinner |
| Claimed | Confirmation and updated XP |
| Expired | Remove or show neutral expired state |
| Already claimed elsewhere | Refresh and show claimed state |

### Exercise

| State | UI response |
|---|---|
| Not started | Start CTA |
| In progress | Continue CTA and saved step |
| Completed | Rating and Replay/Review CTA |
| Locked | Lock reason |
| Coming soon | Non-interactive future state |
| Version changed | Explain reset/migration behavior |

## 13. Loading, Empty, and Error States

Every production screen requires designed states.

### Loading

- Use skeletons matching final layout.
- Do not flash default fake values such as `340 XP`.
- Preserve previous data during background refresh when safe.

### Empty

Examples:

- No completed exercises
- No personal bests
- No weekly league assigned
- No active subject
- No comeback offer

Empty states should provide a next action.

### Errors

Required:

- Dashboard load failure
- Journey load failure
- Attempt save failure
- Validation service unavailable
- Completion result pending
- Leaderboard unavailable
- Offline mode

Do not discard editor content on error.

## 14. Accessibility Requirements

Target WCAG 2.2 AA.

### Keyboard

- Every interactive card must be a semantic link or button.
- Visible focus indicators are required.
- Logical tab order.
- No keyboard traps in the editor or modal.
- Escape closes dismissible dialogs.

### Screen readers

- Use headings in logical order.
- Use landmarks: header, nav, main, aside.
- Announce validation and reward updates with appropriate live regions.
- Move focus into the level-up dialog and return it after dismissal.
- Provide text for icons and stars.
- Associate labels and instructions with editor controls.

### Color and contrast

- Text contrast: minimum 4.5:1 for normal text.
- UI components and focus states: minimum 3:1.
- Locked, complete, error, and success cannot rely only on color.

### Motion

- Respect `prefers-reduced-motion`.
- Avoid mandatory confetti or large movement.
- Celebrations must not block progress.
- Level-up effects should use opacity/scale sparingly and have a reduced-motion equivalent.

### Touch

- Minimum target size: 44x44 CSS pixels where practical.
- Provide sufficient spacing between adjacent actions.

### Cognitive accessibility

- Keep scoring explanations short and available on demand.
- Use consistent terms: lifetime XP, semester XP, weekly XP, level, streak, rating, rank.
- Avoid unexplained abbreviations.

## 15. Responsive Breakpoints

Use content-driven breakpoints; suggested baseline:

- Small: `< 600px`
- Medium: `600-1023px`
- Large: `>= 1024px`

Expected behavior:

### Small

- Collapsible bottom navigation or accessible compact sidebar
- Single-column cards
- Exercise tabs instead of split-screen
- Sticky primary CTA
- Leaderboard tables become compact rows

### Medium

- Two-column dashboard where space allows
- Collapsible sidebar
- Exercise can use stacked or adjustable split layout

### Large

- Persistent sidebar
- Two-column dashboard
- Split-screen exercise
- Wider leaderboard context

Test at:

- 360x800
- 390x844
- 768x1024
- 1366x768
- 1440x900

## 16. Design System Requirements

The current prototype uses a purple primary color and neutral card system. Convert these into named tokens.

### Token groups

- Color: background, surface, text, border, primary, success, warning, danger, info
- Typography: family, size, line height, weight
- Spacing: 4px base scale
- Radius
- Shadow/elevation
- Motion duration/easing
- Breakpoints
- Z-index layers

### Semantic colors

Required semantic roles:

- Available/in progress
- Completed/success
- Locked/neutral
- Warning/streak at risk
- Error/validation failure
- XP/level
- Rating
- Rank movement

Design both light and optional dark themes through semantic tokens, not hard-coded component colors.

### Core components

Create variants and states for:

- Sidebar/navigation item
- Top bar
- Button
- Icon button
- Badge/chip
- Progress bar
- Topic card
- Level card
- Exercise row
- Stat card
- Leaderboard row
- Tabs
- Tooltip
- Toast
- Modal/result dialog
- Player status panel
- Level-up celebration
- Empty state
- Skeleton
- Form control
- Code editor wrapper
- Feedback alert

For each component provide:

- Default
- Hover
- Focus
- Active/selected
- Disabled
- Loading
- Error where applicable
- Mobile variant

## 17. Content and Microcopy

Use direct, supportive language.

Preferred:

- `Continue learning`
- `Complete one activity today to continue your streak`
- `1 of 3 exercises complete`
- `Complete Beginner to unlock Intermediate`
- `Your best rating improved to 3 stars`

Avoid:

- `You failed`
- `You lost everything`
- `Bad performance`
- Excessive exclamation marks

Terms must be standardized:

- **XP:** reward points
- **Level:** gamification level
- **Difficulty level:** Beginner/Intermediate/Advanced
- **Rating:** 1-3 star exercise performance
- **Rank:** leaderboard position
- **Score:** academic or leaderboard formula, always qualified

Avoid calling both gamification level and curriculum difficulty simply "level" without context.

## 18. UX Research Plan

Validate with BTech students before finalizing.

Research questions:

- Can students find the next exercise within five seconds?
- Do they understand the difference between XP and academic grades?
- Do they understand why an exercise or level is locked?
- Are star criteria perceived as fair?
- Does the weekly league motivate or discourage?
- Is the semester-reset batch leaderboard useful and understood?
- Do learners understand that lifetime XP and levels do not reset?
- Do learners notice and understand the persistent player-status panel?
- Do level-up celebrations feel rewarding without delaying study?
- Do comeback bonuses feel supportive rather than manipulative?
- Can students recover editor work after an error?

Recommended methods:

- Moderated usability tests with 5-8 students per iteration
- Accessibility review with keyboard and screen-reader users
- Concept testing for leaderboard privacy
- Diary study for streak behavior
- Analytics review after pilot

Success indicators:

- High next-action discovery
- Low confusion between XP and grades
- Low abandonment caused by unclear locks
- Increased return rate without unhealthy session length

## 19. Figma Handoff Checklist

Deliver:

- Sitemap and user-flow diagrams
- Desktop, tablet, and mobile screens
- Component library with variants
- Token definitions
- Auto-layout throughout
- Responsive behavior annotations
- Interaction prototypes for core flows
- Loading, empty, error, offline, and permission states
- Accessibility notes
- Content/microcopy sheet
- Redlines only where auto-layout/tokens are insufficient

Name layers and components consistently. Include links to source icons and font licensing.

## 20. UI Acceptance Criteria

- Home prioritizes the next learning action.
- Detailed performance appears on Dashboard.
- Topic -> difficulty -> exercise hierarchy is unambiguous.
- Every lock explains how to unlock content.
- XP, rating, academic score, and rank are visually and verbally distinct.
- Completion result explains XP and star calculation.
- Level changes trigger one accessible celebration before the completion result.
- Player status consistently shows title, level progress, semester rank, and streak.
- Replays clearly state whether XP is available.
- Leaderboards show period, scope, formula, and current learner context.
- Semester leaderboard clearly states its reset behavior and separates semester XP from lifetime XP.
- All screens have loading, empty, error, and offline states.
- Core flows work with keyboard only.
- Mobile exercise flow remains usable without horizontal scrolling.
- Designs meet WCAG 2.2 AA contrast and interaction requirements.
