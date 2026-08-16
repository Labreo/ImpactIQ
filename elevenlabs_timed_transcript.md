# ImpactIQ — Master Timed TTS Voiceover Transcript

> **Purpose:** Production-ready timed script and phonetic guide formatted specifically for **ElevenLabs**, **OpenAI TTS**, **PlayHT**, **Descript**, or other Neural Text-to-Speech engines to narrate the **ImpactIQ 3-Minute Demo Video**.
>
> **Target Duration:** Exactly 3:00 (180 Seconds)  
> **Target Delivery Rate:** 130–138 Words Per Minute (Calibrated Mission-Control Pacing)  
> **Total Word Count:** 386 words  

---

## 🎙️ Section 1: ElevenLabs Voice Setup & Recommended Settings

For the most realistic, authoritative, and cinematic delivery, configure your ElevenLabs generation parameters as follows:

| Setting | Recommended Value | Why |
| :--- | :--- | :--- |
| **Recommended Voice** | **"Brian"** *(Deep, Technical, Grounded)* or **"Adam"** / **"George"** / **"Rachel"** | Delivers calm, authoritative mission-control confidence without sounding overly commercial. |
| **Model** | **Eleven Multilingual v2** or **Eleven Turbo v2.5** | Highest natural phrasing, breath simulation, and rhythm control. |
| **Stability** | **65% – 70%** | Prevents dramatic pitch jumps while maintaining steady, articulate delivery. |
| **Clarity / Similarity** | **78% – 85%** | Maximizes crisp pronunciation of scientific and astrodynamic terms. |
| **Style Exaggeration** | **12% – 18%** | Keeps the tone serious and analytical without flat robotic monotone. |
| **Speaker Boost** | **Enabled (ON)** | Enhances presence and vocal depth in the lower-mid frequencies. |

---

## 🗣️ Section 2: Pronunciation & Phonetic Guide (TTS Lexicon)

If your TTS model trips on space acronyms or specialized terminology, replace the words in the prompt with the phonetic spellings below, or add them to your ElevenLabs Pronunciation Dictionary:

| Term in Script | ElevenLabs Phonetic Replacement | Pronunciation Key |
| :--- | :--- | :--- |
| **ImpactIQ** | `Impact I-Q` | *IM-pakt Eye-Cue* |
| **NASA** | `NASA` or `NA-suh` | *NA-suh* |
| **JPL** | `J-P-L` | *Jay-Pee-Ell* |
| **SBDB** | `S-B-D-B` or `Small-Body Database` | *Ess-Bee-Dee-Bee* |
| **NeoWs** | `N-E-O-W-S` or `NEE-oh-wise` | *N-E-O-W-S* |
| **Bennu** | `BEN-oo` | *BEN-oo* |
| **Apophis** | `uh-POFF-iss` | *uh-POFF-iss* |
| **Torino** | `tuh-REE-noh` | *tuh-REE-noh* |
| **Palermo** | `puh-LAIR-moh` | *puh-LAIR-moh* |
| **hapsira** | `hap-SEER-uh` | *hap-SEER-uh* |
| **AU** | `A-U` or `Astronomical Units` | *Ay-You* |
| **Granite** | `GRAN-it` | *GRAN-it* |
| **Monte Carlo** | `MAHN-tee KAR-loh` | *MAHN-tee KAR-loh* |
| **1.3M+** | `one point three million` | *one point three million* |
| **P(i)** | `P of I` or `impact probability` | *Pee-of-Eye* |

---

## ⏱️ Section 3: Master Timed Audio-Visual Storyboard

Use this table during video recording and editing to synchronize screen interactions, camera angles, and sound effects with the voiceover.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 00:00               00:40                             01:55             02:40   03:00  │
│   HOOK & CONTRAST     │     INTERACTIVE 3D PHYSICS      │   AI GOVERNANCE │ SCALE & CLOSE │
│     (38s / 21%)       │          (75s / 42%)            │    (45s / 25%)  │  (22s / 12%)  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

