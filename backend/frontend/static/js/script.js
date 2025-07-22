let genMode = 1;
let allowResetGenList = true;
let numsA = [];
let availableNumbersFromSettings = [];
let usedSettingsNumbers = [];
let lastMin = null;
let lastMax = null;


function updateAvailableNumbers(min, max) {
  if (typeof settingsData !== "undefined" && settingsData.length > 0) {
    const setting = settingsData[0];
    availableNumbersFromSettings = setting.numbers
      .filter((num) => num.value >= min && num.value <= max && !num.flag)
      .map((num) => num.value);

    usedSettingsNumbers = [];
  } else {
    availableNumbersFromSettings = [];
    usedSettingsNumbers = [];
  }
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
    let TimeModeGo = false;

    let min = parseInt(document.getElementById("min").value);
    let max = parseInt(document.getElementById("max").value);
    if (min > max) min = max;
    let count = parseInt(document.getElementById("count").value);
    if (count < 1) count = 1;
    let repeatsMode = document.getElementById("repeats").checked;
    let OutNums = [];
    $(".out").css("display", "none");

    if (min !== lastMin || max !== lastMax) {
      updateAvailableNumbers(min, max);
      lastMin = min;
      lastMax = max;
    }

    if (genMode == 1 || availableNumbersFromSettings.length > 0) {
      let numsA1 = [];

      if (availableNumbersFromSettings.length > 0) {
        numsA1 = availableNumbersFromSettings.filter(
          (n) => !usedSettingsNumbers.includes(n)
        );

        let guaranteedCount = Math.min(count, numsA1.length);

        for (let i = 0; i < guaranteedCount; i++) {
          let val = numsA1[i];
          OutNums.push(val);
          usedSettingsNumbers.push(val);

          fetch("/api/set-flag-by-value/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": getCookie("csrftoken"),
            },
            body: JSON.stringify({ value: val }),
          }).catch((error) => console.error("Ошибка отправки флага:", error));
        }

        count -= guaranteedCount;
      }

      if (count > 0) {
        for (let i = min; i <= max; i++) {
          numsA1.push(i);
        }

        if (!repeatsMode) {
          numsA1 = numsA1.filter((n) => !OutNums.includes(n));
        }

        if (count > numsA1.length) count = numsA1.length;

        if (repeatsMode) {
          for (let i = 0; i < count; i++) {
            let RandIndex = getRandomInt(0, numsA1.length - 1);
            OutNums.push(numsA1[RandIndex]);
            numsA1.splice(RandIndex, 1);
          }
        } else {
          for (let i = 0; i < count; i++) {
            OutNums.push(getRandomInt(min, max));
          }
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
    } else {
      if (numsA.length == 0 && allowResetGenList) {
        for (let i = min; i <= max; i++) {
          numsA.push(i);
        }
        allowResetGenList = false;
        document.getElementById("resetGenMode2").style.display = "none";
      }
      if (count > numsA.length) count = numsA.length;

      for (let i = 0; i < count; i++) {
        let RandIndex = getRandomInt(0, numsA.length - 1);
        OutNums.push(numsA[RandIndex]);
        numsA.splice(RandIndex, 1);
      }

      $("#js-get-clip").html(OutNums.join(" "));

      if (OutNums.length != 0) {
        let startSpan = "";

        if (count <= 4) startSpan = '<span class="digit big" id="out">';
        else startSpan = '<span class="digit small" id="out">';

        document.getElementById("out").innerHTML =
          startSpan + OutNums.join(" ") + "</span>";
        document.getElementById("out-hide").innerHTML =
          startSpan + OutNums.join(" ") + "</span>";
      } else {
        document.getElementById("out").innerHTML =
          '<span class="digit small" id="out">Чисел больше нет</span>';
        document.getElementById("out-hide").innerHTML =
          document.getElementById("out").innerHTML;
        document.getElementById("resetGenMode2").style.display = "inline-block";
        TimeModeGo = true;
      }
    }

    $(".out").slideDown("1000");
    $("html, body").animate({ scrollTop: $(".overlay").offset().top }, 500);
    d = new Date();
    time_zone = Math.abs(d.getTimezoneOffset() / 60);
    $("#gmt-stop").text(time_zone);
    (date = new Date()),
      (h = date.getHours()),
      (m = date.getMinutes()),
      (s = date.getSeconds()),
      (h = h < 10 ? "0" + h : h),
      (m = m < 10 ? "0" + m : m),
      (s = s < 10 ? "0" + s : s),
      (document.getElementById("clock-stop").innerHTML = h + ":" + m + ":" + s);
    var date = new Date();
    var format = [date.getDate(), date.getMonth() + 1, date.getFullYear()].join(
      "."
    );
    document.getElementById("date-stop").innerHTML = format;
    if (TimeModeGo == false) {
      $("#time-go").hide("0");
      $("#time-stop").show("0");
    } else {
      $("#time-stop").hide("0");
      $("#time-go").show("0");
    }
    $(".js-clipboard").text("СКОПИРОВАТЬ РЕЗУЛЬТАТ");
  });

  new Clipboard(".js-clipboard");

  $(".js-to-png").click(function () {
    console.log("js-to-png");
    $("html, body").animate({ scrollTop: 0 });

    setTimeout(function () {
      html2canvas(saveBody1).then(function (canvas) {
        const dataURL = canvas.toDataURL("image/png");

        $.ajax({
          type: "POST",
          url: "/api/save-screenshot/",
          data: { screenshot: dataURL },
          success: function (response) {
            console.log("OK");
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
});

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
