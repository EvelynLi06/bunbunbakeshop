function loadPage(){
    loadLocal();
    loadBg();
    addOnClicks();
    updateTime();
}

function addOnClicks(){
    document.getElementById('todo-btn').addEventListener('click',function(){
        toggleTool('todo');
    });
    
    document.getElementById('weather-btn').addEventListener('click',function(){
        toggleTool('weather');
    });

    document.getElementById('times-btn').addEventListener('click',function(){
        toggleTool('times');
    });

    var cancels = document.getElementsByClassName('cancel-btn');
    for(var i=0; i<cancels.length; i++){
        cancels[i].addEventListener('click',function(){
            toggleTool('close');
        });
    }
}

function loadBg(){
    const topicID = "6sMVjTLSkeQ"; 
    const unsplashApiCall = `https://api.unsplash.com/photos/random/?client_id=${unsplashApiKey}&topics=${topicID}&orientation=landscape`;

    fetch(unsplashApiCall)
        .then(function(response){
            return response.json();
        })
        .then(function(jsonData){
            document.body.style.background = `linear-gradient(0deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)), url('${jsonData.urls.regular}') no-repeat center center fixed`;
            document.body.style.backgroundSize = `cover`;
            document.getElementById("author").innerHTML = jsonData.user.name;
            document.getElementById("author").href = jsonData.user.links.html + "?utm_source=Productivity&utm_medium=referral";
        })
        .catch((error) => {
            let defaultbg = `script.js:40 https://images.unsplash.com/photo-1552598715-7eeb9232a2ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwyNzU2MDF8MHwxfHJhbmRvbXx8fHx8fHx8fDE2MzgzNDExODM&ixlib=rb-1.2.1&q=80&w=1080`;
            document.body.style.background = `linear-gradient(0deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)), url('${defaultbg}') no-repeat center center fixed`;
            document.body.style.backgroundSize = `cover`;
            document.getElementById("author").innerHTML = `Engjell Gjepali`;
            document.getElementById("author").href = `https://unsplash.com/@iamengjell?utm_source=Productivity&utm_medium=referral`;
        });
}

function loadLocal(){
    navigator.geolocation.getCurrentPosition(getCity, reportError);
}

function reportError(){
    console.log("Error in loading navigator geolocation");
}

function getCity(position){
    const { latitude, longitude } = position.coords;
    const cityApiCall = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${cityApiKey}`
    fetch(cityApiCall)
        .then(function(response){
            return response.json();
        })
        .then(function(jsonData){
            const city = jsonData.results[0].components.city;
            const state = jsonData.results[0].components.state;
            const country = jsonData.results[0].components.country;
            document.getElementById("location").innerHTML = `${city}, ${state}, ${country}`;
            getWeather(city)
                .then(function(weather){
                    displayWeather(weather);
                });
        })
}

async function getWeather(city){
    const weatherApiCall = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&units=imperial`;
    let weather =  await fetch(weatherApiCall)
        .then(function(response){
            return response.json();
        })
        .then(function(jsonData){
            const description = jsonData.weather[0].description;
            const temp = jsonData.main.temp;
            const weatherID = jsonData.weather[0].id; // to match icons
            var icon = "";
            if(weatherID==800){         // 800 - clear
                icon = `icons/weather/clear.svg`;
            }else if(weatherID>800){    // 80x - clouds
                icon = `icons/weather/clouds.svg`;
            }else if(weatherID>=700){   // 7xx - mist
                icon = `icons/weather/mist.svg`;
            }else if(weatherID>=600){   // 6xx - snow
                icon = `icons/weather/snow.svg`;
            }else if(weatherID>=500){   // 5xx - rain
                icon = `icons/weather/rain.svg`;
            }else if(weatherID>=300){   // 3xx - drizzle
                icon = `icons/weather/drizzle.svg`;
            }else if(weatherID>=200){   // 2xx - thunderstorm
                icon = `icons/weather/thunderstorm.svg`;
            }else{
                console.log("unmatched weather id: " + weatherID);
            }
            let weather = {'icon': icon, 'description': description, 'temp': temp};
            return weather;
        })
        .catch((error) => {
            console.log("error reached")
            let weather = {'error': "weather apicall encountered error"}
            return weather
        });
    return weather
}