| Timecode | Segment & Tone | Visual & Screen Action (UI Screencast) | Audio Cues & FX | Narration / TTS Line |
| :--- | :--- | :--- | :--- | :--- |
| **00:00 – 00:12** *(12s)* | **The Hook**<br>*Intriguing, Calm, Direct* | Start directly on the live **3D Solar System Canvas**. The camera orbits the glowing Sun and inner planetary rings (Mercury, Venus, Earth, Mars). A golden asteroid trajectory arcs across the screen. No generic intro splash. | Subtle space ambient drone + distant radio telemetry hum. | "Ever seen a headline that says an asteroid *might* hit Earth... and had no idea whether to actually be worried?" |
| **00:12 – 00:25** *(13s)* | **The Contrast**<br>*Slightly Skeptical, Grounded* | Split-screen or brief popup showing a generic AI chatbot prompt: *"Will asteroid Apophis destroy Earth in 2029?"* The chatbot answers with alarmist, ungrounded speculation. | Soft digital glitch sound. | "Ask a standard chatbot, and it will either trigger unnecessary panic or shrug it off... because it isn't running the real orbital math." |
| **00:25 – 00:42** *(17s)* | **The Premise & Scale**<br>*Authoritative, Confident* | Cut to the **ImpactIQ Mission Control Header**. Show the search bar with live telemetry badges: `LIVE QUERY: ALL 1.3M+ NASA JPL SMALL BODIES`. Cursor hovers over target selector pills. | Crispy UI telemetry click sound (`playTelemetryClick`). | "So we built something that runs the real astrodynamic physics first... and uses A-I only to explain the verified results. This is Impact I-Q. <break time=\"0.4s\" /> Impact I-Q connects directly to official NASA J-P-L data, giving instant access to over 1.3 million asteroids and comets tracked in our solar system." |
| **00:42 – 01:08** *(26s)* | **Deep Dive: Bennu**<br>*Dynamic, Analytical* | Search and select **`101955 Bennu`**. The 3D canvas smoothly transitions. Switch camera mode to `TRACK ASTEROID (CLOSE-UP)`. The textured 3D asteroid rock tumbles against deep space starfield. | Computation sweep sound (`playComputationSweep`) followed by soft thruster pan. | "Let’s look at Bennu, currently on NASA's monitored watch list. <break time=\"0.5s\" /> Instead of showing a pre-baked static number, our backend runs a live Monte Carlo physics simulation on the asteroid's actual J-P-L covariance matrix." |
| **01:08 – 01:35** *(27s)* | **3D Time-Scrubber & MC Cloud**<br>*Engaged, Precise* | Drag the interactive **Time-Scrubber** along the timeline towards the close-approach year. A 3D volumetric **Monte Carlo Uncertainty Cloud** (sampled trajectory bundle) expands and resolves near Earth's orbit. The Torino gauge (0) and ImpactIQ Index update dynamically. | Scrubber tick audio (`playScrubberTick`) followed by radar ping. | "As we scrub forward along the orbital arc, you can watch the 3D uncertainty volume resolve in real time. Thousands of simulated trajectories are integrated, landing on an empirical impact probability and concrete risk score right at the exact date of close approach." |
| **01:35 – 01:55** *(20s)* | **Granite Brief & Trust Spine**<br>*Executive, Clear, Rigorous* | Smooth scroll to the **AI Mission Brief Panel**. Highlight the `Model: IBM Granite-8B` tag and `Granite Guardian [Verified PASS]` seal. Expand the structured tabs: *01 Orbit Assessment*, *02 Atmospheric Hydrodynamics*, *03 Astrometric Radar Plan*. | High-frequency telemetry confirmation beep. | "We feed these structured physical parameters into an IBM Granite model to generate an executive mission brief. <break time=\"0.4s\" /> Crucially, a secondary Granite Guardian model audits the output against raw telemetry before you ever see it, ensuring every single claim is strictly grounded." |
| **01:55 – 02:15** *(20s)* | **Grounded Q&A Terminal**<br>*Interactive, Conversational* | Click the prompt chip in the Q&A terminal: *"When will radar astrometry confirm this trajectory?"* The live pulse animation fires, and IBM Granite returns a verified, telemetry-grounded answer based on Goldstone and Arecibo historical optical arcs. | Terminal keypress click + Radar ping (`playRadarPing`). | "If you have questions, you can ask the follow-up console directly: <break time=\"0.3s\" /> *'When will radar astrometry confirm this trajectory?'* <break time=\"0.4s\" /> Because Granite is strictly grounded in the physical simulation context, you receive precise, hallucination-free answers based entirely on observation geometry." |
| **02:15 – 02:40** *(25s)* | **The Trust Moment**<br>*Authoritative, Convincing, High Impact* | Zoom in on the **JPL Sentry Ground-Truth Verification Card**. Point cursor to `Our Calculated P(i)` (e.g., `2.70e-4`) displayed right next to `JPL Sentry Official P(i)` (`2.71e-4`) with the green `[MATCH]` badge. | Sub-bass impact swell / validation chime. | "Here is the ultimate test of credibility... NASA J-P-L already publishes its own official impact monitoring calculations for this object. <break time=\"0.5s\" /> Look at the comparison: our live empirical calculation lands in the exact same order of magnitude as J-P-L's published figure. The physics engine is completely transparent and verified." |
| **02:40 – 02:52** *(12s)* | **Planetary Scale & Sentry Radar**<br>*Expansive, Fast-Paced* | Click `Sentry Threat Radar` button. The multi-asteroid threat radar matrix expands across top monitored bodies: *1950 DA*, *Apophis*, *2010 RF12*, *2000 SG344*. | Radar sweep scan sound effect. | "And because it connects to NASA's full 1.3 million small-body catalog, it scales seamlessly to triage any near-Earth threat across the solar system." |
| **02:52 – 03:00** *(8s)* | **Closing Punchline**<br>*Warm, Memorable, Inspiring* | Wide cinematic camera pull-back showing Earth illuminated against the Sun, with the ImpactIQ branding, live web link (`impact-iq-silk.vercel.app`), and GitHub repository URL. Fade to black. | Gentle musical resolution / fade out. | "We aren't trying to tell you asteroids are scary. We're giving you the physics to know whether this one actually is. <break time=\"0.5s\" /> Thank you." |

