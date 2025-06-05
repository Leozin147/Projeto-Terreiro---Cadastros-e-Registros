const real   = document.getElementById("real-date");
  const display = document.getElementById("display-data");

  real.addEventListener("change", () => {
    if (!real.value) {
      display.value = "";
    } else {
      const [y, m, d] = real.value.split("-");
      display.value = `${d}/${m}/${y}`;
    }
  });

  if (real.value) {
    const [y, m, d] = real.value.split("-");
    display.value = `${d}/${m}/${y}`;
  }


document.querySelectorAll('.date-wrapper input[type="date"]').forEach(input => {
    const placeholder = input.nextElementSibling;
    function toggle() {
      if (input.value) {
        placeholder.style.opacity = '0';
      } else if (document.activeElement !== input) {
        placeholder.style.opacity = '1';
      }
    }
    input.addEventListener('change', toggle);
    input.addEventListener('input', toggle);
    input.addEventListener('focus', () => placeholder.style.opacity = '0');
    input.addEventListener('blur', toggle);
    toggle();
  });