const input = document.querySelector('input');
const botaoResetarFiltro = document.querySelector('#remover');
const botaoPBFiltroJs = document.querySelector('#preto-e-branco-js');
const botaoPBFiltroWasm = document.querySelector('#preto-e-branco-wasm');

let imagemOriginal = document.getElementById('imagem').src;

const file = './target/wasm32-unknown-unknown/release/editor.wasm';


WebAssembly.instantiateStreaming(fetch(file))
  .then((wasm) => {
    const { instance } = wasm

    const { subtracao, criar_memoria_inicial, memory, malloc, acumular, filtro_preto_e_branco } = instance.exports

    botaoPBFiltroWasm.addEventListener('click', (event) => {
      const imagem = document.getElementById('imagem')
      const {canvas, contexto} = converteImagemParaCanvas(imagem)
      const dadosDaImagem = contexto.getImageData(0, 0, canvas.width, canvas.height)
      const buffer = dadosDaImagem.data.buffer
      const u8Array = new Uint8Array(buffer)
      const ponteiro = malloc(u8Array.length)
      let wasmArray = new Uint8ClampedArray(instance.exports.memory.buffer, ponteiro, u8Array.length)

      wasmArray.set(u8Array)
      const inicio = performance.now()
      filtro_preto_e_branco(ponteiro, u8Array.length)
      const final = performance.now()
      tempoDaOperacao(inicio, final, 'WebAssembly Preto e Branco')

      const width = imagem.naturalWidth || imagem.width
      const height = imagem.naturalHeight || imagem.height

      const novoDadosDaImagem = contexto.createImageData(width, height)

      novoDadosDaImagem.data.set(wasmArray)
      contexto.putImageData(novoDadosDaImagem, 0, 0)
      imagem.src = canvas.toDataURL('image/jpeg')

    })

    criar_memoria_inicial()

    const jsList = Uint8Array.from([20, 50, 80])
    const jsListLenght = jsList.length
    const wasmListPointer = malloc(jsListLenght)
    const wasmList = new Uint8Array(memory.buffer, wasmListPointer, jsListLenght)

    wasmList.set(jsList)
    const sumBetweenListItens = acumular(wasmListPointer, jsListLenght)

    criar_memoria_inicial()
    const arrayMemoria = new Uint8Array(memory.buffer, 0).slice(0, 10);
    console.log(arrayMemoria)


    console.log(sumBetweenListItens)
  });



  // Toda vez que for mudado o valor de input executará a função abaixo
input.addEventListener('change', (event) => {
  const arquivo = event.target.files[0];
  const reader = new FileReader();

  // Seleciona o elemento imagem e atualiza o título baseado no arquivo
  const imagem = document.getElementById('imagem');
  imagem.title = arquivo.name;

  reader.onload = (event) => {
    // Quando o processo for finalizado salva o resultado no 
    // atributo src da imagem. Também atualiza a variável imagemOriginal
    imagem.src = event.target.result;
    imagemOriginal = event.target.result;
  };

  reader.readAsDataURL(arquivo);
});

botaoResetarFiltro.addEventListener('click', (event) => {
  const imagem = document.getElementById('imagem');
  imagem.src = imagemOriginal;
  console.log('Imagem voltou ao original');
});


function converteImagemParaCanvas(imagem) {
  // Cria a referência do canvas
  const canvas = document.createElement('canvas');

  // Seleciona o context 2d do canvas
  const contexto = canvas.getContext('2d');

  // Coloca a largura e altura do canvas similar a imagem
  canvas.width = imagem.naturalWidth || imagem.width;
  canvas.height = imagem.naturalHeight || imagem.height;

  // Desenha a imagem no contexto 2d
  contexto.drawImage(imagem, 0, 0);

  // Retorna tanto o canvas como seu contexto
  return { canvas, contexto };
};


function filtroPretoBrancoJS(canvas, contexto) {
  // Pega os dados da imagem
  const dadosDaImagem = contexto.getImageData(0, 0, canvas.width, canvas.height);

  // Pega os pixels da imagem
  const pixels = dadosDaImagem.data;

  // Salva o tempo do inicio
  const inicio = performance.now();

  // Performa a mudança em cada pixel da imagem de 
  // acordo com a formula vista acima
  for (var i = 0, n = pixels.length; i < n; i += 4) {
    const filtro = pixels[i] / 3 + pixels[i+1] / 3 + pixels[i+2] / 3;
    pixels[i] = filtro;
    pixels[i+1] = filtro;
    pixels[i+2] = filtro;
  }

  // Salva o tempo do fim
  const fim = performance.now();

  // Reporta o tempo que levou
  tempoDaOperacao(inicio, fim, 'JavaScript Preto e Branco');

  // Atualiza o canvas com os novos dados
  contexto.putImageData(dadosDaImagem, 0, 0);

  // Retorna um base64 do canvas
  return canvas.toDataURL('image/jpeg');
};

botaoPBFiltroJs.addEventListener('click', (event) => {
  // Seleciona a imagem
  const imagem = document.getElementById('imagem');
  
  // Converte a imagem para canvas
  const { canvas, contexto } = converteImagemParaCanvas(imagem);

  // Recebe o base64
  const base64 = filtroPretoBrancoJS(canvas, contexto);

  // Coloca o novo base64 na imagem
  imagem.src = base64;  
});

function tempoDaOperacao(inicio, fim, nomeDaOperacao) {
  // Seleciona o elemento #performance
  const performance = document.querySelector('#performance');
  // Muda o texto de #performance para o tempo da execução
  performance.textContent = `${nomeDaOperacao}: ${fim - inicio} ms.`;
};