---

## 📋 Section 4: Individual TTS Generation Blocks (Copy & Paste Ready)

If generating audio clip-by-clip in ElevenLabs Speech Synthesis to match video cuts in your timeline, copy each block below directly into ElevenLabs:

### Block 1: The Hook & Chatbot Contrast (0:00 – 0:25)
```text
Ever seen a headline that says an asteroid might hit Earth, and had no idea whether to actually be worried? 

Ask a standard chatbot, and it will either trigger unnecessary panic or shrug it off... because it isn't running the real orbital math.
```

### Block 2: Premise & 1.3M NASA Catalog Scale (0:25 – 0:42)
```text
So we built something that runs the real astrodynamic physics first, and uses A-I only to explain the verified results. This is Impact I-Q.

Impact I-Q connects directly to official NASA J-P-L data, giving instant access to over 1.3 million asteroids and comets tracked in our solar system.
```

### Block 3: Deep Dive — 3D Time-Scrubber & Monte Carlo Cloud (0:42 – 1:35)
```text
Let’s look at Bennu, currently on NASA's monitored watch list.

Instead of showing a pre-baked static number, our backend runs a live Monte Carlo physics simulation on the asteroid's actual J-P-L covariance matrix.

As we scrub forward along the orbital arc, you can watch the 3D uncertainty volume resolve in real time. Thousands of simulated trajectories are integrated, landing on an empirical impact probability and concrete risk score right at the exact date of close approach.
```

