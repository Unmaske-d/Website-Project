// ==============================
// MOBILE MENU
// ==============================

const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector(".main-nav");

if (menuButton) {
    menuButton.addEventListener("click", () => {
        navigation.classList.toggle("mobile-open");
    });
}


// ==============================
// RETURNING VISITOR
// ==============================

if (!localStorage.getItem("experienceExchangeVisited")) {

    localStorage.setItem(
        "experienceExchangeVisited",
        "true"
    );

    localStorage.setItem(
        "experienceExchangeVisitCount",
        "1"
    );

} else {

    let visits = Number(
        localStorage.getItem("experienceExchangeVisitCount") || 1
    );

    localStorage.setItem(
        "experienceExchangeVisitCount",
        visits + 1
    );
}