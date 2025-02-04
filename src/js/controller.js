import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import addIngredientView from './views/addIngredientView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime/runtime';

// if (model.hot) {
//   model.hot.accept();
// }

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);

    //Render spinner
    await model.loadRecipe(id);
    //2) Render
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    const query = searchView.getQuery();
    if (!query) return;

    await model.loadSearchResults(query);

    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());

    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  resultsView.render(model.getSearchResultsPage(goToPage));

  paginationView.render(model.state.search);
};

const controlSortSearchResult = function () {
  resultsView.render(model.sortSearchResultsPage(!model.state.sorted));
  if (model.state.sorted == true) {
    document.getElementsByClassName('btn--sort')[0].innerHTML = '&#8593; SORT';
  }
  if (model.state.sorted == false) {
    document.getElementsByClassName('btn--sort')[0].innerHTML = '&#8595; SORT';
  }
  model.state.sorted = !model.state.sorted;
  console.log(model.state.sorted);
};

const controlServings = function (newServings) {
  model.updateServings(newServings);

  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const conrtolAddBookmark = function () {
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  recipeView.update(model.state.recipe);

  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};
const controlAddRecipe = async function (newRecipe) {
  try {
    addRecipeView.renderSpinner();

    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    recipeView.render(model.state.recipe);

    addRecipeView.renderMessage();

    bookmarksView.render(model.state.bookmarks);

    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('💥', err);
    addRecipeView.renderError(err.message);
  }
};
const controlAddIngredients = function () {
  model.state.addIngredient += 1;
};
const controlDeleteIngredients = function () {
  model.state.addIngredient = model.state.addIngredient - 1;
};
const controlClearBookmarks = function () {
  model.clearBookmarks();
  // location.reload();
  window.location.href = 'http://localhost:1234/';
};
const init = function () {
  addRecipeView.addHandlerUpload(controlAddRecipe);
  addIngredientView.addHandlerClickAddIngredients(controlAddIngredients);
  addIngredientView.addHandlerClickDeleteIngredients(controlDeleteIngredients);
  bookmarksView.addHandlerRender(controlBookmarks);
  bookmarksView.addHandlerClear(controlClearBookmarks);
  paginationView.addHandlerClick(controlPagination);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(conrtolAddBookmark);
  resultsView.addHandlerClick(controlSortSearchResult);
  searchView.addHandlerSearch(controlSearchResults);
};
init();
