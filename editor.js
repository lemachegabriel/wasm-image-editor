const file = './target/wasm32-unknown-unknown/release/editor.wasm';

WebAssembly.instantiateStreaming(fetch(file))
  .then((wasm) => {
    const {instance} = wasm

    const {subtracao} = instance.exports
    console.log(subtracao(29,10))
  });

