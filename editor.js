const input = document.querySelector('input');
const botaoResetarFiltro = document.querySelector('#remover');
const botaoPBFiltroJs = document.querySelector('#preto-e-branco-js');

let imagemOriginal = document.getElementById('imagem').src;

const file = './target/wasm32-unknown-unknown/release/editor.wasm';


WebAssembly.instantiateStreaming(fetch(file))
  .then((wasm) => {
    const { instance } = wasm

    const { subtracao, criar_memoria_inicial, memory, malloc, acumular } = instance.exports

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

