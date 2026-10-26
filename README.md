# CadenceFour

Four-bar cadence desk for bedroom producers and AI-music finishers.

Stuck 8-bar loops never land. Session players write a cadence — authentic V–I, half, deceptive, plagal, stop-time — so the pocket finally resolves and the next section can start.

Live FluidR3 piano, upright, nylon, trumpet, violin, and acoustic kit. Samples pinned to commit SHAs only. No @main. No oscillators.

Distinct from yesterday’s ship and from TagFour, ModEight, LiftTwo, PreEight, AfterHook, EndEight, LastHook.

## Form

Pocket (user bars) · 4-bar resolve

## Play

- A · Pocket loop
- B · Full form
- R · Resolve only

## Pricing recommendation

One-time **$19** on Gumroad (or Lemon Squeezy).

This is a finite desk, not a cloud meter or recurring studio. Do not put it behind a subscription unless bundled into the Forge Pass ($24/mo).

Best place to sell: Gumroad for the producer crowd that already buys indie tools there. Mirror on Lemon Squeezy for VAT handling. One pinned X demo thread + Product Hunt listing. Not the App Store.

## Stack

Static HTML / CSS / JS. Deploy on Vercel team `release-forge`.

## Samples

Pinned commit SHAs only:

- PreEight bank @d58301e4a494555f411a2afbc448b724136eee76
- FluidR3 GM @044fab8e1456bfafc5776e86dfd6bb8697149aef

## License

MIT. workinwithai-create.

## Acceptance (section 9)

(1) Export at 92 BPM, 8 bars, 48 kHz: length exactly 1,001,739 samples; first transient within 1 ms of sample 0.  
(2) Seamless loop, no click, no drift on grid.  
(3) Background tab 30 s → clean stop, no stacked notes.  
(4) Live changes (recipe, mutes, BPM) heard within one bar.  
(5) Blocked sample host → UI names missing instruments.  
(6) Longest pad sustains to end of note.  
(7) No @main/@gh-pages, no Math.random in export path, voice names match samples.
