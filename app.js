function distanciaKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
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

function ordenarPorDistancia(latUser, lonUser) {
  return pontos
    .map(p => ({
      ...p,
      distancia: distanciaKm(latUser, lonUser, p.lat, p.lon)
    }))
    .sort((a, b) => a.distancia - b.distancia);
}

function gerarLinksRota(latOrigem, lonOrigem, latDest, lonDest, label) {
  const nome = encodeURIComponent(label || "Destino");
  const geo = `geo:${latDest},${lonDest}?q=${latDest},${lonDest}(${nome})`;
  const gmaps = `https://www.google.com/maps/dir/?api=1&origin=${latOrigem},${lonOrigem}&destination=${latDest},${lonDest}&travelmode=driving`;
  const waze = `https://waze.com/ul?ll=${latDest},${lonDest}&navigate=yes`;
  return { geo, gmaps, waze };
}

function mostrarResultado(lat, lon, origemTexto) {
  const r = document.getElementById("resultado");
  if (!pontos || !pontos.length) {
    r.innerHTML = "Nenhum ponto cadastrado.";
    return;
  }

  const ordenados = ordenarPorDistancia(lat, lon);

  let html = "";
  html += `<p><b>Origem:</b> ${origemTexto}</p>`;
  html += `<p>Foram encontrados ${ordenados.length} pontos. O primeiro é o mais próximo.</p>`;
  html += `<ul class="lista-pontos">`;

  ordenados.forEach((p, idx) => {
    const links = gerarLinksRota(lat, lon, p.lat, p.lon, p.nome);
    html += `
      <li>
        <div class="linha">
          <div>
            <div class="nome">${idx + 1}. ${p.nome}</div>
            <div class="dist">Distância aproximada: ${p.distancia.toFixed(2)} km</div>
          </div>
        </div>
        <div class="btns-rotas">
          <a class="btn-mini" href="${links.geo}">App de mapas (padrão)</a>
          <a class="btn-mini secondary-mini" href="${links.gmaps}" target="_blank" rel="noopener noreferrer">Google Maps</a>
          <a class="btn-mini secondary-mini" href="${links.waze}" target="_blank" rel="noopener noreferrer">Waze</a>
        </div>
      </li>
    `;
  });

  html += `</ul>`;
  r.innerHTML = html;
}

async function geocodificarEndereco(endereco) {
  const url = "https://nominatim.openstreetmap.org/search?format=json&q=" + encodeURIComponent(endereco);
  const resp = await fetch(url, {
    headers: {
      "Accept-Language": "pt-BR"
    }
  });
  if (!resp.ok) {
    throw new Error("Falha na geocodificação");
  }
  const dados = await resp.json();
  if (!dados.length) {
    throw new Error("Endereço não encontrado");
  }
  const lat = parseFloat(dados[0].lat);
  const lon = parseFloat(dados[0].lon);
  return { lat, lon };
}

async function processarEndereco() {
  const end = document.getElementById("endereco").value.trim();
  const r = document.getElementById("resultado");

  if (!end) {
    r.innerHTML = "Digite um endereço.";
    return;
  }

  r.innerHTML = "Localizando endereço...";

  try {
    const { lat, lon } = await geocodificarEndereco(end);
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
