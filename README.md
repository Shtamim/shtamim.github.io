# Shoyaib Hasan — Portfolio v3

A static portfolio for GitHub Pages. Plain HTML, CSS and JavaScript: no build step, no framework, no backend.

## Page themes

| Page | Theme | Look and feel |
|------|-------|---------------|
| `index.html` | `cyber` | Cybersecurity: interactive terminal, falling data rain, scanlines, glitch headline |
| `projects.html`, `project.html` | `robotics` | Robotics and innovation: blueprint grid, circuit traces with signal pulses, live animated robot arm, spec-sheet cards, live GitHub repo feed |
| `journal.html`, `post.html` | `cool` | Cool neon: starfield with shooting stars, synthwave sun and grid, calm reading layout with progress bar |

## File map

```
index.html / projects.html / project.html / journal.html / post.html
assets/
  css/base.css       tokens, 3 themes, header, footer, buttons, cards
  css/home.css       terminal + cybersecurity styling
  css/projects.css   robotics styling + project detail page
  css/journal.css    cool theme + article page
  js/data.js         ALL editable content (site info, skills, projects, posts)
  js/main.js         header/footer, renderers, filters, GitHub feed
  js/fx.js           canvas backdrops (rain / circuit / stars) + robot arm
  js/terminal.js     the interactive terminal
  images/            project illustrations + favicon
```

## Edit content (only `assets/js/data.js`)

- `site.email`: replace `YOUR_EMAIL@example.com` with your real address.
- `projects`: add an object to the array. Put its image in `assets/images/`.
- `posts`: add an object; each string in `content` is one paragraph.

## Terminal commands

`help`, `whoami`, `skills`, `projects`, `journal`, `contact`, `github`, `ls`, `cat <file>`, `goto <page>`, `date`, `clear`.
Arrow keys browse history and Tab completes a command. Click or press a key during boot to skip the typing.

## Run locally

Open the folder in VS Code and use the **Live Server** extension on `index.html`.

## Publish on GitHub Pages

1. Open your repository: `https://github.com/Shtamim/My-portfolio-website`.
2. Back up the old files, then upload the **contents** of this folder to the repository root.
3. Commit, then go to **Settings → Pages**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`.
4. The site goes live at `https://shtamim.github.io/My-portfolio-website/`.

## Notes

- Fonts (Chakra Petch, IBM Plex Sans, IBM Plex Mono) load from Google Fonts; sensible fallbacks apply offline.
- The "Latest repositories" feed on the projects page calls the public GitHub API. It only works once the site is online, and falls back to a link if GitHub is unreachable.
- Animations pause off-screen and switch to still frames when a visitor prefers reduced motion.
- Never put passwords, API keys or tokens in this repository.
