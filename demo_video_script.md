# ImpactIQ Demo Video Script

**Target Length:** < 3:00  
**Pacing:** Maintain a conversational, steady pace. Do not speed-read.

---

### 0:00–0:12 | Hook (12 seconds)
*(Visual: Cold open. Start with the 3D orbit view of an asteroid already animating towards Earth. No logo slide yet.)*

**Voiceover:**  
"Ever seen a headline that says an asteroid 'might hit Earth' and had no idea whether to actually be worried?"

### 0:12–0:25 | The Failure Mode (13 seconds)
*(Visual: Briefly show a generic AI chat screen giving a vague answer, then quickly transition back to the ImpactIQ dashboard showing raw data processing.)*

**Voiceover:**  
"Ask a standard chatbot, and it’ll either panic you or shrug it off — because it's not actually running the numbers. It’s just guessing based on text."

### 0:25–0:35 | The Premise & Name (10 seconds)
*(Visual: The title "ImpactIQ" fades in smoothly over the starry background, then we transition into the main search dashboard.)*

**Voiceover:**  
"So we built something that runs the real physics first, and only lets AI explain what the physics actually found. This is ImpactIQ."

### 0:35–1:50 | One Object, Start to Finish (75 seconds)
*(Visual: Mouse clicks on "Bennu" from the Sentry watch-list quick-select. The screen transitions to Bennu's dashboard. Show the 3D orbit propagating, the Monte Carlo cloud appearing, and the Risk Score landing. Finally, scroll down to the AI Mission Brief panel.)*

**Voiceover:**  
"Let’s look at Bennu, an object currently on NASA’s Sentry watch list. 

When I select it, ImpactIQ pulls live orbital elements from JPL’s database. But instead of just plotting one path, our backend runs a Monte Carlo simulation — sampling thousands of possible trajectories to find the actual probability of Earth impact. 

We take that empirical data, combine it with a kinetic energy consequence model, and feed those structured numbers into an IBM Granite model on watsonx.ai. 

Instead of a raw data table, we get this: a calibrated, plain-English mission brief. Notice how it says *'Monitoring is required'* — the AI’s language exactly matches the Torino scale risk calculated by our physics engine."

### 1:50–2:20 | The Trust Moment (30 seconds)
*(Visual: Zoom in on the Monte Carlo probability metric, then split the screen or hover to show JPL Sentry's published probability for Bennu right next to our computed probability.)*

**Voiceover:**  
"But here is the part that actually matters. Anyone can generate a random number. JPL already publishes their own impact probability for Bennu using a supercomputer. 

Watch this: our Monte Carlo engine, running live in the browser, lands in the exact same order of magnitude as JPL’s official numbers. And because the Granite model is strictly guarded by a secondary prompt, it won't invent statistics or pretend to be more certain than the data allows."

### 2:20–2:40 | Payoff & Audience (20 seconds)
*(Visual: Zoom out to show the full dashboard — Orbit, Risk Metrics, Consequence, and Brief — beautifully laid out.)*

**Voiceover:**  
"In seconds, we turned raw Keplerian elements into a 0-to-100 Insight Score and a clear narrative. This is built for science communicators, journalists, and anyone who has ever seen an asteroid headline and wondered exactly how worried they should be."

### 2:40–3:00 | Mission Close (20 seconds)
*(Visual: Fade to a clean closing screen with the ImpactIQ logo, team members' names, and a GitHub link.)*

**Voiceover:**  
"ImpactIQ doesn't just display space data; it translates it. 

Built by the Meteor Rizzlers for the IBM AI Builders Challenge. Thank you."
