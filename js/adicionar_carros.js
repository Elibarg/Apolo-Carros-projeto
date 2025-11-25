// js/adicionar_carros.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('addVehicleForm');
  const uploadCard = document.querySelector('.upload-new');
  const fileInput = document.getElementById('imageInput');
  const imageGrid = document.getElementById('imageGrid');

  const dataTransfer = new DataTransfer();

  if (uploadCard) {
    uploadCard.addEventListener('click', (e) => {
      if (e.target.tagName.toLowerCase() === 'input') return;
      fileInput.click();
    });
  }

  fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    
    // Limitar a 12 imagens
    if (dataTransfer.files.length + files.length > 12) {
      alert('Máximo de 12 imagens permitidas.');
      return;
    }
    
    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem.');
        return;
      }
      
      dataTransfer.items.add(file);
      const reader = new FileReader();
      const wrap = document.createElement('div');
      wrap.className = 'image-preview';
      reader.onload = (ev) => {
        wrap.innerHTML = `
          <img src="${ev.target.result}" alt="${file.name}">
          <button type="button" class="btn btn-danger btn-sm remove-image"><i class="fas fa-times"></i></button>
        `;
        imageGrid.insertBefore(wrap, uploadCard);
        wrap.querySelector('.remove-image').addEventListener('click', () => {
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
    while (dataTransfer.items.length) dataTransfer.items.remove(0);
    Array.from(dt.files).forEach(f => dataTransfer.items.add(f));
    fileInput.files = dataTransfer.files;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Validações básicas
    const marca = document.getElementById('marca').value.trim();
    const modelo = document.getElementById('modelo').value.trim();
    const categoria = document.getElementById('categoria').value;
    const combustivel = document.getElementById('combustivel').value;
    const cambio = document.getElementById('cambio').value;
    
    if (!marca || !modelo) {
      alert('Por favor, preencha marca e modelo.');
      return;
    }
    
    if (!categoria || !combustivel || !cambio) {
      alert('Por favor, selecione categoria, combustível e câmbio.');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adicionando...';
    submitBtn.disabled = true;

    const api = "../../backend/api/vehicles.php";
    const fd = new FormData();

    fd.append('marca', marca);
    fd.append('modelo', modelo);
    fd.append('ano', document.getElementById('ano').value || '');
    fd.append('km', document.getElementById('km').value || 0);
    fd.append('preco', document.getElementById('preco').value || 0);
    fd.append('status', document.getElementById('status').value || 'available');
    fd.append('destaque', document.getElementById('destaque').value || 'nao');
    fd.append('categoria', categoria);
    fd.append('combustivel', combustivel);
    fd.append('cambio', cambio);
    fd.append('descricao', document.getElementById('descricao').value || '');

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
        alert('Erro: ' + (res.message || 'Não foi possível cadastrar o veículo'));
        return;
      }
      alert('Veículo cadastrado com sucesso!');
      window.location.href = 'estoque.html';
    })
    .catch(err => {
      console.error(err);
      alert('Erro na requisição. Tente novamente.');
    })
    .finally(() => {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    });
  });
});