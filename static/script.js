
// ── Mapeo de clases → nombre en español ───────────────────────────
const CROP_LABELS = {
    0: 'Manzana', 1: 'Plátano', 2: 'Frijol negro', 3: 'Garbanzo',
    4: 'Coco', 5: 'Café', 6: 'Algodón', 7: 'Uva', 8: 'Yute',
    9: 'Frijol rojo', 10: 'Lenteja', 11: 'Maíz', 12: 'Mango',
    13: 'Frijol polilla', 14: 'Frijol mungo', 15: 'Melón',
    16: 'Naranja', 17: 'Papaya', 18: 'Guandul', 19: 'Granada',
    20: 'Arroz', 21: 'Sandía',
};

// ── Configuración de características ──────────────────────────────
const FEATURES = [
    { id: 'N', label: 'Nitrógeno (N)', placeholder: 'Ej: 90' },
    { id: 'P', label: 'Fósforo (P)', placeholder: 'Ej: 42' },
    { id: 'K', label: 'Potasio (K)', placeholder: 'Ej: 43' },
    { id: 'temperature', label: 'Temperatura (°C)', placeholder: 'Ej: 20.8' },
    { id: 'humidity', label: 'Humedad (%)', placeholder: 'Ej: 82.0' },
    { id: 'ph', label: 'pH del suelo', placeholder: 'Ej: 6.5' },
    { id: 'rainfall', label: 'Lluvia (mm)', placeholder: 'Ej: 202.9' },
];

// ── Render inputs ───────────────────
const grid = document.getElementById('features-grid');
FEATURES.forEach((f) => {
    grid.innerHTML += `
        <div class="input-group">
          <label for="${f.id}">${f.label}</label>
          <input type="number" id="${f.id}" name="${f.id}"
                 placeholder="${f.placeholder}" step="any" required/>
        </div>`;
});

// ── Model toggle  ────────────────────
const btnSvm = document.getElementById('btn-svm');
const btnRf = document.getElementById('btn-rf');

[btnSvm, btnRf].forEach(btn => {
    btn.addEventListener('click', () => {
        btnSvm.classList.toggle('active', btn === btnSvm);
        btnRf.classList.toggle('active', btn === btnRf);
    });
});

// ── Prediction ────────────────────────────────────────────────────
const predictBtn = document.getElementById('btn-predict');
const spinner = document.getElementById('spinner');
const btnLabel = document.getElementById('btn-label');
const resultPanel = document.getElementById('result-panel');
const resultClass = document.getElementById('result-class');
const resultMeta = document.getElementById('result-meta');

predictBtn.addEventListener('click', async () => {
    const features = FEATURES.map(f => {
        const v = document.getElementById(f.id).value;
        return v === '' ? null : parseFloat(v);
    });

    if (features.some(v => v === null || isNaN(v))) {
        showError('Por favor, completa todos los campos del entorno.');
        return;
    }

    const model = document.querySelector('input[name="model"]:checked').value;

    setLoading(true);
    resultPanel.classList.add('hidden');

    try {
        const res = await fetch(`${API_URL}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model, features }),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.detail || 'Error en el servidor');
        }

        showSuccess(data);

    } catch (err) {
        showError(err.message);
    } finally {
        setLoading(false);
    }
});

function setLoading(on) {
    predictBtn.disabled = on;
    spinner.style.display = on ? 'block' : 'none';
    btnLabel.textContent = on ? 'Analizando datos...' : 'Generar Predicción';
}

function showSuccess(data) {
    resultPanel.className = 'result-panel success'; 
    const label = CROP_LABELS[data.prediction] ?? `Clase ${data.prediction}`;
    resultClass.textContent = label;

    const modelLabel = data.model === 'svm' ? 'SVM' : 'Random Forest';
    let meta = `Modelo utilizado: <strong>${modelLabel}</strong><br>`;
    if (data.probability !== null && data.probability !== undefined) {
        const pct = (Math.max(...data.probability) * 100).toFixed(1);
        meta += `Nivel de confianza: <strong>${pct}%</strong>`;
    }
    resultMeta.innerHTML = meta;
}

function showError(msg) {
    resultPanel.className = 'result-panel error';
    resultClass.textContent = 'Error';
    resultMeta.innerHTML = msg;
}