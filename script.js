let balance = Number(localStorage.getItem("luckyCasinoBalance")) || 10000;

let slotBet = 100;
let rouletteBet = 100;
let diceBet = 100;

let selectedRoulette = null;

const symbols = [
    "🍒",
    "🍋",
    "🍊",
    "💎",
    "7️⃣"
];

function save() {
    localStorage.setItem(
        "luckyCasinoBalance",
        balance
    );
}

function formatNumber(number) {
    return Math.floor(number).toLocaleString("ru-RU");
}

function updateBalance() {
    document.getElementById("balance").textContent =
        formatNumber(balance);

    save();
}

function showToast(text) {
    const toast = document.getElementById("toast");

    toast.textContent = text;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 1800);
}

function openGame(game) {

    document.querySelectorAll(".page")
        .forEach(page => page.classList.remove("active"));

    document.getElementById(game)
        .classList.add("active");

    window.scrollTo(0, 0);
}

function goHome() {

    document.querySelectorAll(".page")
        .forEach(page => page.classList.remove("active"));

    document.getElementById("home")
        .classList.add("active");

    window.scrollTo(0, 0);
}


/* =========================
   СТАВКИ
========================= */

function changeBet(value) {

    slotBet += value;

    if (slotBet < 100)
        slotBet = 100;

    if (slotBet > 5000)
        slotBet = 5000;

    document.getElementById("slotBet")
        .textContent = formatNumber(slotBet);
}

function changeRouletteBet(value) {

    rouletteBet += value;

    if (rouletteBet < 100)
        rouletteBet = 100;

    if (rouletteBet > 5000)
        rouletteBet = 5000;

    document.getElementById("rouletteBet")
        .textContent = formatNumber(rouletteBet);
}

function changeDiceBet(value) {

    diceBet += value;

    if (diceBet < 100)
        diceBet = 100;

    if (diceBet > 5000)
        diceBet = 5000;

    document.getElementById("diceBet")
        .textContent = formatNumber(diceBet);
}


/* =========================
   СЛОТЫ
========================= */

function randomSymbol() {

    return symbols[
        Math.floor(Math.random() * symbols.length)
    ];
}

function spinSlots() {

    if (balance < slotBet) {
        showToast("Недостаточно монет");
        return;
    }

    balance -= slotBet;
    updateBalance();

    const r1 = document.getElementById("reel1");
    const r2 = document.getElementById("reel2");
    const r3 = document.getElementById("reel3");

    const result = document.getElementById("slotResult");

    let counter = 0;

    const animation = setInterval(() => {

        r1.textContent = randomSymbol();
        r2.textContent = randomSymbol();
        r3.textContent = randomSymbol();

        counter++;

        if (counter >= 12) {

            clearInterval(animation);

            const a = randomSymbol();
            const b = randomSymbol();
            const c = randomSymbol();

            r1.textContent = a;
            r2.textContent = b;
            r3.textContent = c;

            let multiplier = 0;

            if (a === b && b === c) {

                if (a === "💎")
                    multiplier = 20;

                else if (a === "7️⃣")
                    multiplier = 15;

                else if (a === "🍒")
                    multiplier = 8;

                else if (a === "🍋")
                    multiplier = 5;

                else
                    multiplier = 3;
            }

            if (multiplier > 0) {

                const win = slotBet * multiplier;

                balance += win;

                result.textContent =
                    `🎉 Выигрыш +${formatNumber(win)} монет`;

                showToast(`Вы выиграли ${formatNumber(win)} 🪙`);

            } else {

                result.textContent =
                    "Не повезло. Попробуй ещё раз 😈";
            }

            updateBalance();
        }

    }, 80);
}


/* =========================
   РУЛЕТКА
========================= */

function setRouletteBet(color) {

    selectedRoulette = color;

    const names = {
        red: "🔴 Красное",
        black: "⚫ Чёрное",
        green: "🟢 Зелёное"
    };

    document.getElementById("rouletteColor")
        .textContent =
        `Выбрано: ${names[color]}`;
}

function getRouletteColor(number) {

    if (number === 0)
        return "green";

    const reds = [
        1, 3, 5, 7, 9,
        12, 14, 16, 18,
        19, 21, 23, 25,
        27, 30, 32, 34, 36
    ];

    return reds.includes(number)
        ? "red"
        : "black";
}

function spinRoulette() {

    if (!selectedRoulette) {
        showToast("Сначала выбери цвет");
        return;
    }

    if (balance < rouletteBet) {
        showToast("Недостаточно монет");
        return;
    }

    balance -= rouletteBet;
    updateBalance();

    const number =
        Math.floor(Math.random() * 37);

    const color =
        getRouletteColor(number);

    document.getElementById("rouletteNumber")
        .textContent = number;

    const colorNames = {
        red: "🔴 Красное",
        black: "⚫ Чёрное",
        green: "🟢 Зелёное"
    };

    document.getElementById("rouletteColor")
        .textContent =
        `Выпало: ${colorNames[color]}`;

    let multiplier = 0;

    if (color === selectedRoulette) {

        if (color === "green")
            multiplier = 14;
        else
            multiplier = 2;
    }

    if (multiplier > 0) {

        const win = rouletteBet * multiplier;

        balance += win;

        showToast(
            `🎉 Выигрыш +${formatNumber(win)} 🪙`
        );

    } else {

        showToast("😢 Ставка проиграла");
    }

    updateBalance();
}


/* =========================
   КОСТИ
========================= */

function playDice(type) {

    if (balance < diceBet) {
        showToast("Недостаточно монет");
        return;
    }

    balance -= diceBet;

    const number =
        Math.floor(Math.random() * 6) + 1;

    document.getElementById("diceValue")
        .textContent =
        ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"][number - 1];

    let win = false;

    if (type === "low" && number <= 3)
        win = true;

    if (type === "high" && number >= 4)
        win = true;

    if (win) {

        const reward = diceBet * 2;

        balance += reward;

        showToast(
            `🎉 +${formatNumber(reward)} монет`
        );

    } else {

        showToast("😢 Не повезло");
    }

    updateBalance();
}


/* =========================
   JACKPOT
========================= */

function playJackpot() {

    const cost = 500;

    if (balance < cost) {
        showToast("Недостаточно монет");
        return;
    }

    balance -= cost;

    const jackpot =
        Math.floor(
            Math.random() * 100
        ) + 1;

    const result =
        document.getElementById("jackpotResult");

    if (jackpot === 100) {

        const reward = 25000;

        balance += reward;

        result.textContent =
            `💎 JACKPOT! +${formatNumber(reward)} монет`;

        showToast("💎 JACKPOT!");

    } else if (jackpot >= 90) {

        const reward = 2500;

        balance += reward;

        result.textContent =
            `🎉 Большой выигрыш +${formatNumber(reward)}`;

        showToast(
            `+${formatNumber(reward)} 🪙`
        );

    } else {

        result.textContent =
            "😢 Jackpot не выпал";

        showToast("Попробуй ещё раз");
    }

    updateBalance();
}


/* =========================
   ЗАПУСК
========================= */

updateBalance();