// DATOS DE LA NASA BASADOS EN TUS PDFs
const NASA_DATA = {
    misiones: {
        'luna_4_90': { destino: 'luna', tripulantes: 4, duracion: 90, espacioVital: 40, energiaBase: 1200, masaBase: 8500 },
        'luna_6_90': { destino: 'luna', tripulantes: 6, duracion: 90, espacioVital: 60, energiaBase: 1800, masaBase: 11000 },
        'marte_4_90': { destino: 'marte', tripulantes: 4, duracion: 90, espacioVital: 50, energiaBase: 1500, masaBase: 12000 },
        'marte_6_90': { destino: 'marte', tripulantes: 6, duracion: 90, espacioVital: 75, energiaBase: 2200, masaBase: 15000 }
    },

    modulos: [
        { id: 'DORM_01', nombre: 'Dormitorio Individual', categoria: 'Descanso', area: 4.5, energia: 50, masa: 200, color: 'module-dorm' },
        { id: 'LAB_BIO', nombre: 'Laboratorio Biológico', categoria: 'Ciencia', area: 10, energia: 300, masa: 600, color: 'module-lab' },
        { id: 'COCINA', nombre: 'Cocina', categoria: 'Alimentos', area: 6, energia: 200, masa: 400, color: 'module-kitchen' },
        { id: 'BANO_COMP', nombre: 'Baño Completo', categoria: 'Higiene', area: 5, energia: 150, masa: 350, color: 'module-bath' },
        { id: 'GIMNASIO', nombre: 'Gimnasio', categoria: 'Ejercicio', area: 12, energia: 50, masa: 800, color: 'module-gym' },
        { id: 'PAN_SOL', nombre: 'Panel Solar', categoria: 'Energia', area: 2, energia: -100, masa: 50, color: 'module-solar' },
        { id: 'BATERIA', nombre: 'Batería', categoria: 'Energia', area: 1, energia: 0, masa: 200, color: 'module-battery' },
        { id: 'AIRE_1', nombre: 'Soporte Vital', categoria: 'Soporte', area: 4, energia: 400, masa: 600, color: 'module-air' },
        { id: 'AGUA', nombre: 'Reciclaje Agua', categoria: 'Soporte', area: 3, energia: 300, masa: 400, color: 'module-water' },
        { id: 'ALM_COM', nombre: 'Almacén Comida', categoria: 'Almacenamiento', area: 4, energia: 50, masa: 200, color: 'module-storage' },
        { id: 'ESC_REG', nombre: 'Escudo Regolito', categoria: 'Proteccion', area: 0, energia: 0, masa: 1500, color: 'module-shield' },
        { id: 'ESCLUSA', nombre: 'Esluca de Aire', categoria: 'Proteccion', area: 6, energia: 100, masa: 400, color: 'module-airlock' }
    ],

    adversidades: {
        luna: [
            { id: 'LUNA_001', nombre: 'Frío Extremo Nocturno', descripcion: 'Temperatura -130°C por 14 días', energia: 0.4, integridad: 0.15 },
            { id: 'LUNA_002', nombre: 'Radiación Solar', descripcion: 'Evento de partículas solares', energia: 0, integridad: 0.5 },
            { id: 'LUNA_003', nombre: 'Micrometeoritos', descripcion: 'Lluvia de micrometeoritos', energia: 0.2, integridad: 0.3 }
        ],
        marte: [
            { id: 'MARTE_001', nombre: 'Tormenta de Polvo', descripcion: 'Visibilidad cero por 30 días', energia: 0.8, integridad: 0.25 },
            { id: 'MARTE_002', nombre: 'Invierno Polar', descripcion: 'Temperatura -125°C por 60 días', energia: 0.5, integridad: 0.2 },
            { id: 'MARTE_003', nombre: 'Terremoto Marciano', descripcion: 'Actividad sísmica nivel 5', energia: 0.3, integridad: 0.4 }
        ]
    }
};

// ESTADO GLOBAL DEL SIMULADOR
let estado = {
    misionActual: 'luna_4_90',
    moduloSeleccionado: null,
    habitatDiseñado: [],
    gridOcupado: Array(400).fill(null) // 20x20 grid
};

// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', function() {
    inicializarSimulador();
    crearGridHabitat();
    cargarModulos();
    cargarAdversidades();
    actualizarMetricas();
});

