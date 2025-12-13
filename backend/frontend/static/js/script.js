let genMode = 1;
let allowResetGenList = true;
let numsA = [];
let availableNumbersFromSettings = [];
let usedSettingsNumbers = [];
let lastMin = null;
let lastMax = null;
let isGenerating = false;
let generatedNumbers = [];

let settingsData = JSON.parse(
  document.getElementById("settings-json").textContent || "[]"
);

function updateAvailableNumbers(min, max, callback = null) {
  fetch("/api/settings/")
    .then((response) => response.json())
    .then((data) => {
      settingsData = data.settings_data || [];
      if (settingsData.length > 0) {
        const setting = settingsData[0];
        availableNumbersFromSettings = setting.numbers
          .filter((num) => num.value >= min && num.value <= max && !num.flag)
          .map((num) => num.value);
      } else {
        availableNumbersFromSettings = [];
      }

      if (callback) callback();
    })
    .catch((error) => {
      console.error("Ошибка загрузки настроек:", error);
      availableNumbersFromSettings = [];
      if (callback) callback();
    });
}

function changeMode(e) {
  genMode = e.checked ? 2 : 1;
}

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

function resetList() {
  numsA = [];
  availableNumbersFromSettings = [];
  usedSettingsNumbers = [];
  generatedNumbers = [];
  allowResetGenList = true;
  document.getElementById("resetGenMode2").style.display = "none";

  if (document.getElementById("no-repeats").checked) {
    $("#time-stop").hide("0");
    $("#time-go").show("0");
    $(".out").css("display", "none");
    document.getElementById("out").innerHTML =
      '<span class="digit big" id="out">0</span>';
    document.getElementById("out-hide").innerHTML =
      document.getElementById("out").innerHTML;
    $(".out").slideDown("1000");
  }
}

