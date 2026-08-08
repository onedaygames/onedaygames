# WUYB Play

Canonical protected review home for the CJ-designated WUYB Game 2 build.

Canonical URL:
`https://playonedaygames.com/wuyb/play/`

Default play URL:
`https://playonedaygames.com/wuyb/play/?match=1&v=ef58a80`

Evaluator login:
`https://playonedaygames.com/wuyb/play/login/`

Login uses the shared ODG Alpha credentials source (`ODG_ALPHA_PASSWORD`, falling back to `TRASH_DICE_ALPHA_PASSWORD`) and sets a scoped WUYB Play session cookie.

Approved source commit: `ef58a80 Reduce WUYB title audio preload`

Route SHA-256:
`1AD2FE4573F792D9BDCD2CDA86E4F321C75E14362FC32035C0B7C7E3F58839B4`

This route replaces the old WUYB Alpha Complete URL format so WUYB now matches the Trash Dice `/trash-dice/play/` pattern. Old `/wuyb/alpha-complete/` and `/private/wuyb-preview/` links redirect here. Do not replace these files in place unless CJ explicitly approves a new WUYB Play build.
