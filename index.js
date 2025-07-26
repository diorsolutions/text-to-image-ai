const themeToggle = document.querySelector(".theme-toggle"),
  promptBtn = document.querySelector(".prompt-btn"),
  galleryGrid = document.querySelector(".gallery-grid"),
  promptInput = document.querySelector(".prompt-input"),
  promptForm = document.querySelector(".prompt-form"),
  modelSelect = document.getElementById("model-select"),
  countSelect = document.getElementById("count-select"),
  
  ratioSelect = document.getElementById("ratio-select");

const HF_TOKEN = "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";
const examplePrompts = [
  "A magic forest with glowing plants and fairy homes among giant mushrooms",
  "An old steampunk airship floating through golden clouds at sunset",
  "A future Mars colony with glass domes and gardens against red mountains",
  "A dragon sleeping on gold coins in a crystal cave",
  "An underwater kingdom with merpeople and glowing coral buildings",
  "A floating island with waterfalls pouring into clouds below",
  "A witch's cottage in fall with magic herbs in the garden",
  "A robot painting in a sunny studio with art supplies around it",
  "A magical library with floating glowing books and spiral staircases",
  "A Japanese shrine during cherry blossom season with lanterns and misty mountains",
  "A cosmic beach with glowing sand and an aurora in the night sky",
  "A medieval marketplace with colorful tents and street performers",
  "A cyberpunk city with neon signs and flying cars at night",
  "A peaceful bamboo forest with a hidden ancient temple",
  "A giant turtle carrying a village on its back in the ocean",
];

(() => {
  const savedTheme = localStorage.getItem("theme");
  const changeDefaultSystemDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  const ifDarkTheme =
    savedTheme === "dark" || (!savedTheme && changeDefaultSystemDark);
  document.body.classList.toggle("dark-theme", ifDarkTheme);
  themeToggle.querySelector("i").className = ifDarkTheme
    ? "fa-solid fa-sun"
    : "fa-solid fa-moon";
})();

promptBtn.addEventListener("click", () => {
  const prompt =
    examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
  promptInput.value = prompt;
  promptInput.focus();
});

const createImageDimensions = (aspectRatio, baseSize = 512) => {
  const [width, height] = aspectRatio.split("/").map(Number);
  const scaleFactor = baseSize / Math.sqrt(width * height);

  let calculatWidth = Math.round(width * scaleFactor);
  let calculatHeight = Math.round(height * scaleFactor);

  calculatWidth = Math.floor(calculatWidth / 16) * 16;
  calculatHeight = Math.floor(calculatHeight / 16) * 16;

  return { width: calculatWidth, height: calculatHeight };
};

const updateImgCard = (imageIndex, umgUrl) => {
  const imgCard = document.getElementById(`img-card-${imageIndex}`);
  if (!imgCard) return;

  imgCard.classList.remove("loading");
  imgCard.innerHTML = `<img src="${umgUrl}" class="result-img"/>
                      <div class="img-overlay">
                        <a href="${umgUrl}" class="img-download-btn" download="${Date.now()}.png">
                          <i class="fa-solid fa-download"></i>
                        </a>
                      </div>
  `;
};

const generateImages = async (
  selectedModel,
  imageCount,
  aspectRatio,
  promptText
) => {
  const MODEL_URL = `https://router.huggingface.co/fal-ai/fal-ai/flux/dev/${selectedModel}`;

  const { width, height } = createImageDimensions(aspectRatio);
  const imagePromises = Array.from({ length: imageCount }, async (_, i) => {
    try {
      const response = await fetch(MODEL_URL, {
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: promptText,
          parameters: { width, height },
          options: { wait_for_model: true, user_cache: false },
        }),
      });

      if (!response.ok) throw new Error((await response.json())?.error);

      const result = await response.blob();

      updateImgCard(i, URL.createObjectURL(result));

      console.log(result);
    } catch (error) {
      console.log(error);
    }
  });

  await Promise.allSettled(imagePromises);
};

const createImageCards = (
  selectedModel,
  imageCount,
  aspectRatio,
  promptText
) => {
  galleryGrid.innerHTML = "";
  for (let i = 0; i < imageCount; i++) {
    galleryGrid.innerHTML += `
            <div class="img-card loading" id="img-card-${i}" style="aspect-ratio: ${aspectRatio}" >
              <div class="status-container">
                <div class="spinner"></div>
                <i class="fa-solid fa-download"></i>
                <p class="status-text">Generating...</p>
              </div>
            </div>`;
  }

  generateImages(selectedModel, imageCount, aspectRatio, promptText);
};

const handleSubmitForm = (e) => {
  e.preventDefault();

  const selectedModel = modelSelect.value,
    imageCount = parseInt(countSelect.value) || 1,
    aspectRatio = ratioSelect.value || "1/1",
    promptText = promptInput.value.trim();

  createImageCards(selectedModel, imageCount, aspectRatio, promptText);
};

themeToggle.addEventListener("click", () => {
  const ifDarkTheme = document.body.classList.toggle("dark-theme");
  localStorage.setItem("theme", ifDarkTheme ? "dark" : "light");
  themeToggle.querySelector("i").className = ifDarkTheme
    ? "fa-solid fa-sun"
    : "fa-solid fa-moon";
});

promptForm.addEventListener("submit", handleSubmitForm);
