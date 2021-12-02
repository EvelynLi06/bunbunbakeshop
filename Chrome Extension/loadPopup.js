fetchTodos();
const input = document.getElementById("add-input");
input.replaceWith(input.cloneNode(true));
document.getElementById("add-input").addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        addTodo();
    }
});
