# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: demo-journey.spec.ts >> Smart Krishi-Yatra AI Demo Journey >> Farmer Journey: calculation, delay injection, and re-optimization
- Location: tests\demo-journey.spec.ts:4:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /What will you actually earn/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: /What will you actually earn/i })

```

```yaml
- button "System History"
- button "Mini Game"
- button "Fullscreen"
- text: 📂 Paper Archive — Dashboard
- button "Back"
- button "Forward"
- text: 📂 Paper Archive / Dashboard
- button "Grid view"
- button "List view"
- textbox "Search papers..."
- complementary:
  - text: Favorites
  - link "🏠 Dashboard":
    - /url: /dashboard
  - link "📁 Study Hub":
    - /url: /papers
  - link "🗺️ Roadmap":
    - /url: /roadmap
  - link "🏆 Leaderboard":
    - /url: /leaderboard
  - link "💬 Forum":
    - /url: /forum
  - link "👥 Community":
    - /url: /community
  - text: Account
  - link "🔑 Sign In":
    - /url: /login
  - link "Terms":
    - /url: /terms
  - link "Privacy":
    - /url: /privacy
  - link "Honor Code":
    - /url: /honor-code
- main:
  - text: Paper Archive v2 Online
  - heading "Find the right file, fast." [level=1]
  - paragraph: 0 resources · 0 active users
  - textbox "Search past papers, notes, syllabi..."
  - button "Search"
  - link "🎮 Discord":
    - /url: https://discord.gg/your_discord_invite
  - link "WhatsApp":
    - /url: https://chat.whatsapp.com/your-invite
  - text: 📁 0 Resources 👥 0 Users
  - heading "Quick Access" [level=2]
  - link "📁 Study Hub PAPERS":
    - /url: /papers
  - link "📄 Past Papers EXAMS":
    - /url: /papers?type=PAPER
  - link "📓 Notes NOTES":
    - /url: /papers?type=NOTE
  - link "🗺️ Roadmap ROADMAP":
    - /url: /roadmap
  - link "💬 Forum FORUM":
    - /url: /forum
  - link "🏆 Leaderboard RANKS":
    - /url: /leaderboard
  - link "👥 Community PEOPLE":
    - /url: /community
  - heading "Recently Added" [level=2]
  - link "View All":
    - /url: /papers
  - text: Name Type Uploaded by Date ⚠️ Connection Error Failed to load recent uploads.
- text: Made with locally Dashboard | Paper Archive v2.0 |
- link "MIT License":
  - /url: /legal
- button "AI Tutor"
```