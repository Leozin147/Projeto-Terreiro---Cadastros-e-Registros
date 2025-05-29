const real   = document.getElementById("real-date");
  const display = document.getElementById("display-data");

  // Quando o usuário escolhe ou limpa a data:
  real.addEventListener("change", () => {
    if (!real.value) {
      // limpou
      display.value = "";
    } else {
      // real.value é "YYYY-MM-DD" → formatamos pra DD/MM/YYYY
      const [y, m, d] = real.value.split("-");
      display.value = `${d}/${m}/${y}`;
    }
  });

  // Se quiser já refletir um valor inicial vindo do servidor:
  if (real.value) {
    const [y, m, d] = real.value.split("-");
    display.value = `${d}/${m}/${y}`;
  }


document.querySelectorAll('.date-wrapper input[type="date"]').forEach(input => {
    const placeholder = input.nextElementSibling;
    // função que esconde/mostra baseado no valor
    function toggle() {
      if (input.value) {
        placeholder.style.opacity = '0';
      } else if (document.activeElement !== input) {
        placeholder.style.opacity = '1';
      }
    }
    // esconde quando escolher data ou focar/blur
    input.addEventListener('change', toggle);
    input.addEventListener('input', toggle);
    input.addEventListener('focus', () => placeholder.style.opacity = '0');
    input.addEventListener('blur', toggle);
    // inicializa
    toggle();
  });