let currentStep = 0;
let journeyTime = 0;
let budget = 5;
let circumstance = null;
let routeChoice = "";
let exploredCircumstances = [];

const directJourneyTime = 22;
const appointmentDeadline = 9 * 60 + 30;
const departureTime = 8 * 60 + 30;

const circumstances = [
    {
        id: "accessibility",
        name: "An accessibility barrier",
        description: "Parts of your route may not be physically accessible to you."
    },
    {
        id: "information",
        name: "An information barrier",
        description: "Important information about your route isn't always easy to find or understand."
    },
    {
        id: "budget",
        name: "A limited budget",
        description: "You need to complete your journey while keeping costs as low as possible."
    }
];

// ------------------------------
// TIME AND DISPLAY HELPERS
// ------------------------------

function varyTime(minutes) {
    if (minutes <= 0) return minutes;

    return Math.max(0, minutes + Math.floor(Math.random() * 5) - 2);
}

function formatTime(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function getPanel() {
    return document.getElementById("journey-panel-content");
}

function updateStatus() {
    const directTime = currentStep >= 3 ? directJourneyTime : 0;
    const totalMinutes = departureTime + directTime + journeyTime;

    const timeDisplay = document.getElementById("time-display");
    const budgetDisplay = document.getElementById("budget-display");

    if (timeDisplay) {
        timeDisplay.textContent = formatTime(totalMinutes);
    }

    if (budgetDisplay) {
        budgetDisplay.textContent = `€${budget.toFixed(2)}`;
    }
}

function updateProgress() {
    const counter = document.getElementById("stage-counter");
    const fill = document.getElementById("progress-fill");

    if (counter) {
        counter.textContent = `${Math.min(currentStep, 7)} / 7`;
    }

    if (fill) {
        const percentage = Math.max(
            0,
            Math.min(100, ((currentStep - 1) / 6) * 100)
        );

        fill.style.width = `${percentage}%`;
    }

    document.querySelectorAll(".stage").forEach((stage, index) => {
        stage.classList.remove("active", "completed");

        if (index < currentStep - 1) {
            stage.classList.add("completed");
        }

        if (index === currentStep - 1) {
            stage.classList.add("active");
        }
    });
}

// ------------------------------
// SAVED CIRCUMSTANCES
// ------------------------------

function loadExploredCircumstances() {
    try {
        const saved = localStorage.getItem("experienceExchangeExplored");
        const parsed = saved ? JSON.parse(saved) : [];

        exploredCircumstances = Array.isArray(parsed)
            ? parsed.filter(id => circumstances.some(item => item.id === id))
            : [];
    } catch (error) {
        exploredCircumstances = [];
    }
}

function saveExploredCircumstance() {
    if (!circumstance) return;

    if (!exploredCircumstances.includes(circumstance.id)) {
        exploredCircumstances.push(circumstance.id);
    }

    try {
        localStorage.setItem(
            "experienceExchangeExplored",
            JSON.stringify(exploredCircumstances)
        );
    } catch (error) {
        console.warn("Could not save explored circumstances.", error);
    }
}

// ------------------------------
// CIRCUMSTANCE SELECTION
// ------------------------------

function chooseCircumstance() {
    loadExploredCircumstances();

    const unexplored = circumstances.filter(
        item => !exploredCircumstances.includes(item.id)
    );

    const pool = unexplored.length > 0 ? unexplored : circumstances;

    circumstance = pool[Math.floor(Math.random() * pool.length)];
}

function startJourney() {
    currentStep = 0;
    journeyTime = 0;
    budget = 5;
    circumstance = null;
    routeChoice = "";

    updateStatus();
    updateProgress();

    const panel = getPanel();

    if (!panel) {
        console.error("Missing element: #journey-panel-content");
        return;
    }

    panel.innerHTML = `
        <p class="eyebrow">YOUR JOURNEY — BEFORE YOU BEGIN</p>

        <h2>One destination. Different circumstances.</h2>

        <p>
            You need to reach your destination. Your journey starts at 08:30,
            and you have €5 available (or €2 in the limited-budget scenario).
        </p>

        <p>
            Along the way, you'll make decisions about your route.
            Some may cost time or money; others involve uncertainty or finding an alternative.
        </p>

        <h3>Choose the circumstance you want to explore.</h3>

        <button class="choice-button" onclick="selectCircumstance('accessibility')">
            <strong>An accessibility barrier</strong>
            <span>Parts of your route may not be accessible.</span>
        </button>

        <button class="choice-button" onclick="selectCircumstance('information')">
            <strong>An information barrier</strong>
            <span>Some route information is unclear or difficult to find.</span>
        </button>

        <button class="choice-button" onclick="selectCircumstance('budget')">
            <strong>A limited budget</strong>
            <span>You need to keep your travel costs low.</span>
        </button>

        <button class="choice-button" onclick="selectRandomCircumstance()">
            <strong>Surprise me</strong>
            <span>Let the site choose a circumstance you haven't explored yet.</span>
        </button>
    `;
}

function selectCircumstance(id) {
    circumstance = circumstances.find(item => item.id === id) || null;

    if (circumstance) {
        showCircumstance();
    }
}

function selectRandomCircumstance() {
    chooseCircumstance();
    showCircumstance();
}

function showCircumstance() {
    if (!circumstance) return;

    currentStep = 2;
    journeyTime = 0;
    budget = circumstance.id === "budget" ? 2 : 5;
    routeChoice = "";

    updateStatus();
    updateProgress();

    const panel = getPanel();

    if (!panel) {
        console.error("Missing element: #journey-panel-content");
        return;
    }

    panel.innerHTML = `
        <p class="eyebrow">02 — YOUR CIRCUMSTANCE</p>

        <h2>${circumstance.name}</h2>

        <p>${circumstance.description}</p>

        <p>
            This scenario focuses on one possible barrier. It cannot represent
            everyone's experiences, but it can help you consider how circumstances
            affect everyday choices.
        </p>

        <button class="choice-button" onclick="makeChoice(0, 0)">
            <strong>Continue your journey</strong>
            <span>See how your circumstances affect your options.</span>
        </button>

        <button class="choice-button" onclick="startJourney()">
            <strong>Choose a different circumstance</strong>
            <span>Return to the circumstance selection.</span>
        </button>
    `;
}

// ------------------------------
// POLICE ENCOUNTER
// ------------------------------

function checkPoliceEncounter() {
    if (budget >= 0) return false;
    if (Math.random() >= 0.15) return false;

    showPoliceCaught();
    return true;
}

function showPoliceCaught() {
    saveExploredCircumstance();

    currentStep = 7;

    updateStatus();
    updateProgress();

    const panel = getPanel();
    if (!panel) return;

    panel.innerHTML = `
        <p class="eyebrow">07 — AN UNEXPECTED ENDING</p>

        <h2>You've been stopped.</h2>

        <p>
            Your balance dropped below €0, and you were caught travelling
            without enough money for the fare. This outcome is random:
            it was a 15% chance after a choice made while your balance was negative.
        </p>

        <div class="result-message">
            <h2>Same destination. Different journey.</h2>

            <p>
                A limited budget can affect more than the route you choose.
                It can add uncertainty and consequences to an already difficult journey.
            </p>

            <p class="exploration-count">
                ${exploredCircumstances.length} / ${circumstances.length}
                circumstances explored
            </p>
        </div>

        <div style="margin-top: 35px;">
            <button class="choice-button" onclick="startJourney()">
                <strong>Choose another journey</strong>
                <span>Try another circumstance or let the site choose.</span>
            </button>
        </div>
    `;
}

// ------------------------------
// CHOICE HANDLING
// ------------------------------

function makeChoice(timeAdded, moneyChange = 0) {
    journeyTime += varyTime(timeAdded);
    budget += moneyChange;

    updateStatus();

    // Don't render another stage if the unexpected ending appears.
    if (checkPoliceEncounter()) return;

    currentStep++;

    updateStatus();
    updateProgress();

    showNextStage();
}

// ------------------------------
// JOURNEY STAGES
// ------------------------------

function showNextStage() {
    const panel = getPanel();

    if (!panel || !circumstance) {
        console.error("Cannot show the next stage: panel or circumstance is missing.");
        return;
    }

    // STAGE 3 — PLAN

    if (currentStep === 3) {
        if (circumstance.id === "budget") {
            panel.innerHTML = `
                <p class="eyebrow">03 — YOUR PLAN</p>
                <h2>How will you get there?</h2>

                <p>
                    Your quickest route isn't necessarily the easiest choice
                    when money is limited.
                </p>

                <button class="choice-button" onclick="routeChoice='cheap'; makeChoice(8, 0)">
                    <strong>Take the cheaper route</strong>
                    <span>Save money, but spend more time. +8 min · €0</span>
                </button>

                <button class="choice-button" onclick="routeChoice='fast'; makeChoice(3, -2)">
                    <strong>Take the faster connection</strong>
                    <span>Arrive sooner, but spend €2. +3 min · −€2</span>
                </button>

                <button class="choice-button" onclick="routeChoice='walk'; makeChoice(12, 0)">
                    <strong>Walk part of the way</strong>
                    <span>Avoid paying for another connection. +12 min · €0</span>
                </button>
            `;
        } else if (circumstance.id === "information") {
            panel.innerHTML = `
                <p class="eyebrow">03 — YOUR PLAN</p>
                <h2>How will you find your route?</h2>

                <p>
                    The route information available to you isn't completely clear.
                </p>

                <button class="choice-button" onclick="routeChoice='careful'; makeChoice(8, 0)">
                    <strong>Work it out yourself</strong>
                    <span>Compare the information. +8 min · €0</span>
                </button>

                <button class="choice-button" onclick="routeChoice='help'; makeChoice(5, 0)">
                    <strong>Ask someone for help</strong>
                    <span>Find someone who can explain the route. +5 min · €0</span>
                </button>

                <button class="choice-button" onclick="routeChoice='uncertain'; makeChoice(3, 0)">
                    <strong>Follow the first route you find</strong>
                    <span>It looks quick, but you're not sure. +3 min · €0</span>
                </button>
            `;
        } else {
            panel.innerHTML = `
                <p class="eyebrow">03 — YOUR PLAN</p>
                <h2>How will you get to the station?</h2>

                <p>The most direct route isn't fully accessible.</p>

                <button class="choice-button" onclick="routeChoice='accessible'; makeChoice(8, 0)">
                    <strong>Find an accessible route</strong>
                    <span>Take a longer route you can use. +8 min · €0</span>
                </button>

                <button class="choice-button" onclick="routeChoice='assistance'; makeChoice(5, 0)">
                    <strong>Ask for assistance</strong>
                    <span>See whether another route is available. +5 min · €0</span>
                </button>

                <button class="choice-button" onclick="routeChoice='direct'; makeChoice(3, 0)">
                    <strong>Try the direct route</strong>
                    <span>It's faster, but accessibility is uncertain. +3 min · €0</span>
                </button>
            `;
        }

        return;
    }

    // STAGE 4 — ROUTE

    if (currentStep === 4) {
        if (circumstance.id === "budget") {
            panel.innerHTML = `
                <p class="eyebrow">04 — YOUR ROUTE</p>
                <h2>The route changes.</h2>

                <p>
                    Your planned connection isn't available.
                    The alternatives have different costs.
                </p>

                <button class="choice-button" onclick="makeChoice(8, 0)">
                    <strong>Take the free alternative</strong>
                    <span>Longer, but costs nothing. +8 min · €0</span>
                </button>

                <button class="choice-button" onclick="makeChoice(5, -1)">
                    <strong>Pay for another connection</strong>
                    <span>Save some time, but spend €1. +5 min · −€1</span>
                </button>

                <button class="choice-button" onclick="makeChoice(10, 0)">
                    <strong>Wait for your original route</strong>
                    <span>Don't spend anything, but lose time. +10 min · €0</span>
                </button>
            `;
        } else if (circumstance.id === "information") {
            panel.innerHTML = `
                <p class="eyebrow">04 — YOUR ROUTE</p>
                <h2>The route changes.</h2>

                <p>
                    The information about your connection doesn't match
                    what you expected.
                </p>

                <button class="choice-button" onclick="makeChoice(8, 0)">
                    <strong>Check the information again</strong>
                    <span>Make sure you're on the right route. +8 min · €0</span>
                </button>

                <button class="choice-button" onclick="makeChoice(5, 0)">
                    <strong>Ask someone</strong>
                    <span>Get help finding the correct connection. +5 min · €0</span>
                </button>

                <button class="choice-button" onclick="makeChoice(3, 0)">
                    <strong>Trust the information you have</strong>
                    <span>Keep moving despite the uncertainty. +3 min · €0</span>
                </button>
            `;
        } else {
            panel.innerHTML = `
                <p class="eyebrow">04 — YOUR ROUTE</p>
                <h2>The route changes.</h2>

                <p>
                    Your planned route isn't working as expected.
                    The alternatives aren't equally accessible.
                </p>

                <button class="choice-button" onclick="makeChoice(8, 0)">
                    <strong>Find an accessible alternative</strong>
                    <span>Take a longer route that you can use. +8 min · €0</span>
                </button>

                <button class="choice-button" onclick="makeChoice(5, 0)">
                    <strong>Ask for assistance</strong>
                    <span>Check whether help is available. +5 min · €0</span>
                </button>

                <button class="choice-button" onclick="makeChoice(10, 0)">
                    <strong>Wait for the route to become usable</strong>
                    <span>Stay where you are for now. +10 min · €0</span>
                </button>
            `;
        }

        return;
    }

    // STAGE 5 — PROBLEM

    if (currentStep === 5) {
        if (circumstance.id === "budget") {
            panel.innerHTML = `
                <p class="eyebrow">05 — ANOTHER OBSTACLE</p>
                <h2>You need to make another choice.</h2>
                <p>Your balance is €${budget.toFixed(2)}. A new travel expense appears, and you still need to reach your destination.</p>

                <button class="choice-button" onclick="makeChoice(7, 0)">
                    <strong>Choose the no-cost option</strong>
                    <span>Spend more time instead of money. +7 min · €0</span>
                </button>

                <button class="choice-button" onclick="makeChoice(4, -1)">
                    <strong>Pay for the more direct option</strong>
                    <span>Save time, but spend another €1. +4 min · −€1</span>
                </button>

                <button class="choice-button" onclick="makeChoice(9, 0)">
                    <strong>Look for another alternative</strong>
                    <span>Try to avoid an additional cost. +9 min · €0</span>
                </button>
            `;
        } else if (circumstance.id === "information") {
            panel.innerHTML = `
                <p class="eyebrow">05 — ANOTHER OBSTACLE</p>
                <h2>You aren't sure where to go next.</h2>
                <p>The signs and travel information leave room for interpretation.</p>

                <button class="choice-button" onclick="makeChoice(7, 0)">
                    <strong>Stop and check the signs</strong>
                    <span>Take time to confirm your direction. +7 min · €0</span>
                </button>

                <button class="choice-button" onclick="makeChoice(5, 0)">
                    <strong>Ask a staff member or passer-by</strong>
                    <span>Try to get clearer directions. +5 min · €0</span>
                </button>

                <button class="choice-button" onclick="makeChoice(3, 0)">
                    <strong>Continue based on your best guess</strong>
                    <span>Keep moving, with some uncertainty. +3 min · €0</span>
                </button>
            `;
        } else {
            panel.innerHTML = `
                <p class="eyebrow">05 — ANOTHER OBSTACLE</p>
                <h2>Not every part of the journey is accessible.</h2>
                <p>You encounter another barrier and need to decide how to respond.</p>

                <button class="choice-button" onclick="makeChoice(8, 0)">
                    <strong>Use a different accessible route</strong>
                    <span>Take the longer option. +8 min · €0</span>
                </button>

                <button class="choice-button" onclick="makeChoice(6, 0)">
                    <strong>Ask for assistance</strong>
                    <span>See if someone can help you continue. +6 min · €0</span>
                </button>

                <button class="choice-button" onclick="makeChoice(10, 0)">
                    <strong>Wait for an accessible option</strong>
                    <span>Pause and see what becomes available. +10 min · €0</span>
                </button>
            `;
        }

        return;
    }

    // STAGE 6 — DECISION

    if (currentStep === 6) {
        const late = departureTime + directJourneyTime + journeyTime > appointmentDeadline;

        const timingText = late
            ? "Your estimated arrival is after the 09:30 appointment deadline."
            : "Your estimated arrival is before the 09:30 appointment deadline.";

        panel.innerHTML = `
            <p class="eyebrow">06 — YOUR DECISION</p>
            <h2>Do you continue?</h2>

            <p>
                ${timingText}
                Your current balance is €${budget.toFixed(2)}.
                Think about the trade-offs you've faced so far.
            </p>

            <button class="choice-button" onclick="makeChoice(4, 0)">
                <strong>Continue to the destination</strong>
                <span>Make one final effort to reach the appointment. +4 min · €0</span>
            </button>

            <button class="choice-button" onclick="makeChoice(2, -1)">
                <strong>Choose a faster connection</strong>
                <span>Spend €1 to reduce the remaining travel time. +2 min · −€1</span>
            </button>

            <button class="choice-button" onclick="makeChoice(8, 0)">
                <strong>Take the more cautious option</strong>
                <span>Avoid extra costs and take your time. +8 min · €0</span>
            </button>
        `;
        return;
    }

    // STAGE 7 — ARRIVAL

    if (currentStep === 7) {
        saveExploredCircumstance();
        updateStatus();
        updateProgress();

        const arrival = departureTime + directJourneyTime + journeyTime;
        const arrivedLate = arrival > appointmentDeadline;

        panel.innerHTML = `
            <p class="eyebrow">07 — ARRIVAL</p>

            <h2>
                ${arrivedLate
                    ? "You arrive after the deadline."
                    : "You reach your destination."}
            </h2>

            <p>
                Your estimated arrival time is
                <strong>${formatTime(arrival)}</strong>.
                Your remaining budget is
                <strong>€${budget.toFixed(2)}</strong>.
            </p>

            <p>
                ${arrivedLate
                    ? "The journey took longer than planned. The barriers and decisions along the way affected your arrival."
                    : "You made it before the deadline, but the journey still required choices and compromises."}
            </p>

            <button class="choice-button" onclick="showResults()">
                <strong>View your results</strong>
                <span>Reflect on the circumstance and the choices you made.</span>
            </button>
        `;
        return;
    }

    // SAFE FALLBACK

    panel.innerHTML = `
        <p class="eyebrow">JOURNEY COMPLETE</p>
        <h2>Your journey has ended.</h2>

        <button class="choice-button" onclick="showResults()">
            <strong>View your results</strong>
        </button>
    `;
}

// ------------------------------
// RESULTS AND REFLECTION
// ------------------------------

function showResults() {
    if (!circumstance) return;

    saveExploredCircumstance();

    currentStep = 7;

    updateStatus();
    updateProgress();

    const panel = getPanel();

    if (!panel) return;

    const arrival = departureTime + directJourneyTime + journeyTime;
    const arrivedLate = arrival > appointmentDeadline;

    const reflections = {
        accessibility: {
            heading: "Accessibility affects more than the route.",
            text: "An inaccessible connection can add waiting, extra travel time, and dependence on assistance. A route that works for one traveller may not work for another. Accessibility needs to be considered throughout the journey, not only at the destination."
        },

        information: {
            heading: "Reliable information is part of access.",
            text: "Unclear or inconsistent information can make a journey stressful and time-consuming. People may need to ask for help, double-check directions, or make decisions without certainty. Clear, current, understandable information helps people travel with greater independence."
        },

        budget: {
            heading: "A limited budget changes the choices available.",
            text: "When money is tight, a faster route may not be affordable. Choosing a free option can mean spending more time, and unexpected costs can push a traveller into a negative balance. This simulation is simplified, but it illustrates how financial constraints can create additional uncertainty and trade-offs."
        }
    };

    const reflection = reflections[circumstance.id] || reflections.information;

    panel.innerHTML = `
        <p class="eyebrow">YOUR JOURNEY — RESULTS</p>

        <h2>${reflection.heading}</h2>

        <p>${reflection.text}</p>

        <div class="result-message">
            <h3>Your journey summary</h3>

            <p>
                <strong>Circumstance:</strong>
                ${circumstance.name}
            </p>

            <p>
                <strong>Estimated arrival:</strong>
                ${formatTime(arrival)}
                ${arrivedLate ? "(after the deadline)" : "(before the deadline)"}
            </p>

            <p>
                <strong>Time spent on the journey:</strong>
                ${journeyTime} minutes of added travel time
            </p>

            <p>
                <strong>Remaining budget:</strong>
                €${budget.toFixed(2)}
            </p>
        </div>

        <p class="exploration-count">
            ${exploredCircumstances.length} / ${circumstances.length}
            circumstances explored
        </p>

        <p>
            Consider: which choice had the greatest effect on your journey?
            Would the same options be available to everyone?
        </p>

        <button class="choice-button" onclick="startJourney()">
            <strong>Explore another circumstance</strong>
            <span>Try another journey or choose a different circumstance.</span>
        </button>
    `;
}

// ------------------------------
// INITIALISE
// ------------------------------

document.addEventListener("DOMContentLoaded", () => {
    loadExploredCircumstances();
    updateStatus();
    updateProgress();
});
