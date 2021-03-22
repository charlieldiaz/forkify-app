import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import BookmarksView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import addRecipeView from './views/addRecipeView.js';

import { MODAL_CLOSE_SEC } from './config.js';
import 'regenerator-runtime/runtime';
import 'core-js/stable';
import bookmarksView from './views/bookmarksView.js';

///////////////////////////////////////
if (module.hot) {
  module.hot.accept();
}
const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    // 0) results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());
    // 0.1) updating bookmarks view
    bookmarksView.update(model.state.bookmarks);

    // 1)Loading recipe
    await model.loadRecipe(id);

    // 2)Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    // 1) get query
    const query = searchView.getQuery();
    if (!query) return;
    // 2) load searchresults
    await model.loadSearchResults(query);

    //3) render results

    resultsView.render(model.getSearchResultsPage());

    //4) render the pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

// window.addEventListener('hashchange', controlRecipes);
// window.addEventListener('load', controlRecipes);

const controlPagination = function (goToPage) {
  //3) render new results

  resultsView.render(model.getSearchResultsPage(goToPage));

  //4) render new the pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // Update the recipe servings (in state)
  model.updateServings(newServings);
  //Update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // 1)add / remove bookmark
  if (!model.state.recipe.addBookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // 2)Update recipe View
  recipeView.update(model.state.recipe);

  //3) Render Bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    //Show loading spinner
    addRecipeView.renderSpinner();

    //Upload the new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    ///Render recipe
    recipeView.render(model.state.recipe);

    /// Success message
    addRecipeView.renderMessage();

    //Render the bookmark view
    bookmarksView.render(model.state.bookmarks);

    // Change Id in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.log(err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();

// ////////////////////////////////////
// ///  To be use only during development

// const clearBookmarks = function () {
//   localStorage.clear('bookmarks');
// };

// clearBookmarks();
// ////////////////////////////////////
// ////////////////////////////////////
