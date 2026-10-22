# Week 6: AI Engineering (Atlas lesson pages)

> **Source:** Next Chapter Atlas, Week 6 (Phase 2: AI Engineering), Days 1 to 4
> **Captured:** Oct 21, 2026, from screenshots of the lesson pages
> **Purpose:** context for the `feature/ai-feature` branch of `tx-license-navigator-next`
> Transcribed as written. Quiz answer boxes are left blank on purpose; Joseph's answers are his own.

---

## Day 1: Calling an AI API in Code

**Reading checks with Atlas: Write your best first response in your own words**

1. **Answer, then save.** Save when you are ready. Your first response is the one your instructor reviews.
2. **Compare ideas.** Where available, a model answer appears after your response is safely saved.
3. **Use the coaching.** Atlas highlights what landed and one thing you can sharpen. It is feedback, not a grade.

Your instructor can see your response and Atlas feedback. After all required checks are saved, finish the lesson with the completion button at the bottom of the page.

**Shared resources:** AI News Discussion Guide. Prepare a short AI news share: what happened, why it matters, and how it connects to builders.

> ***Flipped concept-reading day.*** *This is the week the whole program has been building toward:* ***AI inside your own app.*** *Not you chatting with AI — your app calling AI automatically, as a feature users get. Today's Explorations are mostly* ***goal-only*** *— you write the prompts from the goal. You're ready for that now.*

### This Week

**Week 6 of 13 · Phase 2: AI Engineering · Ends in a project, no gate**

You've used AI all program. This week you put it *inside* your own application, in code — and then deal with everything that makes that hard in the real world: it costs money, it has limits, and sometimes it returns something you didn't expect in front of a user.

| Day | What you do |
|---|---|
| 1 | Calling an AI API in code |
| 2 | Tokens, cost and rate limits |
| 3 | Guardrails and reliability |
| 4 | Build day — add a reliable AI feature |
| 5 | Demo day — show your AI feature |

**Friday you demo an AI feature that holds up when things go wrong.** That's the assignment — not that it works once in a demo, but that it handles a bad response, a rate limit, or a user who types something strange. **Lane 3, control under constraints**, is where that gets scored.

**By Friday you should be able to:** call an AI API from your own code, keep a key out of your repository and say why that matters, estimate what a feature costs to run, and put a guardrail around a response you can't fully predict.

### Day Brief

Everything so far has been *you* using AI. Today it flips: your **app** uses AI, on its own, as a built-in feature. A user pastes a messy note and your app hands back a clean summary — because behind the scenes, your code sent that note to an AI model and got the answer, automatically. No human in the loop.

That's what an **AI API** is: a way for your *code* to talk to an AI model, the same way Week 4's APIs let your code talk to other services. And here's the beautiful part — the prompting skills you built in Phase 1 (system prompts, roles, examples, reliability) now live *in your code.* Week 2's "system prompt" becomes a line in your app. You already know the hard part.

**Try it before you read on:** ask your AI: `When an app has an "AI feature," how does the app actually get the AI's answer? What's an "AI API"?` Read it critically.

### Concept

*Read for the mental model; direct the agent for the code.*

#### 1. An AI API is just another API — for an AI model

Week 4: your code sends a request to a service, gets a response. An **AI API** is the same pattern, where the service is an AI model:

> *your app sends the model a request (your text + instructions) → the model sends back its generated response → your app uses it*

So calling AI from code is not a new skill — it's Week 4's request/response, pointed at an AI. The difference is *what you send* and *what comes back* (text the model generated, not fixed data).

**Try it:** picture your Week 5 notes app adding a "summarize" button. In one sentence, what would the app *send* to the AI, and what would it get *back*?

#### 2. What you send: the system prompt (in code) + the user's input

Remember Week 2? You gave an AI a **system prompt** — a role and rules — and it behaved reliably. In an AI API, that system prompt lives **in your code**, set once, applied to every call. Then each request adds the specific user input.

```
system prompt (in your code, always):
  "You are a concise summarizer. Summarize the user's note in 2 sentences.
   Plain language. Never add information that isn't in the note."

user input (per request):
  [whatever note the user pasted]
```

This is the exact Week 2 skill — role, rules, reliability — now engineered into an app so *every* user gets that behavior. Your prompt-design fluency is now a product feature.

**What it actually looks like in code**

Your agent will write something close to this, and you should be able to read it:

