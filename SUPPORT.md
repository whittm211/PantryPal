# PantryPal Support

PantryPal is a pantry, grocery, meal planning, and AI meal suggestion web app.

Public app:

https://whittm211.github.io/PantryPal/

## Getting Help

For launch support, use the GitHub repository issue tracker or contact the PantryPal project owner.

When reporting a problem, include:

- What screen you were on.
- Whether you were using guest mode or a signed-in account.
- What you expected to happen.
- What actually happened.
- Any visible error message.
- Browser and device, if known.

## Common Issues

### I do not see my guest data on another device

Guest mode stores data in the browser on the current device. To move guest data, use Settings -> Data -> Export JSON, then import that backup on the other device.

### I created an account but cannot sign in yet

If email confirmation is enabled, check your email and confirm the account before signing in. If too many confirmation emails were requested, wait a few minutes before trying again.

### AI Chef says it is generating for a while

AI Chef first tries the remote PantryPal backend. If that request times out, the app falls back to local pantry-aware suggestions so users still get meal ideas.

### Barcode lookup does not find my item

Barcode lookup depends on available product data. If an item is not found, enter the food details manually.

## Known Limitations

- Barcode coverage is incomplete.
- Receipt scanning is not available yet.
- Nutrition values are estimates when shown.
- AI Chef can suggest substitutions and meals, but users should review ingredients for allergies and dietary needs.
- Guest data can be lost if browser storage is cleared.

## Security Notes

Do not share private Supabase keys, access tokens, or local `.env` files in support requests.
