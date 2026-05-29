const video = document.getElementById('webcam');
const canvas = document.getElementById('overlay');
const ctx = canvas.getContext('2d');
const btnCapturar = document.getElementById('btn-capturar');

// 1. Acessar a câmera traseira do dispositivo
async function iniciarCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: { ideal: "environment" }, // Força o uso da câmera traseira
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        });
        video.srcObject = stream;
        
        // Ajustar o tamanho do canvas de overlay quando o vídeo carregar
        video.addEventListener('loadedmetadata', () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            desenharGuiaDeAlinhamento();
        });
    } catch (err) {
        console.error("Erro ao acessar a câmera: ", err);
        alert("Por favor, permita o acesso à câmera.");
    }
}

// 2. Desenhar uma máscara na tela para ajudar o professor a alinhar o papel
function desenharGuiaDeAlinhamento() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Desenha uma borda guia onde o gabarito deve se encaixar
    ctx.strokeStyle = "rgba(0, 255, 0, 0.6)"; // Verde semi-transparente
    ctx.lineWidth = 4;
    ctx.setLineDash([15, 10]); // Linha tracejada
    
    // Margem de 10% das bordas do vídeo
    const margemX = canvas.width * 0.1;
    const margemY = canvas.height * 0.1;
    const larguraGuia = canvas.width * 0.8;
    const alturaGuia = canvas.height * 0.8;
    
    ctx.strokeRect(margemX, margemY, larguraGuia, alturaGuia);
}

// 3. Onde a mágica do processamento de imagem vai começar
btnCapturar.addEventListener('click', () => {
    // Criamos um canvas temporário em memória para extrair a matriz de pixels
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Copia o frame atual do vídeo para o canvas em memória
    tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
    
    // Obtém a matriz de pixels (RGBA)
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    
    // PRÓXIMO PASSO: Processar essa matriz (Binarização e Detecção das Âncoras)
    console.log("Frame capturado com sucesso! Total de pixels:", imageData.data.length / 4);
    alert("Frame capturado! Verifique o console do navegador.");
});

// Inicializa a câmera ao carregar a página
window.addEventListener('DOMContentLoaded', iniciarCamera);