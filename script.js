// Swiper Initialization
document.addEventListener('DOMContentLoaded', () => {
    const swiper = new Swiper('.home', {
        loop: true,
        speed: 800,
        slidesPerView: 1,
        spaceBetween: 30,
        centeredSlides: true,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        autoplay: {
            delay: 8000,
        },
    });
});



// Recipe Class
class Recipe {
    constructor(title, category, ingredients, instructions, image) {
        this.id = Date.now(); // this was used to test the delete function, but it is not needed.
        this.title = title;
        this.category = category;
        this.ingredients = ingredients;
        this.instructions = instructions;
        this.image = image || "images/image6.jpg";
    }
}



// Recipe Storage
const newRecipes = [];

// Add Recipe
const addrecipe = (event) => {
    event.preventDefault();

    let title = document.getElementById("recipeTitle").value;
    let category = document.getElementById("recipeCategory").value;
    let ingredients = document.getElementById("recipeIngredients").value;
    let instructions = document.getElementById("recipeInstructions").value;
    let image = document.getElementById("recipeImage").value || "images/image6.jpg";

    if (!title || !category || !ingredients || !instructions) {
        alert("Please fill in this field.");
        return;
    }

    let addnewrecipe = new Recipe(title, category, ingredients, instructions, image);
    newRecipes.push(addnewrecipe);

    // Clear form fields
    document.getElementById("recipeForm").reset();

    saveRecipe();
    displayrecipe();
    showCategories();
};

// Display Recipes
const displayrecipe = (recipesArray) => {
    let display = document.getElementById("recipesContainer");
    display.innerHTML = '';

    (recipesArray || newRecipes).forEach((recipe, index) => {
        let recipeCard = document.createElement("div");
        recipeCard.classList.add("recipe-card");
        recipeCard.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.title}">
            <h3>${recipe.title}</h3>
            <p><strong>Category:</strong> ${recipe.category}</p>
            <div class ="card-buttons">
                <button onclick="showRecipe(${index})" class="showrecipe-btn">View</button>
                
                <button onclick="deleteRecipe(${recipe.id})" class="delete-btn">Delete</button>
            </div>
        `;
        display.appendChild(recipeCard);
    });
};

// fetching random recipe from themealdb api

const fetchRandomRecipe = async () => {
    try {
        let res = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
        let data = await res.json();
        let meal = data.meals[0];

        //extract ingredients
        const ingredients = Array.from({length: 20}, (_, i) => 
            meal[`strIngredient${i+1}`]
        ).filter(ingredient => ingredient && ingredient.trim() !== '');

        let randomRecipe = new Recipe(
            meal.strMeal,
            meal.strCategory,
            ingredients.join(", "), 
            meal.strInstructions,
            meal.strMealThumb
        );

        // Add to array and save
        newRecipes.push(randomRecipe);
        saveRecipe();
        displayrecipe();
        showCategories();

    } catch(error) {
        console.log("Error fetching recipe:", error);
        // Consider adding user-facing error message
    }
}


const showCategories = () => {
    let show = document.getElementById("categoriesGrid");
    show.innerHTML = '';

    let uniqueCategory = [...new Set(newRecipes.map(recipe => recipe.category))];

    uniqueCategory.forEach(category => {
        let categoryBtn = document.createElement("button");
        categoryBtn.classList.add("category-btn");
        categoryBtn.textContent = category;
        categoryBtn.onclick = () => filteredCategory(category);
        show.appendChild(categoryBtn);
    });
};

document.addEventListener("DOMContentLoaded", () => {
    const searchButton = document.querySelector('.search-bar');
    if (searchButton) {
        searchButton.addEventListener("submit", searchRecipes);
    }
});


const filteredCategory = (category) => {
    let filteredRecipes = newRecipes.filter(recipe => 
        recipe.category.toLowerCase() === category.toLowerCase()
    );
    displayrecipe(filteredRecipes);
};



// Search Recipes
const searchRecipes = (event) => {
    event.preventDefault();

    let searchQuery = document.querySelector('input[name="q"]').value.toLowerCase();

    let filteredRecipe = newRecipes.filter(recipe =>
        recipe.title.toLowerCase().includes(searchQuery) ||
        recipe.category.toLowerCase().includes(searchQuery)
    );

    if (filteredRecipe.length > 0) {
        displayrecipe(filteredRecipe);
    } else {
        document.getElementById("recipesContainer").innerHTML = `<p>No recipes found.</p>`;
    }
};

// Save Recipes to Local Storage
const saveRecipe = () => {
    localStorage.setItem('newRecipes', JSON.stringify(newRecipes));

};

// Load Recipes from Local Storage
const loadRecipe = () => {
    let savedRecipe = localStorage.getItem("newRecipes");

    if (savedRecipe) {
        let parsedRecipe = JSON.parse(savedRecipe);

        newRecipes.length = 0; 
        parsedRecipe.forEach(recipeData => {
        let recipe = new Recipe(recipeData.title, recipeData.category, recipeData.ingredients, recipeData.instructions, recipeData.image);
        recipe.id = recipeData.id; 
        newRecipes.push(recipe);
});
        // debugging
        console.log("loaded Recipes: ", newRecipes);
    }
    showCategories()
    displayrecipe();
};


// to view the details of each recipe

const showRecipe = (index) => {
    const recipe = newRecipes[index];
    const modal = document.getElementById("recipeModal");
    const content = document.getElementById("recipeContent");


    content.innerHTML = `
    <h2>${recipe.title}</h2>
    <img src="${recipe.image}" alt="${recipe.title}">
    <div class="recipe-details">
        <p><strong>Category:</strong> ${recipe.category}</p>
        <div class="ingredients">
            <h3>Ingredients</h3>
            <ul>${recipe.ingredients}</ul>
        </div>
        <div class="instructions">
            <h3>Instructions</h3>
            <p>${recipe.instructions}</p>
        </div>
    </div>
    `;

    modal.style.display = 'flex';
    
};

// close modal
const closeModal = ()=>{
    document.getElementById("recipeModal").style.display = 'none';
    document.body.style.overflow = 'auto';
}

window.onclick = (event) =>{
    const modal = document.getElementById("recipeModal");
    if(event.target === modal){
        closeModal();
    }
}


const deleteRecipe = (id) => {
    const isConfirmed = confirm("Are you sure you want to delete this recipe?");

    if(!isConfirmed)
        return;

    const index = newRecipes.findIndex(recipe => recipe.id === id);
    if (index !== -1) {
        newRecipes.splice(index, 1);
        saveRecipe();
        displayrecipe();
        showCategories();
    }
};


//fetch random recipe
// fetchRandomRecipe();


// Load saved recipes
loadRecipe();

// Event Listeners
document.getElementById("recipeForm").addEventListener("submit", addrecipe);

