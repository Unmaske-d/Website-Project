let currentStep = 0;
let journeyTime = 0;
let budget = 5;
let circumstance = "";
let routeChoice = "";
let exploredCircumstances = [];

const circumstances = [
    {
        id: "accessibility",
        name: "An accessibility barrier",
        description:
            "Parts of your route may not be physically accessible to you."
    },
    {
        id: "information",
        name: "An information barrier",
        description:
            "Important information about your route isn't always easy to find or understand."
    },
    {
        id: "budget",
        name: "A limited budget",
        description:
            "You need to complete your journey while keeping costs as low as possible."
    }
];

// ==============================
// TIME VARIATION
// ==============================

function varyTime(minutes) {
    if (minutes <= 0) return minutes;

    // Random variation between -2 and +2 minutes.
    const variation = Math.floor(Math.random() * 5) - 2;

    return Math.max(0, minutes + variation);
}

// ==============================
// RNG
// ==============================

function chooseCircumstance() {

    const saved =
        localStorage.getItem("experienceExchangeExplored");

    if (saved) {
        exploredCircumstances = JSON.parse(saved);
    } else {
        exploredCircumstances = [];
    }


    // Find circumstances the user has not explored yet

    const unexplored =
        circumstances.filter(
            item => !exploredCircumstances.includes(item.id)
        );


    // If there are still unexplored circumstances,
    // choose randomly from those.

    if (unexplored.length > 0) {

        const index =
            Math.floor(Math.random() * unexplored.length);

        circumstance = unexplored[index];

    } else {

        // All circumstances have been explored.
        // Start choosing randomly again.

        const index =
            Math.floor(Math.random() * circumstances.length);

        circumstance = circumstances[index];
    }
}


// ==============================
// START
// ==============================

function startJourney() {
    const panel = document.getElementById("journey-panel-content");

    panel.innerHTML = `
        <p class="eyebrow">YOUR JOURNEY — BEFORE YOU BEGIN</p>

        <h2>One destination. Different circumstances.</h2>

        <p>
            You need to reach your destination. Your journey starts
            at 08:30, and you have €5 available.
        </p>

        <p>
            Along the way, you'll make decisions about your route.
            Some may cost time or money; others may involve uncertainty
            or finding an alternative.
        </p>

        <h3>Choose the circumstance you want to explore.</h3>

        <button class="choice-button"
                onclick="selectCircumstance('accessibility')">
            <strong>An accessibility barrier</strong>
            <span>Parts of your route may not be accessible.</span>
        </button>

        <button class="choice-button"
                onclick="selectCircumstance('information')">
            <strong>An information barrier</strong>
            <span>Some route information is unclear or difficult to find.</span>
        </button>

        <button class="choice-button"
                onclick="selectCircumstance('budget')">
            <strong>A limited budget</strong>
            <span>You need to keep your travel costs low.</span>
        </button>

        <button class="choice-button"
                onclick="selectRandomCircumstance()">
            <strong>Surprise me</strong>
            <span>Let the site choose a circumstance for you.</span>
        </button>
    `;
}

function selectCircumstance(id) {
    circumstance = circumstances.find(item => item.id === id);

    if (!circumstance) return;

    showCircumstance();
}

function selectRandomCircumstance() {
    chooseCircumstance();
    showCircumstance();
}

function showCircumstance() {
    // Reset the journey for a fresh attempt.
    currentStep = 2;
    journeyTime = 0;
    budget = circumstance.id === "budget" ? 2 : 5;
    routeChoice = "";

    updateStatus();
    updateProgress();

    const panel = document.getElementById("journey-panel-content");

    panel.innerHTML = `
        <p class="eyebrow">02 — YOUR CIRCUMSTANCE</p>

        <h2>${circumstance.name}</h2>

        <p>${circumstance.description}</p>

        <p>
            This scenario focuses on one possible barrier.
            It cannot represent everyone's experiences, but it can
            help you consider how circumstances affect everyday choices.
        </p>

        <button class="choice-button" onclick="makeChoice(0, 0)">
            <strong>Continue your journey</strong>
            <span>See how your circumstances affect your options.</span>
        </button>

        <button class="choice-button" onclick="startJourney()">
            <strong>Choose a different circumstance</strong>
            <span>You can change your choice at any time before beginning.</span>
        </button>
    `;
}


// ==============================
// JOURNEY STEPS
// ==============================

