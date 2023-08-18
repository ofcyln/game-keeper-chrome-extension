const addGameButton = document.getElementById("addGameToList");
// const clearListButton = document.getElementById("clearList");
const gameListElement = document.getElementById("gameList");
const errorMessageElement = document.getElementById("errorMessage");
const baseURLs = [
  "https://www.ign.com/reviews/",
  "https://www.ign.com/articles/",
  "https://www.ign.com/reviews/",
  "https://ign.com/articles/",
  "https://www.ign.com/games/",
  "https://ign.com/games/",
];
const excludedReviewURLs = ["movies", "tv", "tech", "comics"];

const isCorrectURL = (tab) =>
  baseURLs.some((url) => tab.url.includes(url)) &&
  !excludedReviewURLs.some((url) => tab.url.includes(url));

const gameList = () =>
  chrome.storage.local.get({ gameList: [] }, ({ gameList }) => {
    if (gameList.length > 0) {
      updateGameListUI(gameList);
    }
  });

function isDuplicateGame(gameList, title) {
  return gameList.some((game) => game.title === title);
}

gameList();

chrome.storage.local.get({ gameList: [] }, ({ gameList }) => {
  const gameListLength = gameList.length;
});

chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  if (!isCorrectURL(tab)) {
    addGameButton.disabled = true;
    addGameButton.classList.add("opacity-50", "cursor-not-allowed");

    const errorMessage = document.createElement("p");
    errorMessage.classList.add("text-red-500");
    errorMessage.textContent =
      "You need to be on a game review page in IGN to add any game to the list.";
    gameListElement.appendChild(errorMessage);
  }
});

addGameButton.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (isCorrectURL(tab)) {
      const gameTitle = tab.title.trim().split(" - ")[0];
      const gameData = { title: gameTitle };

      chrome.storage.local.get({ gameList: [] }, ({ gameList }) => {
        if (!isDuplicateGame(gameList, gameTitle)) {
          gameList.push(gameData);
          chrome.storage.local.set({ gameList }, () => {
            console.log("Game added to list:", gameList);
            updateGameListUI(gameList);
          });
        } else {
          const message = document.createElement("p");
          errorMessage.classList.add("text-red-500");
          message.textContent = `${gameTitle} is already in the list!`;
          errorMessageElement.appendChild(message);
        }
      });

      gameList();
    } else {
      console.log("This is not an IGN reviews page.");
    }
  });
});

function updateGameListUI(gameList) {
  gameListElement.innerHTML = "";

  if (gameList.length > 0) {
    for (const [index, game] of gameList.entries()) {
      const listItem = document.createElement("div");
      listItem.classList.add(
        "bg-white",
        "p-4",
        "my-2",
        "rounded",
        "shadow-sm",
        "flex",
        "justify-between"
      );

      const gameName = document.createElement("p");
      gameName.classList.add("text-green-500", "font-bold", "text-base");
      gameName.textContent = `${index + 1} - ${game.title}`;

      const removeButton = document.createElement("button");
      removeButton.classList.add("text-red-500", "hover:text-red-700", "ml-2");
      removeButton.innerHTML = "X";
      removeButton.addEventListener("click", () => {
        gameList.splice(index, 1);
        chrome.storage.local.set({ gameList }, () => {
          updateGameListUI(gameList);
        });
      });

      listItem.appendChild(gameName);
      listItem.appendChild(removeButton);
      gameListElement.appendChild(listItem);
    }
  } else {
    const message = document.createElement("p");
    message.textContent = "No games in the list.";
    gameListElement.appendChild(message);
  }
}
