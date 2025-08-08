// ========== 🌤️ CONFIG ==========
// Get your own free API key from https://openweathermap.org/api
const OPENWEATHER_API_KEY = "2d59e8bc28573156c86f2b1a7c59caa1";

// ========== 🔁 GLOBAL STATE ==========
let weatherTag = "hot";
let cityName = "";
let vegMeals = [];
let nonvegMeals = [];
let desserts = [];

// ========== 🌍 FETCH LOCATION + WEATHER ==========
async function getLocationAndWeather() {
    try {

        const locRes = await fetch("https://ipinfo.io/json?token=f4d72ceb087f19");
        const locData = await locRes.json();
        cityName = locData.city;
        const [latitude, longitude] = locData.loc.split(",");
        const weatherRes = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`
        );

        const weatherData = await weatherRes.json();

        const temp = weatherData.main.temp;
        const condition = weatherData.weather[0].main.toLowerCase();
        const description = weatherData.weather[0].description.toLowerCase();

        // 🖼️ Set background based on condition
        // setBackgroundBasedOnWeather(description);

        const isRainy = condition.includes("rain") || condition.includes("storm");

        // Assign weather tag
        if (isRainy) weatherTag = "rainy";
        else if (temp >= 33) weatherTag = "hot";
        else if (temp < 24) weatherTag = "cold";
        else weatherTag = "mild";

        document.getElementById("location-weather").textContent =
            `📍 ${cityName} | ${Math.round(temp)}°C | ${weatherTag.toUpperCase()}`;
        document.getElementById("loader").style.display = "none";

    } catch (err) {
        console.error("Failed to fetch weather:", err);
        document.getElementById("location-weather").textContent = "⚠️ Failed to get weather info.";
        document.getElementById("loader").style.display = "none";

    }
}
function showLoader() {
    document.getElementById("loader").style.display = "flex";
}

function hideLoader() {
    document.getElementById("loader").style.display = "none";
}


// ========== 📦 LOAD LOCAL JSON FILES ==========
async function loadData() {
    try {
        const [vegRes, nonvegRes, dessertRes] = await Promise.all([
            fetch("data/veg.json"),
            fetch("data/nonveg.json"),
            fetch("data/desserts.json")
        ]);
        vegMeals = await vegRes.json();
        nonvegMeals = await nonvegRes.json();
        desserts = await dessertRes.json();
    } catch (err) {
        console.error("Error loading data:", err);
    }
}

// ========== 🎯 FILTER + PICK RANDOM ==========
function filterMeals(meals) {
    const filtered = meals.filter(m => m.weather.includes(weatherTag));
    return filtered.length ? filtered : meals;
}

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// ========== 💡 GET RANDOM MEALS ==========
function getRandomMeal(type) {
    const mealData = type === "veg" ? vegMeals : nonvegMeals;
    const list = filterMeals(mealData);
    const meal = getRandomItem(list);

    const elId = type === "veg" ? "veg-meal" : "nonveg-meal";
    const tagId = type === "veg" ? "veg-tag" : "nonveg-tag";
    const skeletonId = type === "veg" ? "skeleton-veg" : "skeleton-nonveg";
    const buttonClass = type === "veg" ? "veg-button" : "nonveg-button";

    // Hide content and show skeleton
    document.getElementById(elId).style.display = "none";
    document.getElementById(tagId).style.display = "none";
    document.getElementById(skeletonId).classList.remove("hidden");

    // Hide button
    document.querySelector(`.${buttonClass}`).classList.add("hidden");

    setTimeout(() => {
        // Set content
        document.getElementById(elId).textContent = meal.meal;
        document.getElementById(elId).style.display = "block";
        document.getElementById(tagId).style.display = "block";

        // Hide skeleton
        document.getElementById(skeletonId).classList.add("hidden");

        // Show button
        document.querySelector(`.${buttonClass}`).classList.remove("hidden");
    }, 800);
}


function getRandomDessert() {
    const filtered = desserts.filter(d => d.weather.includes(weatherTag));
    const dessert = getRandomItem(filtered);

    // Hide content
    document.getElementById("dessert-homemade").parentElement.style.display = "none";
    document.getElementById("dessert-fancy").parentElement.style.display = "none";

    // Show skeleton
    document.getElementById("skeleton-dessert").classList.remove("hidden");

    // Hide button
    document.querySelector(".dessert-button").classList.add("hidden");

    setTimeout(() => {
        // Set content
        document.getElementById("dessert-homemade").textContent = getRandomItem(dessert.homemade);
        document.getElementById("dessert-fancy").textContent = getRandomItem(dessert.fancy);

        // Show content
        document.getElementById("dessert-homemade").parentElement.style.display = "block";
        document.getElementById("dessert-fancy").parentElement.style.display = "block";

        // Hide skeleton
        document.getElementById("skeleton-dessert").classList.add("hidden");

        // Show button
        document.querySelector(".dessert-button").classList.remove("hidden");
    }, 800);
}




// ========== 🚀 INIT ==========
async function init() {
    await getLocationAndWeather();
    await loadData();
    getRandomMeal("veg");
    getRandomMeal("nonveg");
    getRandomDessert();
}

function getAllMeals() {
    showLoader();
    getRandomMeal("veg");
    getRandomMeal("nonveg");
    getRandomDessert();
    setTimeout(hideLoader, 600);
}


function setBackgroundBasedOnWeather(weather) {
    weather = weather.toLowerCase();

    let bgClass = "";

    if (weather.includes("rain") || weather.includes("drizzle")) {
        bgClass = "bg-gradient-to-br from-blue-100 to-gray-300"; // rainy
    } else if (weather.includes("cloud")) {
        bgClass = "bg-gradient-to-br from-gray-200 to-gray-400"; // cloudy
    } else if (weather.includes("clear") || weather.includes("sunny")) {
        bgClass = "bg-gradient-to-br from-yellow-50 to-orange-100"; // sunny
    } else if (weather.includes("snow")) {
        bgClass = "bg-gradient-to-br from-white to-blue-100"; // snowy
    } else if (weather.includes("thunder") || weather.includes("storm")) {
        bgClass = "bg-gradient-to-br from-gray-700 to-gray-900"; // thunderstorm
    } else if (weather.includes("mist") || weather.includes("fog") || weather.includes("haze")) {
        bgClass = "bg-gradient-to-br from-gray-100 to-gray-300"; // foggy/misty
    } else {
        // fallback default
        bgClass = "bg-gradient-to-br from-yellow-50 to-orange-100";
    }

    // Remove previous gradient classes
    document.body.className = document.body.className
        .split(" ")
        .filter(c => !c.startsWith("bg-gradient-to") && !c.startsWith("from-") && !c.startsWith("to-"))
        .join(" ")
        .trim();

    // Add new gradient background
    document.body.classList.add(...bgClass.split(" "));
}


init();
