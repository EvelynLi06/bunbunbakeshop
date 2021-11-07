function loadCartHeader(){
    let cartItem = document.getElementById("cartItem");
    cartItem.innerText = `${sessionStorage.length} items`;
}

function loadCart(){
    let contentDiv = document.getElementById("content");
    contentDiv.innerHTML = "";
    // delete all existing products and reload according to sessionStorage

    if(sessionStorage.length === 0){
        let emptyDiv = document.createElement("div");
        let emptyText = document.createElement("h1");
        let promoText = document.createElement("h2");
        emptyText.innerText = "Your cart is empty.";
        promoText.innerText = "Discover your favorite cinnamon bun flavor to fill it up!";
        emptyDiv.appendChild(emptyText);
        emptyDiv.appendChild(promoText);
        contentDiv.appendChild(emptyDiv);
        return;
    }

    for (var i=0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        let item = JSON.parse(sessionStorage.getItem(key));

        let name = item.product;
        let glaze = item.glaze;
        let qt = item.qt;
        let price = item.price;
        let save = item.save;

        let productDiv = document.createElement("div");
        productDiv.id = `product_${i}`;

        let imgDiv = `<div class="product_checkout_img_div">
                        <img class="product_checkout_img" id="product_img_${i}" src="media/product.png">
                      </div>`;
        let detailDiv = `<div class="product_checkout_detail_div" id="product_checkout_detail_div_${i}">
                           <h2>${name}</h2>
                           <div class="edits">
                            <select class="glazeSelected" id="glazeSelected_${i}" name="glaze" onchange="changeGlaze(${i})">
                                <option value="None">None</option>
                                <option value="Sugar Milk">Sugar Milk</option>
                                <option value="Vanilla Milk">Vanilla Milk</option>
                                <option value="Double Chocolate">Double Chocolate</option>
                            </select>
                            <select class="qtSelected" id="qtSelected_${i}" name="qt" onchange="changeQt(${i})">
                                <option value="1">1</option>
                                <option value="3">3</option>
                                <option value="6">6</option>
                                <option value="12">12</option>
                            </select>
                            <div class="trash">
                              <img class="delete_btns" id="delete_btn_${i}" src="media/trash.svg" onclick="deleteItem(${i})">
                            </div>
                           </div>
                         </div>`;
        detailDiv = detailDiv.replace(`value="`+glaze+`"`, `value="`+glaze+`"` + " selected");
        detailDiv = detailDiv.replace(`value="`+qt+`"`, `value="`+qt+`"` + " selected");
        
        let priceDiv = `<div class="product_checkout_price">
                          <h2>$ ${price}</h2>
                          <span>(Saved: $ ${save})</span>
                        </div>`;

        productDiv.innerHTML = imgDiv + detailDiv + priceDiv;
        contentDiv.appendChild(productDiv);

    }
}

function changeGlaze(i){
    const key = sessionStorage.key(i);
    let item = JSON.parse(sessionStorage.getItem(key));

    let name = item.product;
    // let glaze = item.glaze;
    let qt = item.qt;
    let price = item.price;
    let save = item.save;

    let new_item = {
        "product": name, 
        "glaze": document.getElementById(`glazeSelected_${i}`).value, 
        "qt": qt, 
        "price": price,
        "save": save
    };

    sessionStorage.removeItem(key);
    sessionStorage.setItem(i, JSON.stringify(new_item));
    loadCart();
}

function changeQt(i){
    const key = sessionStorage.key(i);
    let item = JSON.parse(sessionStorage.getItem(key));

    let name = item.product;
    let glaze = item.glaze;
    let qt = document.getElementById(`qtSelected_${i}`).value;
    let price = item.price;
    let save = item.save;

    price = 2.75;
    save = 0;
    if(qt == 3){
        price = 7;
        save = 3*2.75-7;
    }
    if(qt == 6){
        price = 12;
        save = 6*2.75-7;
    }
    if(qt == 12){
        price = 23;
        save = 12*2.75-7;
    }

    let new_item = {
        "product": name, 
        "glaze": glaze, 
        "qt": qt,  
        "price": price,
        "save": save
    };

    sessionStorage.removeItem(key);
    sessionStorage.setItem(i, JSON.stringify(new_item));
    loadCart();

}

function deleteItem(i){
    const key = sessionStorage.key(i);
    sessionStorage.removeItem(key);
    for (var i=0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        let item = sessionStorage.getItem(key);
        sessionStorage.removeItem(key);
        sessionStorage.setItem(i, item);
    }
    loadCartHeader();
    loadCart();

}

function buttonChosen(x, buttonType){
    if(buttonType === 'glaze'){
        var glazeChosenLast = document.getElementsByClassName("glazeChosen");
        for (var i=0; i<glazeChosenLast.length; i++) {
            var elem = glazeChosenLast[0];
            elem.className = "glaze";
        }

        var glazeChosenId = buttonType + x;
        var glazeChosen = document.getElementById(glazeChosenId);
        glazeChosen.className = "glazeChosen";

    }

    if(buttonType === 'qt'){
        var qtChosenLast = document.getElementsByClassName("qtChosen");
        for (var i=0; i<qtChosenLast.length; i++) {
            var elem = qtChosenLast[0];
            elem.className = "qt";
        }

        var qtChosenId = buttonType + x;
        var qtChosen = document.getElementById(qtChosenId);
        qtChosen.className = "qtChosen";
        let price = document.getElementById("price");
        let prc = 2.75;
        let save = 0;
        if(x === 3){
            prc = 7;
            save = 3*2.75-7;
        }
        if(x === 6){
            prc = 12;
            save = 6*2.75-7;
        }
        if(x === 12){
            prc = 23;
            save = 12*2.75-7;
        }
        price.innerText = "$ " +prc;
        let hiddenSave = document.getElementById("saved");
        let hiddenPrice = document.getElementById("priceh");
        hiddenSave.value = save;
        hiddenPrice.value = prc;
    }
}

function addToCart(){
    var product = document.getElementById("product_name").innerText;
    let glaze = document.getElementsByClassName("glazeChosen")[0];
    let qt = document.getElementsByClassName("qtChosen")[0];
    let price = document.getElementById("priceh");
    let save = document.getElementById("saved");
    
    let item = {"product": product, "glaze": glaze.innerText, 
                "qt": qt.innerText, "price": price.value,
                "save": save.value};
    let key = sessionStorage.length;
    key ++;
    sessionStorage.setItem(key, JSON.stringify(item));

    glaze.className = "glaze";
    qt.className = "qt";
    price.innerText = "$ 2.75";
    loadCartHeader();
}