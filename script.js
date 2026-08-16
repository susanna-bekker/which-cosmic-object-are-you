let current = "start";

const introScreen = document.getElementById("intro-screen");
const questionCard = document.getElementById("question-card");
const restartBtn = document.getElementById("restart-btn");
const text = document.getElementById("text");
const buttonsContainer = document.getElementById("buttons");

/* ===== START BUTTON ===== */
document.getElementById("start-btn").onclick = () => {
    introScreen.style.display = "none";
    questionCard.style.display = "block";
    restartBtn.style.display = "none";
    current = "start";
    render();
};

/* ===== RESTART ===== */
restartBtn.onclick = () => {
    current = "start";

    // очистка
    text.innerHTML = "";
    document.querySelectorAll("button.answer").forEach(b => b.remove());

    // показать intro
    introScreen.style.display = "flex";
    questionCard.style.display = "none";
    restartBtn.style.display = "none";
};

function typeText(element, fullText, speed = 80, callback) {
    element.innerHTML = ""; // очищаем
    const spans = [];

    // создаём все буквы сразу как inline элементы
    for (let i = 0; i < fullText.length; i++) {
        const char = fullText[i];

        const span = document.createElement("span");
        span.textContent = char === "\n" ? " " : char; // заменяем \n на пробел для естественного переноса
        span.style.opacity = "0";
        span.style.transition = "opacity";

        element.appendChild(span);
        spans.push(span);
    }

    // анимация появления
    let i = 0;
    function showNext() {
        if (i < spans.length) {
            spans[i].style.opacity = "1";
            // если это пробел, сразу показать следующую букву
            if (spans[i].textContent === " ") {
                i++;
                showNext(); // рекурсивно без задержки
            } else {
                i++;
                setTimeout(showNext, speed); // обычная задержка
            }
        } else {
            if (callback) callback();
        }
    }
    showNext();
}


/* ===== RENDER ===== */
function render() {
    const node = data[current];

    // удалить старые yes/no
    document.querySelectorAll("button.answer").forEach(b => b.remove());

    // показать restart после старта
    restartBtn.style.display = "block";

    /* ===== RESULT ===== */
    /* ===== FINAL RESULT ===== */
    if (!node) {
        // Очистка текущего текста и кнопок
        text.innerHTML = "";
        document.querySelectorAll("button.answer").forEach(b => b.remove());

        // Preload the result image while showing "You are..."
        // Картинка берётся уменьшенная: карточка всё равно не шире 300px,
        // а полноразмерный PNG весит несколько мегабайт.
        const result = results[current];
        const picture = `pictures/small/${current}.webp`;
        const preloadImg = new Image();
        preloadImg.src = picture;

        // Создаем временный элемент для "You are..."
        const overlayText = document.createElement("div");
        overlayText.textContent = "You are...";
        overlayText.style.position = "fixed";
        overlayText.style.top = "50%";
        overlayText.style.left = "50%";
        overlayText.style.transform = "translate(-50%, -50%)";
        overlayText.style.fontFamily = "'Gaegu', cursive";
        overlayText.style.fontSize = "60px";
        overlayText.style.color = "#F3E84F";
        overlayText.style.textAlign = "center";
        overlayText.style.zIndex = "1000";

        // Добавляем overlayText в тело документа
        document.body.appendChild(overlayText);

        // Печатаем "You are..."
        typeText(overlayText, "You are...", 100, () => {
            // Пауза 1 сек
            setTimeout(() => {
                // Плавное исчезновение
                overlayText.style.transition = "opacity 0.6s ease";
                overlayText.style.opacity = "0";

                setTimeout(() => {
                    // Удаляем overlayText из DOM
                    if (overlayText.parentNode === document.body) {
                        document.body.removeChild(overlayText);
                    }
                    introScreen.style.display = "none";

                    // Показ финального результата (image already preloaded)
                    const container = document.createElement("div");
                    container.className = "result-card-container";

                    container.innerHTML = `
                        <div class="result-card">
                            <div class="result-image"></div>
                            <div class="result-content">
                                <h2 style="color:${result.color}; border-bottom:2px solid ${result.color};">
                                    ${keepNamesWhole(current)}
                                </h2>
                                ${result.text.split("\n\n").map(p => `<p>${keepNamesWhole(p)}</p>`).join("")}
                            </div>
                        </div>
                    `;

                    // путь ставим отдельно: в имени бывает апостроф ("Halley's Comet"),
                    // который ломает url('...') внутри атрибута style
                    container.querySelector(".result-image").style.backgroundImage = `url("${picture}")`;

                    text.appendChild(container);

                    setTimeout(() => {
                        container.style.opacity = "1";
                        container.style.transform = "scale(1)";
                    }, 100);
                }, 600); // время исчезновения
            }, 1000); // пауза 1 сек
        });

        return;
    }

    /* ===== QUESTION ===== */
    typeText(text, node.text, 50, () => {

        // создаём кнопки
        ["no", "yes"].forEach(answer => {
            const btn = document.createElement("button");
            btn.textContent = answer.toUpperCase();
            btn.className = `answer ${answer}`;

            btn.onclick = () => {
                current = node[answer];
                render();
            };

            buttonsContainer.appendChild(btn);

            // Делаем небольшую задержку, чтобы анимация была плавной
            setTimeout(() => {
                btn.classList.add("show");

            }, 50);
        });

    });
}
