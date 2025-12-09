function distanciaKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function ordenarPontos(latUser, lonUser) {
  return pontos
    .map(p => ({ ...p, dist: distanciaKm(latUser, lonUser, p.lat, p.lon) }))
    .sort((a, b) => a.dist - b.dist);
}

// Link universal do Google Maps (funciona bem em Android e iOS; abre app se instalado)
function linkRotaGoogle(latOrigem, lonOrigem, latDest, lonDest) {
  return `https://www.google.com/maps/dir/?api=1&origin=${latOrigem},${lonOrigem}&destination=${latDest},${lonDest}&travelmode=driving`;
}

function mostrarResultado(lat, lon, origemTexto) {
  const r = document.getElementById("resultado");
  if (!pontos || !pontos.length) {
    r.innerHTML = "Nenhum ponto cadastrado.";
    return;
  }

  const ordenados = ordenarPontos(lat, lon);

  let html = `<p><b>Origem:</b> ${origemTexto}</p>`;
  html += `<p>Foram encontrados ${ordenados.length} pontos. O primeiro é o mais próximo.</p>`;
  html += "<ul class='lista-pontos'>";

  ordenados.forEach((p, i) => {
    const link = linkRotaGoogle(lat, lon, p.lat, p.lon);
    html += `
      <li>
        <b>${i + 1}. ${p.nome}</b><br>
        Distância: ${p.dist.toFixed(2)} km<br>
        <a class="btn-mini" href="${link}" target="_blank" rel="noopener noreferrer">Traçar rota</a>
      </li>
    `;
  });

  html += "</ul>";
  r.innerHTML = html;
}

async function geocodificar(endereco) {
  const url = "https://nominatim.openstreetmap.org/search?format=json&q=" + encodeURIComponent(endereco);
  const resp = await fetch(url, { headers: { "Accept-Language": "pt-BR" } });
  if (!resp.ok) throw new Error("Falha na geocodificação");
  const dados = await resp.json();
  if (!dados.length) throw new Error("Endereço não encontrado");
  return {
    lat: parseFloat(dados[0].lat),
    lon: parseFloat(dados[0].lon)
  };
}

async function processarEndereco() {
  const campo = document.getElementById("endereco");
  const r = document.getElementById("resultado");
  const end = campo.value.trim();

  if (!end) {
    r.innerHTML = "Digite um endereço.";
    return;
  }

  r.innerHTML = "Localizando endereço...";

  try {
    const { lat, lon } = await geocodificar(end);
    mostrarResultado(lat, lon, "Endereço digitado");
  } catch (e) {
    r.innerHTML = "Erro: " + e.message;
  }
}

function processarGPS() {
  const r = document.getElementById("resultado");
  if (!navigator.geolocation) {
    r.innerHTML = "Seu navegador não suporta geolocalização.";
    return;
  }

  r.innerHTML = "Obtendo localização atual...";

  navigator.geolocation.getCurrentPosition(
    pos => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      mostrarResultado(lat, lon, "Minha localização (GPS)");
    },
    err => {
      r.innerHTML = "Não foi possível obter sua localização (GPS bloqueado?).";
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
}
