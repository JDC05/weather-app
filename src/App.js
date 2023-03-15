import React, { useState, useEffect } from 'react';
import {UilTemperature, UilSearch, UilArrowUp, UilArrowDown} from "@iconscout/react-unicons"

const API_KEY = '33a24b52f5870d8876793215201329ab';

// Displays the current date and time, and updates itself every second.
function App() {
  const [weather, setCurrentWeather] = useState({});
  const [forecast, setWeatherForecast] = useState([]);
  const [isCelsius, setIsCelsius] = useState(true);
  const [city, setCity] = useState("");
  const [serviceData, setServiceData] = useState([]);


  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const currentWeatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`);
        const currentWeatherData = await currentWeatherResponse.json();
        const weatherForecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`);
        const weatherForecastData = await weatherForecastResponse.json();
        setCurrentWeather(currentWeatherData);
        setWeatherForecast(weatherForecastData);
        fetch('https://api.tfl.gov.uk/Line/Mode/tube%2Cdlr%2Coverground%2Ctram/Status')
        .then(response => response.json())
        .then(data => setServiceData(data))
      } catch (error) {
        console.log(error)
      }
    });
  }, []);

  // When the user clicks on the temp-icon button, this function is called
  const toggleTemperatureUnit = () => {
    setIsCelsius(!isCelsius);
  };

  // Temperature is formatted with °C symbol if isCelsius is true and °F otherwise
  const formatTemp = (temp) => {
    return isCelsius ? temp.toFixed() + '°C' : convertToFahrenheit(temp).toFixed() + '°F';
  };

  // converts temperature between celsius or fahrenheit
  const convertToFahrenheit = (temp) => {
    return (temp * 9/5) + 32;
  };

  // Returns a string representing the class name of the background image for the component. 
  // Maps the weather icon code to the corresponding background image.
  const formatBackground = () => {
    if(weather.weather) {
      const currentWeatherIcon = weather.weather[0].icon
      if (currentWeatherIcon === "01d") {return "imageSunny"}
      else if (currentWeatherIcon === "01n") {return "imageNight"}
      else if (currentWeatherIcon === "02d" || currentWeatherIcon === "03d" || currentWeatherIcon === "04d") {return "imageCloudy_d"}
      else if (currentWeatherIcon === "02n" || currentWeatherIcon === "03n" || currentWeatherIcon === "04n") {return "imageCloudy_n"}
      else if (currentWeatherIcon === "09d" || currentWeatherIcon === "10d") {return "imageRain_d"}
      else if (currentWeatherIcon === "09n" || currentWeatherIcon === "10n") {return "imageRain_n"}
      else if (currentWeatherIcon === "11d") {return "imageThunderstorm_d"}
      else if (currentWeatherIcon === "11n") {return "imageThunderstorm_n"}
      else if (currentWeatherIcon === "13d") {return "imageSnow_d"}
      else if (currentWeatherIcon === "13n") {return "imageSnow_n"}
      else if (currentWeatherIcon === "50d") {return "imageMist_d"}
      else if (currentWeatherIcon === "50n") {return "imageMist_n"}
    }
    
  }

  // Returns a string representing the class name for the temperature display. It returns "top-tempCold" 
  // if the current temperature is less than 20 degrees Celsius and "top-tempHot" otherwise.
  const formatTempBackground = () => {
    if(weather.main) {
      return weather.main.temp < 20 ? "top-tempCold" : "top-tempHot"
    }
    return null
  }

  // Converts the argument to a the hour format with AM/PM
  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const options = { hour: 'numeric', minute: 'numeric', hour12: true };
    const time = date.toLocaleString('en-US', options);
    return time;
  }

  // Converts the argument into the respective week day
  const getDayOfWeek = (dateString) => {
    const date = new Date(dateString);
    const options = { weekday: 'short' };
    const dayOfWeek = date.toLocaleDateString(undefined, options);
    return dayOfWeek;
  }

  // Renders an hourly forecast for the current weather which contains the time, temp and weather icon
  const renderForecastHourly = () => {
    if(forecast.list) {
      return forecast.list.slice(0, 4).map((item) => {
        return (
          <div key={item.dt}>
            <p className='bold'>{formatTime(item.dt)}</p>
            <img src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`} alt=""/>
            <p>{formatTemp(item.main.temp)}</p>          
          </div>
        );
      });
    }   
  };

  // Renders a daily forecast for the current weather which contains the time, temp and weather icon
  const renderForecastDaily = () => {
    if (forecast.list) {
      const dailyForecast = [];
      let currentDay = new Date(forecast.list[0].dt_txt).getDate();
      let minTemp = Infinity;
      let maxTemp = -Infinity;
  
      forecast.list.forEach((item) => {
        const day = new Date(item.dt_txt).getDate();
  
        if (day !== currentDay) {
          dailyForecast.push({
            day: getDayOfWeek(item.dt_txt),
            minTemp: formatTemp(minTemp),
            maxTemp: formatTemp(maxTemp),
            icon: item.weather[0].icon,
          });
  
          minTemp = Infinity;
          maxTemp = -Infinity;
          currentDay = day;
        }
  
        minTemp = Math.min(minTemp, item.main.temp_min);
        maxTemp = Math.max(maxTemp, item.main.temp_max);
      });
  
      return dailyForecast.map((item, index) => {
        return (
          <div key={index}>
            <p className='bold'>{item.day}</p>
            <img src={`https://openweathermap.org/img/wn/${item.icon}.png`} alt=""/>
            <p className='arrow'><UilArrowUp size={15}/>{item.maxTemp}</p>
            <p className='arrow'><UilArrowDown size={15}/>{item.minTemp}</p>        
          </div>
        );
      });
    }
  };

  const handleSearchClickLocation = async () => {
    if (city !== '') {
      try {
        const currentWeatherResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&`
        );
        const currentWeatherData = await currentWeatherResponse.json();
        const weatherForecastResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric&`
        );
        const weatherForecastData = await weatherForecastResponse.json();
        setCurrentWeather(currentWeatherData);
        setWeatherForecast(weatherForecastData);
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <div className={formatBackground()}>
      <div className="container">

        <div className="top">
          
          <div className="nav-bar">

            <div className='search'>
                <input
                type="text"
                placeholder='Location'
                value={city}
                onChange={(e) => setCity(e.currentTarget.value)}
                />
                <UilSearch size={20} className="search-icon" onClick={handleSearchClickLocation}/>
            </div>
            
            <div className='top-icon'>
            <UilTemperature className='temp-icon' onClick={toggleTemperatureUnit}/>       
            </div>            
          </div>


          <div className='currentWeather'>

            <div className='temperature'>
              <div className={formatTempBackground()}>
              {weather.main ? <h1>{formatTemp(weather.main.temp)}</h1> : null}
              </div>

              <div className='weather-info'>
                {weather.weather ? <img src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`} alt=""/>: null}
                {weather.weather ? <p className='bold'>{weather.weather[0].main}</p>: null}
              </div>
            </div>

            <div className='weather-stats'>

              <h2 className='bold'>{weather.name}</h2>
              <br/>
              {weather.main ? <p className='bold'>Feels like: {formatTemp(weather.main.feels_like)}</p> : null}
              {weather.main ? <p className='bold'>Humidity: {weather.main.humidity.toFixed()}%</p> : null}
              {weather.wind ? <p className='bold'>Wind: {weather.wind.speed} m/s</p>: null} 

            </div>
          </div>
        
        </div>

        <div className='bottom'>

          <div className='bottom-info'>
            <div className='bottom-header'>
              <p className='bold'>TFL Services</p>
            </div>
            <div className='tfl-container'>
              <p style={{backgroundColor: "#B36305"}} className='bold'>{serviceData[0]?.lineStatuses[0].statusSeverityDescription}</p>
              <p style={{backgroundColor: "#E32017"}} className='bold'>{serviceData[1]?.lineStatuses[0].statusSeverityDescription}</p>
              <p style={{backgroundColor: "#FFD300"}} className='bold'>{serviceData[2]?.lineStatuses[0].statusSeverityDescription}</p>
              <p style={{backgroundColor: "#00782A"}} className='bold'>{serviceData[3]?.lineStatuses[0].statusSeverityDescription}</p>
              <p style={{backgroundColor: "#00A4A7"}} className='bold'>{serviceData[4]?.lineStatuses[0].statusSeverityDescription}</p>
              <p style={{backgroundColor: "#F3A9BB"}} className='bold'>{serviceData[5]?.lineStatuses[0].statusSeverityDescription}</p>
              <p style={{backgroundColor: "#A0A5A9"}} className='bold'>{serviceData[6]?.lineStatuses[0].statusSeverityDescription}</p>
              <p style={{backgroundColor: "#EE7C0E"}} className='bold'>{serviceData[7]?.lineStatuses[0].statusSeverityDescription}</p>
              <p style={{backgroundColor: "#9B0056"}} className='bold'>{serviceData[8]?.lineStatuses[0].statusSeverityDescription}</p>
              <p style={{backgroundColor: "#000000"}} className='bold'>{serviceData[9]?.lineStatuses[0].statusSeverityDescription}</p>
              <p style={{backgroundColor: "#003688"}} className='bold'>{serviceData[10]?.lineStatuses[0].statusSeverityDescription}</p>
              <p style={{backgroundColor: "#84B817"}} className='bold'>{serviceData[11]?.lineStatuses[0].statusSeverityDescription}</p>
              <p style={{backgroundColor: "#0098D4"}} className='bold'>{serviceData[12]?.lineStatuses[0].statusSeverityDescription}</p>
              <p style={{backgroundColor: "#95CDBA"}} className='bold'>{serviceData[13]?.lineStatuses[0].statusSeverityDescription}</p>
            </div>
          </div>
          

          <div className='bottom-info'>
            <div className='bottom-header'>
              <p className='bold'>Hourly Forecast</p>
            </div>
            <div className="bottom-data">
              {forecast ? renderForecastHourly(): null}
            </div>
          </div>

          <div className='bottom-info'>
            <div className='bottom-header'>
              <p className='bold'>Weekly Forecast</p>
            </div>
            <div className="bottom-data">
              {forecast ? renderForecastDaily(): null}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;
