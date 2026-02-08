
# 🗣️ YapYap - Social Vibe Playground

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Tech](https://img.shields.io/badge/Powered%20By-Google%20Gemini-8E75B2)
![Status](https://img.shields.io/badge/Status-Beta-orange)

**YapYap** is a gamified social simulator designed to help you practice small talk, master the "vibe," and conquer social anxiety using real-time voice AI.

---

## 💡 The "Why" (Project Philosophy)

> "Many people aren't 'bad' at small talk—they just freeze up. They don't know how to start, they fear the awkward silence, or they panic about how to leave."

YapYap was built on a simple premise: **Social skills are a muscle, not a personality trait.**

For introverts, the socially anxious, or anyone who dreads the phrase *"So, what do you do?"*, this app provides a **zero-risk sandbox**. 
*   **No Judgment:** Practice with an AI that simulates real human awkwardness, enthusiasm, or boredom.
*   **Gamified Feedback:** Watch your "Social Battery" drain or recharge based on how well you engage.
*   **Real Skills:** Learn actionable techniques (Openers, Continuers, Closers) derived from social psychology.

---

## 🚀 Features

*   **🎙️ Real-time Voice Conversation:** Powered by Google's **Gemini Multimodal Live API**, interact with NPCs naturally. No typing, just talking.
*   **🎭 Diverse Scenarios:** 
    *   *The Party "Orphan"* (Approaching strangers)
    *   *The Elevator Pitch* (High-stakes brevity)
    *   *The Uber Ride* (Handling trapped conversations)
    *   *The Gym Regular* (Respecting boundaries)
*   **⚡ The Vibe Engine:** A background AI agent analyzes your speech patterns in real-time.
    *   *Vibing/Flowing:* Boosts your score.
    *   *Awkward/Painful:* Drains your energy bar.
*   **📊 Post-Game Analysis:** Get a detailed breakdown of your performance, including:
    *   Did you use open-ended questions?
    *   Did you act like an "FBI Agent" (interrogator)?
    *   Did you exit the conversation gracefully?

---

## 🛠️ Tech Stack

*   **Frontend:** React 19, TypeScript, Vite
*   **Styling:** Tailwind CSS (Cyberpunk/Retro-futurist aesthetic)
*   **AI Core:** `@google/genai` SDK
    *   **NPC Agent:** `gemini-2.5-flash-native-audio` (Low latency voice)
    *   **Judge Agent:** `gemini-2.5-flash` (Async text analysis)
*   **Audio:** Web Audio API (Raw PCM stream processing)

---

## 🏗️ Architecture

YapYap uses a **Dual-Agent Architecture** to simulate social pressure:

1.  **The Actor (Live Client):** Focuses purely on roleplay. It has instructions *never* to break character or give advice. It simply reacts to you.
2.  **The Judge (Async Sidecar):** Silently observes the transcript. It evaluates your "Vibe" (Engagement, Empathy, Flow) and updates the UI (Energy Bar) without interrupting the audio stream.

---

## 📦 Getting Started

### Prerequisites
*   Node.js (v18+)
*   A Google AI Studio API Key (Paid tier required for Live API or verify free tier limits)

### Installation

1.  Clone the repo:
    ```bash
    git clone https://github.com/yourusername/yapyap.git
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up your environment variables:
    *   Create a `.env` file (or let the app prompt you).
    *   You need a `VITE_API_KEY` (or `process.env.API_KEY` depending on your build setup).

4.  Run the dev server:
    ```bash
    npm run dev
    ```

---

## 🎮 How to Play

1.  **Select a Scenario:** Choose a difficulty level and context (e.g., "Old Friend Encounter").
2.  **Choose Duration:** Speed Round (1 min) or Standard (3 mins).
3.  **Speak:** The connection opens immediately. Say hello!
4.  **Watch the Battery:** 
    *   If it turns **Green**, you are engaging well.
    *   If it turns **Red**, you are losing the NPC's interest. Change the topic!
5.  **Exit:** Try to end the conversation naturally before the timer runs out.

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