### Block 4: IBM Granite Mission Brief & Guardian Trust Spine (1:35 – 1:55)
```text
We feed these structured physical parameters into an IBM Granite model to generate an executive mission brief.

Crucially, a secondary Granite Guardian model audits the output against raw telemetry before you ever see it, ensuring every single claim is strictly grounded.
```

### Block 5: Grounded Interactive Q&A Terminal (1:55 – 2:15)
```text
If you have questions, you can ask the follow-up console directly: "When will radar astrometry confirm this trajectory?"

Because Granite is strictly grounded in the physical simulation context, you receive precise, hallucination-free answers based entirely on observation geometry.
```

### Block 6: The Trust Moment — NASA Sentry Comparison (2:15 – 2:40)
```text
Here is the ultimate test of credibility. NASA J-P-L already publishes its own official impact monitoring calculations for this object.

Look at the comparison: our live empirical calculation lands in the exact same order of magnitude as J-P-L's published figure. The physics engine is completely transparent and verified.
```

### Block 7: Multi-Object Scale & Mission Close (2:40 – 3:00)
```text
And because it connects to NASA's full 1.3 million small-body catalog, it scales seamlessly to triage any near-Earth threat across the solar system.

We aren't trying to tell you asteroids are scary. We're giving you the physics to know whether this one actually is. Thank you.
```

---

## ⚡ Section 5: Full Continuous Master Script (One-Shot ElevenLabs Generation)

If generating the entire 3-minute voiceover in a **single take** in ElevenLabs (or ElevenLabs Projects / Reader), paste this exact pre-formatted text block with built-in natural pause punctuation:

```text
Ever seen a headline that says an asteroid might hit Earth... and had no idea whether to actually be worried?

Ask a standard chatbot, and it will either trigger unnecessary panic or shrug it off — because it isn't running the real orbital math.

So we built something that runs the real astrodynamic physics first, and uses A-I only to explain the verified results. This is Impact I-Q.

Impact I-Q connects directly to official NASA J-P-L data, giving instant access to over 1.3 million asteroids and comets tracked in our solar system.

Let’s look at Bennu, currently on NASA's monitored watch list.

Instead of showing a pre-baked static number, our backend runs a live Monte Carlo physics simulation on the asteroid's actual J-P-L covariance matrix.

As we scrub forward along the orbital arc, you can watch the 3D uncertainty volume resolve in real time. Thousands of simulated trajectories are integrated, landing on an empirical impact probability and concrete risk score right at the exact date of close approach.

We feed these structured physical parameters into an IBM Granite model to generate an executive mission brief.

Crucially, a secondary Granite Guardian model audits the output against raw telemetry before you ever see it, ensuring every single claim is strictly grounded.

If you have questions, you can ask the follow-up console directly: "When will radar astrometry confirm this trajectory?"

Because Granite is strictly grounded in the physical simulation context, you receive precise, hallucination-free answers based entirely on observation geometry.

Here is the ultimate test of credibility. NASA J-P-L already publishes its own official impact monitoring calculations for this object.

Look at the comparison: our live empirical calculation lands in the exact same order of magnitude as J-P-L's published figure. The physics engine is completely transparent and verified.

And because it connects to NASA's full 1.3 million small-body catalog, it scales seamlessly to triage any near-Earth threat across the solar system.

We aren't trying to tell you asteroids are scary. We're giving you the physics to know whether this one actually is.

Thank you.
```

---

## 🎞️ Section 6: Synchronized Subtitles / Captions (.SRT Format)

Import this ready-to-use subtitle track into Premiere Pro, DaVinci Resolve, Final Cut Pro, or CapCut:

