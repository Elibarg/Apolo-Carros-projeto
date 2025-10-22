// Arquivo: js/photo-upload.js - Sistema Universal de Upload de Fotos
class PhotoUpload {
    constructor(options = {}) {
        this.options = {
            maxFiles: 10,
            maxFileSize: 5 * 1024 * 1024, // 5MB
            allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            previewContainer: null,
            inputElement: null,
            onFilesSelected: null,
            onFileRemove: null,
            ...options
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        if (this.options.inputElement) {
            this.options.inputElement.addEventListener('change', (e) => {
                this.handleFileSelection(e.target.files);
            });
        }
    }

    handleFileSelection(files) {
        const validFiles = this.validateFiles(files);
        
        if (validFiles.length === 0) {
            return;
        }

        this.createPreviews(validFiles);

        if (this.options.onFilesSelected) {
            this.options.onFilesSelected(validFiles);
        }
    }

    validateFiles(files) {
        const validFiles = [];
        
        for (let file of files) {
            // Verificar tipo de arquivo
            if (!this.options.allowedTypes.includes(file.type)) {
                alert(`Tipo de arquivo não permitido: ${file.name}. Use apenas imagens JPEG, PNG, GIF ou WebP.`);
                continue;
            }

            // Verificar tamanho do arquivo
            if (file.size > this.options.maxFileSize) {
                alert(`Arquivo muito grande: ${file.name}. Tamanho máximo: 5MB.`);
                continue;
            }

            // Verificar número máximo de arquivos
            if (validFiles.length >= this.options.maxFiles) {
                alert(`Máximo de ${this.options.maxFiles} arquivos permitidos.`);
                break;
            }

            validFiles.push(file);
        }

        return validFiles;
    }

    createPreviews(files) {
        if (!this.options.previewContainer) return;

        // Limpar previews existentes se necessário
        // this.clearPreviews();

        files.forEach(file => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const preview = this.createPreviewElement(e.target.result, file);
                this.options.previewContainer.appendChild(preview);
            };
            
            reader.readAsDataURL(file);
        });
    }

    createPreviewElement(imageSrc, file) {
        const previewDiv = document.createElement('div');
        previewDiv.className = 'photo-preview';
        previewDiv.innerHTML = `
            <img src="${imageSrc}" alt="Preview">
            <button type="button" class="remove-photo" data-filename="${file.name}">
                <i class="fas fa-times"></i>
            </button>
            <div class="photo-info">
                <span class="photo-name">${file.name}</span>
                <span class="photo-size">${this.formatFileSize(file.size)}</span>
            </div>
        `;

        // Adicionar evento de remoção
        const removeBtn = previewDiv.querySelector('.remove-photo');
        removeBtn.addEventListener('click', () => {
            this.removePreview(previewDiv, file);
        });

        return previewDiv;
    }

    removePreview(previewElement, file) {
        previewElement.remove();
        
        if (this.options.onFileRemove) {
            this.options.onFileRemove(file);
        }
    }

    clearPreviews() {
        if (this.options.previewContainer) {
            this.options.previewContainer.innerHTML = '';
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    getSelectedFiles() {
        const previews = this.options.previewContainer?.querySelectorAll('.photo-preview') || [];
        return Array.from(previews).map(preview => {
            const img = preview.querySelector('img');
            const info = preview.querySelector('.photo-name');
            return {
                src: img.src,
                name: info?.textContent || 'image',
                element: preview
            };
        });
    }

    // Método estático para inicialização rápida
    static init(selector, options = {}) {
        const element = document.querySelector(selector);
        if (!element) {
            console.warn(`Elemento não encontrado: ${selector}`);
            return null;
        }

        const defaultOptions = {
            inputElement: element,
            previewContainer: element.closest('.upload-container')?.querySelector('.preview-container') || 
                            document.querySelector('.preview-container')
        };

        return new PhotoUpload({ ...defaultOptions, ...options });
    }
}

// Inicialização automática para elementos com data-photo-upload
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('[data-photo-upload]').forEach(element => {
        PhotoUpload.init(element);
    });
});