function inicializarSimulador() {
    // Configurar botones de misión
    document.querySelectorAll('[data-destino]').forEach(btn => {
        btn.addEventListener('click', () => cambiarConfiguracion('destino', btn.dataset.destino));
    });
    
    document.querySelectorAll('[data-tripulantes]').forEach(btn => {
        btn.addEventListener('click', () => cambiarConfiguracion('tripulantes', btn.dataset.tripulantes));
    });
    
    document.querySelectorAll('[data-duracion]').forEach(btn => {
        btn.addEventListener('click', () => cambiarConfiguracion('duracion', btn.dataset.duracion));
    });

    // Botones de control
    document.getElementById('clearBtn').addEventListener('click', limpiarDiseño);
    document.getElementById('validateBtn').addEventListener('click', validarDiseño);
}

function cambiarConfiguracion(tipo, valor) {
    // Actualizar botones activos
    document.querySelectorAll(`[data-${tipo}]`).forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset[tipo] === valor) btn.classList.add('active');
    });

    // Recalcular estado de misión
    const destino = document.querySelector('[data-destino].active').dataset.destino;
    const tripulantes = document.querySelector('[data-tripulantes].active').dataset.tripulantes;
    const duracion = document.querySelector('[data-duracion].active').dataset.duracion;
    
    estado.misionActual = `${destino}_${tripulantes}_${duracion}`;
    
    // Recargar adversidades para el destino
    cargarAdversidades();
    actualizarMetricas();
}

function crearGridHabitat() {
    const grid = document.getElementById('habitatGrid');
    grid.innerHTML = '';
    
    for (let i = 0; i < 400; i++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.index = i;
        
        cell.addEventListener('click', () => colocarModulo(i));
        cell.addEventListener('dragover', (e) => e.preventDefault());
        cell.addEventListener('drop', (e) => {
            e.preventDefault();
            colocarModulo(i);
        });
        
        grid.appendChild(cell);
    }
}

function cargarModulos() {
    const grid = document.getElementById('modulesGrid');
    
    NASA_DATA.modulos.forEach(modulo => {
        const item = document.createElement('div');
        item.className = 'module-item';
        item.draggable = true;
        item.innerHTML = `
            <div class="module-icon ${modulo.color}"></div>
            <strong>${modulo.nombre}</strong>
            <br><small>Área: ${modulo.area}m² | Energía: ${modulo.energia}W</small>
        `;
        
        item.addEventListener('dragstart', () => {
            estado.moduloSeleccionado = modulo;
        });
        
        item.addEventListener('click', () => {
            estado.moduloSeleccionado = modulo;
        });
        
        grid.appendChild(item);
    });
}

function colocarModulo(index) {
    if (!estado.moduloSeleccionado || estado.gridOcupado[index]) return;
    
    const modulo = estado.moduloSeleccionado;
    const cell = document.querySelector(`.grid-cell[data-index="${index}"]`);
    
    // Calcular área necesaria (simplificado: 1 celda = 1m²)
    const areaNecesaria = Math.ceil(modulo.area);
    
    // Verificar espacio disponible (simulación simple)
    if (areaNecesaria > 1) {
        alert(`⚠️ ${modulo.nombre} necesita ${areaNecesaria} celdas. Implementación avanzada requerida.`);
        return;
    }
    
    // Colocar módulo
    estado.gridOcupado[index] = modulo.id;
    estado.habitatDiseñado.push({
        ...modulo,
        posicion: index
    });
    
    cell.classList.add('occupied', modulo.color);
    cell.title = modulo.nombre;
    
    actualizarMetricas();
}

function actualizarMetricas() {
    const mision = NASA_DATA.misiones[estado.misionActual];
    let areaTotal = 0;
    let energiaTotal = mision.energiaBase;
    let masaTotal = mision.masaBase;
    let espacioVital = 0;
    
    estado.habitatDiseñado.forEach(modulo => {
        areaTotal += modulo.area;
        energiaTotal += modulo.energia;
        masaTotal += modulo.masa;
        if (modulo.categoria === 'Descanso') espacioVital += modulo.area;
    });
    
    // Actualizar UI
    document.getElementById('areaUsed').textContent = `${areaTotal.toFixed(1)} m²`;
    document.getElementById('energyNet').textContent = `${energiaTotal} W`;
    document.getElementById('totalMass').textContent = `${masaTotal} kg`;
    
    const porcentajeVital = Math.min((espacioVital / mision.espacioVital) * 100, 100);
    document.getElementById('livingSpaceBar').style.width = `${porcentajeVital}%`;
    document.getElementById('livingSpace').textContent = `${porcentajeVital.toFixed(0)}%`;
    
    // Color según eficiencia energética
    document.getElementById('energyNet').style.color = energiaTotal >= 0 ? '#00ff00' : '#ff0000';
}

