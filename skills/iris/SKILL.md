---
name: iris
description: Iris draws live, interactive UI in bb chat from ```iris blocks (JSX-style markup), ```iris-react apps (TSX with Iris's own components) and ```iris-app HTML pages. Use when writing or debugging an Iris card, checking one with iris_check or `bb iris check`, asking a rich question with iris_ask, keeping a card in a file (::iris{file}), setting a card's inputs, checking a plugin's data feed, or changing the Iris plugin's settings.
---

# Iris

Iris renders ```iris blocks in assistant replies as live UI in the person's bb theme. The full syntax and every component's props are in your instructions (the iris_* tools carry them); `bb iris docs <Name>` prints one component.

## Commands
- `bb iris check <file>`: validates a block and prints an outline of what the person will see, reading the thread's files, bb data and plugin: feeds when run from a thread. Exit 1 on errors.
- `bb iris components`: every component with its one-line summary.
- `bb iris docs <Name> [Name...]`: props and an example.
- `bb iris try "<prompt>"`: runs a prompt in a subthread whose agent knows Iris (works in trial rollout too).
- `bb iris pin <file> [--id <id>] [--title <title>] [--once] [--alert-when <expr>] [--alert-message <text>]`: pins the card in the file beside this thread's conversation and follows the file (re-read every 3 s), so rewriting it updates the pin; `--once` stores the card as it is now. Checked first; at most 5 pins per thread; the same id replaces a pin. The iris_pin tool does the same (`alert_when`, `alert_message`).
- Pin alerts: `--alert-when 'build.state == "failed"'` is an Iris expression over the card's own names, checked every 30 s. When it turns true the person sees the alert on the pin and the pinned-count chip, a toast in bb, a desktop notification where allowed, and the thread marked unread, until they dismiss it. Phone pushes aren't possible: bb gives plugins no notification API, and its push notifications fire only on agent turns and questions. Alerts never message the thread.
- `bb iris unpin <id>` or `--all`, and `bb iris pins [--json]`: remove and list this thread's pins (iris_unpin, iris_pins).
- `bb iris cards [--json]`: this thread's cards with what the person set in each (iris_cards; the cards.list RPC for other clients).
- `bb iris set <id|n> name=value [name=value...]` or `--json '{...}'`: sets inputs in a card from `bb iris cards`, by its id (message#index, stable) or number; each must be a <state> the card declares and keep its type, and an open card redraws (iris_card_set; the cards.set RPC).
- `bb iris feed check <plugin>/<name>`: reads a plugin's Iris data feed the way a card does (load("plugin:<plugin>/<name>")) and prints whether it answers, its type, size, time and caching, and the fields a card can use. Exit 1 when a card couldn't read it.
- `bb plugin rpc call iris pins.list|pins.all|pins.set|pins.ack|pins.remove --input-file <json>`: the same pins for any client, by threadId.

## Cards people can read
The person reads a card once, at a glance, often on a phone. Everything they need must be on the card: they can't open its source.
- Lead with the answer in your first sentence; the card carries the evidence. One Card per idea, titled with what it shows.
- Fit the component to the data before reaching for Table: before and after values are a Delta, checks with results are Acceptance, review notes are Findings, steps are Steps, a trend is a Chart. iris_check names a better fit when it sees one.
- Tables hold values, not prose:
  - A cell is a value, a label or a short phrase. At most one column holds sentences, and it goes last.
  - A column of sentences wraps on its own; short values, IDs and paths stay on one line, and a row with a cut cell opens in full on a click (unless the card gives rows its own `onRowClick`). Don't set a `width` to squeeze a prose column.
  - When each row needs a paragraph (a reason, a finding, a note), use `<List>` with `<Item title={...} detail={...} />`, one item per row (both wrap), or Findings for review notes. iris_check warns about a paragraph in a cell when the rows are written in the card.
  - Numbers stay numbers so they right-align and format: `14210` with `format: "usd"`, not `"$14,210"`. Dates and IDs stay strings.
  - Short sentence-case column labels ("What it does", not "WHAT_IT_DOES"). Keep a table under about 25 rows, or let it page.
- DataGrid is for large data to sort, filter, group and pivot. It cuts every cell to one line; the row the person clicks or reaches with the arrow keys shows in full below the grid when it holds long text. Never put sentences in one (iris_check warns when the rows are written in the card).
- Text stays short: a sentence or two around the data, Markdown inside `<Text>`. Notes that qualify the data go after it.
- Phone width: cards fill the width, a `<Row>` wraps its items onto new lines when they run out of room, and a table that doesn't fit becomes one block per row. Avoid fixed widths.
- Before sending: run iris_check (or `bb iris check`), read the outline as the person will see it, and fix every warning.

## File cards
Write a card's markup to a file (for example `$BB_THREAD_STORAGE/status.iris`) and put `::iris{file="$BB_THREAD_STORAGE/status.iris"}` on its own line in a reply: the card draws inline and follows the file, re-read every 3 s while it shows. `iris_examples(["Recipes"])` has this pattern, a Variants picker, and setting a card's inputs.

## Settings (`bb plugin config iris`)
- `stance`: `eager` (default) shows anything that can be shown; `balanced` keeps short answers as prose.
- `rollout`: `everywhere` (default) or `trial` (only threads started with `bb iris try`), for testing beside another UI plugin.
- `workers`: teach agent-spawned threads too (off by default; it costs prompt tokens in every worker session).
Settings apply after `bb plugin reload iris`, in sessions that start afterwards.

## Limits
- load() and Snippet read only the thread's workspace and its thread storage, up to 8 MB.
- ```iris-app pages and ```iris-react apps run sandboxed with no network; window.iris.insert/send/copy/submit are the only way out, and each works only from a click.
- ```iris-react apps import only react, react-dom, lucide-react and "iris" (the kit: `bb iris docs React`). iris_check compiles them; compile and runtime errors show under the app with their line.
- iris_ask waits as long as the person's Ask timeout setting (1 hour unless they changed it). Leave timeoutMinutes unset unless the question has a real deadline; it overrides the setting, up to 7 days.
- Live cards re-read files every 2 s and plugin: sources every 10 s; a failed refresh keeps the last good value with a "retrying" note. load(path, {fallback: x}) returns x instead of an error.
