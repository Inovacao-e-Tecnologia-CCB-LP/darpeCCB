function formatarData(d) {
  return new Date(d + "T00:00:00").toLocaleDateString("pt-BR");
}

function formatarHorario(horario) {
  if (horario && typeof horario === "string" && horario.startsWith("'")) {
    return horario.slice(1);
  }
  return horario;
}

function isMobile() {
  return window.innerWidth < 768;
}
