// glaze: 0-None; 1-Sugar Milk; 2-Vanilla Milk; 3-Double Chocolate

var items = []

function arrayRemove(arr, value) { 
    
    return arr.filter(function(ele){ 
        return ele != value; 
    });
}

function loadCartHeader(){
    let cartItem = document.getElementById("cartItem");
    cartItem.innerText = "0 items".replace(0, sessionStorage.length);
}

function loadCart(){
    console.log(items);
    let contentDiv = document.getElementById("content");
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
        productDiv.id = "product_0".replace(0, i);

        let imgDiv = `<div class="product_checkout_img_div">
                        <img class="product_checkout_img" id="product_img_0" src="product.png">
                      </div>`;
        let detailDiv = `<div class="product_checkout_detail_div">
                           <h2>PRODUCTNAME</h2>
                           <div class="edits">
                            <select id="glazeSelected" name="glaze">
                                <option value="None">None</option>
                                <option value="Sugar Milk">Sugar Milk</option>
                                <option value="Vanilla Milk">Vanilla Milk</option>
                                <option value="Double Chocolate">Double Chocolate</option>
                            </select>
                            <select id="qtSelected" name="qt">
                                <option value="1">1</option>
                                <option value="3">3</option>
                                <option value="6">6</option>
                                <option value="12">12</option>
                            </select>
                             <span>delete</span>
                           </div>
                         </div>`;
        detailDiv = detailDiv.replace("PRODUCTNAME", name);
        detailDiv = detailDiv.replace(`value="`+glaze+`"`, `value="`+glaze+`"` + " selected");
        detailDiv = detailDiv.replace(`value="`+qt+`"`, `value="`+qt+`"` + " selected");
        
        let priceDiv = `<div class="product_checkout_price">
                          <h2>$ PRICE</h2>
                          <span>(Saved: $ SAVE)</span>
                        </div>`;
        priceDiv = priceDiv.replace("PRICE", price);
        priceDiv = priceDiv.replace("SAVE", save);

        productDiv.innerHTML = imgDiv + detailDiv + priceDiv;
        contentDiv.appendChild(productDiv);

    }

    //checkout button
}

function deleteItem(){
    // get the parent or grand parent's innerHTML
    // use arrayRemove to delete that HTML from the items array

}

function buttonChosen(x, buttonType){
    // change the style
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

    sessionStorage.setItem(product, JSON.stringify(item));

    glaze.className = "glaze";
    qt.className = "qt";
    price.innerText = "$ 2.75";
    loadCartHeader();
    // change the style back
}