```js
const response = await client.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    { role: "system", content: "You are a concise summarizer..." },
    { role: "user",   content: userNote }
  ]
});
```

Three things to notice, and you can now read all of them:

- `await` — of course. This goes over the internet and takes time (Week 4).
- `model:` — *which* AI you're calling. Different models cost different amounts and vary in capability. This is a dial you can change, and changing it is often the cheapest fix for a slow or expensive feature.
- `messages:` — a **list**, and every entry has a `role`. `system` is your instructions; `user` is what the person typed. Same two ideas from Week 2, now as data your code assembles.

**The thing that surprises everyone: the API has no memory**

When you use a chat product, it remembers your conversation. **The API does not.**

Every call is a blank slate. The model has no idea you called it thirty seconds ago. It knows *only* what's in the `messages` list you just sent, and nothing else.

That's not a limitation to work around — it's the same context lesson from Week 2, showing up in your code. The model only ever knows what's in front of it. In a chat product, the product is quietly resending your history on every message. If you want your app to remember, **your app has to do that job** — store previous messages and include them in the list next time.

Two practical consequences:

- **"Why doesn't it remember what I told it?"** is not a bug. You didn't send it.
- **Sending history costs money**, because every message in the list is tokens you pay for. That's tomorrow's lesson, and it's why apps don't simply resend everything forever.

**Try it:** write a one-line system prompt (in your head or notes) for an AI feature you'd want in an app. Role + one rule. You just designed the core of an AI feature.

#### 3. The API key — a secret that costs real money

To call an AI API, your app needs an **API key** — like Week 5's connection string, a secret that identifies the account making the call.

**You'll be given a key.** You don't need to sign up for anything, and you don't need a card. Your instructor issues it, and there's nothing for you to buy — so if you were bracing for that, you can stop.

What makes it higher-stakes than Week 5's secrets is what the key *is*: **every call costs money on a real account, and it isn't your account — it's the program's.** That's the whole reason the rules here are absolute rather than good practice:

- **env file, git-ignored, never committed, never in the front end.**
- A key pushed to a public repo gets found by scrapers in minutes, not days. People run bots that watch new commits for exactly this.
- If a key leaks, the bill lands on everyone, and the key gets shut off — which means it stops working for the rest of the cohort too, not just you.

Nobody is going to be angry about a mistake here, and you will not be charged for anything. But **tell your instructor immediately** if you think a key has been exposed — a leaked key that's reported in five minutes is a non-event, and one that's found a week later is not. That's the actual professional instinct this teaches: you say something straight away.

#### 4. Where the AI call lives: the back end

