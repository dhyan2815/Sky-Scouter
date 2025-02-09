import WEATHER_API_KEY from "./config";

// API key for OpenWeatherMap (replace with your own)
const API_KEY = WEATHER_API_KEY;
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_API_URL = 'https://api.openweathermap.org/data/2.5/forecast';

// DOM elements
const cityInput = document.querySelector('.city-input');
const cityInputBtn = document.querySelector('.city-input-btn');
const geolocationBtn = document.getElementById('geolocation-btn');
const weatherInfo = document.getElementById('weather-info');
const cityName = document.getElementById('city-name');
const weatherIcon = document.getElementById('weather-icon');
const temperature = document.getElementById('temperature');
const description = document.getElementById('description');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const pressure = document.getElementById('pressure');
const forecast = document.getElementById('forecast');
const loading = document.getElementById('loading');

// Event listeners
cityInputBtn.addEventListener('click', () => getWeather(cityInput.value));
geolocationBtn.addEventListener('click', getLocationWeather);
cityInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        getWeather(cityInput.value);
    }
});

// Function to fetch weather data
async function getWeather(city) {
    showLoading();
    try {
        const weatherResponse = await fetch(`${WEATHER_API_URL}?q=${city}&appid=${API_KEY}&units=metric`);
        const weatherData = await weatherResponse.json();

        if (weatherResponse.ok) {
            displayWeather(weatherData);
            getForecast(city);
        } else {
            throw new Error(`API Error: ${weatherData.message}`);
        }
    } catch (error) {
        console.error('Detailed error:', error);
        if (error.message.includes('API Error')) {
            alert(`Weather API error: ${error.message}`);
        } else {
            alert(`Error fetching weather data: ${error.message}. Please check your internet connection and try again.`);
        }
    } finally {
        hideLoading();
    }
}

// Function to fetch weather data using geolocation
function getLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                showLoading();
                try {
                    const response = await fetch(`${WEATHER_API_URL}?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`);
                    const data = await response.json();
                    if (response.ok) {
                        displayWeather(data);
                        getForecast(data.name);
                    } else {
                        throw new Error(data.message);
                    }
                } catch (error) {
                    console.error('Error fetching weather data:', error);
                    alert('Error fetching weather data. Please try again.');
                } finally {
                    hideLoading();
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
                alert('Unable to retrieve your location. Please enter a city manually.');
            }
        );
    } else {
        alert('Geolocation is not supported by your browser. Please enter a city manually.');
    }
}

// Function to display weather information
function displayWeather(data) {
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    weatherIcon.alt = data.weather[0].description;
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    description.textContent = data.weather[0].description;
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${data.wind.speed} m/s`;
    pressure.textContent = `${data.main.pressure} hPa`;

    weatherInfo.style.display = 'block';
    weatherInfo.classList.add('animate__fadeIn');
}

// Function to fetch and display 5-day forecast
async function getForecast(city) {
    try {
        const response = await fetch(`${FORECAST_API_URL}?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await response.json();

        if (response.ok) {
            displayForecast(data.list);
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error fetching forecast data:', error);
    }
}

// Function to display 5-day forecast
function displayForecast(forecastData) {
    forecast.innerHTML = '';
    const dailyData = forecastData.filter(item => item.dt_txt.includes('12:00:00'));
    
    dailyData.forEach(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const iconUrl = `https://openweathermap.org/img/wn/${day.weather[0].icon}.png`;
        const temp = Math.round(day.main.temp);

        const forecastItem = document.createElement('div');
        forecastItem.classList.add('forecast-item');
        forecastItem.innerHTML = `
            <p class="forecast-day">${dayName}</p>
            <img src="${iconUrl}" alt="${day.weather[0].description}" class="forecast-icon">
            <p class="forecast-temp">${temp}°C</p>
        `;
        forecast.appendChild(forecastItem);
    });
}

// Functions to show/hide loading spinner
function showLoading() {
    loading.style.display = 'flex';
}

function hideLoading() {
    loading.style.display = 'none';
}
