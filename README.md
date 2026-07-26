# Sun and Moon

A mobile web prototype for a Dahu Park activity. The Moon uses the paper map, while the Sun uses the phone to collect Stars through NFC interactions and a compass-like Star detector.

## What It Includes

- A Sun and Moon pairing ritual that combines NFC, spoken introduction, and the physical map.
- Real Web NFC scan triggers for Android Chrome.
- Two demonstration tasks: meeting a friendly dog and watering flowers.
- A Star detector with orientation, vibration, and generated audio feedback.
- A persistent home screen, backup park map, team score, and local community sky.

Read `docs/ARCHITECTURE.md` for the technical design and `AGENTS.md` for collaboration rules.

## Run the demo

Run a local static server:

```sh
python3 -m http.server 8080
```

Open the displayed local address in a browser. On desktop, use the two `Demo` scan buttons to run the complete flow.

## Test real NFC

1. Use an Android phone with NFC enabled and current Chrome.
2. Host the app over HTTPS. Web NFC is not available on ordinary HTTP pages.
3. Format the Moon necklace and both Star badges as readable NDEF tags.
4. Start the activity, tap `Scan Moon necklace`, and touch the Moon tag.
5. When the task is complete, tap `Scan Star badge` and touch either Star badge.

The demonstration accepts either Star badge for either active task. NFC tag contents stay on the device and are not sent anywhere.

## Test Mode

Long-press the application title for about one second to reveal local test controls. These controls are intentionally hidden from normal participant pages.

## Checks

```sh
npm test
```
