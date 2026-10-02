// --- SHUFFLE BAG (Guarantees zero repeats until pool is exhausted) ---
class Deck {
    constructor(items) {
        this.original = items ? [...items] : [];
        this.pile = [];
    }
    draw() {
        if (!this.original || this.original.length === 0) return null;
        if (this.pile.length === 0) {
            this.pile = [...this.original];
            for (let i = this.pile.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [this.pile[i], this.pile[j]] = [this.pile[j], this.pile[i]];
            }
        }
        return this.pile.pop();
    }
}

let husbandBaseline = {
    name: "Hubby",
    heightInches: 71,
    stamina: "1 solid round a night",
    toolText: "6\" but thick",
    toolInches: 6.0
};

let data = {};
let decks = {};
let currentProfile = {};
let savedProfiles = [];

function parseHeight(htStr) {
    if (!htStr) return 72;
    const parts = htStr.replace(/"/g, '').split("'");
    return parseInt(parts[0], 10) * 12 + parseInt(parts[1] || '0', 10);
}

function randomItem(arr) {
    if (!arr || arr.length === 0) return "";
    return arr[Math.floor(Math.random() * arr.length)];
}

function toggleSettings() {
    const modal = document.getElementById('settings-modal');
    if (modal) modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
}

function applySettings() {
    husbandBaseline.name = document.getElementById('cfg-name').value || "Hubby";
    husbandBaseline.heightInches = parseInt(document.getElementById('cfg-height').value, 10);
    husbandBaseline.stamina = document.getElementById('cfg-stamina').value;
    husbandBaseline.toolText = document.getElementById('cfg-tool').value;
    husbandBaseline.toolInches = parseFloat(document.getElementById('cfg-tool-inches').value) || 6.0;
    
    toggleSettings();
    
    // Update dynamic ruler pin positions immediately upon applying settings
    if (currentProfile && currentProfile.name) {
        renderProfile(currentProfile);
    }
}

function toggleSection(secId) {
    const card = document.getElementById(secId);
    if (card) card.classList.toggle('active');
}

function buildRulerTicks() {
    const container = document.getElementById('ruler-ticks-row');
    if (!container) return;
    container.innerHTML = "";
    for (let i = 2; i <= 10; i++) {
        const tick = document.createElement('div');
        tick.className = 'tick-mark major';
        const label = document.createElement('span');
        label.className = 'tick-label';
        label.innerText = i + '"';
        tick.appendChild(label);
        container.appendChild(tick);

        if (i < 10) {
            const half = document.createElement('div');
            half.className = 'tick-mark';
            container.appendChild(half);
        }
    }
}

// --- DYNAMIC GRAMMAR BUILDERS ---

function buildDynamicStory(bullName, meetLoc, dest, archetypeKey) {
    const g = data.storyGrammar;
    if (!g) return "";
    const introTpl = randomItem(g.intros);
    const tensionPool = (g.tensions && g.tensions[archetypeKey]) ? g.tensions[archetypeKey] : g.tensions["Shadow-Wielder"];
    const tensionTpl = randomItem(tensionPool);
    const pivotTpl = randomItem(g.pivots);

    const part1 = introTpl.replace(/{NAME}/g, bullName).replace(/{LOCATION}/g, meetLoc);
    const part2 = tensionTpl.replace(/{NAME}/g, bullName);
    const part3 = pivotTpl.replace(/{NAME}/g, bullName).replace(/{DEST}/g, dest);

    return `${part1} ${part2} ${part3}`;
}

function buildDynamicHardware(toolLen, circ, toolGirth, hubbyName, archetypeKey, bullName) {
    const g = data.hardwareGrammar;
    if (!g) return "";
    const cmpTpl = randomItem(g.comparisons);
    const mechPool = (g.mechanics && g.mechanics[archetypeKey]) ? g.mechanics[archetypeKey] : g.mechanics["Shadow-Wielder"];
    const mechTpl = randomItem(mechPool);
    const reactTpl = randomItem(g.reactions);

    const part1 = cmpTpl.replace(/{HUBBY}/g, hubbyName);
    const part2 = mechTpl
        .replace(/{NAME}/g, bullName)
        .replace(/{LEN}/g, toolLen)
        .replace(/{CIRC}/g, circ)
        .replace(/{GIRTH}/g, toolGirth);
    const part3 = reactTpl.replace(/{HUBBY}/g, hubbyName);

    return `${part1} ${part2} ${part3}`;
}

// --- SYNCHRONIZED PROFILE GENERATOR ---

function generateProfileObj() {
    // 1. Core Persona Archetype Anchor
    const persona = decks.personalities.draw();
    const archetypeKey = persona.type;
    const vibeGroup = persona.vibeGroup || "dominant";

    // 2. Coherent Setting Clusters (Enforces strict narrative flow: luxury meets luxury, retreat meets retreat)
    const currentSetting = randomItem(data.settingClusters) || data.settingClusters[0];
    const occupation = randomItem(currentSetting.occupations);
    const meet = randomItem(currentSetting.meets);
    const dest = randomItem(currentSetting.destinations);
    const hangout = randomItem(currentSetting.hangouts);

    // 3. Physical Specs & Spousal Baseline
    const name = decks.names.draw();
    const height = randomItem(data.heights);
    const toolLen = randomItem(data.toolLengths) || 7.5;
    const circ = randomItem(data.circumcisionStatus);
    const toolGirth = randomItem(data.toolGirths);
    const rule = randomItem(data.spousalRules);

    // 4. Coordinated Satisfaction Tier (Filter by Persona Vibe)
    let eligibleTiers = data.synchronizedTiers;
    if (vibeGroup === "gentle") {
        eligibleTiers = data.synchronizedTiers.filter(t => t.pct <= 50);
    } else if (vibeGroup === "dominant") {
        eligibleTiers = data.synchronizedTiers.filter(t => t.pct >= 50 && t.pct <= 85);
    } else if (vibeGroup === "illicit") {
        eligibleTiers = data.synchronizedTiers.filter(t => t.pct >= 65);
    }
    const syncTier = randomItem(eligibleTiers) || data.synchronizedTiers[0];

    // 5. Rule Breach Probability Driven by Tone
    let breachModifier = 0;
    if (vibeGroup === "illicit") breachModifier = 0.25;
    if (vibeGroup === "gentle") breachModifier = -0.25;
    const finalBreachProb = Math.min(0.98, Math.max(0.05, syncTier.breachProb + breachModifier));

    const didBreak = Math.random() < finalBreachProb;
    const breachVerdict = didBreak
        ? `<span style="color:var(--hazard-color); font-weight:800;">🚨 BROKEN WITHOUT HESITATION</span> ("${name}'s dominance made our agreement completely impossible to enforce.")`
        : `<span style="color:#00e676; font-weight:800;">🛡️ Kept Under Control</span> ("Tempted to fold, but enforced boundaries before things went too far.")`;

    // 6. Round-by-Round Breakdown & Finish Logistics
    const roundsCount = syncTier.rounds || 2;
    const chosenFlow = randomItem(data.positionFlows) || data.positionFlows[0];
    let logisticsList = [];
    let recordedReleases = [];

    for (let r = 1; r <= roundsCount; r++) {
        const pos = chosenFlow[(r - 1) % chosenFlow.length];

        let candidateReleases = data.releaseOptions;
        if (rule.toLowerCase().includes("protection") && !didBreak) {
            candidateReleases = data.releaseOptions.filter(rel => rel.type.includes("condom"));
        } else if (vibeGroup === "gentle") {
            candidateReleases = data.releaseOptions.filter(rel => !rel.type.includes("ass") && !rel.type.includes("everywhere"));
        } else if (vibeGroup === "illicit") {
            candidateReleases = data.releaseOptions.filter(rel => rel.type.includes("ass") || rel.type.includes("vagina") || rel.type.includes("everywhere"));
        }

        const roundRelease = randomItem(candidateReleases) || data.releaseOptions[0];
        recordedReleases.push(roundRelease.type);

        const roundOrgasm = randomItem(data.orgasmTiers) || data.orgasmTiers[2];
        const meterWidth = Math.floor(Math.random() * 25) + 75;

        logisticsList.push(`
            <div style="margin-bottom:12px; background: rgba(0,0,0,0.28); padding:10px 12px; border-radius:10px; border: 1px solid rgba(255,255,255,0.06);">
                <div style="font-weight:800; color:#38bdf8; font-size:0.88rem; margin-bottom:4px;">ROUND ${r} BREAKDOWN</div>
                <div style="margin-bottom:6px;">
                    • <strong>Position (${pos.name}):</strong> 
                    <span style="color:#e2e8f0;">${pos.desc.replace(/Hubby/g, husbandBaseline.name)}</span>
                </div>
                <div style="margin-bottom:6px; background: rgba(255,255,255,0.03); padding:6px 8px; border-radius:6px;">
                    • <strong>Release Location:</strong> <span style="color:#ff6b81; font-weight:700;">${roundRelease.type}</span><br>
                    <span style="font-size:0.77rem; color:#94a3b8;">${roundRelease.amountDesc}</span>
                    <div class="meter-bar" style="margin:4px 0 3px;">
                        <div class="meter-fill" style="width: ${meterWidth}%; background: linear-gradient(90deg, #38bdf8, #818cf8, #ff3366);"></div>
                    </div>
                    <span style="font-size:0.75rem; color:#cbd5e1; font-style:italic;">${roundRelease.cleanDesc}</span>
                </div>
                <div style="background: rgba(0,0,0,0.22); padding:6px 8px; border-radius:6px; border-left: 2px solid ${roundOrgasm.color};">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <strong style="font-size:0.75rem; text-transform:uppercase; color:#fff;">Wife Orgasm Meter:</strong>
                        <span style="font-size:0.76rem; font-weight:800; color:${roundOrgasm.color};">${roundOrgasm.label}</span>
                    </div>
                    <div class="meter-bar" style="height:5px; margin:4px 0;">
                        <div class="meter-fill" style="width: ${roundOrgasm.fill}%; background: ${roundOrgasm.color};"></div>
                    </div>
                    <span style="font-size:0.75rem; color:#f1f5f9; font-style:italic;">${roundOrgasm.desc}</span>
                </div>
            </div>
        `);
    }

    // 7. Homecoming Scenario (Tied to final release)
    const finalRelease = recordedReleases[recordedReleases.length - 1] || "";
    let matchingHomecomings = data.homecomingScenarios.filter(h => {
        if (finalRelease.includes("vagina") || finalRelease.includes("ass")) {
            return h.text.toLowerCase().includes("inside") || h.tagClass === "vibe-nasty";
        }
        if (vibeGroup === "gentle") return h.tagClass === "vibe-nice";
        if (vibeGroup === "dominant") return h.tagClass === "vibe-cruel";
        return h.tagClass === "vibe-nasty";
    });
    const homecoming = randomItem(matchingHomecomings) || data.homecomingScenarios[0];

    // 8. Husband Audio Instructions (Tied to Vibe Group)
    const matchingInstructions = data.instructionArchetypes.filter(a => a.vibeGroup === vibeGroup);
    const instArchetype = matchingInstructions.length > 0 ? randomItem(matchingInstructions) : data.instructionArchetypes[0];
    const instructionStart = randomItem(instArchetype.starts);
    const instructionEnd = randomItem(instArchetype.ends);

    // 9. Procedural Stories & Physical Reports
    const story = buildDynamicStory(name, meet, dest, archetypeKey);
    const toolSensation = buildDynamicHardware(toolLen, circ, toolGirth, husbandBaseline.name, archetypeKey, name);

    const starCount = Math.min(5, Math.max(1, Math.ceil(syncTier.pct / 20)));
    let starStr = "⭐".repeat(starCount);

    return {
        name: name,
        age: Math.floor(Math.random() * 15) + 28,
        distance: (Math.random() * 6 + 1.2).toFixed(1),
        origin: decks.origins.draw(),
        meetLocation: meet,
        beard: decks.facialHairTypes.draw(),
        height: height,
        heightInches: parseHeight(height),
        style: decks.styles.draw(),
        circumcision: circ,
        toolLength: toolLen,
        toolGirth: toolGirth,
        logisticsHtml: logisticsList.join(""),
        h1: decks.hobbies.draw(),
        occupation: occupation,
        hangout: hangout,
        behavior: decks.behaviors.draw(),
        destination: dest,
        story: story,
        role: decks.fantasyRoles.draw(),
        persona: persona,
        reaction: decks.reactions.draw(),
        toolSensation: toolSensation,
        favTrait: randomItem(persona.favoriteTraits),
        spousalRule: rule,
        breachVerdict: breachVerdict,
        replayInnuendo: decks.mentalReplayInnuendos.draw(),
        bullText: decks.bullTexts.draw(),
        homecoming: homecoming,
        syncTier: syncTier,
        performances: roundsCount,
        stamina: syncTier.staminaDesc,
        waterworks: syncTier.waterworks,
        breedHazard: syncTier.hazard,
        aftermathStars: starStr,
        aftermathStarsDesc: `"${syncTier.tier} — ${syncTier.desc.replace(/Hubby/g, husbandBaseline.name)}"`,
        instructionTone: instArchetype.tone,
        instructionStart: instructionStart,
        instructionEnd: instructionEnd
    };
}

// --- RENDER CARD VIEW ---

function renderProfile(profile) {
    if (!profile || !profile.name) return;
    currentProfile = profile;

    document.getElementById('p-name').innerText = profile.name;
    document.getElementById('p-age').innerText = profile.age;
    document.getElementById('p-origin').innerText = profile.origin;
    document.getElementById('p-distance').innerText = `${profile.distance} miles away`;
    document.getElementById('p-candidate-tag').innerText = profile.role;
    document.getElementById('p-persona-tag').innerText = profile.persona.type;

    document.getElementById('p-tags').innerHTML = `
        <div class="tag">💼 ${profile.occupation}</div>
        <div class="tag">📏 ${profile.height}</div>
        <div class="tag">✂️ ${profile.circumcision}</div>
        <div class="tag">🧔 ${profile.beard}</div>
        <div class="tag">🎯 ${profile.h1}</div>
    `;

    document.getElementById('p-vibe-summary').innerHTML = `
        <strong>Archetype:</strong> ${profile.behavior}.<br>
        <strong>Wardrobe:</strong> ${profile.style}.<br>
        <strong>Cruising at:</strong> ${profile.hangout}.
    `;

    document.querySelectorAll('.lbl-hubby-name').forEach(el => el.innerText = husbandBaseline.name);
    document.getElementById('p-target-husband').innerText = husbandBaseline.name;
    document.getElementById('p-hubby-name-pin').innerText = husbandBaseline.name;

    document.getElementById('p-story').innerText = profile.story;
    document.getElementById('p-reaction').innerText = profile.reaction;
    document.getElementById('p-fav-trait').innerText = profile.favTrait;

    document.getElementById('p-exp-tier').innerText = profile.syncTier.tier;
    document.getElementById('p-exp-fill').style.width = `${profile.syncTier.pct}%`;
    document.getElementById('p-exp-desc').innerText = (profile.syncTier.desc || '').replace(/Hubby/g, husbandBaseline.name);

    document.getElementById('p-waterworks').innerText = profile.waterworks;
    document.getElementById('p-positions-visual').innerHTML = profile.logisticsHtml;

    document.getElementById('p-rule-text').innerText = `"${profile.spousalRule}"`;
    document.getElementById('p-breach-verdict').innerHTML = profile.breachVerdict;

    document.getElementById('p-aftermath-stars').innerText = profile.aftermathStars;
    document.getElementById('p-aftermath-stars-desc').innerText = profile.aftermathStarsDesc;
    
    // Dynamic Aftermath Soreness scaling based on tier intensity
    let sorenessText = "";
    if (profile.syncTier.pct <= 30) {
        sorenessText = `A mild, pleasant warmth from his ${profile.toolLength}" ${profile.circumcision} frame and ${profile.performances} comfortable rounds. Walked home feeling refreshed with zero lingering discomfort.`;
    } else if (profile.syncTier.pct <= 60) {
        sorenessText = `His ${profile.toolLength}" ${profile.circumcision} shaft and ${profile.performances} steady rounds left my muscles pleasantly tender and my posture subtly altered all morning.`;
    } else if (profile.syncTier.pct <= 85) {
        sorenessText = `His heavy ${profile.toolLength}" ${profile.circumcision} caliber and ${profile.performances} relentless rounds left my hips deeply bruised, my thighs aching, and my stride visibly altered for days.`;
    } else {
        sorenessText = `An absolute systemic override. His massive ${profile.toolLength}" ${profile.circumcision} frame and ${profile.performances} brutal rounds left my body completely wrecked, my legs shaking, and my soul thoroughly claimed.`;
    }
    document.getElementById('p-aftermath-soreness').innerText = sorenessText;

    const diffInches = profile.heightInches - husbandBaseline.heightInches;
    let diffLabel = "";
    if (diffInches > 0) diffLabel = `+${diffInches}" taller than ${husbandBaseline.name}`;
    else if (diffInches === 0) diffLabel = `Identical height to ${husbandBaseline.name}`;
    else diffLabel = `Matches ${husbandBaseline.name}'s eye line`;
    document.getElementById('p-height-delta').innerText = `${profile.height} (${diffLabel})`;

    // Dynamic Ruler Scale Calculations (Fixes hardcoded 50% pin bug)
    const rulerPct = Math.min(100, Math.max(0, ((profile.toolLength - 2) / 8) * 100));
    const hubbyRulerPct = Math.min(100, Math.max(0, ((husbandBaseline.toolInches - 2) / 8) * 100));
    
    document.getElementById('ruler-bar-fill').style.width = `${rulerPct}%`;
    document.getElementById('ruler-marker-line').style.left = `${rulerPct}%`;
    
    const baselinePin = document.getElementById('ruler-baseline-pin');
    if (baselinePin) baselinePin.style.left = `${hubbyRulerPct}%`;

    document.getElementById('p-ruler-tag').innerText = `${profile.toolLength}" (${profile.toolLength > husbandBaseline.toolInches ? '+' + (profile.toolLength - husbandBaseline.toolInches).toFixed(1) + '" over ' + husbandBaseline.name : 'Matches ' + husbandBaseline.name})`;
    document.getElementById('p-tool-heat-sub').innerText = `Carries a ${profile.toolLength}" ${profile.circumcision} cock (${profile.toolGirth}).`;
    document.getElementById('p-tool-sensation').innerText = profile.toolSensation;

    const enginePct = (profile.performances / 4) * 100;
    document.getElementById('p-engine-fill').style.width = `${enginePct}%`;
    document.getElementById('p-engine-gauge-label').innerText = `${profile.performances} / 4 Rounds`;
    document.getElementById('p-engine-summary').innerText = `${profile.performances} round${profile.performances > 1 ? 's' : ''} (${profile.stamina})`;

    const satGaugeFill = Math.min(100, Math.max(25, 40 + (profile.syncTier.pct * 0.6)));
    document.getElementById('p-sat-fill').style.width = `${satGaugeFill}%`;
    document.getElementById('p-sat-gauge-label').innerText = `${Math.round(satGaugeFill)}% Rating`;
    document.getElementById('p-satisfaction').innerText = `Satisfaction Verdict: ${profile.syncTier.tier}. Completely shattered my standard expectations — delivered an electric, devastating intensity that renders routine married life tame.`;

    document.getElementById('p-breed-label').innerText = profile.breedHazard.level;
    document.getElementById('p-breed-fill').style.width = `${profile.breedHazard.fill}%`;
    document.getElementById('p-breed-sub').innerText = profile.breedHazard.desc;

    document.getElementById('p-replay-val').innerText = (profile.replayInnuendo || '').replace(/Hubby/g, husbandBaseline.name);
    document.getElementById('p-morning-text').innerText = (profile.bullText || '').replace(/Hubby/g, husbandBaseline.name);
    
    const hc = profile.homecoming;
    const vibeEl = document.getElementById('p-homecoming-vibe');
    vibeEl.className = `homecoming-vibe-tag ${hc.tagClass}`;
    vibeEl.innerText = hc.vibe;
    document.getElementById('p-homecoming-text').innerText = (hc.text || '').replace(/Hubby/g, husbandBaseline.name);

    document.getElementById('p-instruction-tone').innerText = profile.instructionTone;
    const instructionBody = `
        <p style="margin-bottom:10px;">"${profile.instructionStart.replace(/Hubby/g, husbandBaseline.name)}"</p>
        <div style="font-size:0.82rem; color:var(--text-muted); font-style:italic; margin:8px 0; padding:6px 10px; background:rgba(0,0,0,0.25); border-radius:6px; border-left:2px solid var(--primary);">
            [She traces the thumbprints left on her hips, quietly describing how effortlessly ${profile.name} controlled her cadence while ${husbandBaseline.name} obeys.]
        </div>
        <p style="margin-top:10px;">"${profile.instructionEnd.replace(/Hubby/g, husbandBaseline.name)}"</p>
    `;
    document.getElementById('p-instruction-text').innerHTML = instructionBody;

    const likeBtn = document.getElementById('like-btn');
    likeBtn.innerHTML = "❤️";
    likeBtn.disabled = false;
    likeBtn.style.opacity = "1";

    const pitchBtn = document.getElementById('pitch-btn');
    pitchBtn.innerHTML = "🍸";
    pitchBtn.disabled = false;

    document.getElementById('toast-banner').style.display = 'none';
}

function generateProfile() {
    try {
        renderProfile(generateProfileObj());
        const card = document.getElementById('profile-card');
        if (card) card.scrollTop = 0;
    } catch (err) {
        console.error("Profile generation error:", err);
    }
}

function pitchCandidate() {
    const toast = document.getElementById('toast-banner');
    const pitchText = `Audition Pitch for ${husbandBaseline.name}: Bull is ${currentProfile.name} (${currentProfile.height}, ${currentProfile.occupation}, ${currentProfile.persona.type}). Rating: ${currentProfile.syncTier.tier}. Cock Size: ${currentProfile.toolLength}" (${currentProfile.circumcision}). Rule Status: ${currentProfile.breachVerdict}. Grant hall pass?`;
    
    toast.innerHTML = `<strong>Proposal Dispatched to Partner!</strong><br>${pitchText}`;
    toast.style.display = 'block';

    const pitchBtn = document.getElementById('pitch-btn');
    pitchBtn.innerHTML = "✔️";
    pitchBtn.disabled = true;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(pitchText).catch(() => {});
    }
}