function displayWeather(weather){
    document.getElementById("weather-icon").innerHTML=`<img id="weather-svg" src="${weather.icon}">`;
    document.getElementById("weather-words").innerHTML=weather.description;
    document.getElementById("weather-temp").innerHTML=weather.temp;
}

function updateTime(){
    var d = new Date();
    var formattedTime = moment(d).format('hh:mm');
    var formattedAMPM = moment(d).format('A');
    document.getElementById("time").innerHTML = formattedTime;
    document.getElementById("ampm").innerHTML = "  " + formattedAMPM;
    if(formattedAMPM == "AM"){
        document.getElementById("daytimegreet").innerHTML = "Good morning!"
    }else{
        document.getElementById("daytimegreet").innerHTML = "Good afternoon!"
    }
}

function toggleTool(tool){
    document.getElementById("tools").classList.toggle("active");
    if(tool == "todo"){
        loadTodo();
    } else if(tool == "weather"){
        loadWeather();
    } else if(tool == "times"){
        loadTimes();
    } else if(tool == "close"){
        document.getElementById("tool-content").innerHTML = "";
        showToolBtns();
        changeElementById("list-content", "none");
        changeElementById("weather-bar", "flex");
        changeElementById("times-bar", "flex");
        changeElementById("todo-bar", "flex");
        document.getElementById("todo-hide").classList.remove("active");
        document.getElementById("weather-hide").classList.remove("active");
        document.getElementById("times-hide").classList.remove("active");
    } else {
        console.log("toggle Tool unknown parameter: " + tool);
        document.getElementById("tools").classList.toggle("active");
    }
}

function loadTodo(){
    document.getElementById("tool-content").innerHTML = "";
    hideToolBtns();
    changeElementById("weather-bar", "none");
    changeElementById("times-bar", "none");
    document.getElementById("todo-hide").classList.toggle("active");
    changeElementById("list-content", "flex");
    addEventListenerToAdd("todo");
    fetchTodos();
}

function fetchTodos(){
    const content = document.getElementById("tool-content");
    content.innerHTML = "";
    try{
        var itemsStorage = localStorage.getItem('todo-items');
        var itemsArr = JSON.parse(itemsStorage);
    
        for (var i = 0; i < itemsArr.length; i++) {
            var newItem = itemsArr[i]
            var unchecked = `style="display:flex;"`;
            var checked = `style="display:none;"`;
            var strike = ``;
            if(newItem.status == 1){
                var tmp = unchecked;
                unchecked = checked;
                checked = tmp;
                strike = `style="text-decoration: line-through;"`;
            }
            var newItemHTML = `
                <div class="tool-item" id="todo-item-${i}">
                    <div class="todo-main">

                        <div class="unchecked" id="uncheck-${i}" ${unchecked}>
                            <img class="tool-icon" src="icons/fi_square.svg" alt="icon for unchecked to do task">
                        </div>

                        <div class="checked" id="check-${i}" ${checked}>
                            <img class="tool-icon" src="icons/fi_check-square.svg" alt="icon for checked to do task">
                        </div>

                        <div class="todo-desp" id="todo-task-${i}" ${strike}>
                            ${newItem.item}
                        </div>

                        <div class="delete-icon" id="trash-${i}">
                            <img class="tool-icon trash" src="icons/fi_trash.svg" alt="icon for deleting this to do task">
                        </div>

                        <div class="expand-icon" id="expand-${i}">
                            <img class="tool-icon expand" id="expand-${i}-icon" src="icons/fi_chevron-right.svg" alt="icon for expanding to do task and showing related links">
                        </div>
                    </div>  

                    <div class="link-region" id="todo-item-${i}-links">
                    </div>

                </div>
            `;
            content.innerHTML += newItemHTML;
        }
        for (var i = 0; i < itemsArr.length; i++) {
            document.getElementById(`check-${i}`).addEventListener('click',function(){
                uncheckTodo(this.id) 
            });
            document.getElementById(`uncheck-${i}`).addEventListener('click',function(){
                checkTodo(this.id) 
            });
            document.getElementById(`trash-${i}`).addEventListener('click',function(){
                trashTodo(this.id.split("-")[1]) 
            });
            document.getElementById(`expand-${i}`).addEventListener('click',function(){
                expandLinks(this.id) 
            });
        }
        if(itemsArr.length == 0){
            content.innerHTML = `
            <div class="tool-item dummy" id="todo-item-notask">
               No tasks are added to the to-do list at this moment, add some tasks!
            </div>`;
        }
    }catch(e){
        console.log("error encountered fetching todo")
    }
}