function makeChoice(timeAdded, moneyChange) {

    journeyTime += varyTime(timeAdded);
    budget += moneyChange;

    updateStatus();

    currentStep++;

    updateProgress();

    showNextStage();
}


// ==============================
// UPDATE STATUS
// ==============================

function updateStatus() {

    const startHour = 8;
    const startMinute = 30;

    const directTime = 22;

    const totalMinutes =
        startHour * 60 +
        startMinute +
        directTime +
        journeyTime;

    const hours =
        Math.floor(totalMinutes / 60);

    const minutes =
        totalMinutes % 60;

    const formattedTime =
        String(hours).padStart(2, "0") +
        ":" +
        String(minutes).padStart(2, "0");

    document.getElementById("time-display").textContent =
        formattedTime;

    document.getElementById("budget-display").textContent =
        "€" + budget.toFixed(2);
}


// ==============================
// SHOW NEXT STAGE
// ==============================

function showNextStage() {

    const panel =
        document.getElementById("journey-panel-content");


    // ==============================
    // STAGE 3 — PLAN
    // ==============================

    if (currentStep === 3) {

        if (circumstance.id === "budget") {

            panel.innerHTML = `

                <p class="eyebrow">03 — YOUR PLAN</p>

                <h2>How will you get there?</h2>

                <p>
                    You have several options. Your budget means
                    that the quickest route isn't necessarily the
                    easiest choice.
                </p>

                <button class="choice-button"
                        onclick="routeChoice = 'cheap'; makeChoice(8, 0)">

                    <strong>Take the cheaper route</strong>

                    <span>
                        Save your money, but spend more time travelling.
                        +8 min · €0
                    </span>

                </button>

                <button class="choice-button"
                        onclick="routeChoice = 'fast'; makeChoice(3, -2)">

                    <strong>Take the faster connection</strong>

                    <span>
                        Arrive sooner, but spend €2.
                        +3 min · −€2
                    </span>

                </button>

                <button class="choice-button"
                        onclick="routeChoice = 'walk'; makeChoice(12, 0)">

                    <strong>Walk part of the way</strong>

                    <span>
                        Avoid paying for another connection.
                        +12 min · €0
                    </span>

                </button>

            `;

        } else if (circumstance.id === "information") {

            panel.innerHTML = `

                <p class="eyebrow">03 — YOUR PLAN</p>

                <h2>How will you find your route?</h2>

                <p>
                    There are several ways to reach the station,
                    but the information available to you isn't
                    completely clear.
                </p>

                <button class="choice-button"
                    onclick="routeChoice = 'careful'; makeChoice(8, 0)">

                <strong>Work it out yourself</strong>

                <span>
                    Take time to compare the information.
                    +8 min · €0
                </span>

            </button>

            <button class="choice-button"
                    onclick="routeChoice = 'help'; makeChoice(5, 0)">

                <strong>Ask someone for help</strong>

                <span>
                    Find someone who can explain the route.
                    +5 min · €0
                </span>

            </button>

            <button class="choice-button"
                    onclick="routeChoice = 'uncertain'; makeChoice(3, 0)">

                <strong>Follow the first route you find</strong>

                <span>
                    It looks quick, but you aren't completely sure.
                    +3 min · €0
                </span>

            </button>

            `;

        } else if (circumstance.id === "accessibility") {

            panel.innerHTML = `

                <p class="eyebrow">03 — YOUR PLAN</p>

                <h2>How will you get to the station?</h2>

                <p>
                    The most direct route isn't fully accessible.
                    You need to decide how to continue.
                </p>

                <button class="choice-button"
                        onclick="routeChoice = 'accessible'; makeChoice(8, 0)">

                    <strong>Find an accessible route</strong>

                    <span>
                        Take a longer route that you know you can use.
                        +8 min · €0
                    </span>

                </button>

                <button class="choice-button"
                        onclick="routeChoice = 'assistance'; makeChoice(5, 0)">

                    <strong>Ask for assistance</strong>

                    <span>
                        See whether another accessible route is available.
                        +5 min · €0
                    </span>

                </button>

                <button class="choice-button"
                        onclick="routeChoice = 'direct'; makeChoice(3, 0)">

                    <strong>Try the direct route</strong>

                    <span>
                        It looks faster, but accessibility is uncertain.
                        +3 min · €0
                    </span>

                </button>

            `;

        }

        return;
    }


    // ==============================
    // STAGE 4 — ROUTE
    // ==============================

    if (currentStep === 4) {

        if (circumstance.id === "budget") {

            panel.innerHTML = `

                <p class="eyebrow">04 — YOUR ROUTE</p>

                <h2>The route changes.</h2>

                <p>
                    Your planned connection isn't available.
                    The alternatives have different costs.
                </p>

                <button class="choice-button"
                        onclick="makeChoice(8, 0)">

                    <strong>Take the free alternative</strong>

                    <span>
                        Longer, but stays within your budget.
                        +8 min · €0
                    </span>

                </button>

                <button class="choice-button"
                        onclick="makeChoice(5, -1)">

                    <strong>Pay for another connection</strong>

                    <span>
                        Save some time, but spend €1.
                        +5 min · −€1
                    </span>

                </button>

                <button class="choice-button"
                        onclick="makeChoice(10, 0)">

                    <strong>Wait for your original route</strong>

                    <span>
                        Don't spend anything, but lose time.
                        +10 min · €0
                    </span>

                </button>

            `;

        } else if (circumstance.id === "information") {

            panel.innerHTML = `

                <p class="eyebrow">04 — YOUR ROUTE</p>

                <h2>The route changes.</h2>

                <p>
                    The information about your connection
                    doesn't match what you expected.
                </p>

                <button class="choice-button"
                        onclick="makeChoice(8, 0)">

                    <strong>Check the information again</strong>

                    <span>
                        Take time to make sure you're on the right route.
                        +8 min · €0
                    </span>

                </button>

                <button class="choice-button"
                        onclick="makeChoice(5, 0)">

                    <strong>Ask someone</strong>

                    <span>
                        Get help finding the correct connection.
                        +5 min · €0
                    </span>

                </button>

                <button class="choice-button"
                        onclick="makeChoice(3, 0)">

                    <strong>Trust the information you have</strong>

                    <span>
                        Keep moving, even though you're uncertain.
                        +3 min · €0
                    </span>

                </button>

            `;

        } else if (circumstance.id === "accessibility") {

            panel.innerHTML = `

                <p class="eyebrow">04 — YOUR ROUTE</p>

                <h2>The route changes.</h2>

                <p>
                    Your planned route isn't working as expected.
                    The alternatives aren't equally accessible.
                </p>

                <button class="choice-button"
                        onclick="makeChoice(8, 0)">

                    <strong>Take the accessible alternative</strong>

                    <span>
                        Longer, but you know you can use it.
                        +8 min · €0
                    </span>

                </button>

                <button class="choice-button"
                        onclick="makeChoice(5, -1)">

                    <strong>Use another connection</strong>

                    <span>
                        Pay a little more for a suitable route.
                        +5 min · −€1
                    </span>

                </button>

                <button class="choice-button"
                        onclick="makeChoice(3, 0)">

                    <strong>Try the direct route</strong>

                    <span>
                        It's faster, but accessibility is uncertain.
                        +3 min · €0
                    </span>

                </button>

            `;

        }

        return;
    }


    // ==============================
// STAGE 5 — PROBLEM
// ==============================

if (currentStep === 5) {

    // --------------------------
    // INFORMATION
    // --------------------------

    if (circumstance.id === "information") {

        if (routeChoice === "uncertain") {

            panel.innerHTML = `

                <p class="eyebrow">05 — A PROBLEM</p>

                <h2>Something doesn't look right.</h2>

                <p>
                    The route you followed doesn't match
                    the information on the station board.
                </p>

                <button class="choice-button"
                        onclick="makeChoice(5, 0)">

                    <strong>Check the information again</strong>

                    <span>
                        Take some time to find the correct route.
                        +5 min · €0
                    </span>

                </button>

                <button class="choice-button"
                        onclick="makeChoice(4, 0)">

                    <strong>Ask someone</strong>

                    <span>
                        Get help finding the correct connection.
                        +4 min · €0
                    </span>

                </button>

                <button class="choice-button"
                        onclick="makeChoice(2, 0)">

                    <strong>Keep going</strong>

                    <span>
                        Trust your original decision.
                        +2 min · €0
                    </span>

                </button>

            `;

        } else {

            panel.innerHTML = `

                <p class="eyebrow">05 — A PROBLEM</p>

                <h2>Your train is delayed.</h2>

                <p>
                    The journey isn't going exactly as planned.
                    You need to decide what to do next.
                </p>

                <button class="choice-button"
                        onclick="makeChoice(10, 0)">

                    <strong>Wait for the next train</strong>

                    <span>
                        Stay with your current route.
                        +10 min · €0
                    </span>

                </button>

                <button class="choice-button"
                        onclick="makeChoice(5, -2)">

                    <strong>Take another connection</strong>

                    <span>
                        Get moving again faster.
                        +5 min · −€2
                    </span>

                </button>

                <button class="choice-button"
                        onclick="makeChoice(7, 0)">

                    <strong>Look for another route</strong>

                    <span>
                        Find a different way to your destination.
                        +7 min · €0
                    </span>

                </button>

            `;

        }

        return;
    }


    // --------------------------
    // ACCESSIBILITY
    // --------------------------

    if (circumstance.id === "accessibility") {

        if (routeChoice === "direct") {

            panel.innerHTML = `

                <p class="eyebrow">05 — A PROBLEM</p>

                <h2>The direct route isn't accessible.</h2>

                <p>
                    The route you chose has no elevators to the platform.
                    Asking someone to help you up the stairs takes too long and you will miss your connection.
                </p>

                <button class="choice-button"
                        onclick="makeChoice(8, 0)">

                    <strong>Find another route</strong>

                    <span>
                        Take a longer accessible route.
                        +8 min · €0
                    </span>

                </button>

                <button class="choice-button"
                        onclick="makeChoice(5, 0)">

                    <strong>Ask for assistance</strong>

                    <span>
                        Find out whether another option is available.
                        +5 min · €0
                    </span>

                </button>

                <button class="choice-button"
                        onclick="makeChoice(10, 0)">

                    <strong>Wait and try again</strong>

                    <span>
                        Wait for a suitable route.
                        +10 min · €0
                    </span>

                </button>

            `;

        } else {

            panel.innerHTML = `

                <p class="eyebrow">05 — A PROBLEM</p>

                <h2>Your train is delayed.</h2>

                <p>
                    The journey isn't going exactly as planned.
                    You need to decide what to do next.
                </p>

                <button class="choice-button"
                        onclick="makeChoice(10, 0)">

                    <strong>Wait for the next train</strong>

                    <span>
                        Stay with your current route.
                        +10 min · €0
                    </span>

                </button>

                <button class="choice-button"
                        onclick="makeChoice(5, 0)">

                    <strong>Find another accessible route</strong>

                    <span>
                        Change your route.
                        +5 min · €0
                    </span>

                </button>

                <button class="choice-button"
                        onclick="makeChoice(7, 0)">

                    <strong>Ask for assistance</strong>

                    <span>
                        Find out what accessible options are available.
                        +7 min · €0
                    </span>

                </button>

            `;

        }

        return;
    }


    // --------------------------
    // BUDGET
    // --------------------------

    if (circumstance.id === "budget") {

        panel.innerHTML = `

            <p class="eyebrow">05 — A PROBLEM</p>

            <h2>Your train is delayed.</h2>

            <p>
                The journey isn't going exactly as planned.
                You need to decide what to do next.
            </p>

            <button class="choice-button"
                    onclick="makeChoice(10, 0)">

                <strong>Wait for the next train</strong>

                <span>
                    Stay with your current route.
                    +10 min · €0
                </span>

            </button>

            <button class="choice-button"
                    onclick="makeChoice(5, -2)">

                <strong>Take another connection</strong>

                <span>
                    Get moving again faster, but spend €2.
                    +5 min · −€2
                </span>

            </button>

            <button class="choice-button"
                    onclick="makeChoice(7, 0)">

                <strong>Look for a free alternative</strong>

                <span>
                    Avoid spending more money.
                    +7 min · €0
                </span>

            </button>

        `;

        return;
    }
}


    // ==============================
    // STAGE 6 — FINAL DECISION
    // ==============================

    if (currentStep === 6) {

        if (circumstance.id === "budget") {

            panel.innerHTML = `

                <p class="eyebrow">06 — FINAL DECISION</p>

                <h2>You're almost there.</h2>

                <p>
                    You can still choose between saving money
                    and saving time.
                </p>

                <button class="choice-button"
                        onclick="finishJourney(5)">

                    <strong>Take the free route</strong>

                    <span>
                        Keep your remaining money.
                        +5 min · €0
                    </span>

                </button>

                <button class="choice-button"
                        onclick="finishJourney(3)">

                    <strong>Pay for the faster connection</strong>

                    <span>
                        Arrive sooner.
                        +3 min · −€1
                    </span>

                </button>

                <button class="choice-button"
                        onclick="finishJourney(8)">

                    <strong>Walk the rest of the way</strong>

                    <span>
                        Spend nothing, but take longer.
                        +8 min · €0
                    </span>

                </button>

            `;

        } else if (circumstance.id === "information") {

            panel.innerHTML = `

                <p class="eyebrow">06 — FINAL DECISION</p>

                <h2>You're almost there.</h2>

                <p>
                    You need to decide which information
                    you trust.
                </p>

                <button class="choice-button"
                        onclick="finishJourney(5)">

                    <strong>Follow the confirmed route</strong>

                    <span>
                        Take the route you know is correct.
                        +5 min
                    </span>

                </button>

                <button class="choice-button"
                        onclick="finishJourney(3)">

                    <strong>Take the uncertain shortcut</strong>

                    <span>
                        It looks faster, but you're not completely sure.
                        +3 min
                    </span>

                </button>

                <button class="choice-button"
                        onclick="finishJourney(7)">

                    <strong>Ask for directions again</strong>

                    <span>
                        Make absolutely sure before continuing.
                        +7 min
                    </span>

                </button>

            `;

        } else if (circumstance.id === "accessibility") {

            panel.innerHTML = `

                <p class="eyebrow">06 — FINAL DECISION</p>

                <h2>You're almost there.</h2>

                <p>
                    You have to choose between the fastest
                    route and the route you know is accessible.
                </p>

                <button class="choice-button"
                        onclick="finishJourney(5)">

                    <strong>Take the accessible route</strong>

                    <span>
                        Reliable, but takes a little longer.
                        +5 min
                    </span>

                </button>

                <button class="choice-button"
                        onclick="finishJourney(3, -1)">

                    <strong>Try the direct route</strong>

                    <span>
                        Faster, but accessibility is uncertain.
                        +3 min
                    </span>

                </button>

                <button class="choice-button"
                        onclick="finishJourney(8)">

                    <strong>Ask for assistance</strong>

                    <span>
                        Make sure you can complete the final part.
                        +8 min
                    </span>

                </button>

            `;

        }

        return;
    }
}


