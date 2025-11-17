// js/editar_estoque.js
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) { alert('ID ausente'); window.location.href = 'estoque.html'; return; }

  const form = document.getElementById('editVehicleForm');
  const uploadCard = document.querySelector('.upload-new');
  const fileInput = document.getElementById('imageInput');
  const imageGrid = document.getElementById('imageGrid');

  const dataTransfer = new DataTransfer(); // para novas imagens
  const removedImages = []; // URLs a serem removidas do servidor (string)

  // abrir file dialog quando clicar no cartão
  uploadCard && uploadCard.addEventListener('click', (e) => {
    if (e.target.tagName.toLowerCase() === 'input') return;
    fileInput.click();
  });

  // carregar veículo
  fetch(`../../backend/api/vehicles.php?id=${encodeURIComponent(id)}`, { credentials: 'include' })
    .then(r => r.json())
    .then(res => {
      if (!res.success) { alert('Veículo não encontrado'); return; }
      const v = res.data;
      document.getElementById('vehicleId').value = v.id;
      document.getElementById('model').value = v.modelo || '';
      document.getElementById('year').value = v.ano || '';
      document.getElementById('km').value = v.km || '';
      document.getElementById('status').value = v.status || 'available';
      document.getElementById('price').value = v.preco || '';

      // inserir imagens existentes
      (v.images || []).forEach(url => {
        const wrap = document.createElement('div');
        wrap.className = 'image-preview';
        wrap.innerHTML = `
          <img src="${url}" alt="img">
          <button type="button" class="btn btn-danger btn-sm remove-image-existing"><i class="fas fa-times"></i></button>
        `;
        imageGrid.insertBefore(wrap, uploadCard);
        wrap.querySelector('.remove-image-existing').addEventListener('click', () => {
          // marcar para remoção e esconder preview
          removedImages.push(url);
          wrap.remove();
        });
      });
    });

  // quando selecionar novos arquivos
  fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      dataTransfer.items.add(file);
      const reader = new FileReader();
      const wrap = document.createElement('div');
      wrap.className = 'image-preview';
      reader.onload = (ev) => {
        wrap.innerHTML = `
          <img src="${ev.target.result}" alt="${file.name}">
          <button type="button" class="btn btn-danger btn-sm remove-image-new"><i class="fas fa-times"></i></button>
        `;
        imageGrid.insertBefore(wrap, uploadCard);
        wrap.querySelector('.remove-image-new').addEventListener('click', () => {
          removeFileFromDataTransfer(file.name);
          wrap.remove();
        });
      };
      reader.readAsDataURL(file);
    });
    fileInput.files = dataTransfer.files;
  });

  function removeFileFromDataTransfer(name) {
    const dt = new DataTransfer();
    Array.from(dataTransfer.files).forEach(f => {
      if (f.name !== name) dt.items.add(f);
    });
    // reset dataTransfer
    while (dataTransfer.items.length) dataTransfer.items.remove(0);
    Array.from(dt.files).forEach(f => dataTransfer.items.add(f));
    fileInput.files = dataTransfer.files;
  }

  // submit do form: envia both removed_images[] e images[] (novas)
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const api = "../../backend/api/vehicles.php";
    const fd = new FormData();

    fd.append('_method', 'PUT');
    fd.append('id', id);
    fd.append('modelo', document.getElementById('model').value || '');
    fd.append('ano', document.getElementById('year').value || '');
    fd.append('km', document.getElementById('km').value || 0);
    fd.append('preco', document.getElementById('price').value || 0);
    fd.append('status', document.getElementById('status').value || 'available');

    // novas imagens
    Array.from(dataTransfer.files).forEach(file => {
      fd.append('images[]', file, file.name);
    });

    // imagens removidas (URLs)
    removedImages.forEach(url => fd.append('removed_images[]', url));

    fetch(api, {
      method: 'POST', // usamos override _method=PUT
      credentials: 'include',
      body: fd
    })
    .then(r => r.json())
    .then(res => {
      if (!res.success) {
        alert('Erro: ' + (res.message || 'Não foi possível atualizar'));
        return;
      }
      alert('Atualizado com sucesso!');
      window.location.href = 'estoque.html';
    })
    .catch(err => {
      console.error(err);
      alert('Erro na requisição.');
    });
  });
});