function expandLinks(id){
    document.getElementById(id+"-icon").style.transform="rotate(90deg)";
    var index = id.split("-")[1];
    var itemsStorage = localStorage.getItem('todo-items');
    var itemsArr = JSON.parse(itemsStorage);

    var currItemLinks = itemsArr[index].links;
    var linksRegion = document.getElementById(`todo-item-${index}-links`);
    changeElementById(`todo-item-${index}-links`, "flex");
    linksRegion.innerHTML = "";
    for (var i = 0; i < currItemLinks.length; i++) {
        var linkObj = currItemLinks[i];
        var newLink = `
            <div class="links" id="link-${i}">
                <a href="${linkObj.link}" target="_blank">
                    <div class="link-arrow-btn">
                        <img class="tool-icon trash" src="icons/fi_chevrons-right.svg" alt="icon for deleting this to do task">
                    </div>
                </a>
                <a class="link-name" href="${linkObj.link}" target="_blank">
                    ${linkObj.name}
                </a>
                <div class="link-delete-btn" id="trash-link-${index}-${i}">
                    <img class="tool-icon trash" src="icons/fi_trash.svg" alt="icon for deleting this to do task">
                </div>
            </div>
        `;
        linksRegion.innerHTML += newLink;
    }

    document.getElementById(id).removeEventListener('click',function(){
        expandLinks(id);
    });

    document.getElementById(id).addEventListener('click',function(){
        closeLinks(id);
    });

    if(currItemLinks.length==0){
        var noLink = `
            <div class="links" id="no-link">
                No links are associated with this task at this moment.
            </div>
        `;
        linksRegion.innerHTML += noLink;
    }

    if(document.getElementById("todo-header") != null){
        // current window is the popup, present the save current tab option!
        let saveTab = `
            <div class="save">
                <div class="link-save-btn" id="link-save-${index}">
                    <img class="tool-icon save" src="icons/fi_link.svg" alt="icon for save current tab link to this to do task">
                </div>
                <div class="desp">
                    <div class="saveLink">
                        Save current link as
                    </div>
                    <div class="saveTitle">
                        <input id="link-title-${index}" type="text" name="Save current link as">
                    </div>
                </div>
            </div>
        `;
        linksRegion.innerHTML += saveTab;

        document.getElementById(`link-title-${index}`).addEventListener("keyup",function(event){
            if (event.key === "Enter") {
                console.log(id);
                saveLink(id);
            }
        });
        // add event listener to the link icon 
    }

    for (var i = 0; i < currItemLinks.length; i++) {
        document.getElementById(`trash-link-${index}-${i}`).addEventListener('click',function(){
            trashLink(this.id);
        });
    }
}

function saveLink(id){
    var index = id.split("-")[1];
    getCurrentTab()
        .then(function(tab){
            var name = document.getElementById(`link-title-${index}`).value;
            name = name=="" ? tab.title : name;

            var itemsStorage = localStorage.getItem('todo-items');
            var itemsArr = JSON.parse(itemsStorage);
        
            itemsArr[index].links.push({'link': tab.url, 'name': name});
            saveItems(itemsArr, "todo-items");
            expandLinks(id);

        })
}

function closeLinks(id){
    var index = id.split("-")[1];
    document.getElementById(id+"-icon").style.transform="rotate(0deg)";
    changeElementById(`todo-item-${index}-links`, "none");
    document.getElementById(id).removeEventListener('click',function(){
        closeLinks(id);
    });
    document.getElementById(id).addEventListener('click',function(){
        expandLinks(id);
    });
}

function trashLink(id){
    var todoIndex = id.split("-")[2];
    var linkIndex = id.split("-")[3];

    var itemsStorage = localStorage.getItem('todo-items');
    var itemsArr = JSON.parse(itemsStorage);
    itemsArr[todoIndex].links.splice(linkIndex, 1);
    saveItems(itemsArr, "todo-items");
    expandLinks("expand-"+todoIndex);
}

function trashTodo(index){
    trash(index, 'todo-items');
    fetchTodos();
}

