const VEH_API = "../../backend/api/vehicles.php";

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) { alert("ID do veículo não informado"); window.location.href = "estoque.html"; return; }

    const form = document.querySelector(".vehicle-form");

    // campos existentes no seu HTML: model, year, km, status, imagem previews
    // mapeie ids
    const modelInput = document.getElementById('model');
    const yearInput = document.getElementById('year');
    const kmInput = document.getElementById('km');
    const statusSelect = document.getElementById('status');
    const previewGrid = document.querySelector('.image-upload-grid');

    // buscar dados
    fetch(`${VEH_API}?id=${id}`, { credentials: 'include' })
        .then(r => r.json())
        .then(res => {
            if (!res.success) { alert("Veículo não encontrado"); return; }
            const v = res.data;
            modelInput.value = v.modelo || '';
            yearInput.value = v.ano || '';
            kmInput.value = v.km || '';
            statusSelect.value = v.status || 'available';

            // imagens
            const images = v.images || [];
            images.forEach(url => {
                const div = document.createElement('div');
                div.className = 'image-preview';
                div.innerHTML = `<img src="${url}" alt="Veículo"><button type="button" class="btn btn-danger btn-sm remove-image"><i class="fas fa-times"></i></button>`;
                previewGrid.insertBefore(div, previewGrid.querySelector('.upload-new'));
                div.querySelector('.remove-image').addEventListener('click', () => div.remove());
            });
        });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('_method', 'PUT'); // override
        formData.append('id', id);
        formData.append('modelo', modelInput.value);
        formData.append('ano', yearInput.value);
        formData.append('km', kmInput.value);
        formData.append('status', statusSelect.value);

        // pegar novos arquivos, se houver input file dentro upload-new
        const fileInput = previewGrid.querySelector('input[type="file"]');
        if (fileInput && fileInput.files.length) {
            for (let i=0;i<fileInput.files.length;i++){
                formData.append('images[]', fileInput.files[i]);
            }
        }

        // se quiser substituir imagens em vez de adicionar, enviar replace_images=1
        // formData.append('replace_images','1');

        fetch(VEH_API, {
            method: 'POST',
            body: formData,
            credentials: 'include'
        })
        .then(r => r.json())
        .then(res => {
            if (!res.success) { alert("Erro: "+(res.message||"")); return; }
            alert("Atualizado!");
            window.location.href = "estoque.html";
        })
        .catch(err => console.error(err));
    });
});
