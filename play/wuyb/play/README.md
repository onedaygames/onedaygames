# WUYB Play

Canonical protected review home for the CJ-designated WUYB Game 2 build.

Canonical URL:
`https://playonedaygames.com/wuyb/play/`

Default play URL:
`https://playonedaygames.com/wuyb/play/?match=1&v=5d0e620`

Evaluator login:
`https://playonedaygames.com/wuyb/play/login/`

Login uses the shared ODG Alpha credentials source (`ODG_ALPHA_PASSWORD`, falling back to `TRASH_DICE_ALPHA_PASSWORD`) and sets a scoped WUYB Play session cookie.

Approved source commit: `5d0e620 Make WUYB match timer more conspicuous`

Route SHA-256:
`77D696E56F3683DF16A61E8A92FB606FAE93ACC8B7561DA925B7A50C21B6E1C5`

This route replaces the old WUYB Alpha Complete URL format so WUYB now matches the Trash Dice `/trash-dice/play/` pattern. Old `/wuyb/alpha-complete/` and `/private/wuyb-preview/` links redirect here. Do not replace these files in place unless CJ explicitly approves a new WUYB Play build.