function trashWeather(index){
    trash(index, 'weather-items');
    fetchWeathers();
}

function trashTime(index){
    trash(index, 'time-items');
    fetchTimes();
}

function trash(index, item){
    var itemsStorage = localStorage.getItem(item);
    var itemsArr = JSON.parse(itemsStorage);
    itemsArr.splice(index, 1);
    saveItems(itemsArr, item);
}

function checkTodo(id){
    var index = id.split("-")[1];
    var itemsStorage = localStorage.getItem('todo-items');
    var itemsArr = JSON.parse(itemsStorage);

    itemsArr[index].status = 1;

    saveItems(itemsArr, "todo-items");

    var uncheck_id = id;
    var check_id = id.slice(2);
    changeElementById(uncheck_id, "none");
    changeElementById(check_id, "flex");
    document.getElementById("todo-task-"+index).style.textDecoration = "line-through";
}

function uncheckTodo(id){
    var index = id.split("-")[1];
    var itemsStorage = localStorage.getItem('todo-items');
    var itemsArr = JSON.parse(itemsStorage);

    itemsArr[index].status = 0;

    saveItems(itemsArr, "todo-items");

    var check_id = id;
    var uncheck_id = "un" + id;
    changeElementById(uncheck_id, "flex");
    changeElementById(check_id, "none");
    document.getElementById("todo-task-"+index).style.textDecoration = "none";
}

function loadWeather(){
    document.getElementById("tool-content").innerHTML = "";
    hideToolBtns();
    changeElementById("todo-bar", "none");
    changeElementById("times-bar", "none");
    document.getElementById("weather-hide").classList.toggle("active");
    changeElementById("list-content", "flex");
    addEventListenerToAdd("weather");
    fetchWeathers();
}

function loadTimes(){
    document.getElementById("tool-content").innerHTML = "";
    hideToolBtns();
    changeElementById("weather-bar", "none");
    changeElementById("todo-bar", "none");
    document.getElementById("times-hide").classList.toggle("active");
    changeElementById("list-content", "flex");
    addEventListenerToAdd("times");
    fetchTimes();
}

function hideToolBtns(){
    changeElementById("todo-btn", "none");
    changeElementById("weather-btn", "none");
    changeElementById("times-btn", "none");
}

function showToolBtns(){
    changeElementById("todo-btn", "flex");
    changeElementById("weather-btn", "flex");
    changeElementById("times-btn", "flex");
}

function changeElementById(id, display){
    document.getElementById(id).style.display=display;
}

function addEventListenerToAdd(tool){
    // add event listener to the plus button for 'click' to show input field
    // animation for the input field
    const input = document.getElementById("add-input");
    input.replaceWith(input.cloneNode(true));
    document.getElementById("add-input").addEventListener("keyup", function(event) {
        if (event.key === "Enter") {
            add(tool);
        }
    });
}

function add(tool){
    if(tool=="todo"){
        addTodo();
    } else if(tool=="weather"){
        addWeather();
    } else if(tool=="times"){
        addTime();
    } else{
        console.log("unknown tool parameter for add: " + tool);
    }
}

function addTodo(){
    var itemName = document.getElementById("add-input").value;
    if(itemName != ""){
        document.getElementById("add-input").value = "";
        var itemsStorage = localStorage.getItem('todo-items');
        var itemsArr = JSON.parse(itemsStorage);
        if(itemsArr == null){
            itemsArr = [];
        }
        itemsArr.push({"item":sanitize(itemName), "status":0, "links":[]});
        saveItems(itemsArr, "todo-items");
        fetchTodos();
    }
}

function saveItems(obj, itemname){
    var string = JSON.stringify(obj);
    localStorage.setItem(itemname, string);
}

function addWeather(){
    var city = sanitize(document.getElementById("add-input").value);
    var itemsStorage = localStorage.getItem('weather-items');
    var itemsArr = JSON.parse(itemsStorage);
    var cities = new Set();
    for (var i = 0; i < itemsArr.length; i++) {
        cities.add(itemsArr[i].city);
    }
    
    if(city != "" && !cities.has(city)){
        getWeather(city)
        .then(function(weather){
            if(weather.error == null){
                document.getElementById("add-input").value = "";
                var itemsStorage = localStorage.getItem('weather-items');
                var itemsArr = JSON.parse(itemsStorage);
                if(itemsArr == null){
                    itemsArr = [];
                }
                itemsArr.push({"city": city});
                saveItems(itemsArr, "weather-items");
                fetchWeathers();
            }
            else{
                // show error about invalid city
            }
        });

    }
}

