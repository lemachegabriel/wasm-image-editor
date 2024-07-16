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

