# Decisions

## 2026-07-27: Shared Roles

The Moon uses the paper map for broad navigation while the Sun uses the phone. The phone intentionally does not become a replacement digital map.

## 2026-07-27: NFC Scope

NFC interactions are real on Android Chrome, but the Moon profile and task location are demonstration data. Generic readable NFC tags are enough for the current prototype.

## 2026-07-27: Hidden Test Mode

Participant screens must not expose prototype tooling. Long-pressing the app title reveals development controls for simulated NFC scans, task selection, and detector heading.

## 2026-07-27: Backup Map

The phone uses the supplied activity-map image only on the backup map screen. It does not provide turn-by-turn navigation or replace the Moon's physical paper map.

## 2026-07-27: Visual System

The participant interface uses a calm hand-drawn park style: a blue information zone, warm map-texture interaction area, irregular sticker controls, rounded Phosphor icons, and locally bundled display fonts. Image containers remain simple rounded rectangles with a light sticker outline. Text stays sparse and participant actions are icon-led.

Generated character and task illustrations follow the supplied character references without directly reusing those reference images. The activity map is the only supplied reference asset used directly in the participant interface.

## 2026-07-27: Simulated Outdoor Status

Temperature, steps, current area, update time, task locations, and community scores are presentation-only mock data. NFC remains the only real external interaction in this prototype.
