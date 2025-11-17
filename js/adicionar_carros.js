const VEH_API = "../../backend/api/vehicles.php";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".vehicle-form");
    const imageInput = document.getElementById("vehicleImages");
    const preview = document.getElementById("imagePreview");

    imageInput && imageInput.addEventListener("change", () => {
        preview.innerHTML = "";
        Array.from(imageInput.files).forEach(file => {
            const reader = new FileReader();
            const wrap = document.createElement('div');
            wrap.className = 'image-preview';
            reader.onload = e => {
                wrap.innerHTML = `<img src="${e.target.result}" alt=""><button type="button" class="btn btn-danger btn-sm remove-image"><i class="fas fa-times"></i></button>`;
                preview.appendChild(wrap);
                wrap.querySelector('.remove-image').addEventListener('click', () => {
                    wrap.remove();
                    // rebuild FileList: easiest is to clear input and rely on user re-select — keep simple
                    imageInput.value = "";
                });
            };
            reader.readAsDataURL(file);
        });
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('marca', document.getElementById('marca').value);
        formData.append('modelo', document.getElementById('modelo').value);
        formData.append('ano', document.getElementById('ano').value);
        formData.append('km', document.getElementById('km').value);
        formData.append('preco', document.getElementById('preco').value);
        formData.append('status', 'available');
        formData.append('descricao', '');

        const files = document.getElementById('vehicleImages').files;
        for (let i = 0; i < files.length; i++) {
            formData.append('images[]', files[i]);
        }

        fetch(VEH_API, {
            method: 'POST',
            body: formData,
            credentials: 'include'
        })
        .then(r => r.json())
        .then(res => {
            if (!res.success) {
                alert("Erro: " + (res.message || "Não foi possível cadastrar"));
                return;
            }
            alert("Veículo cadastrado com sucesso!");
            window.location.href = "estoque.html";
        })
        .catch(err => {
            console.error(err);
            alert("Erro na requisição.");
        });
    });
});
