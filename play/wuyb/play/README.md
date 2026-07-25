# WUYB Play

Canonical protected review home for the CJ-designated WUYB Game 2 build.

Canonical URL:
`https://playonedaygames.com/wuyb/play/`

Default play URL:
`https://playonedaygames.com/wuyb/play/?match=1&v=0eaaaa3`

Evaluator login:
`https://playonedaygames.com/wuyb/play/login/`

Login uses the shared ODG Alpha credentials source (`ODG_ALPHA_PASSWORD`, falling back to `TRASH_DICE_ALPHA_PASSWORD`) and sets a scoped WUYB Play session cookie.

Approved source commit: `0eaaaa3 Add WUYB title play cue` (CJ title-helper test 2026-07-23: the title screen adds one passive mint bouncing down-arrow above the `WHAT'S UNDER YOUR BED?` play button, matching the in-game helper-arrow language. The title CTA, speaker, credits, title-only lullaby routing, Round 1 and Round 2 helper behavior, Round 3 helper-free rule, official gameplay music rotation, normal attack timing, auto-advance pacing, open-pile placement, and the approved c630abd attack feel dials remain unchanged.)

Route SHA-256:
`7E4FECC021F016E2481936D1B2578370FC67E88BE839FB2637D2CE2C0CFD2BF6`

This route replaces the old WUYB Alpha Complete URL format so WUYB now matches the Trash Dice `/trash-dice/play/` pattern. Old `/wuyb/alpha-complete/` and `/private/wuyb-preview/` links redirect here. Do not replace these files in place unless CJ explicitly approves a new WUYB Play build.
