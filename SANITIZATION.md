# Sanitization Notes

This repository was rewritten from a private working copy on **2026-05-20** to remove all personal references and ensure it is safe for public release. This document summarizes what was scrubbed and what is intentionally retained.

## What was removed

- **Personal alias / OS account name.** All references to the original developer's local Windows username have been replaced with `BarnsAWS` (the GitHub account name) or removed where they served no documentation purpose.
- **Local file paths.** Absolute paths under any `C:\Users\<...>\OneDrive\...` directory have been replaced with relative paths (e.g., `./STANDARDS.md`) or removed entirely from documentation.
- **Personal "Hello, ..." UI verification text.** Any verification checklist line that named a specific signed-in user has been generalized to `Hello, <your alias>` so it works for any reader.
- **Internal Amazon tool name lists.** Any enumerated list of internal-only Amazon applications (used as historical context in the original draft) has been removed from the public Standards document. The Cloudscape framework class names (`awsui-polaris-dark-mode`, `awsui_*`) are publicly documented at [cloudscape.design](https://cloudscape.design) and are retained because the script targets them functionally.
- **Internal reference URL.** A reference to a specific internal Amazon dark-mode reference implementation URL has been generalized to "the publicly-documented Cloudscape dark-mode token set."
- **Original commit history.** The repository was re-initialized with a single fresh commit so no prior commit metadata (author email, message body, timestamps tied to the original developer) remains.

## What is intentionally retained

- **The `@match` URL(s)** the userscript targets. These are publicly resolvable DNS names; without them the script cannot match the page and is non-functional. They reveal nothing that DNS itself does not.
- **`awsui-polaris-dark-mode` body class and `awsui_*` class-prefix selectors.** These are publicly documented Cloudscape API surface, used here exactly as Cloudscape itself documents them.
- **Cloudscape token hex values** (`#161d26`, `#1b232d`, `#42b4ff`, `#ff9900`, etc.). These are publicly visible in the Cloudscape design system and on any deployed Cloudscape application via DevTools.
- **The Amazon Orange brand color** (`#ff9900`) used for primary action buttons. This is a public brand color and is what Cloudscape's primary CTA token resolves to in dark mode.
- **The `BarnsAWS` author identity** on the single rewritten commit, using the GitHub-provided noreply address `<id>+BarnsAWS@users.noreply.github.com` so no real email is exposed.

## Verification done before publishing

A local audit confirmed:

- No occurrences of the original developer's local Windows username in any tracked file.
- No occurrences of any local file path beginning with a Windows drive letter and a personal home directory.
- No `email = <real-email>` in any committed config.
- Commit author email uses the GitHub noreply form.
- README and ABOUT verification checklists do not name a specific user.
- The `STANDARDS.md` document does not enumerate internal Amazon tool names or reference internal-only documentation URLs.

## License

This project is MIT-licensed. See `LICENSE`.
