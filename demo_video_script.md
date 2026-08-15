# ImpactIQ Demo Video Script

**Target Length:** 3:00  
**Pacing:** Maintain a conversational, steady, professional mission control pace. Do not speed-read.

---

### 0:00–0:12 | Hook
*(Visual: 3D Orbit view already animating smoothly with the Sun, inner planets, and asteroid trajectory. No logo slide yet.)*

**Voiceover:**  
"Ever seen a headline that says an asteroid 'might hit Earth' and had no idea whether to actually be worried?"

---

### 0:12–0:25 | Contrast
*(Visual: Briefly show a generic chatbot screen giving a vague, ungrounded answer.)*

**Voiceover:**  
"Ask a standard chatbot and it will either trigger unnecessary panic or shrug it off — because it isn't running the real orbital math."

---

### 0:25–0:40 | Premise & 1.3M+ NASA Catalog Scale
*(Visual: Main mission control search interface. Show the search bar with live telemetry badge: `LIVE QUERY: ALL 1.3M+ NASA JPL SMALL BODIES`.)*

**Voiceover:**  
"So we built something that runs the real astrodynamic physics first, and uses AI only to explain the verified results. This is ImpactIQ. 

ImpactIQ connects directly to official NASA JPL APIs, giving instant, live access to over 1.3 million asteroids and comets tracked in our solar system."

---

### 0:40–1:35 | Single Object Deep Dive — Interactive 3D Time-Scrubber & Monte Carlo Cloud
*(Visual: Search for `101955 Bennu` (or `99942 Apophis`). Show the high-definition 3D orbital engine with Earth, Moon, inner planets, and asteroid belt. Switch camera to `TRACK ASTEROID (CLOSE UP)` to show the 3D tumbling rock. Drag the interactive Time-Scrubber forward in time and watch the Monte Carlo uncertainty cloud resolve dynamically near the Point of Closest Approach. The Torino hazard gauge and Insight Score update live.)*

**Voiceover:**  
"Let’s look at Bennu, currently on NASA's monitored watch list. 

Instead of showing a pre-baked static number, our backend runs a live Monte Carlo physics simulation on the asteroid's actual JPL covariance matrix. 

As we scrub forward along the orbital arc, you can watch the 3D uncertainty volume resolve in real time. Thousands of simulated trajectories are integrated, landing on an empirical impact probability and concrete risk score right at the exact date of close approach."

---

### 1:35–1:55 | IBM Granite Mission Brief & Guardian Trust Spine
*(Visual: Scroll to the AI Mission Brief panel. Point out the `Model: IBM Granite-8B` tag and the `Granite Guardian Verified [PASS]` seal. Click the `Inject Ungrounded Claim (Falsification Test)` button on the Guardian console to show the guardrail catching and flagging a simulated hallucination live on screen.)*

**Voiceover:**  
"We feed these structured physical parameters into an IBM Granite model to generate an executive mission brief. 

Crucially, a secondary Granite Guardian model audits the output against raw telemetry before you ever see it. With our built-in Falsification Console, you can see the Guardian actively intercept and flag fabricated claims on the spot."

---

### 1:55–2:15 | Grounded Follow-up Chat
*(Visual: Click the quick-prompt chip or type into the follow-up console: "When will radar astrometry confirm this trajectory?" The grounded, telemetry-bound answer appears.)*

**Voiceover:**  
"If you have questions, you can ask the follow-up console directly. *'When will radar astrometry confirm this trajectory?'* 

Because Granite is strictly grounded in the physical simulation context, you receive precise, hallucination-free answers based entirely on observation geometry."

---

### 2:15–2:40 | The Trust Moment (NASA JPL Sentry Ground-Truth Comparison)
*(Visual: Focus on the NASA/JPL Sentry Ground-Truth Verification card. Highlight our calculated Monte Carlo probability right next to JPL Sentry's published official probability.)*

**Voiceover:**  
"Here is the ultimate test of credibility — NASA JPL already publishes its own official impact monitoring calculations for this object. 

Look at the comparison: our live empirical calculation lands in the exact same order of magnitude as JPL's published figure. The physics engine is completely transparent and verified."

---

### 2:40–2:52 | Planetary Scale & Sentry Radar Triage
*(Visual: Click the `Sentry Multi-Object Threat Radar` button to display the autonomous multi-asteroid threat matrix across top Sentry objects like 1950 DA, Bennu, 2010 RF12, and 2000 SG344.)*

**Voiceover:**  
"And because it connects to NASA's full 1.3 million small-body catalog, it scales seamlessly to triage any near-Earth threat across the solar system."

---

### 2:52–3:00 | Mission Close
*(Visual: Clean closing mission screen with the ImpactIQ branding, team member credits, and repository link.)*

**Voiceover:**  
"We aren't trying to tell you asteroids are scary. We're giving you the physics to know whether this one actually is. Thank you."
