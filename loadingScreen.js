let showLoadingScreen = function(canvas, engine) {
    let defaultLoadingScreen = new BABYLON.DefaultLoadingScreen(canvas, "Please Wait", "black");
  
    engine.loadingScreen = defaultLoadingScreen;
    engine.displayLoadingUI();
  };
  
  let hideLoadingScreen = function(engine) {
    engine.hideLoadingUI();
  };
  
  export {
    showLoadingScreen,
    hideLoadingScreen
  }