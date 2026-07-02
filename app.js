const DATA_PATH = "data/matchup_probabilities.csv";

const form = document.getElementById("matchup-form");
const teamASelect = document.getElementById("team-a");
const teamBSelect = document.getElementById("team-b");
const message = document.getElementById("form-message");
const resultsSection = document.getElementById("results-section");

let matchupRows = [];
let lookup = new Map();

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(",").map((header) => header.trim());

  return lines.slice(1).map((line) => {
    const values = line.split(",").map((value) => value.trim());
    return headers.reduce((row, header, index) => {
      row[header] = values[index];
      return row;
    }, {});
  });
}

function matchupKey(teamA, teamB) {
  return `${teamA}|||${teamB}`;
}

function formatPercent(value) {
  const number = Number(value);
  return Number.isFinite(number) ? `${number.toFixed(1)}%` : "—";
}

function populateTeamSelectors(rows) {
  const teams = [...new Set(rows.flatMap((row) => [row.Team_A, row.Team_B]))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  for (const team of teams) {
    const optionA = document.createElement("option");
    optionA.value = team;
    optionA.textContent = team;

    const optionB = optionA.cloneNode(true);

    teamASelect.appendChild(optionA);
    teamBSelect.appendChild(optionB);
  }
}

function updateResult(teamA, teamB, row) {
  const teamAWin = formatPercent(row.Team_A_Win);
  const draw = formatPercent(row.Draw);
  const teamBWin = formatPercent(row.Team_B_Win);

  document.getElementById("team-a-label").textContent = `${teamA} Win`;
  document.getElementById("team-b-label").textContent = `${teamB} Win`;

  document.getElementById("team-a-win").textContent = teamAWin;
  document.getElementById("draw-probability").textContent = draw;
  document.getElementById("team-b-win").textContent = teamBWin;

  document.getElementById("table-team-a").textContent = `${teamA} Win`;
  document.getElementById("table-team-b").textContent = `${teamB} Win`;

  document.getElementById("table-team-a-value").textContent = teamAWin;
  document.getElementById("table-draw-value").textContent = draw;
  document.getElementById("table-team-b-value").textContent = teamBWin;

  resultsSection.hidden = false;
  resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function loadData() {
  try {
    const response = await fetch(DATA_PATH);

    if (!response.ok) {
      throw new Error(`Could not load ${DATA_PATH}`);
    }

    const csvText = await response.text();
    matchupRows = parseCSV(csvText);

    lookup = new Map(
      matchupRows.map((row) => [matchupKey(row.Team_A, row.Team_B), row])
    );

    populateTeamSelectors(matchupRows);
  } catch (error) {
    message.textContent =
      "The prediction data could not be loaded. Open the site through a local server or GitHub Pages.";
    console.error(error);
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  message.textContent = "";

  const teamA = teamASelect.value;
  const teamB = teamBSelect.value;

  if (!teamA || !teamB) {
    message.textContent = "Please select both teams.";
    return;
  }

  if (teamA === teamB) {
    message.textContent = "Please select two different teams.";
    return;
  }

  const row = lookup.get(matchupKey(teamA, teamB));

  if (!row) {
    message.textContent = "That matchup was not found in the prediction data.";
    return;
  }

  updateResult(teamA, teamB, row);
});

loadData();