```srt
1
00:00:01,000 --> 00:00:06,200
Ever seen a headline that says an asteroid might hit Earth...

2
00:00:06,400 --> 00:00:11,800
and had no idea whether to actually be worried?

3
00:00:12,200 --> 00:00:17,500
Ask a standard chatbot, and it will either trigger unnecessary panic or shrug it off...

4
00:00:17,800 --> 00:00:23,900
because it isn't running the real orbital math.

5
00:00:25,000 --> 00:00:30,500
So we built something that runs the real astrodynamic physics first...

6
00:00:30,800 --> 00:00:35,200
and uses AI only to explain the verified results. This is ImpactIQ.

7
00:00:35,500 --> 00:00:41,200
ImpactIQ connects directly to official NASA JPL data,

8
00:00:41,400 --> 00:00:47,500
giving instant access to over 1.3 million asteroids and comets tracked in our solar system.

9
00:00:48,000 --> 00:00:52,800
Let’s look at Bennu, currently on NASA's monitored watch list.

10
00:00:53,200 --> 00:00:58,000
Instead of showing a pre-baked static number,

11
00:00:58,200 --> 00:01:04,500
our backend runs a live Monte Carlo physics simulation on the asteroid's actual JPL covariance matrix.

12
00:01:05,000 --> 00:01:11,500
As we scrub forward along the orbital arc, you can watch the 3D uncertainty volume resolve in real time.

13
00:01:12,000 --> 00:01:18,200
Thousands of simulated trajectories are integrated, landing on an empirical impact probability

14
00:01:18,500 --> 00:01:24,000
and concrete risk score right at the exact date of close approach.

15
00:01:25,000 --> 00:01:31,000
We feed these structured physical parameters into an IBM Granite model to generate an executive mission brief.

16
00:01:31,500 --> 00:01:37,200
Crucially, a secondary Granite Guardian model audits the output against raw telemetry before you ever see it,

17
00:01:37,500 --> 00:01:42,500
ensuring every single claim is strictly grounded.

18
00:01:43,000 --> 00:01:48,000
If you have questions, you can ask the follow-up console directly:

19
00:01:48,200 --> 00:01:53,800
"When will radar astrometry confirm this trajectory?"

20
00:01:54,200 --> 00:02:00,500
Because Granite is strictly grounded in the physical simulation context,

21
00:02:00,800 --> 00:02:07,000
you receive precise, hallucination-free answers based entirely on observation geometry.

22
00:02:07,800 --> 00:02:13,200
Here is the ultimate test of credibility.

23
00:02:13,500 --> 00:02:19,500
NASA JPL already publishes its own official impact monitoring calculations for this object.

24
00:02:20,000 --> 00:02:26,000
Look at the comparison: our live empirical calculation lands in the exact same order of magnitude

25
00:02:26,200 --> 00:02:30,800
as JPL's published figure.

26
00:02:31,000 --> 00:02:36,500
The physics engine is completely transparent and verified.

27
00:02:37,000 --> 00:02:43,000
And because it connects to NASA's full 1.3 million small-body catalog,

28
00:02:43,200 --> 00:02:49,500
it scales seamlessly to triage any near-Earth threat across the solar system.

29
00:02:50,000 --> 00:02:54,200
We aren't trying to tell you asteroids are scary.

30
00:02:54,500 --> 00:02:59,000
We're giving you the physics to know whether this one actually is.

31
00:02:59,200 --> 00:03:00,000
Thank you.
```

---

## 💡 Quick Tips for Audio-Video Assembly

1. **Pacing:** Let pauses breathe naturally. Never compress speech by 1.25x or rush through the JPL Sentry comparison moment.
2. **Music Ducking:** Set your background music track to **-22 dB** under the speech track, and duck it by an additional **-4 dB** during narration so the technical diction is crisp.
3. **Sound FX Sync:** Layer subtle telemetry sound effects (such as the clicks and radar pings already built into `frontend/src/utils/audioFx.ts`) whenever buttons are clicked or simulations finish rendering.
