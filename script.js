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
        const isRainy = condition.includes("rain") || condition.includes("storm");

        // Assign weather tag
        if (isRainy) weatherTag = "rainy";
        else if (temp >= 33) weatherTag = "hot";
        else if (temp < 24) weatherTag = "cold";
        else weatherTag = "mild";

        document.getElementById("location-weather").textContent =
            `📍 ${cityName} | ${Math.round(temp)}°C | ${weatherTag.toUpperCase()}`;
    } catch (err) {
        console.error("Failed to fetch weather:", err);
        document.getElementById("location-weather").textContent = "⚠️ Failed to get weather info.";
    }
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
    document.getElementById(elId).textContent = meal.meal;
}

function getRandomDessert() {
    const filtered = desserts.filter(d => d.weather.includes(weatherTag));
    const dessert = getRandomItem(filtered);

    document.getElementById("dessert-homemade").textContent = getRandomItem(dessert.homemade);
    document.getElementById("dessert-fancy").textContent = getRandomItem(dessert.fancy);
}

// ========== 🚀 INIT ==========
async function init() {
    await getLocationAndWeather();
    await loadData();
    getRandomMeal("veg");
    getRandomMeal("nonveg");
    getRandomDessert();
}

init();
