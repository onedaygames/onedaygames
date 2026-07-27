# WUYB Play

Canonical protected review home for the CJ-designated WUYB Game 2 build.

Canonical URL:
`https://playonedaygames.com/wuyb/play/`

Default play URL:
`https://playonedaygames.com/wuyb/play/?match=1&v=ed513f2`

Evaluator login:
`https://playonedaygames.com/wuyb/play/login/`

Login uses the shared ODG Alpha credentials source (`ODG_ALPHA_PASSWORD`, falling back to `TRASH_DICE_ALPHA_PASSWORD`) and sets a scoped WUYB Play session cookie.

Approved source commit: `ed513f2 Generalize WUYB route sync`

Route SHA-256:
`BD07523503DE4F90AE78BD6A49C8BD9CDE3D84BF152A550BDC55EAB3B6D684EB`

This route replaces the old WUYB Alpha Complete URL format so WUYB now matches the Trash Dice `/trash-dice/play/` pattern. Old `/wuyb/alpha-complete/` and `/private/wuyb-preview/` links redirect here. Do not replace these files in place unless CJ explicitly approves a new WUYB Play build.