// ==============================
// FINISH
// ==============================

function finishJourney(timeAdded, moneyChange = 0) {
    journeyTime += varyTime(timeAdded);
    budget += moneyChange;

    if (!exploredCircumstances.includes(circumstance.id)) {
        exploredCircumstances.push(circumstance.id);

        localStorage.setItem(
            "experienceExchangeExplored",
            JSON.stringify(exploredCircumstances)
        );
    }

    currentStep = 7;

    updateStatus();
    updateProgress();

    const panel =
        document.getElementById("journey-panel-content");
       

    const directTime = 22;

    const totalTime =
        directTime + journeyTime;

    panel.innerHTML = `

        <p class="eyebrow">07 — ARRIVAL</p>

        <h2>You arrived.</h2>

        <p>
            The destination was the same.
            The journey wasn't.
        </p>

        <div class="result-grid">

            <div class="result-card">

                <div class="result-number">
                    ${totalTime} min
                </div>

                <div class="result-label">
                    YOUR JOURNEY
                </div>

            </div>

            <div class="result-card">

                <div class="result-number">
                    ${directTime} min
                </div>

                <div class="result-label">
                    DIRECT JOURNEY
                </div>

            </div>

        </div>

        <div class="result-message">

            <h2>
                Same destination.<br>
                Different journey.
            </h2>

            <p class="exploration-count">
            ${exploredCircumstances.length} / ${circumstances.length}
            circumstances explored
            </p>
            <p>
                The circumstances around an everyday task can affect
                the time, choices and effort required to complete it.
            </p>

        </div>

        <div style="margin-top: 35px;">

            <button class="choice-button" onclick="startJourney()">
                <strong>Choose another journey</strong>
                <span>Try any circumstance again, or let the site choose.</span>
            </button>

        </div>

    `;
}


// ==============================
// PROGRESS
// ==============================

function updateProgress() {

    document.getElementById("stage-counter").textContent =
        currentStep + " / 7";

    const percentage =
        ((currentStep - 1) / 6) * 100;

    document.getElementById("progress-fill").style.width =
        percentage + "%";

    const stages =
        document.querySelectorAll(".stage");

    stages.forEach((stage, index) => {

        stage.classList.remove("active", "completed");

        if (index < currentStep - 1) {
            stage.classList.add("completed");
        }

        if (index === currentStep - 1) {
            stage.classList.add("active");
        }

    });
}