The AI call happens in your app's **back end** (Week 5's server side), never the browser. Why: the key is a secret (can't be in front-end code anyone can read), and you want to control/validate what gets sent. So the flow is:

> *user acts in* ***browser*** *→ request to* ***server*** *→ server calls the* ***AI API*** *(with your system prompt + the input) → AI responds → server sends it back →* ***screen*** *shows the result*

It's Week 5's data flow with an AI call added in the middle. Your app can call the database *and* the AI — that's a modern AI app.

**Try it:** trace the flow for "user clicks Summarize and sees a summary." Where does the AI call happen? Why not in the browser?

#### 5. You direct; you verify (the AI can still be wrong — Phase 1 never left)

Same controlled loop, with a Phase 1 twist: the AI's *output* still needs judging. Your app might call AI perfectly and the AI still returns something wrong or weird. So you verify both: did the code call the API right, *and* is the AI's answer good enough to show a user?

> *direct the agent to add the AI call → review the diff → run it → check the AI's actual output → commit*

### Guided Exploration

*The core of today. Work with Codex on your Week 5 app (or a small fresh one). Prompts are goal-only now — you write them.*

#### Exploration 1 — Store Your API Key Safely *(hint provided — new setup)*

**Goal:** take the key you were given and store it as a git-ignored secret. **Hint (setup is new, so here's help):** your instructor gives you the key — nothing to sign up for. Ask your coding agent to set it up as an environment variable in your app's git-ignored env file. Never paste it into a chat, a commit, a screenshot, or anything public.

1. Have the agent wire it up as a secret. Review where it put it — don't just accept that it did.
2. **Verify it's git-ignored** (not in your commits). Log how you confirmed.

#### Exploration 2 — Make Your App Call the AI *(goal-only — you write the prompt)*

**Goal:** add a back-end route that sends some text to the AI API with a system prompt you wrote, and returns the AI's response; show the result in the app.

1. **Write the agent prompt yourself.** Include: what the feature does, your system prompt (role + rule), that the call goes in the back end, and that the result shows in the UI.
2. Review the diff — find the AI call, the system prompt, and where the result reaches the screen.
3. Run it. **Check the AI's actual output** — is it good? Commit.
4. Log your prompt + your system prompt + whether the AI's output was actually useful.

#### Exploration 3 — Change the Behavior via the System Prompt *(goal-only)*

**Goal:** change how your AI feature behaves by editing only the system prompt (not the rest of the code).

1. Direct the agent (your prompt) to adjust the system prompt — change the tone, the length, or add a rule.
2. Run it again. Did the behavior change as expected? (This is Week 2's lesson, in code: the system prompt steers everything.)
3. Commit. Log the before/after behavior and what one system-prompt change did.

**What you should notice:** your Phase 1 prompt-design skill is now a dial inside a real app. You built an AI feature — and you control it by controlling the prompt.

### Checks for Understanding

*Answer in the LMS before the workshop — tomorrow's session is built on what you write here.*

**Quiz · Free response** (`ai-api-integration`)
Explain what an 'AI API' is by connecting it to the regular APIs you learned in Week 4. What's the same, and what's different about what comes back?

> Answer: _(Joseph's saved answer and Atlas feedback not transcribed)_

> **Model answer:** Same request-and-response shape as any API. Different in what comes back: not a stored fact, but generated text that varies and can be wrong.

**Quiz · Free response** (`ai-api-integration`)
In an AI feature, where does the 'system prompt' live, and what does it do? Connect it to what you learned in Week 2.

> Answer:

**Quiz · Free response** (`data-flow`)
Trace the data flow for 'a user clicks Summarize and sees a summary,' including the AI call. Why does the AI call happen on the back end, not in the browser? Give TWO reasons.

> Answer:

**Quiz · Free response** (`verifier-mindset`)
From Exploration 2: paste the system prompt you wrote. Was the AI's output actually good? How did you judge it (not just 'it returned something')?

> Answer:

### Apply / Evidence

Add to your **Prompt Log**:

1. Your Exploration 2 agent prompt (that you wrote) + your feature's system prompt.
2. Your Exploration 3 before/after: what one system-prompt change did.
3. One idea for the AI feature you'll build for this week's project.

### Going Deeper

*(optional)*

- Ask the agent to show you the raw response the AI API returns (not just the text) — notice it's JSON with extra info (like token counts — tomorrow's topic).
- Compare providers: skim the OpenAI API and the Anthropic (Claude) API docs; note that the request/response idea is the same across both.

### Resources

- **Reference (official):** OpenAI API — Quickstart *(confirm current URL + model/pricing at delivery)*
- **Reference (alternative):** Anthropic (Claude) API docs *(the same pattern, different provider)*
- **Reference:** your Week 2 Prompt Recipe card — your system-prompt skills now go in code.

**Bring this to class: Your pre-reading notes** (optional; does not hold up lesson completion)
- A note or takeaway:
- A question that is bubbling up:

*Previous: Demo Day — Show Your Full-Stack App · Next: Tokens, Cost & Rate Limits. To complete this day: answer the exit ticket.*

---

## Day 2: Tokens, Cost & Rate Limits

*(Same "Reading checks with Atlas" box as Day 1.)*

**Shared resources:** Student-Led Review Prep Guide. Prepare a short review that teaches yesterday's key idea back to the cohort.

> ***Flipped concept-reading day.*** *Your app calls AI. Now the engineering reality:* ***every call costs money, and there are limits on how fast you can call.*** *Today you learn to think about tokens, cost, and rate limits — the difference between a fun demo and something you could actually ship. Explorations are goal-only; you write the prompts.*

### Day Brief

Yesterday's excitement — your app uses AI! — comes with a bill. Every AI call costs a little money, measured in **tokens** (remember tokens from Week 1? Now they have a price tag). And providers **rate-limit** you: you can only make so many calls so fast.

Why this matters for a builder who wants to get paid: a client will ask "what will this cost to run?" and "what happens when a hundred people use it at once?" Being able to answer makes you a real engineer, not a hobbyist. Today you learn to estimate cost and design for limits. It's not scary math — it's awareness that keeps your app affordable and reliable.

**Try it before you read on:** ask your AI: `What is a "token" in AI APIs, and how does token usage relate to cost?` Connect it to what you learned about tokens in Week 1.

### Concept

*Read for the mental model; measure with the agent.*

#### 1. Tokens — the unit of AI (and now, of cost)

Week 1: the AI sees text as **tokens** (chunks, roughly ¾ of a word each). Here's the new part: **you pay per token.** Both directions count:

- **Input tokens** — the text you send (system prompt + user input).
- **Output tokens** — the text the AI generates back.

A rough feel: a paragraph is a few hundred tokens. Providers price per million tokens, so one call is usually a tiny fraction of a cent — but it adds up across many users and long inputs.

**Try it:** paste a paragraph into the same tokenizer you used in Week 2 (platform.openai.com/tokenizer, or tiktokenizer.vercel.app if that won't load) and look at the count. Rough estimate if you'd rather: words ÷ 0.75 ≈ tokens. Get a feel for how big a real input actually is.

#### 2. Cost — small per call, real at scale

One call is cheap. The engineering question is *scale*:

- 1 user summarizing 1 note: fractions of a cent. Fine.
- 1,000 users, 50 times a day, with huge inputs: now it's real money.

**Do the arithmetic once**

Vague cost sense is how people get surprised, so run one real calculation. Say a model charges roughly **$0.15 per million input tokens** and **$0.60 per million output tokens** — cheap-model territory, and close enough for thinking:

- Your system prompt is ~100 tokens. The user's note is ~400. That's **500 input tokens**.
- The summary comes back at ~150 **output tokens**.
- Input: 500 × $0.15/1,000,000 = **$0.000075**. Output: 150 × $0.60/1,000,000 = **$0.00009**.
- **About $0.00017 a call.** Call it a fifth of a hundredth of a cent.

Now scale it: 200 users × 20 calls a day ≈ **$0.68 a day**, about **$20 a month**. Real, manageable, and *predictable* — which is the point. You can now answer "what would this cost?" with a number instead of a shrug, which is exactly what the Phase 2 gate means by cost awareness.

Change one input though: let users paste 10,000-token documents instead of 400-token notes and that same feature is roughly **$400 a month**. Input size is the whole ballgame.

**Yesterday's cliffhanger: history costs money**

Remember the API has no memory. If you want your app to remember a conversation, **you resend the history every single call** — and every message in that list is input tokens you pay for again.

So a ten-message conversation isn't ten cheap calls. Call one sends one message; call ten sends ten. Cost grows with the *square* of the conversation length, not in a line. This is why real apps summarize old messages, keep only the last few, or start fresh — not to be stingy, but because unbounded history is unbounded cost.

**Two levers you control**

- **Input size** — don't send more than you need. Sending a whole book to summarize one page is waste you pay for. **Cap what a user can submit.**
- **Model choice** — smaller models cost far less and are often completely sufficient. Use the cheapest one that does the job; you don't always need the biggest brain. Changing `model:` is a one-line experiment.

**Your key bills the program's account**, so you won't see an invoice — but the cost is real. Ask your instructor what your feature actually cost to run this week. Knowing the number for something *you* built is worth more than any estimate.

**Try it:** think about your Week 6 feature. What's the *largest* input a user might send? That's your cost risk. How could you cap it?

#### 3. Capping — protect yourself from runaway cost

Because a leaked key or a huge input can rack up charges, real apps **cap** things:

- **Limit input length** (e.g., truncate or reject inputs over N characters).
- **Set a max output length** (don't let the AI ramble for 2,000 tokens when 100 will do).
- **Watch your provider's usage dashboard** and set spending limits there.

This is responsible engineering — and it's a Phase 1 idea (control) with dollars attached.

#### 4. Rate limits — you can only call so fast

Providers limit how many requests you can make per minute (a **rate limit**), to keep the service fair and stable. If your app calls too fast, you get an error (often "429 Too Many Requests").

Your app should handle that gracefully, not crash — e.g., wait a moment and retry, or show the user a friendly "busy, try again" message. You don't hand-write this; you direct the agent to handle rate-limit errors. But you must *know it exists* so you ask for it.

**Try it:** ask your AI: `What is a 429 rate-limit error and what are polite ways an app can handle it?` Note one approach.

#### 5. You direct; you measure

The controlled loop, with a cost lens:

> *add the AI call → check the token usage in the response → estimate cost → cap input/output as needed → handle rate limits → commit*

Your value here is *awareness and judgment*: knowing calls cost money, roughly how much, and designing so it stays affordable and reliable. That's exactly what a client pays for.

### Guided Exploration

*The core of today. Work with Codex on your app. Prompts are goal-only.*

#### Exploration 1 — See Your Token Usage

**Goal:** find out how many tokens your AI feature actually uses per call.

1. Direct the agent (your prompt) to log or display the token usage from an AI call (the API returns it in the response).
2. Run your feature on a short input and a long input. Compare the token counts.
3. Log: short vs. long token counts. What drove the difference?

#### Exploration 2 — Estimate the Cost

**Goal:** put a rough dollar figure on your feature.

1. Find your model's price per million tokens (from the provider's pricing page — confirm current numbers).
2. Using your token counts from Exploration 1, estimate the cost of one call, and of 1,000 calls.
3. Log the estimate. Was it more or less than you expected?

#### Exploration 3 — Add a Cap and Handle Limits *(goal-only)*

**Goal:** protect your feature from runaway cost and rate-limit crashes.

1. Direct the agent (your prompt) to: cap the input length (reject or truncate very long inputs) and handle a rate-limit/error gracefully with a friendly message.
2. Review the diffs — find the input cap and the error handling.
3. Test: try a huge input (does it cap?) and confirm errors don't crash the app.
4. Commit. Log what you capped and how errors are handled now.

**What you should notice:** with a few controls, your AI feature is affordable and won't fall over. That's the leap from demo to shippable.

### Checks for Understanding

*Answer in the LMS before the workshop — tomorrow's session is built on what you write here.*

**Quiz · Free response** (`tokens-cost`)
Explain tokens as the unit of AI cost. Connect it back to what tokens meant in Week 1. Which costs you money: the input, the output, or both?

> Answer:

**Quiz · Free response** (`tokens-cost`)
From Exploration 2: roughly what does one call of your feature cost, and what would 1,000 calls cost? Name one thing you could change to lower it.

> Answer:

**Quiz · Free response** (`ai-api-integration`)
A client asks, 'What happens when 100 people use this at the same time?' Explain rate limits in plain terms and one way your app can handle hitting one without crashing.

> Answer:

**Quiz · Free response** (`tokens-cost`)
From Exploration 3: what input cap did you add, and why? How does capping protect you (think about a leaked key or a giant input)?

> Answer:

### Apply / Evidence

Add to your **Prompt Log**:

1. Your token counts (short vs. long input) and your cost estimate.
2. Your Exploration 3 prompts + what you capped and how errors are handled.
3. One cost/limit consideration for the feature you'll build this week.

### Going Deeper

*(optional)*

- Ask the agent to explain "streaming" responses (showing the AI's answer as it generates) and when it's worth it. (Concept only.)
- Look at your provider's usage dashboard; set a spending limit if you can. Real engineers do this on day one.

### Resources

- **Reference (official):** your AI provider's **pricing page** and **rate-limits doc** *(confirm current numbers at delivery — these change often)*
- **Go find one (~6 min):** search out a beginner "how AI API pricing works / what are tokens" explainer. Skim two, keep the one that explains it more clearly, and note which you picked.
- **Reference:** your Week 1 notes on tokens — same idea, now with a price.

**Bring this to class: Your pre-reading notes** (optional)
- A note or takeaway:
- A question that is bubbling up:

*Previous: Calling an AI API in Code · Next: Guardrails & Reliability. To complete this day: answer the exit ticket.*

---

## Day 3: Guardrails & Reliability

*(Same "Reading checks with Atlas" box as Day 1.)*

> ***Flipped concept-reading day.*** *Your AI feature works and is affordable. Today: making it* ***reliable and safe*** *— because an AI feature real people use will meet weird inputs, bad outputs, and misuse.* ***Guardrails*** *are how you handle that. Then you get your Week 6 project. Explorations are goal-only.*

### Day Brief

Here's the truth about shipping an AI feature: users will do things you didn't expect, and the AI will sometimes return something wrong, weird, or unsafe. That's not a maybe — it's a guarantee at any real scale. The difference between an amateur's demo and a professional's product is **guardrails**: the checks that keep the feature reliable and safe when reality gets messy.

This is Week 2's responsible-use lesson (find the failure mode) turned into *engineering* (build the safeguard). You already know how to *spot* where AI goes wrong. Today you learn to *build the guard* — and that's a genuinely valuable, employable skill.

**Try it before you read on:** think of your AI feature. Ask your AI: `What are 3 ways a user could break or misuse [my feature], and what could go wrong with the AI's output?` Save the list.

### Concept

*Read for the mental model; build the guards with the agent.*

#### 1. Three places an AI feature fails

1. **Bad input** — empty, gigantic, gibberish, or malicious text from the user.
2. **Bad output** — the AI returns something wrong, off-topic, unsafe, or not in the format you needed.
3. **Failure/slowness** — the AI API errors, times out, or hits a rate limit (yesterday).

A reliable feature has a guardrail for each. You don't need fancy tools — just sensible checks, which you direct the agent to add.

**Try it:** for your feature, name one realistic example of each of the three failures. That list *is* your guardrail to-do list.

#### 2. Guard the input (before you call the AI)

Check the user's input *before* spending a call on it:

- **Not empty / not too long** (also saves cost — yesterday's cap).
- **Roughly the right kind of thing** (if you expect a note, don't send an empty box).
- Optionally, block obvious abuse.

A simple rule: never send junk to the AI. Validate first, call second.

#### 3. Guard the output (before you show the user)

The AI's answer is a **draft** (Phase 1, forever). Before showing it:

- **Check it's there and non-empty.**
- **Check the format** if you need one (e.g., you asked for 2 sentences — did you get roughly that?).
- **Constrain via the system prompt** — the best output guardrail is a tight system prompt with clear rules and "if you're unsure, say so" (Week 2 + Week 1's uncertainty trick).
- For sensitive uses, add a **human-check step** ("review before sending").

#### 4. Guard against failure (when the AI breaks)

From yesterday: the AI API can error, be slow, or rate-limit you. It is not a question of *whether* — over enough calls, all three will happen.

**`try` / `catch` — the shape of handling failure**

This is the construct that does the work, and you'll see it everywhere from here on:

```js
try {
  const summary = await summarizeWithAI(note);
  return summary;
} catch (error) {
  console.error("AI call failed:", error);
  return "Couldn't summarize that just now - try again in a moment.";
}
```

Read it as: **"try this; if it blows up, do that instead."**

- Code inside `try` runs normally. If it fails, JavaScript stops right there and jumps to `catch` — it does not continue through the rest of the `try` block.
- `catch (error)` receives the thing that went wrong. **Log it** (that's for you, in the terminal) and **return something human** (that's for the user).
- Without a `try` / `catch`, a failed AI call takes your whole page down. With one, the user sees a sentence.

**The two audiences rule.** The error object is for you and belongs in the log. The message on screen is for the user and should never be the raw error — it says what happened and what to do next, in plain language. "Something went wrong" is nearly useless; "Couldn't summarize that just now — try again in a moment" tells them it's temporary and that trying again is reasonable.

**Timeouts — because "slow" is its own failure**

An API that never answers is worse than one that fails fast, because the user just sits there. Set a limit — a few seconds — after which you stop waiting and show the fallback. Ask your agent to add one and to tell you what it set it to.

**Fallbacks — decide what "AI is down" looks like**

Answer this before you build, not during the outage: **what does a user see when the AI feature is unavailable?** A message? A retry button? The app working without that one feature?

The best answer is usually **the rest of the app still works.** An AI feature that takes the whole product down when it fails wasn't guarded — it was just wired in and hoped for.

**Try it:** ask your agent `what happens in this code if the AI API returns a 500?` and read the answer against your own reasoning. If the honest answer is "the page breaks," you've found your next card.

#### 5. Govern — what you'd tell the person using it

Guardrails are what you build. **Govern** is what you can *say* about it afterwards, and it's the last of the four Trustworthy-AI questions — you met Map, Measure and Manage back in Week 3, and this is the one that was waiting until you had a real app with real users.

It's three plain questions about your own project:

- **Where did you use AI?** In the build (the agent wrote code) and in the product (the feature calls a model). Those are different, and people conflate them.
- **What did you check?** Which diffs you reviewed, what you tested, what you caught. You have this in your Prompt Log already.
- **What would you tell a user?** If someone using your app asked "is this AI?", what's the honest answer — and does your app make that obvious, or does it let them assume a person wrote it?

That last one is the whole point. **A user should never have to guess whether they're talking to a model.** It costs one line of interface text and it's the difference between a product people trust and one they feel tricked by later.

There's a cost dimension too: you now know roughly what your feature costs to run. Being able to say "about this much per hundred uses" is part of being trusted with it.

**Try it:** write your three Govern answers now, in your Prompt Log, in the plainest language you can. You'll be asked for them at the Phase 2 gate.

#### 6. The reliability mindset (and your project)

Put simply: **assume it will get weird, and design for it.** A builder who ships an AI feature that stays calm under bad input, bad output, and downtime is doing real engineering. Your Week 6 project requires **at least one guardrail of each kind**, and your demo names your feature's failure mode and the guard you built.

> *direct the agent to add each guard → review the diff → test by trying to break it → commit*

**Try it:** the best way to find guardrail needs is to *attack your own feature.* You'll do exactly that in the Exploration.

### Guided Exploration

*The core of today. Work with Codex. Prompts are goal-only — you write them.*

#### Exploration 1 — Break Your Own Feature

**Goal:** find where your AI feature fails.

1. Throw bad inputs at your feature: empty, enormous, gibberish, something off-topic.
2. Note what happens each time — crash? weird output? cost spike? nothing?
3. Log your feature's **failure modes** — this is your guardrail to-do list (and your Week 2 failure-mode habit, engineered).

#### Exploration 2 — Guard the Input and Output *(goal-only)*

**Goal:** add an input guardrail and an output guardrail.

1. Direct the agent (your prompt) to validate the input (reject empty/too-long) and to check the AI's output before showing it (non-empty, roughly the right format).
2. Also tighten your **system prompt** with a clear rule and an "if unsure, say so."
3. Review the diffs. Re-run your break-it tests — do the guards hold now?
4. Commit. Log which guards you added and what they caught.

#### Exploration 3 — Guard Against Failure *(goal-only)*

**Goal:** make your feature survive the AI erroring or being slow.

1. Direct the agent to handle an API error/timeout gracefully with a friendly fallback message (build on yesterday's rate-limit handling).
2. Test it if you can (ask the agent how to simulate a failure).
3. Commit. Log: what does a user see now if the AI is down, instead of a crash?

**What you should notice:** you turned a fragile demo into something that stays calm when reality gets weird. That's reliability — and it's exactly what a paying user needs.

### The Week 6 Project — "Add a Reliable AI Feature"

*Read now; scope in today's lab; build Day 4; demo Day 5.*

**Add one AI-powered feature to your app** (your Week 5 app, or a small fresh one) — summarize, categorize, draft, explain, generate a title, etc. Built with Codex, under control, and made *reliable.*

**Your spec (build exactly this):**

- The app **calls an AI API** in its back end (key kept secret) and shows the AI result in the UI.
- Has a **system prompt in code** (role + rules).
- **Guardrails:** at least one each for **bad input**, **bad output**, and **failure** (error/slow).
- **Cost awareness:** you can state roughly what a call costs + you capped input.
- Runs locally + on GitHub, no secrets committed.

**The constraints that prove control (Lane 3):**

- Review diffs; small commits; log prompts; catch one agent mistake.
- **Explain the data flow including the AI call.**
- **Name your feature's failure mode + the guardrail you built for it** (Week 2, engineered).

**How you'll be graded** (weekly rubric): *Build skill* (AI feature works + guardrails hold) · *Control* (reviewed diffs, small commits, explains the AI-inclusive data flow, cost awareness, caught a mistake) · *Demo* (show it working + explain the AI call + name failure mode & guardrail) · *Meets-the-spec* (AI call + system prompt + 3 guardrails + cost cap + on GitHub, no secrets).

**Demo Day 5:** show the AI feature + **explain the AI call in your data flow + name the failure mode and the guardrail** you built.

### Checks for Understanding

*Answer in the LMS before the workshop — tomorrow's session is built on what you write here.*

**Quiz · Free response** (`guardrails`)
Name the three places an AI feature can fail (input, output, failure) and give a realistic example of each for YOUR feature.

> Answer:

**Quiz · Free response** (`guardrails`)
From Exploration 1: what happened when you threw bad input at your feature? Which failure did you NOT expect?

> Answer:

**Quiz · Free response** (`responsible-ai`)
Why is the AI's output always a 'draft' you should guard before showing a user? Name two ways to guard output (one of them involving the system prompt). Connect to Phase 1.

> Answer:

**Quiz · Free response** (`guardrails`)
For your Week 6 project: state your feature's failure mode and the specific guardrail you'll build for it. Why does that guardrail matter for a real user?

> Answer:

### Apply / Evidence

Add to your **Prompt Log**:

1. Your feature's failure modes from Exploration 1 (your break-it list).
2. Your Exploration 2 + 3 prompts + which guardrails you added and what they caught.
3. Your Week 6 project one-liner: *your AI feature + its failure mode + your main guardrail.*

Bring your feature idea and any reliability question to the workshop.

### Resources

- **Go find one (~7 min):** search out a beginner-friendly piece on making AI features reliable / input & output validation. Skim two, keep the one that explains it more clearly, and note which you picked.
- **Reference:** your Week 2 responsible-use notes — failure modes, now engineered into guardrails.
- **Reference:** the weekly-project rubric — read the Control lane's new AI-feature requirements.

**Bring this to class: Your pre-reading notes** (optional)
- A note or takeaway:
- A question that is bubbling up:

*Previous: Tokens, Cost & Rate Limits · Next: Build Day — Add a Reliable AI Feature. To complete this day: answer the exit ticket.*

---

## Day 4: Build Day — Add a Reliable AI Feature

**Shared resources:** Student-Led Review Prep Guide. Prepare a short review that teaches yesterday's key idea back to the cohort.

> ***Build day (no new reading).*** *Build your reliable AI feature with Codex. Re-read your spec and your break-it list. Keep the controlled loop tight and your API key secret. Prompt Log open all day.*

### Day Brief

Today you build the thing this whole program is named for: **an app with AI inside it** — and not a fragile demo, a *reliable* one. Your feature calls an AI model, behaves consistently (system prompt), stays affordable (cost cap), and holds up when users get weird (guardrails).

The grade is control + reliability. A single AI feature that works, guards its failures, and that you can fully explain — including the AI call in your data flow — beats a flashier one that falls over. Remember the demo: show it working, explain the AI call, and name your failure mode + guardrail.

### Your Build Plan

Re-confirm before you start:

- **My AI feature:** ____________ (what it does for the user)
- **My system prompt (role + rule):** ____________
- **Likely failure mode:** ____________
- **My three guardrails:** input ____ / output ____ / failure ____

The spec:

1. Calls an AI API on the back end (key secret) + shows the result.
2. System prompt in code.
3. One guardrail each for bad input, bad output, failure.
4. Cost-aware (capped input; you know rough cost).
5. On GitHub, no secrets committed.

### The Build Loop (controlled loop, all day)

> ***ask → review the diff → accept → run → verify (incl. the AI output) → commit***

1. **Ask** for one piece at a time: the AI call → the system prompt → each guardrail → the cost cap.
2. **Review the diff** — find the AI call, the system prompt, the guard. Explain before accepting.
3. **Verify** — run it; **judge the AI's actual output**; try to break it and confirm the guard holds.
4. **Commit** each working piece. Key stays out of every commit.

Get the AI call working and committed before adding guardrails. Then attack it and guard what breaks.

### Control Checklist (keep this next to you)

- [ ] I reviewed every diff before accepting it.
- [ ] I can explain my data flow **including the AI call**.
- [ ] The AI feature works and I judged the output quality (not just "it ran").
- [ ] I have a guardrail for bad input, bad output, and failure.
- [ ] I capped input and know roughly what a call costs.
- [ ] My API key is git-ignored — NOT in any commit.
- [ ] Small commits + Prompt Log current + one agent mistake caught.

### When You Get Stuck

The "I'm Stuck" ladder, agent edition:

1. Read the error message.
2. Paste the exact error to Codex; ask it to explain + fix; **review the fix.**
3. Ask a peer.
4. Ask the TA.

AI-API errors are common (auth, model id, rate limit). If the agent loops, `git` back to your last working commit and take a smaller step.

### End-of-Day Self-Check (demo-ready?)

By end of day, aim to have:

- [ ] A working AI feature with a system prompt in code.
- [ ] One guardrail each for input, output, failure — tested by trying to break it.
- [ ] Cost cap in place + a rough cost figure in mind.
- [ ] Pushed to GitHub, key NOT committed.
- [ ] Data-flow (with the AI call) + failure-mode + guardrail ready to explain.
- [ ] A rough 2-minute demo in mind.

Not done? Note where you are. Day 5 opens with a short finish-up window.

*Tomorrow (Day 5) is a short day: demo your AI feature, explain the AI call, name your failure mode + guardrail, close the week. Next week is the Phase 2 gate — this is your rehearsal.*

*(Day 4 has no Checks for Understanding, Apply / Evidence, or Resources section. Finish this lesson: Exit ticket — Done, no exit ticket required; Submit your work — Needed; Mark lesson complete — Needed. Previous: Guardrails & Reliability · Next: Project Kickoff + Sprint Planning.)*