function saveProfile() {
    const savedSection = document.getElementById('saved-section');
    const savedList = document.getElementById('saved-list');
    const countSpan = document.getElementById('saved-count');
    const likeBtn = document.getElementById('like-btn');

    savedProfiles.unshift(currentProfile);
    savedSection.style.display = 'block';

    const card = document.createElement('div');
    card.className = 'saved-card';
    card.innerHTML = `
        <div class="saved-avatar"><span style="font-size: 1.2rem;">🔥</span></div>
        <div class="saved-info">
            <h4>${currentProfile.name}, ${currentProfile.age} (${currentProfile.role} • ${currentProfile.persona.type})</h4>
            <p>💼 ${currentProfile.occupation} • 📏 ${currentProfile.height} • 🔩 ${currentProfile.toolLength}" (${currentProfile.circumcision})</p>
            <p>⭐ ${currentProfile.syncTier.tier} | 🏠 ${currentProfile.homecoming.vibe}</p>
        </div>
    `;

    savedList.prepend(card);
    countSpan.innerText = savedProfiles.length;

    likeBtn.innerHTML = "🔥";
    likeBtn.disabled = true;
    likeBtn.style.opacity = "0.7";

    setTimeout(() => {
        generateProfile();
    }, 350);
}

function superLike() {
    const card = document.getElementById('profile-card');
    card.style.transition = "transform 0.3s ease";
    card.style.transform = "scale(1.03) translateY(-10px)";
    setTimeout(() => {
        card.style.transform = "none";
        saveProfile();
    }, 200);
}

// --- BOOTSTRAP INITIALIZATION ---
async function initApp() {
    try {
        const response = await fetch('content.json');
        data = await response.json();

        // Populate shuffle decks
        decks.names = new Deck(data.names);
        decks.personalities = new Deck(data.personalities);
        decks.facialHairTypes = new Deck(data.facialHairTypes);
        decks.origins = new Deck(data.origins);
        decks.styles = new Deck(data.styles);
        decks.hobbies = new Deck(data.hobbies);
        decks.behaviors = new Deck(data.behaviors);
        decks.fantasyRoles = new Deck(data.fantasyRoles);
        decks.reactions = new Deck(data.reactions);
        decks.bullTexts = new Deck(data.bullTexts);
        decks.mentalReplayInnuendos = new Deck(data.mentalReplayInnuendos);

        buildRulerTicks();
        generateProfile();
    } catch (e) {
        console.error("Initialization failure while loading content.json:", e);
    }
}

window.onload = initApp;
