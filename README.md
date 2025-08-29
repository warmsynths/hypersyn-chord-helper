
# Hypersyn Chord Helper

Hypersyn Chord Helper is a web-based tool for musicians and synth enthusiasts to convert chord progressions into Hypersyn-compatible hex codes. It features a stylish synthwave interface, advanced voicing options, save/load chord sets, and modern toast notifications for all user feedback.

## Features
- Convert chord names (e.g., Cmaj7, Dm7, G13) to Hypersyn hex codes
- Supports a wide range of chord types and extensions
- Advanced voicing options (closed, open triad, drop-2, drop-3, spread, octave doubling, inversions, shell, altered)
- Displays both root-baked and interval-only hex codes
- Unique chord type grouping and interval display
- Save, load, and delete named chord sets (localStorage)
- Synthwave-inspired UI with retro fonts and Dracula color palette
- Play chord progressions and single chords with Web Audio API
- Responsive design for desktop and mobile
- Modern toast notifications for all user feedback
- Toggle synthwave video background

## Usage
1. Open `index.html` in your browser.
2. Paste or type your chord progression into the input box.
3. Select a voicing type from the dropdown.
4. Click **Convert** to see the hex codes for each chord.
5. Preview and play your progression or single chords.
6. Save, load, or delete named chord sets for quick recall.
7. Use the output in Hypersyn, trackers, or other music tools.
8. Toggle the video background for distraction-free mode.

## Chord Types & Voicings Supported
- Major, minor, seventh, major seventh, minor seventh, minor ninth, thirteenth, half-diminished seventh, altered seventh, and more.
- Voicing options: closed, open triad, drop-2, drop-3, spread, octave doubling, first/second/third inversion, shell dominant, altered dominant.

## Development
- All conversion, voicing, save/load, and toast logic is in [`src/core.js`](src/core.js).
- UI and styling are in [`index.html`](index.html), using Tailwind CSS and Share Tech Mono font.
- Toast animation styles and video toggle logic are injected via index.html and core.js.

## License
MIT

## Credits
- Inspired by the M8 Tracker and synthwave aesthetics.
- Video background by [visualdon on Reddit](https://www.reddit.com/user/visualdon/)
