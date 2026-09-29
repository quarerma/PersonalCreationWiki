## How to get it working

First you will need to have a Vercel account or any other quick deploy tool, vercel is recommended tho.
After just connect to the repository and you should be able to start populating your world wiki.

### Running the project

With node already installed, run

```
npm run install
```

Now run the project with

```
npm run dev
```

The defaul local URL is localhost:3000.

## Customizing the app

First file to modify is [config/site.ts](config/site.ts). Update the site title, description, contact email and any branding values there.

There is also text you can add and change at [components/wiki/site-footer.tsx](components/wiki/site-footer.tsx)
Also change the logo to anything you wish by changing the [public/logo.vsg](public/logo.svg), be sure that the new file must have the same name patter.

Below are clear steps and examples to create pages and customize the app.

## Creating pages

Use the project helper to scaffold a new wiki page folder and files:

`npm run create-page -- <slug> [title] [--type <type>] [--skip-router]`

- `slug`: folder name and URL (e.g. `medeia`). Required.
- `title` (optional): human-friendly page title. Defaults to a capitalized version of the slug.
- `--type <type>` (optional): populates `info.json` from a template. Available types: `character`, `location`, `god` (see `scripts/page-templates`).
- `--skip-router` (optional): create files only and do not update `router.json`. (use this option when you dont want it to be on the main page but still be reachable via hyperlinks)

Examples:

- Create a character page and register it in the router:

  `npm run create-page -- medeia "Medeia, Imperatriz do Império Médio" --type god`

- Create a location page without modifying the router:

  `npm run create-page -- atenas "Atenas" --type location --skip-router`

What the script creates:

- `content/pages/<slug>/content.md` — the Markdown content for the page.
- `content/pages/<slug>/info.json` — structured metadata (title plus any template fields).
- `content/pages/<slug>/images/` — image folder (a `.gitkeep` file is added).

The available info templates are located at `scripts/page-templates/` and include `character-info.json`, `location-info.json`, and `god-info.json`.

After creating pages you can run the validator to refresh the site manifest:

`npm run validate-wiki`

Images: naming and carousels

- Main image: the site looks for a page main image with one of these exact filenames (in this order): `portrait.png`, `portrait.jpg`, `portrait.jpeg`. Place that file in `content/pages/<slug>/images/` and it will be used as the page portrait.
- Additional images: drop extra images in the same `images/` folder and reference them from Markdown or a carousel.
- Carousel: to show an image carousel for the page create a `carousel.json` file at `content/pages/<slug>/carousel.json` containing an array of objects. Each object should include `image_name` (filename in the `images/` folder). Optional fields:
  - `image_label`: a short caption string
  - `display_default`: boolean, set to `true` to make this image the initially displayed slide

Example `carousel.json`:

```
[
  { "image_name": "portrait.png", "image_label": "Portrait", "display_default": true },
  { "image_name": "battle-1.jpg", "image_label": "Battle scene" },
  { "image_name": "map.png", "image_label": "Map" }
]
```

Notes:

- Carousel images are served from `/wiki-assets/<slug>/images/<image_name>`; make sure filenames match exactly.
- If the carousel file is missing or invalid the page simply won't show a carousel. After adding images or `carousel.json`, run `npm run validate-wiki` to refresh the manifest if needed.

## Changing page types and translation

To use command-line page creation with meaningful categories you can map internal page `type` values to human-friendly labels and control their ordering.

Where to edit

- Display labels & ordering: update `components/wiki/SearchBar.tsx`. The `pageTypeParser` function maps a page `type` string to the displayed section title; `sectionOrder` controls which types are shown first and their order.
- Creation templates: add or change JSON templates in `scripts/page-templates/` and register them in `scripts/create-wiki-page.ts` `INFO_TEMPLATES` to make `--type <type>` populate `info.json` on creation.

How to add a new type (quick steps)

1. Add a template (optional): create `scripts/page-templates/<my-type>-info.json` describing default `info.json` fields for the new type.
2. Register template: open `scripts/create-wiki-page.ts` and add an entry to the `INFO_TEMPLATES` mapping, e.g. `mytype: path.join(PAGE_TEMPLATES_DIR, 'mytype-info.json')`.
3. Add display label: edit `components/wiki/SearchBar.tsx` and add a `case 'mytype': return 'My Type Label'` to `pageTypeParser`.
4. Control ordering: add `'mytype'` into the `sectionOrder` array at the desired position.
5. (Optional) Update `lib/wiki/types.ts` if you want to document the type in your TypeScript types — add the literal to any union or just rely on the string field.

Examples

- Add a `creature` page type:
  - Create `scripts/page-templates/creature-info.json` with default fields.
  - Add `creature: path.join(PAGE_TEMPLATES_DIR, 'creature-info.json')` to `INFO_TEMPLATES` in `scripts/create-wiki-page.ts`.
  - In `components/wiki/SearchBar.tsx` add `case 'creature': return 'Criaturas'` and include `'creature'` in `sectionOrder` where desired.

Notes about converters and translations

- If you have an external converter that emits type names different from the local ones, either update the converter output to match your app's type strings or add mappings by extending `pageTypeParser` so the UI groups them correctly.
- The `--skip-router` flow is useful when using converters: create page files, run the converter to produce `content/router.json`, then run `npm run validate-wiki`.

## Customizing colors

This project uses CSS variables (in `styles/globals.css`) for the actual color values and exposes them to Tailwind via `tailwind.config.js` color tokens. That means you can change the visual theme in two places:

- Quick theme tweaks: edit `styles/globals.css` to change the HSL variable values for light and dark themes.
- Structural tokens & utility names: edit `tailwind.config.js` if you want to add new semantic color tokens (for example `highlight`) or change how tokens map to Tailwind names.

Quick steps:

1. Open [styles/globals.css](styles/globals.css) and update the `--primary`, `--primary-foreground`, `--background`, and other HSL variables under `:root` (light) and `.dark` (dark). These variables are used by Tailwind tokens like `bg-primary` and `text-primary-foreground`.

2. If you need a new semantic token, add it to the `colors` section in [tailwind.config.js](tailwind.config.js). Example: add a `highlight` token that reads from `--highlight` CSS variable.

3. Add the corresponding CSS variable in `styles/globals.css` for both light and dark themes (e.g. `--highlight: 48 100% 50%;`), then use the new token in your components as `bg-highlight` or `text-highlight-foreground` depending on how you expose it in `tailwind.config.js`.

Example — change the primary color:

1. Edit [styles/globals.css](styles/globals.css) and adjust the variable (light theme):

```
  :root {
    --primary: 220 65% 55%; /* new hue/saturation/lightness */
    --primary-foreground: 210 40% 98%;
  }
```

2. Save and reload your dev server — Tailwind reads the token names from the config but the color values come from the CSS variables, so updating `styles/globals.css` will immediately change the UI colors.

Notes:

- Prefer editing `styles/globals.css` for color value changes and `tailwind.config.js` for token names or structural changes. This keeps a clear separation between values and semantic tokens.
- If you use design tokens in other parts of the app, keep the variable names consistent to avoid confusion.

## Page content structure

A page folder looks like:

- `content/pages/<page-name>/`
  - `content.md`
  - `info.json`
  - `images/`
    - `portrait.png` (or jpg/jpeg)

Use `##` headings in `content.md` to create sections.

To include an image in Markdown (left or right hint):

```
![right](portrait.png)
```
