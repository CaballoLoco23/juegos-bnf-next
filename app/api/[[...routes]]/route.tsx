/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'
// import { neynar } from 'frog/hubs'
import { handle } from 'frog/next'
import { serveStatic } from 'frog/serve-static'

const app = new Frog<{
  State: {
    coleccion: { nombre: string; descripcion: string, imagen: string, valor: string }[],
    opciones: { nombre: string; descripcion: string, imagen: string, valor: string }[],
    actual: { nombre: string; descripcion: string, imagen: string, valor: string },
    aciertos: { nombre: string; descripcion: string, imagen: string, valor: string }[],
    ganaste: boolean,
    acierto: boolean | null,
    aciertosNecesarios: number
  }
}>({
    initialState: {
      coleccion: [
        { nombre: "Farcaster", descripcion: '¿Con el propósito de educar sobre qué protocolo trata el capítulo 1?', imagen: '', valor: 'far' },
        { nombre: "Café", descripcion: 'Aquí el día siempre se arranca con...', imagen: '', valor: 'bas' },
        { nombre: "Alex", descripcion: 'Fundador del canal apasionado por el básquet', imagen: '', valor: 'ale' },
        { nombre: "Drácula", descripcion: '¿Qué aplicación hizo explotar el precio de DEGEN en el episodio 4?', imagen: '', valor: 'dra' },
        { nombre: "Ray", descripcion: 'Fundador del canal, de la tierra de Messi', imagen: '', valor: 'ray' },
        { nombre: "Nada", descripcion: 'De qué trata el episodio 8?', imagen: '', valor: 'nad' },
      ],
      opciones: [],
      actual: {},
      aciertos: [],
      ganaste: false,
      acierto: null,
      aciertosNecesarios: 3
    },
    assetsPath: '/',
    basePath: '/api',
  })

app.frame('/', (c) => {

  const { buttonValue, deriveState, status } = c
  const { acierto, ganaste, actual, opciones } = deriveState((state) => {
   
    let opt: any[];
    opt = [];
    let correctos = state.aciertos;
    state.acierto = null;
    state.ganaste = false;
   
    if ((!state.aciertosNecesarios && state.coleccion.length - state.aciertos.length <= 3) || (state.aciertosNecesarios > 0 && state.aciertos.length >= state.aciertosNecesarios)) {
      state.ganaste = true;
      state.acierto = false;
      state.aciertos = [];
      state.opciones = [];
    } else {
      if (state.actual.valor && buttonValue && buttonValue === state.actual.valor) {
        state.acierto = true;
        state.aciertos.push(state.actual);
      } else if (state.actual.valor && buttonValue && buttonValue !== state.actual.valor) {
        state.acierto = false;
      }
      while (opt.length < 3) {
        let rand = Math.floor(Math.random() * state.coleccion.length);
        let f = correctos.findIndex(x => x.valor === state.coleccion[rand].valor);
        if (!opt.includes(state.coleccion[rand]) && f < 0) {
          opt.push(state.coleccion[rand]);
        }
      }
      let dado = Math.floor(Math.random() * 2);
      state.actual = opt[dado];
      state.opciones = opt;
    }
  });
  if (status === 'initial') {
    return c.res({
      image: (
        <div tw="flex flex-col w-full h-full p-10 bg-black justify-center items-center">
          <div tw="text-white text-7xl">
            ¿Cuánto sabes de BNFarcaster?
          </div>
          <div tw="text-white text-4xl">
            (Elige la opción correcta)
          </div>
        </div>
      ),
      intents: [
        <Button value="init">Comienza el juego!!</Button>,
      ],
    })
  }
  if (ganaste) {
    return c.res({
      image: (
        <div tw="flex flex-col w-full h-full p-10 bg-black justify-center items-center">
          <div tw="text-white text-7xl">FELICITACIONES!!!!</div>
          <div tw="text-white text-4xl">Eres un fiel seguidor del canal</div>
          <div tw="flex flex-none"><img src={'/logobnf.png'} style={{ width: '25%' }} /></div>
        </div>
      ),
      intents: [
        <Button>Volver a jugar</Button>,
        <Button.Reset>Reiniciar</Button.Reset>
      ],
    })
  }
  if (acierto === false) {
    return c.res({
      image: (
        <div tw="flex flex-col w-full h-full p-10 bg-white justify-center items-center">
          <div tw="text-black text-6xl">Lo siento, vuelve a intentar. 🤦</div>
        </div>
      ),
      intents: [
        <Button>Volver a intentar</Button>,
        <Button.Link href='https://www.youtube.com/@BuenasNochesFarcaster'>Visitanos</Button.Link>
      ],
    })
  }
  if (acierto === true) {
    return c.res({
      image: (
        <div tw="flex flex-col w-full h-full p-10 bg-white justify-center items-center">
          <div tw="text-black text-6xl">Correcto!!!! 🙌</div>
        </div>
      ),
      intents: [
        <Button value="">Seguir jugando</Button>
      ],
    })
  }
  return c.res({
    image: (
      <div tw="flex flex-col justify-center items-center h-screen bg-black">
        <div tw="text-white text-5xl text-center p-10">{actual.descripcion}</div>
      </div>

    ),
    intents: [
      <Button value={opciones[0].valor}>{opciones[0].nombre}</Button>,
      <Button value={opciones[1].valor}>{opciones[1].nombre}</Button>,
      <Button value={opciones[2].valor}>{opciones[2].nombre}</Button>,
    ],
  })
})

devtools(app, { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
