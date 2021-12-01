const unsplashApiKey = 'llYQB34v9t3w3_-Kyw7QPBZj5So7EWK_srEWcFLFqMc';
const cityApiKey = `d1f42a8dd39343a7a96d84b8ef9ce43b`;
const weatherApiKey = `140fd973686efad3a17e1207a6761a77`;

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
            document.getElementById("author").href = jsonData.user.links.html;
        })
        .catch((error) => {
            let defaultbg = `script.js:40 https://images.unsplash.com/photo-1552598715-7eeb9232a2ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwyNzU2MDF8MHwxfHJhbmRvbXx8fHx8fHx8fDE2MzgzNDExODM&ixlib=rb-1.2.1&q=80&w=1080`;
            document.body.style.background = `linear-gradient(0deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)), url('${defaultbg}') no-repeat center center fixed`;
            document.body.style.backgroundSize = `cover`;
            document.getElementById("author").innerHTML = `Engjell Gjepali`;
            document.getElementById("author").href = `https://unsplash.com/@iamengjell`;
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
            getWeather(city);
        })
}

function getWeather(city){
    
    const weatherApiCall = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&units=imperial`
    fetch(weatherApiCall)
        .then(function(response){
            return response.json();
        })
        .then(function(jsonData){
            const description = jsonData.weather[0].description;
            const temp = jsonData.main.temp;
            const weatherID = jsonData.weather[0].id; // to match icons
            var icon = "";
            if(weatherID==800){         // 800 - clear
                icon = `<img id="weather-svg" src="icons/weather/clear.svg">`
            }else if(weatherID>800){    // 80x - clouds
                icon = `<img id="weather-svg" src="icons/weather/clouds.svg">`
            }else if(weatherID>=700){   // 7xx - mist
                icon = `<img id="weather-svg" src="icons/weather/mist.svg">`
            }else if(weatherID>=600){   // 6xx - snow
                icon = `<img id="weather-svg" src="icons/weather/snow.svg">`
            }else if(weatherID>=500){   // 5xx - rain
                icon = `<img id="weather-svg" src="icons/weather/rain.svg">`
            }else if(weatherID>=300){   // 3xx - drizzle
                icon = `<img id="weather-svg" src="icons/weather/drizzle.svg">`
            }else if(weatherID>=200){   // 2xx - thunderstorm
                icon = `<img id="weather-svg" src="icons/weather/thunderstorm.svg">`
            }else{
                console.log("unmatched weather id: " + weatherID);
            }
            document.getElementById("weather-icon").innerHTML=icon;
            document.getElementById("weather-words").innerHTML=description;
            document.getElementById("weather-temp").innerHTML=temp;
        })
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
                trashTodo(this.id) 
            });
            document.getElementById(`expand-${i}`).addEventListener('click',function(){
                expandLinks(this.id) 
            });
        }
    }catch(e){

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
                <a href="${linkObj.link}">
                    <div class="link-arrow-btn">
                        <img class="tool-icon trash" src="icons/fi_chevrons-right.svg" alt="icon for deleting this to do task">
                    </div>
                </a>
                <a class="link-name" href="${linkObj.link}">
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
                No link is associated with this task at this moment.
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

function trashTodo(id){
    var index = id.split("-")[1];
    var itemsStorage = localStorage.getItem('todo-items');
    var itemsArr = JSON.parse(itemsStorage);
    itemsArr.splice(index, 1);
    saveItems(itemsArr, "todo-items");
    fetchTodos();
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
}

function loadTimes(){
    document.getElementById("tool-content").innerHTML = "";
    hideToolBtns();
    changeElementById("weather-bar", "none");
    changeElementById("todo-bar", "none");
    document.getElementById("times-hide").classList.toggle("active");
    changeElementById("list-content", "flex");
    addEventListenerToAdd("times");

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
    input.addEventListener("keyup", function(event) {
        if (event.key === "Enter") {
            add(tool);
            // console.log('key enter pressed')
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
    var city = document.getElementById("add-input").value;
    document.getElementById("add-input").value = "";

    var itemsStorage = localStorage.getItem('weather-items');
    var itemsArr = JSON.parse(itemsStorage);
    itemsArr.push({"city":city});
    saveItems(itemsArr);
    loadWeather();
}

function addTime(){
    var tz = document.getElementById("add-input").value;
    document.getElementById("add-input").value = "";

    var itemsStorage = localStorage.getItem('time-items');
    var itemsArr = JSON.parse(itemsStorage);
    itemsArr.push({"timezone":tz});
    saveItems(itemsArr);
    loadTimes();
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
