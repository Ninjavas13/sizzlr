// --- SHUFFLE BAG ---
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
    toolInches: 6.0,
    preferredVibe: "all",
    experienceLevel: "auto",
    waterworksChoice: "auto",
    crossedPathsChoice: "auto",
    overrideHomecoming: "",
    overrideTone: ""
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
    husbandBaseline.preferredVibe = document.getElementById('cfg-vibe').value;
    husbandBaseline.experienceLevel = document.getElementById('cfg-exp-level').value;
    husbandBaseline.waterworksChoice = document.getElementById('cfg-waterworks').value;
    husbandBaseline.crossedPathsChoice = document.getElementById('cfg-crossed-paths').value;
    husbandBaseline.overrideHomecoming = document.getElementById('cfg-homecoming-override').value;
    husbandBaseline.overrideTone = document.getElementById('cfg-tone-override').value;

    toggleSettings();
    generateProfile();
}

function toggleSection(secId) {
    const card = document.getElementById(secId);
    if (card) {
        card.classList.toggle('active');
    }
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

function getWeightedOrgasm() {
    const weights = [1, 2, 4, 7, 10];
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let randomVal = Math.random() * totalWeight;
    for (let i = 0; i < data.orgasmTiers.length; i++) {
        if (randomVal < weights[i]) return data.orgasmTiers[i];
        randomVal -= weights[i];
    }
    return data.orgasmTiers[data.orgasmTiers.length - 1];
}

function generateProfileObj() {
    let availablePersonalities = data.personalities;
    if (husbandBaseline.preferredVibe && husbandBaseline.preferredVibe !== "all") {
        availablePersonalities = data.personalities.filter(p => p.vibeGroup === husbandBaseline.preferredVibe);
        if (availablePersonalities.length === 0) availablePersonalities = data.personalities;
    }
    const persona = randomItem(availablePersonalities);
    const archetypeKey = persona.type;
    const vibeGroup = persona.vibeGroup || "dominant";

    const currentSetting = randomItem(data.settingClusters) || data.settingClusters[0];
    const occupation = randomItem(currentSetting.occupations);
    const dest = randomItem(currentSetting.destinations);
    const hangout = randomItem(currentSetting.hangouts);

    let meetChoice = husbandBaseline.crossedPathsChoice;
    if (!meetChoice || meetChoice === "auto") {
        meetChoice = randomItem(data.crossedPathsOptions);
    }
    const meetStoryText = data.crossedPathsNarratives[meetChoice] || "We crossed paths unexpectedly under intense circumstances.";

    const name = decks.names.draw();
    const height = randomItem(data.heights);
    const toolLen = randomItem(data.toolLengths) || 7.5;
    const circ = randomItem(data.circumcisionStatus);
    const toolGirth = randomItem(data.toolGirths);
    const rule = randomItem(data.spousalRules);

    let syncTier;
    if (husbandBaseline.experienceLevel && husbandBaseline.experienceLevel !== "auto") {
        const lvlIdx = parseInt(husbandBaseline.experienceLevel, 10) - 1;
        syncTier = data.synchronizedTiers[Math.min(7, Math.max(0, lvlIdx))] || data.synchronizedTiers[0];
    } else {
        let eligibleTiers = data.synchronizedTiers;
        if (vibeGroup === "gentle") eligibleTiers = data.synchronizedTiers.filter(t => t.pct <= 50);
        else if (vibeGroup === "dominant") eligibleTiers = data.synchronizedTiers.filter(t => t.pct >= 50 && t.pct <= 85);
        else if (vibeGroup === "illicit") eligibleTiers = data.synchronizedTiers.filter(t => t.pct >= 65);
        syncTier = randomItem(eligibleTiers) || data.synchronizedTiers[0];
    }

    let breachModifier = vibeGroup === "illicit" ? 0.25 : (vibeGroup === "gentle" ? -0.25 : 0);
    const finalBreachProb = Math.min(0.98, Math.max(0.05, syncTier.breachProb + breachModifier));
    const didBreak = Math.random() < finalBreachProb;

    // Random round count from 1 to 4
    const roundsCount = Math.floor(Math.random() * 4) + 1;
    const chosenFlow = randomItem(data.positionFlows) || data.positionFlows[0];
    let roundsData = [];

    for (let r = 1; r <= roundsCount; r++) {
        const pos = chosenFlow[(r - 1) % chosenFlow.length];
        const roundRelease = randomItem(data.releaseOptions) || data.releaseOptions[0];
        const roundOrgasm = getWeightedOrgasm();

        roundsData.push({
            roundNum: r,
            positionName: pos.name,
            positionDesc: pos.desc,
            selectedRelease: roundRelease,
            orgasm: roundOrgasm,
            meterWidth: Math.floor(Math.random() * 25) + 75
        });
    }

    let waterworksText = syncTier.waterworks;
    if (husbandBaseline.waterworksChoice && husbandBaseline.waterworksChoice !== "auto") {
        waterworksText = husbandBaseline.waterworksChoice;
    }

    let homecoming = randomItem(data.homecomingScenarios) || data.homecomingScenarios[0];
    if (husbandBaseline.overrideHomecoming) {
        const found = data.homecomingScenarios.find(h => h.vibe === husbandBaseline.overrideHomecoming);
        if (found) homecoming = found;
    }

    let matchingInstructions = data.instructionArchetypes.filter(a => a.vibeGroup === vibeGroup);
    if (husbandBaseline.overrideTone) {
        const foundTone = data.instructionArchetypes.find(a => a.tone === husbandBaseline.overrideTone);
        if (foundTone) matchingInstructions = [foundTone];
    }
    const instArchetype = matchingInstructions.length > 0 ? randomItem(matchingInstructions) : data.instructionArchetypes[0];
    const instructionStart = randomItem(instArchetype.starts);
    const instructionEnd = randomItem(instArchetype.ends);

    const staminaRating = randomItem(data.staminaRatings);
    const recklessnessItem = randomItem(data.recklessnessScales);

    const starCount = Math.min(5, Math.max(1, Math.ceil(syncTier.pct / 20)));
    let starStr = "⭐".repeat(starCount);

    return {
        name: name,
        age: Math.floor(Math.random() * 15) + 28,
        distance: (Math.random() * 6 + 1.2).toFixed(1),
        origin: decks.origins.draw(),
        meetLocation: meetChoice,
        beard: decks.facialHairTypes.draw(),
        height: height,
        heightInches: parseHeight(height),
        style: decks.styles.draw(),
        circumcision: circ,
        toolLength: toolLen,
        toolGirth: toolGirth,
        roundsData: roundsData,
        h1: decks.hobbies.draw(),
        occupation: occupation,
        hangout: hangout,
        behavior: decks.behaviors.draw(),
        destination: dest,
        story: meetStoryText,
        role: decks.fantasyRoles.draw(),
        persona: persona,
        reaction: decks.reactions.draw(),
        toolSensation: `His ${toolLen}" ${circ} frame and ${toolGirth} left me completely undone.`,
        favTrait: randomItem(persona.favoriteTraits),
        spousalRule: rule,
        defaultDidBreak: didBreak,
        recklessness: recklessnessItem,
        staminaRating: staminaRating,
        replayInnuendo: decks.mentalReplayInnuendos.draw(),
        bullText: decks.bullTexts.draw(),
        homecoming: homecoming,
        syncTier: syncTier,
        performances: roundsCount,
        waterworks: waterworksText,
        aftermathStars: starStr,
        aftermathStarsDesc: `"${syncTier.tier} — ${syncTier.desc.replace(/Hubby/g, husbandBaseline.name)}"`,
        instructionTone: instArchetype.tone,
        instructionStart: instructionStart,
        instructionEnd: instructionEnd
    };
}

function chooseRuleBreak(broken) {
    const verdictEl = document.getElementById('p-breach-verdict');
    if (broken) {
        verdictEl.innerHTML = `<span style="color:var(--hazard-color); font-weight:800;">🚨 BROKEN BY CHOICE</span> ("You chose to abandon the agreement, throwing caution to the wind.")`;
    } else {
        verdictEl.innerHTML = `<span style="color:#00e676; font-weight:800;">🛡️ ENFORCED BY CHOICE</span> ("You stood your ground and kept boundaries firmly under control.")`;
    }
}

function renderRoundsLogistics() {
    const container = document.getElementById('p-positions-visual');
    if (!container || !currentProfile.roundsData) return;

    let logisticsList = [];
    currentProfile.roundsData.forEach((rd, idx) => {
        let releaseOptionsHtml = data.releaseOptions.map(rel => {
            const isSelected = rel.type === rd.selectedRelease.type ? 'selected' : '';
            return `<option value="${rel.type}" ${isSelected}>${rel.type}</option>`;
        }).join('');

        logisticsList.push(`
            <div style="margin-bottom:12px; background: rgba(0,0,0,0.28); padding:10px 12px; border-radius:10px; border: 1px solid rgba(255,255,255,0.06);" data-round-idx="${idx}">
                <div style="font-weight:800; color:#38bdf8; font-size:0.88rem; margin-bottom:4px; display:flex; justify-content:space-between; align-items:center;">
                    <span>ROUND ${rd.roundNum} BREAKDOWN</span>
                    <span style="font-size:0.75rem; color:var(--gold-accent);">✏️ Change Finish Location</span>
                </div>
                <div style="margin-bottom:6px;">
                    • <strong>Position (${rd.positionName}):</strong> 
                    <span style="color:#e2e8f0;">${rd.positionDesc.replace(/Hubby/g, husbandBaseline.name)}</span>
                </div>
                <div style="margin-bottom:6px; background: rgba(255,255,255,0.03); padding:6px 8px; border-radius:6px;">
                    • <strong>Release Location:</strong> 
                    <select class="round-release-dropdown" onchange="updateRoundRelease(${idx}, this.value)" style="background:#171a24; color:#fff; border:1px solid #38bdf8; border-radius:4px; padding:3px 6px; font-size:0.78rem; margin-top:2px; margin-bottom:4px; width:100%; outline:none;">
                        ${releaseOptionsHtml}
                    </select>
                    <span style="font-size:0.77rem; color:#94a3b8;" id="rel-desc-${idx}">${rd.selectedRelease.amountDesc}</span>
                    <div class="meter-bar" style="margin:4px 0 3px;">
                        <div class="meter-fill" style="width: ${rd.meterWidth}%; background: linear-gradient(90deg, #38bdf8, #818cf8, #ff3366);"></div>
                    </div>
                    <span style="font-size:0.75rem; color:#cbd5e1; font-style:italic;" id="rel-clean-${idx}">${rd.selectedRelease.cleanDesc}</span>
                </div>
                <div style="background: rgba(0,0,0,0.22); padding:6px 8px; border-radius:6px; border-left: 2px solid ${rd.orgasm.color};">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <strong style="font-size:0.75rem; text-transform:uppercase; color:#fff;">Wife Orgasm Meter:</strong>
                        <span style="font-size:0.76rem; font-weight:800; color:${rd.orgasm.color};">${rd.orgasm.label}</span>
                    </div>
                    <div class="meter-bar" style="height:5px; margin:4px 0;">
                        <div class="meter-fill" style="width: ${rd.orgasm.fill}%; background: ${rd.orgasm.color};"></div>
                    </div>
                    <span style="font-size:0.75rem; color:#f1f5f9; font-style:italic;">${rd.orgasm.desc}</span>
                </div>
            </div>
        `);
    });
    container.innerHTML = logisticsList.join("");
}

function updateRoundRelease(roundIdx, newType) {
    const found = data.releaseOptions.find(r => r.type === newType);
    if (found && currentProfile.roundsData[roundIdx]) {
        currentProfile.roundsData[roundIdx].selectedRelease = found;
        document.getElementById(`rel-desc-${roundIdx}`).innerText = found.amountDesc;
        document.getElementById(`rel-clean-${roundIdx}`).innerText = found.cleanDesc;
    }
}

function changeHomecomingVibe(vibeName) {
    const found = data.homecomingScenarios.find(h => h.vibe === vibeName);
    if (found) {
        currentProfile.homecoming = found;
        const vibeEl = document.getElementById('p-homecoming-vibe');
        vibeEl.className = `homecoming-vibe-tag ${found.tagClass}`;
        vibeEl.innerText = found.vibe;
        document.getElementById('p-homecoming-text').innerText = (found.text || '').replace(/Hubby/g, husbandBaseline.name);
    }
}

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

    // Recklessness Scale (Moved right after experience item)
    document.getElementById('p-reckless-label').innerText = profile.recklessness.level;
    document.getElementById('p-reckless-fill').style.width = `${profile.recklessness.fill}%`;
    document.getElementById('p-reckless-sub').innerText = profile.recklessness.desc;

    document.getElementById('p-waterworks').innerText = profile.waterworks;
    renderRoundsLogistics();

    document.getElementById('p-rule-text').innerText = `"${profile.spousalRule}"`;
    
    // Interactive Rule Verdict Choice UI
    document.getElementById('p-breach-verdict').innerHTML = `
        <div>Did you break this rule?</div>
        <div style="margin-top:6px; display:flex; gap:8px;">
            <button onclick="chooseRuleBreak(false)" style="background:rgba(0,230,118,0.2); color:#00e676; border:1px solid #00e676; padding:4px 10px; border-radius:6px; cursor:pointer; font-weight:700;">✅ Kept Rule</button>
            <button onclick="chooseRuleBreak(true)" style="background:rgba(255,51,102,0.2); color:var(--primary); border:1px solid var(--primary); padding:4px 10px; border-radius:6px; cursor:pointer; font-weight:700;">🚨 Broke Rule</button>
        </div>
    `;

    document.getElementById('p-aftermath-stars').innerText = profile.aftermathStars;
    document.getElementById('p-aftermath-stars-desc').innerText = profile.aftermathStarsDesc;
    
    let sorenessText = profile.syncTier.pct <= 30 ? 
        `A mild warmth from his ${profile.toolLength}" ${profile.circumcision} frame and ${profile.performances} comfortable rounds.` :
        (profile.syncTier.pct <= 65 ? `His ${profile.toolLength}" shaft and ${profile.performances} rounds left my muscles tender and stride altered.` : `An absolute systemic override. His massive ${profile.toolLength}" frame and ${profile.performances} brutal rounds left my body completely wrecked.`);
    document.getElementById('p-aftermath-soreness').innerText = sorenessText;

    const diffInches = profile.heightInches - husbandBaseline.heightInches;
    let diffLabel = diffInches > 0 ? `+${diffInches}" taller than ${husbandBaseline.name}` : (diffInches === 0 ? `Identical height to ${husbandBaseline.name}` : `Matches ${husbandBaseline.name}'s eye line`);
    document.getElementById('p-height-delta').innerText = `${profile.height} (${diffLabel})`;

    const rulerPct = Math.min(100, Math.max(0, ((profile.toolLength - 2) / 8) * 100));
    const hubbyRulerPct = Math.min(100, Math.max(0, ((husbandBaseline.toolInches - 2) / 8) * 100));
    
    document.getElementById('ruler-bar-fill').style.width = `${rulerPct}%`;
    document.getElementById('ruler-marker-line').style.left = `${rulerPct}%`;
    document.getElementById('ruler-baseline-pin').style.left = `${hubbyRulerPct}%`;

    document.getElementById('p-ruler-tag').innerText = `${profile.toolLength}"`;
    document.getElementById('p-tool-heat-sub').innerText = `Carries a ${profile.toolLength}" ${profile.circumcision} cock (${profile.toolGirth}).`;
    document.getElementById('p-tool-sensation').innerText = profile.toolSensation;

    // Stamina Rating (No round references)
    document.getElementById('p-stamina-rating-text').innerText = profile.staminaRating;

    const satGaugeFill = Math.min(100, Math.max(25, 40 + (profile.syncTier.pct * 0.6)));
    document.getElementById('p-sat-fill').style.width = `${satGaugeFill}%`;
    document.getElementById('p-sat-gauge-label').innerText = `${Math.round(satGaugeFill)}% Rating`;
    document.getElementById('p-satisfaction').innerText = `Satisfaction Verdict: ${profile.syncTier.tier}. Delivered an electric, devastating intensity.`;

    document.getElementById('p-replay-val').innerText = (profile.replayInnuendo || '').replace(/Hubby/g, husbandBaseline.name);
    document.getElementById('p-morning-text').innerText = (profile.bullText || '').replace(/Hubby/g, husbandBaseline.name);
    
    // Homecoming Vibe Selector Dropdown
    const hc = profile.homecoming;
    const vibeEl = document.getElementById('p-homecoming-vibe');
    vibeEl.className = `homecoming-vibe-tag ${hc.tagClass}`;
    vibeEl.innerText = hc.vibe;
    document.getElementById('p-homecoming-text').innerText = (hc.text || '').replace(/Hubby/g, husbandBaseline.name);
    
    const homecomingSelect = document.getElementById('homecoming-tone-select');
    if (homecomingSelect) homecomingSelect.value = hc.vibe;

    // Hubby Instructions (Original style, no typewriter bug)
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
    const pitchText = `Audition Pitch for ${husbandBaseline.name}: Bull is ${currentProfile.name} (${currentProfile.height}, ${currentProfile.occupation}). Rating: ${currentProfile.syncTier.tier}.`;
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
            <h4>${currentProfile.name}, ${currentProfile.age} (${currentProfile.role})</h4>
            <p>💼 ${currentProfile.occupation} • 📏 ${currentProfile.height} • 🔩 ${currentProfile.toolLength}"</p>
        </div>
    `;

    savedList.prepend(card);
    countSpan.innerText = savedProfiles.length;
    likeBtn.innerHTML = "🔥";
    likeBtn.disabled = true;
    likeBtn.style.opacity = "0.7";

    setTimeout(() => { generateProfile(); }, 350);
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

async function initApp() {
    try {
        const response = await fetch('content.json');
        data = await response.json();

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
