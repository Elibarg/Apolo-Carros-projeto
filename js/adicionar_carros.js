// js/adicionar_carros.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('addVehicleForm');
  const uploadCard = document.querySelector('.upload-new');
  const fileInput = document.getElementById('imageInput');
  const imageGrid = document.getElementById('imageGrid');

  // Usamos DataTransfer para manter uma lista editável de arquivos
  const dataTransfer = new DataTransfer();

  // quando clicar no cartão, abrir o input escondido
  if (uploadCard) {
    uploadCard.addEventListener('click', (e) => {
      // evitar clique no botão interno
      if (e.target.tagName.toLowerCase() === 'input') return;
      fileInput.click();
    });
  }

  // tratar seleção de arquivos
  fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      // adicionar ao DataTransfer
      dataTransfer.items.add(file);
      // criar preview
      const reader = new FileReader();
      const wrap = document.createElement('div');
      wrap.className = 'image-preview';
      reader.onload = (ev) => {
        wrap.innerHTML = `
          <img src="${ev.target.result}" alt="${file.name}">
          <button type="button" class="btn btn-danger btn-sm remove-image"><i class="fas fa-times"></i></button>
        `;
        // inserir antes do uploadCard
        imageGrid.insertBefore(wrap, uploadCard);
        // remover handler
        wrap.querySelector('.remove-image').addEventListener('click', () => {
          // remover do DataTransfer
          removeFileFromDataTransfer(file.name);
          wrap.remove();
        });
      };
      reader.readAsDataURL(file);
    });

    // atualizar o fileInput.files com dataTransfer (para compat com envio)
    fileInput.files = dataTransfer.files;
  });

  function removeFileFromDataTransfer(name) {
    // criar novo DataTransfer e copiar exceto o nome
    const dt = new DataTransfer();
    Array.from(dataTransfer.files).forEach(f => {
      if (f.name !== name) dt.items.add(f);
    });
    // substituir
    while (dataTransfer.items.length) dataTransfer.items.remove(0);
    Array.from(dt.files).forEach(f => dataTransfer.items.add(f));
    fileInput.files = dataTransfer.files;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const api = "../../backend/api/vehicles.php";
    const fd = new FormData();

    fd.append('marca', document.getElementById('model').value || '');
    fd.append('modelo', document.getElementById('model').value || '');
    fd.append('ano', document.getElementById('year').value || '');
    fd.append('km', document.getElementById('km').value || 0);
    fd.append('preco', document.getElementById('price').value || 0);
    fd.append('status', document.getElementById('status').value || 'available');

    // adicionar arquivos do dataTransfer
    Array.from(dataTransfer.files).forEach((file, idx) => {
      fd.append('images[]', file, file.name);
    });

    fetch(api, {
      method: 'POST',
      credentials: 'include',
      body: fd
    })
    .then(r => r.json())
    .then(res => {
      if (!res.success) {
        alert('Erro: ' + (res.message || 'Não foi possível cadastrar'));
        return;
      }
      alert('Veículo cadastrado com sucesso!');
      window.location.href = 'estoque.html';
    })
    .catch(err => {
      console.error(err);
      alert('Erro na requisição.');
    });
  });
});
