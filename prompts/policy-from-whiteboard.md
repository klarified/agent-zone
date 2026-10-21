# Prompt: from whiteboard to policy

Use this after the team has discussed its zones on a whiteboard. Run it in Claude Code from the root of your repository, on a new branch, with this repository cloned next to yours (`../agent-zone`). Give Claude the photo by dragging it into the terminal, pasting it, or replacing the path below.

Copy everything between the lines and fill in the brackets.

---

Read the photo of our whiteboard: [path to photo]. [If there is a second photo, for example a system sketch: path to second photo.]

It shows the result of a discussion about review zones. For each zone (Core, Middle, Surface) we wrote down what must be understood, how much review we can handle, and which pull requests we placed there.

Use `../agent-zone/agent-review-policy.md` as the template and write `docs/agent-review-policy.md`:

- Fill in examples, signals and requirements from the photo, in the words we used and in the language we used on the board.
- Use the pull request numbers as examples. If `gh` works in this repository, fetch each pull request's title and write it next to the number.
- Where the photo is unclear, or where we wrote that we did not agree, put it under "Open questions". Do not guess.
- Do not add rules, signals or limits that are not on the board, even if the template has them. Remove template lines we did not discuss.
- [Paste any notes or open questions written down during the discussion here.]

Show me the result before you save the file.

---

Read the draft aloud together and correct it before you commit. The policy is the team's words; the agent only types them up.