function validarDiseño() {
    const resultados = document.getElementById('validationResults');
    const mision = NASA_DATA.misiones[estado.misionActual];
    
    let html = '<h3>🔍 VALIDACIÓN NASA</h3>';
    
    // Verificar energía
    const energiaTotal = estado.habitatDiseñado.reduce((sum, m) => sum + m.energia, mision.energiaBase);
    if (energiaTotal >= 0) {
        html += '<div class="validation-item valid">✅ Energía: Suficiente</div>';
    } else {
        html += '<div class="validation-item">❌ Energía: Insuficiente - Agregar paneles solares</div>';
    }
    
    // Verificar dormitorios
    const dormitorios = estado.habitatDiseñado.filter(m => m.id.startsWith('DORM'));
    if (dormitorios.length >= mision.tripulantes) {
        html += '<div class="validation-item valid">✅ Dormitorios: Suficientes</div>';
    } else {
        html += `<div class="validation-item">❌ Dormitorios: Faltan ${mision.tripulantes - dormitorios.length}</div>`;
    }
    
    // Verificar módulos esenciales
    const modulosEsenciales = ['AIRE_1', 'AGUA', 'ALM_COM'];
    modulosEsenciales.forEach(moduloId => {
        if (estado.habitatDiseñado.some(m => m.id === moduloId)) {
            html += `<div class="validation-item valid">✅ ${NASA_DATA.modulos.find(m => m.id === moduloId).nombre}</div>`;
        } else {
            html += `<div class="validation-item">❌ Falta: ${NASA_DATA.modulos.find(m => m.id === moduloId).nombre}</div>`;
        }
    });
    
    resultados.innerHTML = html;
}

function cargarAdversidades() {
    const container = document.getElementById('adversityButtons');
    const destino = estado.misionActual.split('_')[0];
    const adversidades = NASA_DATA.adversidades[destino];
    
    container.innerHTML = '';
    
    adversidades.forEach(adv => {
        const btn = document.createElement('button');
        btn.className = 'pixel-btn adversity-btn';
        btn.textContent = adv.nombre;
        btn.onclick = () => simularAdversidad(adv);
        container.appendChild(btn);
    });
}

function simularAdversidad(adversidad) {
    const resultado = document.getElementById('simulationResult');
    const mision = NASA_DATA.misiones[estado.misionActual];
    
    let energiaTotal = estado.habitatDiseñado.reduce((sum, m) => sum + m.energia, mision.energiaBase);
    let integridad = 100;
    
    // Aplicar penalizaciones
    energiaTotal *= (1 - adversidad.energia);
    integridad *= (1 - adversidad.integridad);
    
    let html = `<h3>🌪️ SIMULACIÓN: ${adversidad.nombre}</h3>`;
    html += `<p>${adversidad.descripcion}</p>`;
    html += `<p><strong>Energía después:</strong> ${energiaTotal.toFixed(0)} W</p>`;
    html += `<p><strong>Integridad:</strong> ${integridad.toFixed(0)}%</p>`;
    
    if (energiaTotal > 0 && integridad > 50) {
        html += '<div class="result-success"><strong>✅ MISIÓN EXITOSA</strong><br>El hábitat resistió la adversidad.</div>';
        resultado.className = 'simulation-result result-success';
    } else {
        html += '<div class="result-failure"><strong>❌ FALLO DE MISIÓN</strong><br>El hábitat necesita mejoras.</div>';
        resultado.className = 'simulation-result result-failure';
    }
    
    resultado.innerHTML = html;
}

function limpiarDiseño() {
    if (confirm('¿Estás seguro de que quieres limpiar todo el diseño?')) {
        estado.habitatDiseñado = [];
        estado.gridOcupado = Array(400).fill(null);
        
        document.querySelectorAll('.grid-cell').forEach(cell => {
            cell.className = 'grid-cell';
        });
        
        actualizarMetricas();
        document.getElementById('validationResults').innerHTML = '';
        document.getElementById('simulationResult').innerHTML = '';
    }
}