async function fetchWeathers(){
    const content = document.getElementById("tool-content");
    content.innerHTML = ``;
    try{
        var itemsStorage = localStorage.getItem('weather-items');
        var itemsArr = JSON.parse(itemsStorage);

        for (var i = 0; i < itemsArr.length; i++) {
            var newCity = itemsArr[i].city;

            await getWeather(newCity)
                .then(function(weather){
                    var newItemHTML = ` 
                        <div class="city-weather" id="weather-${i}">
                            <div class="weather-city-name">${newCity}</div>

                            <div class="curr-weather city" id="curr-weather-${newCity}">
                                <div class="city-weather-icon" id="weather-icon-${i}">
                                    <img class="city-weather-svg" src="${weather.icon}">
                                </div>

                                <div class="weather-desp">
                                    <div class="city-weather-temp" id="weather-temp-${i}">${weather.temp}</div>
                                    <div class="city-weather-words" id="weather-words-${i}">${weather.description}</div>
                                </div>
                            </div>

                            <div class="weather-delete-icon" id="weather-trash-${i}">
                                <img class="tool-icon trash" src="icons/fi_trash.svg" alt="icon for deleting this weather">
                            </div>
                        </div>
                    `;
                    content.innerHTML += newItemHTML;
                });
        }

        for (var j = 0; j < itemsArr.length; j++) {
            document.getElementById(`weather-trash-${j}`).addEventListener('click',function(){
                trashWeather(this.id.split("-")[2]);
            });
        }

        if(itemsArr.length == 0){
            content.innerHTML = `
                <div class="city-weather dummy" id="weather-dummy">
                    No cities are added to the weather list at this moment, add some cities!
                </div>
            `;
        }

    }catch(e){
        console.log("error encountered fetching weathers");
    }
}

function fetchTimes(){
    const content = document.getElementById("tool-content");
    content.innerHTML = ``;
    let d = new Date();
    try{
        var itemsStorage = localStorage.getItem('time-items');
        var itemsArr = JSON.parse(itemsStorage);

        for (var i = 0; i < itemsArr.length; i++) {
            var newTz = itemsArr[i].timezone;
            var newItemHTML = ` 
                <div class="timezone" id="timezone-${i}">
                    <div class="timezone-name">${newTz}</div>

                    <div class="timezone-time-date" id="curr-time-${newTz}">
                        <div class="timezone-time">
                            <div class="timezone-time-hm">${moment(d).tz(newTz).format('hh:mm')}</div>
                            <div class="timezone-time-a">${moment(d).tz(newTz).format('A')}</div>
                        </div>
                        <div class="timezone-date">${moment(d).tz(newTz).format('LL')}</div>
                    </div>

                    <div class="time-delete-icon" id="time-trash-${i}">
                        <img class="tool-icon trash" src="icons/fi_trash.svg" alt="icon for deleting timezone ${newTz}">
                    </div>
                </div>
            `;
            content.innerHTML += newItemHTML;
        }

        for (var j = 0; j < itemsArr.length; j++) {
            document.getElementById(`time-trash-${j}`).addEventListener('click',function(){
                trashTime(this.id.split("-")[2]);
            });
        }

        if(itemsArr.length == 0){
            content.innerHTML = `
                <div class="timezone dummy" id="timezone-dummy">
                    No timezones are added to the list at this moment, add some timezones!
                </div>
            `;
        }

    }catch(e){
        console.log("error encountered fetching times");
    }

}

function addTime(){
    var tz = sanitize(document.getElementById("add-input").value);
    if(tz != ""){
        // check valid timezone and non-repeat timezone
        document.getElementById("add-input").value = "";
        var itemsStorage = localStorage.getItem('time-items');
        var itemsArr = JSON.parse(itemsStorage);
        if(itemsArr == null){
            itemsArr = [];
        }
        itemsArr.push({"timezone": tz});
        saveItems(itemsArr, "time-items");
        fetchTimes();
    }
}

function sanitize(s) {
    // Be sure to replace ampersand first
    return s.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;') 
}

async function getCurrentTab() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}