$(document).ready(function () {
  document.getElementById("no-repeats").checked = false;
  d = new Date();
  time_zone = Math.abs(d.getTimezoneOffset() / 60);
  $("#gmt").text(time_zone);

  $(".js-generate").click(function () {
    if (isGenerating) return;
    isGenerating = true;

    let min = parseInt(document.getElementById("min").value);
    let max = parseInt(document.getElementById("max").value);
    if (min > max) min = max;
    let count = parseInt(document.getElementById("count").value);
    if (count < 1) count = 1;
    let repeatsMode = !document.getElementById("repeats").checked;
    let OutNums = [];
    let TimeModeGo = false;
    $(".out").css("display", "none");
    const d = new Date();
    const time_zone = Math.abs(d.getTimezoneOffset() / 60);
    $("#gmt-stop").text(time_zone);
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    const s = String(d.getSeconds()).padStart(2, "0");
    const format = [d.getDate(), d.getMonth() + 1, d.getFullYear()].join(".");
    const clockStop = document.getElementById("clock-stop");
    const dateStop = document.getElementById("date-stop");

    if (clockStop) {
      clockStop.innerHTML = `${h}:${m}:${s}`;
    }

    if (dateStop) {
      dateStop.innerHTML = format;
    }

    updateAvailableNumbers(min, max, function () {
      console.log(repeatsMode, OutNums, count, genMode, availableNumbersFromSettings);
      if (genMode == 1) {
        let OutNums = [];
        let availableForRandom = [];

        let guaranteed = availableNumbersFromSettings.slice();
        

        let guaranteedCount = Math.min(count, guaranteed.length);

        // guaranteed = shuffleArray(guaranteed.slice());

        for (let i = 0; i < guaranteedCount; i++) {
          let val = guaranteed[i];
          OutNums.push(val);
          usedSettingsNumbers.push(val);
          generatedNumbers.push(val);

          fetch("/api/set-flag-by-value/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": getCookie("csrftoken"),
            },
            body: JSON.stringify({ value: val }),
          }).catch((err) => console.error("Ошибка отправки флага:", err));
        }

        let remainingCount = count - guaranteedCount;

        if (remainingCount > 0) {
          for (let i = min; i <= max; i++) {
            availableForRandom.push(i);
          }

          availableForRandom = availableForRandom.filter(
            (n) => !OutNums.includes(n)
          );

          // availableForRandom = shuffleArray(availableForRandom);
          let take = Math.min(remainingCount, availableForRandom.length);
          for (let i = 0; i < take; i++) {
let randIndex = getRandomInt(0, availableForRandom.length - 1);
OutNums.push(availableForRandom[randIndex]);
availableForRandom.splice(randIndex, 1);
          }
        }
        let startSpan =
          OutNums.length <= 4
            ? '<span class="digit big" id="out">'
            : '<span class="digit small" id="out">';

        document.getElementById("out").innerHTML =
          startSpan + OutNums.join(" ") + "</span>";
        document.getElementById("out-hide").innerHTML =
          startSpan + OutNums.join(" ") + "</span>";
        $("#js-get-clip").html(OutNums.join(" "));

        if (OutNums.length === 0) {
          resetList();
        }
const d = new Date();

const h1 = String(d.getHours()).padStart(2, "0");
const m1 = String(d.getMinutes()).padStart(2, "0");
const s1 = String(d.getSeconds()).padStart(2, "0");

const day = String(d.getDate()).padStart(2, "0");
const month = String(d.getMonth() + 1).padStart(2, "0");
const year = d.getFullYear();

// GMT смещение
const gmtOffset = -d.getTimezoneOffset() / 60;
const gmtSign = gmtOffset >= 0 ? "+" : "-";

const formatted = `Создано: ${day}.${month}.${year} в ${h1}:${m1}:${s1} GMT ${gmtSign}${Math.abs(gmtOffset)}`;

document.getElementById("time-stop").textContent = formatted;


      } else {
        // genMode == 2 — режим без повторений
        if (numsA.length == 0 && allowResetGenList) {
          for (let i = min; i <= max; i++) {
            numsA.push(i);
          }
          numsA = numsA.filter((n) => !generatedNumbers.includes(n));
          allowResetGenList = false;
          document.getElementById("resetGenMode2").style.display = "none";
        }

        if (count > numsA.length) count = numsA.length;

        let OutNums = [];

        // === ПРИОРИТЕТ ДЛЯ ВСЕХ ДОСТУПНЫХ ЧИСЕЛ ИЗ SETTINGS ===
        let guaranteed = availableNumbersFromSettings.filter(
          (n) => numsA.includes(n) && !usedSettingsNumbers.includes(n)
        );

        // Перемешиваем, чтобы порядок был случайным среди гарантированных
        // guaranteed = shuffleArray(guaranteed.slice());

        // Сколько гарантированных можем взять (не больше count и не больше доступных)
        let guaranteedCount = Math.min(count, guaranteed.length);

        for (let i = 0; i < guaranteedCount; i++) {
          let val = guaranteed[i];
          OutNums.push(val);

          // Удаляем из основного пула
          let indexInNumsA = numsA.indexOf(val);
          if (indexInNumsA !== -1) numsA.splice(indexInNumsA, 1);

          // Помечаем как использованные
          usedSettingsNumbers.push(val);
          generatedNumbers.push(val);

          // Отправляем флаг на сервер
          fetch("/api/set-flag-by-value/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": getCookie("csrftoken"),
            },
            body: JSON.stringify({ value: val }),
          }).catch((err) => console.error("Ошибка отправки флага:", err));
        }

        // Оставшееся количество чисел добираем случайно
        let remainingCount = count - guaranteedCount;

        for (let i = 0; i < remainingCount; i++) {
          if (numsA.length === 0) break;
          let RandIndex = getRandomInt(0, numsA.length - 1);
          let num = numsA[RandIndex];
          OutNums.push(num);
          numsA.splice(RandIndex, 1);
        }

        $("#js-get-clip").html(OutNums.join(" "));

        if (OutNums.length !== 0) {
          let startSpan =
            OutNums.length <= 4
              ? '<span class="digit big" id="out">'
              : '<span class="digit small" id="out">';
          document.getElementById("out").innerHTML =
            startSpan + OutNums.join(" ") + "</span>";
          document.getElementById("out-hide").innerHTML =
            startSpan + OutNums.join(" ") + "</span>";
const d = new Date();

const h2 = String(d.getHours()).padStart(2, "0");
const m2 = String(d.getMinutes()).padStart(2, "0");
const s2 = String(d.getSeconds()).padStart(2, "0");

const day = String(d.getDate()).padStart(2, "0");
const month = String(d.getMonth() + 1).padStart(2, "0");
const year = d.getFullYear();

// GMT смещение
const gmtOffset = -d.getTimezoneOffset() / 60;
const gmtSign = gmtOffset >= 0 ? "+" : "-";

const formatted =
  `Создано: ${day}.${month}.${year} в ${h2}:${m2}:${s2} GMT ${gmtSign}${Math.abs(gmtOffset)}`;

const timeStop = document.getElementById("time-stop");
if (timeStop) {
  timeStop.textContent = formatted;
}

        } else {
          document.getElementById("out").innerHTML =
            '<span class="digit small" id="out">Чисел больше нет</span>';
          document.getElementById("time-stop").innerHTML = "Создано: -";
          TimeModeGo = true;
          document.getElementById("out-hide").innerHTML =
            document.getElementById("out").innerHTML;
          document.getElementById("resetGenMode2").style.display =
            "inline-block";
        }

        // Добавляем все сгенерированные в общий список (на случай, если были не из settings)
        OutNums.forEach((n) => {
          if (!generatedNumbers.includes(n)) generatedNumbers.push(n);
        });
      }
      $(".out").slideDown("1000");

      $("html, body").animate({ scrollTop: $(".overlay").offset().top }, 500);

      if (TimeModeGo == false) {
        $("#time-go").hide("0");
        $("#time-stop").show("0");
      } else {
        $("#time-stop").hide("0");
        $("#time-go").show("0");
      }

      $(".js-clipboard").text("СКОПИРОВАТЬ РЕЗУЛЬТАТ");
    });
    setTimeout(() => {
      isGenerating = false;
    }, 250);
  });

  new Clipboard(".js-clipboard");

  $(".js-to-png").click(function () {
    $("html, body").animate({ scrollTop: 0 });

    setTimeout(function () {
      html2canvas(saveBody1).then(function (canvas) {
        const dataURL = canvas.toDataURL("image/png");

        $.ajax({
          type: "POST",
          url: "/api/save-screenshot/",
          data: { screenshot: dataURL },
          success: function (response) {
            window.open(response.url, "_blank");
          },
          error: function (error) {
            console.error(error);
          },
        });
      });
    }, 500);
  });

  $("#resetGenMode2").click(resetList);
  setInterval(function () {
    const d = new Date();
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    const s = String(d.getSeconds()).padStart(2, "0");
    document.getElementById("clock").innerHTML = `${h}:${m}:${s}`;
  }, 1000);

  setInterval(function () {
    const d = new Date();
    const format = [d.getDate(), d.getMonth() + 1, d.getFullYear()].join(".");
    document.getElementById("date").innerHTML = format;
  }, 900);
});

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
