document.addEventListener('DOMContentLoaded', () => {
    // BASE DE DATOS DE PRUEBA CON KILOMETRAJE INCLUIDO
    let vehiculos = [
        {
            id: 1,
            placa: 'PBX-1234',
            propietario: 'Carlos Mendoza',
            marca: 'Toyota',
            modelo: 'Corolla',
            anio: 2019,
            kilometraje: 78500,
            servicio: 'Mantenimiento Preventivo',
            estado: 'En Reparación',
            prioridad: 'Normal',
            imagen: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=150&q=80',
            fecha: new Date('2026-08-01T08:30:00')
        },
        {
            id: 2,
            placa: 'GBA-5678',
            propietario: 'Ana Lucía Ríos',
            marca: 'Chevrolet',
            modelo: 'Sail',
            anio: 2021,
            kilometraje: 42000,
            servicio: 'Frenos y Suspensión',
            estado: 'Ingresado',
            prioridad: 'Urgente',
            imagen: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=150&q=80',
            fecha: new Date('2026-08-03T10:15:00')
        },
        {
            id: 3,
            placa: 'PCO-9012',
            propietario: 'Taller Logística S.A.',
            marca: 'Ford',
            modelo: 'Ranger',
            anio: 2018,
            kilometraje: 135000,
            servicio: 'Reparación de Motor',
            estado: 'Listo',
            prioridad: 'Normal',
            imagen: '',
            fecha: new Date('2026-07-28T14:00:00')
        }
    ];

    let editMode = false;

    // ELEMENTOS DOM
    const form = document.getElementById('vehicle-form');
    const tableBody = document.getElementById('table-body');
    const searchInput = document.getElementById('search-input');
    const filterEstado = document.getElementById('filter-estado');
    const sortSelect = document.getElementById('sort-select');
    const btnCancel = document.getElementById('btn-cancel');
    const btnSubmit = document.getElementById('btn-submit');
    const formTitle = document.getElementById('form-title');
    const fileInput = document.getElementById('imagen-file');
    const btnExport = document.getElementById('btn-export');

    const modal = document.getElementById('detail-modal');
    const modalBody = document.getElementById('modal-body');
    const closeModal = document.querySelector('.close-modal');

    let uploadedImageBase64 = '';
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => { uploadedImageBase64 = event.target.result; };
                reader.readAsDataURL(file);
            }
        });
    }

    renderTable();
    updateStats();

    // GUARDAR O EDITAR REGISTRO
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!validateForm()) return;

            const id = document.getElementById('vehicle-id').value;
            const placa = document.getElementById('placa').value.trim().toUpperCase();
            const propietario = document.getElementById('propietario').value.trim();
            const marca = document.getElementById('marca').value.trim();
            const modelo = document.getElementById('modelo').value.trim();
            const anio = parseInt(document.getElementById('anio').value);
            const kilometraje = parseInt(document.getElementById('kilometraje').value);
            const servicio = document.getElementById('servicio').value;
            const estado = document.getElementById('estado').value;
            const prioridad = document.getElementById('prioridad').value;
            const urlImagen = document.getElementById('imagen').value.trim();

            const finalImage = uploadedImageBase64 || urlImagen || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=150&q=80';

            if (editMode) {
                const index = vehiculos.findIndex(v => v.id == id);
                if (index !== -1) {
                    vehiculos[index] = {
                        ...vehiculos[index],
                        placa, propietario, marca, modelo, anio, kilometraje, servicio, estado, prioridad,
                        imagen: finalImage
                    };
                }
                resetForm();
            } else {
                const newVehicle = {
                    id: Date.now(),
                    placa, propietario, marca, modelo, anio, kilometraje, servicio, estado, prioridad,
                    imagen: finalImage,
                    fecha: new Date()
                };
                vehiculos.unshift(newVehicle);
                resetForm();
            }

            renderTable();
            updateStats();
        });
    }

    window.deleteVehicle = function(id) {
        if (confirm('¿Eliminar registro del taller?')) {
            vehiculos = vehiculos.filter(v => v.id !== id);
            renderTable();
            updateStats();
        }
    };

    // VACIAR TODO (Integrado correctamente a la estructura actual)
    window.vaciarTodo = function() {
        if (vehiculos.length === 0) {
            alert('No hay registros para eliminar.');
            return;
        }
        if (confirm('¿Desea eliminar todos los registros del taller?')) {
            vehiculos = [];
            renderTable();
            updateStats();
        }
    };

    // EXPORTACIÓN CSV
    window.exportCSV = function() {
        if (vehiculos.length === 0) {
            alert('No hay datos registrados para exportar.');
            return;
        }
        let csv = 'Placa,Propietario,Marca,Modelo,Año,Kilometraje,Servicio,Estado,Prioridad\n';
        vehiculos.forEach(r => {
            csv += `"${r.placa}","${r.propietario}","${r.marca}","${r.modelo}",${r.anio},${r.kilometraje},"${r.servicio}","${r.estado}","${r.prioridad}"\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', `reporte_vehiculos_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(a);
        a.click();
        a.remove();
    };

    window.editVehicle = function(id) {
        const v = vehiculos.find(item => item.id === id);
        if (!v) return;

        editMode = true;
        document.getElementById('vehicle-id').value = v.id;
        document.getElementById('placa').value = v.placa;
        document.getElementById('propietario').value = v.propietario;
        document.getElementById('marca').value = v.marca;
        document.getElementById('modelo').value = v.modelo;
        document.getElementById('anio').value = v.anio;
        document.getElementById('kilometraje').value = v.kilometraje;
        document.getElementById('servicio').value = v.servicio;
        document.getElementById('estado').value = v.estado;
        document.getElementById('prioridad').value = v.prioridad;
        document.getElementById('imagen').value = v.imagen.startsWith('data:') ? '' : v.imagen;

        formTitle.textContent = '✏️ Editar Vehículo';
        btnSubmit.textContent = 'Actualizar Datos';
        btnCancel.style.display = 'block';

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (btnCancel) btnCancel.addEventListener('click', resetForm);

    function resetForm() {
        editMode = false;
        form.reset();
        document.getElementById('vehicle-id').value = '';
        uploadedImageBase64 = '';
        formTitle.textContent = '➕ Registrar Nuevo Vehículo';
        btnSubmit.textContent = 'Guardar Registro';
        btnCancel.style.display = 'none';
        clearErrors();
    }

    // VALIDACIONES
    function validateForm() {
        clearErrors();
        let isValid = true;

        const placa = document.getElementById('placa').value.trim();
        const propietario = document.getElementById('propietario').value.trim();
        const marca = document.getElementById('marca').value.trim();
        const modelo = document.getElementById('modelo').value.trim();
        const anio = document.getElementById('anio').value;
        const kilometraje = document.getElementById('kilometraje').value;
        const servicio = document.getElementById('servicio').value;
        const currentId = document.getElementById('vehicle-id').value;

        if (!placa) { showError('err-placa', 'Obligatorio.'); isValid = false; }
        else {
            const duplicate = vehiculos.some(v => v.placa.toUpperCase() === placa.toUpperCase() && v.id != currentId);
            if (duplicate) { showError('err-placa', 'Esta placa ya existe.'); isValid = false; }
        }

        if (!propietario) { showError('err-propietario', 'Obligatorio.'); isValid = false; }
        if (!marca) { showError('err-marca', 'Obligatorio.'); isValid = false; }
        if (!modelo) { showError('err-modelo', 'Obligatorio.'); isValid = false; }

        const yearNum = parseInt(anio);
        if (!anio || isNaN(yearNum) || yearNum < 1950 || yearNum > 2027) {
            showError('err-anio', 'Año inválido.'); isValid = false;
        }

        const kmNum = parseInt(kilometraje);
        if (kilometraje === '' || isNaN(kmNum) || kmNum < 0) {
            showError('err-kilometraje', 'Ingrese un kilometraje válido.'); isValid = false;
        }

        if (!servicio) { showError('err-servicio', 'Seleccione un servicio.'); isValid = false; }

        return isValid;
    }

    function showError(id, msg) {
        const el = document.getElementById(id);
        if (el) el.textContent = msg;
    }

    function clearErrors() {
        document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
    }

    // FILTRADO Y ORDENACIÓN
    if (searchInput) searchInput.addEventListener('input', renderTable);
    if (filterEstado) filterEstado.addEventListener('change', renderTable);
    if (sortSelect) sortSelect.addEventListener('change', renderTable);

    function getFilteredAndSortedVehicles() {
        let result = [...vehiculos];
        const term = searchInput ? searchInput.value.toLowerCase().trim() : '';

        if (term) {
            result = result.filter(v => 
                v.placa.toLowerCase().includes(term) ||
                v.propietario.toLowerCase().includes(term) ||
                v.marca.toLowerCase().includes(term) ||
                v.modelo.toLowerCase().includes(term)
            );
        }

        const estadoVal = filterEstado ? filterEstado.value : 'TODOS';
        if (estadoVal !== 'TODOS') {
            result = result.filter(v => v.estado === estadoVal);
        }

        const sortVal = sortSelect ? sortSelect.value : 'fecha-desc';
        result.sort((a, b) => {
            if (sortVal === 'fecha-desc') return new Date(b.fecha) - new Date(a.fecha);
            if (sortVal === 'km-desc') return b.kilometraje - a.kilometraje;
            if (sortVal === 'km-asc') return a.kilometraje - b.kilometraje;
            if (sortVal === 'anio-desc') return b.anio - a.anio;
            if (sortVal === 'placa') return a.placa.localeCompare(b.placa);
            return 0;
        });

        return result;
    }

    // DIBUJAR TABLA
    function renderTable() {
        if (!tableBody) return;
        const data = getFilteredAndSortedVehicles();
        tableBody.innerHTML = '';

        const recordCount = document.getElementById('record-count');
        if (recordCount) recordCount.textContent = `${data.length} Vehículos`;

        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 2rem;">No hay registros encontrados.</td></tr>`;
            return;
        }

        data.forEach(v => {
            const tr = document.createElement('tr');
            let badgeClass = 'badge-ingresado';
            if (v.estado === 'En Reparación') badgeClass = 'badge-reparacion';
            if (v.estado === 'Listo') badgeClass = 'badge-listo';

            const defaultImg = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=150&q=80';

            tr.innerHTML = `
                <td><img src="${v.imagen || defaultImg}" alt="${v.marca}" class="vehicle-thumb" onerror="this.src='${defaultImg}'"></td>
                <td><strong>${v.placa}</strong></td>
                <td>${v.marca} ${v.modelo}</td>
                <td>${v.anio}</td>
                <td><strong>${v.kilometraje.toLocaleString()} km</strong></td>
                <td>${v.propietario}</td>
                <td><span class="badge ${badgeClass}">${v.estado}</span></td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="viewDetail(${v.id})">👁️</button>
                    <button class="btn btn-sm btn-primary" onclick="editVehicle(${v.id})">✏️</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteVehicle(${v.id})">🗑️</button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    function updateStats() {
        if (!document.getElementById('stat-total')) return;
        document.getElementById('stat-total').textContent = vehiculos.length;
        document.getElementById('stat-proceso').textContent = vehiculos.filter(v => v.estado === 'En Reparación').length;
        document.getElementById('stat-listos').textContent = vehiculos.filter(v => v.estado === 'Listo').length;
        document.getElementById('stat-urgente').textContent = vehiculos.filter(v => v.prioridad === 'Urgente').length;
    }

    // VER DETALLE EN MODAL
    window.viewDetail = function(id) {
        const v = vehiculos.find(item => item.id === id);
        if (!v || !modal || !modalBody) return;

        const defaultImg = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=500&q=80';
        modalBody.innerHTML = `
            <div style="text-align: center; margin-bottom: 1rem;">
                <img src="${v.imagen || defaultImg}" style="width: 100%; max-height: 200px; object-fit: cover; border-radius: 8px;" onerror="this.src='${defaultImg}'">
                <h3 style="margin-top: 10px;">${v.marca} ${v.modelo} (${v.anio})</h3>
                <p><strong>Placa:</strong> ${v.placa}</p>
            </div>
            <p><strong>Kilometraje:</strong> ${v.kilometraje.toLocaleString()} km</p>
            <p><strong>Propietario:</strong> ${v.propietario}</p>
            <p><strong>Servicio:</strong> ${v.servicio}</p>
            <p><strong>Estado:</strong> ${v.estado}</p>
            <p><strong>Prioridad:</strong> ${v.prioridad}</p>
            <p><strong>Ingreso:</strong> ${new Date(v.fecha).toLocaleString()}</p>
        `;
        modal.style.display = 'flex';
    };

    if (closeModal) closeModal.addEventListener('click', () => { modal.style.display = 'none'; });
    window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

    // EXPORTACIÓN JSON
    if (btnExport) {
        btnExport.addEventListener('click', () => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(vehiculos, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `registro_vehiculos_${new Date().toISOString().slice(0,10)}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
        });
    }
});