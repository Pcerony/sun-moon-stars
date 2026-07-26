# Sun, Moon, and Stars Activity App Design

## Goal

Build a mobile-first web app for a Dahu Park activity pairing an older participant (Moon) with a young citizen participant (Sun). The app is operated by the Sun and supports real NFC scans on Android Chrome. It is also a self-contained demonstration prototype: GPS, shared activity data, and social data are simulated.

## Scope

- Use real Web NFC scanning when available on Android Chrome over HTTPS.
- Read a Moon necklace tag to begin collecting the selected demonstration task.
- Read either of two physical Star badge tags to finish the active task.
- Provide a simulation fallback for desktop testing and filming contingencies.
- Include two switchable demonstration locations/tasks: "Meet a Friendly Dog" and "Water the Flowers".
- Update the active team's score and a local, illustrative community sky after completion.

## Experience Flow

1. The Sun opens the app and starts a team.
2. The app asks the pair to follow the paper map; it intentionally does not provide a digital map.
3. A hidden/demo-only location selector chooses the current site for filming.
4. The Sun taps a control and scans the Moon necklace. The app treats this as a real activation event and reveals the selected task.
5. The pair completes the lightweight real-world activity.
6. The NPC presents either reusable Star badge. The Sun scans it to complete the active task.
7. The app awards points, adds the task's star to the team sky, and updates a mocked shared sky / activity summary.

## Screens

- Welcome: concise activity introduction and start action.
- Pairing: request a Moon necklace scan, with a simulated scan fallback.
- Map prompt: asks the pair to consult the physical map; offers demo location switching only in a discreet test control.
- Task: task title, simple instruction, status, and Star badge scan action.
- Completion: task-specific confirmation, points earned, and continue action.
- Sky: team stars, score, fixed example teams, and community progress.

## NFC Contract

- Moon necklaces and Star badges are NDEF-formatted NFC tags.
- The first valid Moon scan activates task collection. The tag payload is retained only as a non-visible session identifier.
- During the demonstration, either valid Star badge completes whichever task is currently active. Its tag payload is not mapped to a task.
- Scans begin only from a visible user action. A scan error, unsupported device, invalid tag, or scan in the wrong state shows a short recovery message and preserves a simulated completion route.

## Data and State

All state is local to the browser session. A task has an id, title, instruction, points, and star name. The current state includes selected demo location, whether a Moon tag has been scanned, active task, completed task ids, score, and static social-reference data. No account, server, GPS permission, multi-phone sync, or persistent backend is included.

## Implementation

Use a dependency-free static app (HTML, CSS, and JavaScript) so it can be hosted securely and tested quickly. Keep NFC access behind a small adapter that exposes scan requests and a simulation fallback. Keep task/state logic separate from rendering so later GPS and iOS-native adapters can be added without rewriting the flow.

## Verification

- Desktop: exercise both tasks with simulated Moon and Star scans; confirm points, completion, reset, and invalid-state messages.
- Android Chrome: host over HTTPS, scan an NDEF Moon tag and either NDEF Star tag, and confirm the corresponding state transitions.
- Mobile visual check: ensure controls remain readable and reachable on a narrow phone viewport.
