const apiKey = "3d84094e7f1241f486b130239251106";
let currentForecastData = null; // to store forecast for toggling

// Get weather by coordinates
async function getWeatherByCoords(lat, lon) {
  try {
    const res = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=7&aqi=yes`);
    const data = await res.json();
    currentForecastData = data;
    displayWeather(data);
    displayTodayForecast(data); // show today by default
  } catch (error) {
    alert("Failed to fetch weather data. " + error.message);
    console.error(error);
  }
}

// Get weather by search
async function getWeatherBySearch(query) {
  try {
    const res = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${query}&days=7&aqi=yes`);
    const data = await res.json();
    currentForecastData = data;
    displayWeather(data);
    displayTodayForecast(data); // show today by default
  } catch (error) {
    alert("Failed to fetch weather data. " + error.message);
    console.error(error);
  }
}

// Update main weather and highlights
function displayWeather(data) {
  const current = data.current;
  const location = data.location;

  document.getElementById("temp").innerText = `${current.temp_c}°C`;
  document.getElementById("condition").innerText = current.condition.text;
  document.getElementById("location").innerText = `${location.name}, ${location.country}`;
  document.getElementById("humidity").innerText = `${current.humidity}%`;
  document.getElementById("wind").innerText = `${current.wind_kph} km/h ${current.wind_dir}`;
  document.getElementById("visibility").innerText = `${current.vis_km} km`;
  document.getElementById("airQuality").innerText = `${current.air_quality.pm2_5.toFixed(1)}`;

  const now = new Date(location.localtime);
  const weekday = now.toLocaleDateString("en-US", { weekday: "long" });
  const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  document.getElementById("datetime").innerText = `${weekday}, ${time}`;

  const astro = data.forecast.forecastday[0].astro;
  document.getElementById("sunrise").innerText = `🌅: ${astro.sunrise}`;
  document.getElementById("sunset").innerText = `🌇: ${astro.sunset}`;
}


// Show 7-day forecast
function displayForecast(data) {
  const forecastContainer = document.getElementById("weeklyForecast");
  forecastContainer.innerHTML = "";

  data.forecast.forecastday.forEach(day => {
    const date = new Date(day.date);
    const weekday = date.toLocaleDateString("en-US", { weekday: "short" });

    const card = document.createElement("div");
    card.className = "forecast-card";
    card.innerHTML = `
      <p>${weekday}</p>
      <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}" />
      <p>${day.day.maxtemp_c}° / ${day.day.mintemp_c}°</p>
    `;
    forecastContainer.appendChild(card);
  });
}

// Show only today's forecast
function displayTodayForecast(data) {
    const forecastContainer = document.getElementById("weeklyForecast");
    forecastContainer.innerHTML = "";
  
    const hours = data.forecast.forecastday[0].hour;
  
    hours.forEach(hour => {
      const time = new Date(hour.time).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
  
      const card = document.createElement("div");
      card.className = "forecast-card";
      card.innerHTML = `
        <p>${time}</p>
        <img src="https:${hour.condition.icon}" alt="${hour.condition.text}" />
        <p>${hour.temp_c}°C</p>
      `;
      forecastContainer.appendChild(card);
    });
  }
  

// Default load by geolocation
navigator.geolocation.getCurrentPosition(
  pos => {
    getWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
  },
  err => {
    alert("Location access denied. Enter a city name instead.");
  }
);

// Event Listeners
document.getElementById("getLocationBtn").addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(pos => {
    getWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
  });
});

document.getElementById("search").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    getWeatherBySearch(e.target.value);
  }
});

document.getElementById("searchBtn").addEventListener("click", () => {
  const query = document.getElementById("search").value.trim();
  if (query !== "") {
    getWeatherBySearch(query);
  } else {
    alert("Please enter a city name.");
  }
});

// Toggle: Today vs Week
document.getElementById("todayBtn").addEventListener("click", () => {
  if (!currentForecastData) return;
  document.getElementById("todayBtn").classList.add("active");
  document.getElementById("weekBtn").classList.remove("active");
  displayTodayForecast(currentForecastData);
});

document.getElementById("weekBtn").addEventListener("click", () => {
  if (!currentForecastData) return;
  document.getElementById("weekBtn").classList.add("active");
  document.getElementById("todayBtn").classList.remove("active");
  displayForecast(currentForecastData);
});
