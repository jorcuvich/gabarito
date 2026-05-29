const btnIniciar = document.getElementById('btn-iniciar');
const btnCapturar = document.getElementById('btn-capturar');
const videoContainer = document.getElementById('video-container');
const video = document.getElementById('webcam');
const canvas = document.getElementById('overlay');
const ctx = canvas.getContext('2d');
const logDiv = document.getElementById('log');

// Função auxiliar para exibir mensagens na tela (útil para debug no celular)
function logger(mensagem) {
    logDiv.style.display = 'block';
    logDiv.innerHTML += `> ${mensagem}<br>`;
    logDiv.scrollTop = logDiv.scrollHeight;
}

// 1. Solicita acesso à câmera após o clique do usuário
btnIniciar.addEventListener('click', async () => {
    logger("Solicitando permissão de hardware...");
    
    try {
        const restricoes = {
            video: {
                facingMode: { ideal: "environment" }, // Prioriza a câmera traseira
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        };

        const stream = await navigator.mediaDevices.getUserMedia(restricoes);
        video.srcObject = stream;
        
        // Ajustes de interface após sucesso
        btnIniciar.style.display = 'none';
        videoContainer.style.display = 'inline-block';
        btnCapturar.style.display = 'inline-block';
        
        logger("Câmera traseira ativada com sucesso.");

        // Redimensiona o canvas com base nas propriedades reais do fluxo de vídeo
        video.addEventListener('loadedmetadata', () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            desenharGuiaDeAlinhamento();
        });
        
    } catch (err) {
        logger(`ERRO: ${err.name} - ${err.message}`);
        alert("Não foi possível acessar a câmera traseira. Certifique-se de que está usando HTTPS e que deu permissão.");
    }
});

// 2. Desenha o overlay estático de auxílio ao usuário
function desenharGuiaDeAlinhamento() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Configuração do estilo da linha guia
    ctx.strokeStyle = "rgba(40, 167, 69, 0.8)"; // Verde estável
    ctx.lineWidth = 4;
    ctx.setLineDash([15, 8]); // Estilo tracejado
    
    // Define uma margem interna de 10%
    const margemX = canvas.width * 0.1;
    const margemY = canvas.height * 0.1;
    const larguraGuia = canvas.width * 0.8;
    const alturaGuia = canvas.height * 0.8;
    
    ctx.strokeRect(margemX, margemY, larguraGuia, alturaGuia);
    
    // Desenha pequenas marcações nos cantos internos para simular onde as âncoras devem ficar
    ctx.fillStyle = "rgba(40, 167, 69, 0.3)";
    const tamanhoAlvo = 30;
    // Canto Superior Esquerdo
    ctx.fillRect(margemX, margemY, tamanhoAlvo, tamanhoAlvo);
    // Canto Superior Direito
    ctx.fillRect(margemX + larguraGuia - tamanhoAlvo, margemY, tamanhoAlvo, tamanhoAlvo);
    // Canto Inferior Esquerdo
    ctx.fillRect(margemX, margemY + alturaGuia - tamanhoAlvo, tamanhoAlvo, tamanhoAlvo);
    // Canto Inferior Direito
    ctx.fillRect(margemX + larguraGuia - tamanhoAlvo, margemY + alturaGuia - tamanhoAlvo, tamanhoAlvo, tamanhoAlvo);
}

// 3. Captura o Frame Atual e extrai a matriz de dados (ImageData)
btnCapturar.addEventListener('click', () => {
    logger("Capturando frame do vídeo...");
    
    if (!video.videoWidth || !video.videoHeight) {
        logger("Erro: Mídia de vídeo ainda não está pronta.");
        return;
    }

    // Cria um canvas em memória (off-screen) com as dimensões nativas do vídeo
    const canvasMemoria = document.createElement('canvas');
    canvasMemoria.width = video.videoWidth;
    canvasMemoria.height = video.videoHeight;
    const ctxMemoria = canvasMemoria.getContext('2d');
    
    // Desenha o frame atual exato do elemento HTML5 Video no canvas em memória
    ctxMemoria.drawImage(video, 0, 0, canvasMemoria.width, canvasMemoria.height);
    
    // Extrai o array unidimensional RGBA contendo todos os pixels
    // Estrutura do array: [R, G, B, A, R, G, B, A, ...]
    const dadosImagem = ctxMemoria.getImageData(0, 0, canvasMemoria.width, canvasMemoria.height);
    
    logger(`Frame capturado. Resolução: ${canvasMemoria.width}x${canvasMemoria.height}`);
    logger(`Matriz de dados de imagem extraída: ${dadosImagem.data.length} elementos.`);
    
    // NOTA DE ARQUITETURA: 
    // É a partir daqui, usando a variável 'dadosImagem', que vamos aplicar o 
    // algoritmo de limiarização (thresholding) e busca por contornos no próximo passo.
    
    alert("Frame coletado! Pronto para processar a matriz de pixels.");
});