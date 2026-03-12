"use client"

// EAD-3: Escala Abreviada del Desarrollo - 3
// 4 areas: Motricidad Gruesa (MG), Motricidad Fina (MF), Audicion-Lenguaje (AL), Personal-Social (PS)
// Items de muestra organizados por rango de edad

export interface EadItem {
  id: string
  numero: number
  area: "MG" | "MF" | "AL" | "PS"
  rangoEdad: number // 1-12 (grupos de edad)
  descripcion: string
  condicionObservacion: string
  criterioRespuesta: string
  materiales: string
}

export interface EcppItem {
  id: string
  numero: number
  dimension: "implicacion" | "dedicacion" | "ocio" | "asesoramiento" | "rol"
  pregunta: string
}

// Rangos de edad EAD-3 (simplificado para 0-36 meses)
export const RANGOS_EDAD_EAD = [
  { rango: 1, label: "0 dias a 1 mes", mesesMin: 0, mesesMax: 1 },
  { rango: 2, label: "1 mes y 1 dia a 3 meses", mesesMin: 1, mesesMax: 3 },
  { rango: 3, label: "3 meses y 1 dia a 6 meses", mesesMin: 3, mesesMax: 6 },
  { rango: 4, label: "6 meses y 1 dia a 9 meses", mesesMin: 6, mesesMax: 9 },
  { rango: 5, label: "9 meses y 1 dia a 12 meses", mesesMin: 9, mesesMax: 12 },
  { rango: 6, label: "12 meses y 1 dia a 18 meses", mesesMin: 12, mesesMax: 18 },
  { rango: 7, label: "18 meses y 1 dia a 24 meses", mesesMin: 18, mesesMax: 24 },
  { rango: 8, label: "24 meses y 1 dia a 36 meses", mesesMin: 24, mesesMax: 36 },
]

export function getRangoEdadByMeses(meses: number): number {
  for (const rango of RANGOS_EDAD_EAD) {
    if (meses >= rango.mesesMin && meses <= rango.mesesMax) {
      return rango.rango
    }
  }
  return 8 // Default al ultimo rango si es mayor
}

// Items de muestra EAD-3 (3 items por area por rango - total 12 items por rango)
// Solo incluimos algunos rangos como muestra
export const EAD_ITEMS: EadItem[] = [
  // Rango 1: 0 dias a 1 mes
  {
    id: "mg-1-1",
    numero: 1,
    area: "MG",
    rangoEdad: 1,
    descripcion: "Realiza reflejo de busqueda y reflejo de succion",
    condicionObservacion: "Pidale al cuidador que acaricie la comisura de la boca del bebe y luego que introduzca un dedo o chupete en su boca.",
    criterioRespuesta: "Puntue si el bebe gira la cabeza hacia el lado que ha sido acariciado y si la boca inicia un movimiento de succion.",
    materiales: "Recurso humano"
  },
  {
    id: "mg-1-2",
    numero: 2,
    area: "MG",
    rangoEdad: 1,
    descripcion: "El reflejo de moro esta presente y es simetrico",
    condicionObservacion: "Alce al bebe con sus dos brazos, poniendole una de sus manos bajo la cabeza y la otra en la parte baja de la espalda. Sostengalo al menos a 5 cm de la camilla, a continuacion, baje suave pero repentinamente sus manos hasta la camilla. Observe la reaccion del bebe.",
    criterioRespuesta: "Puntue si observa abduccion de los brazos con extension de los antebrazos y apertura de las manos, luego una aduccion de los brazos y flexion de los antebrazos. Puede presentarse llanto.",
    materiales: "Recurso humano"
  },
  {
    id: "mg-1-3",
    numero: 3,
    area: "MG",
    rangoEdad: 1,
    descripcion: "Mueve sus extremidades",
    condicionObservacion: "Coloque al bebe acostado boca-arriba, con las piernas libres. Llame su atencion tocandolo o hablandole suavemente o pidale al cuidador que lo haga.",
    criterioRespuesta: "Puntue si el bebe reacciona moviendo vigorosa y simetricamente todas las extremidades (ambos brazos y ambas piernas).",
    materiales: "Recurso humano"
  },
  {
    id: "mf-1-1",
    numero: 1,
    area: "MF",
    rangoEdad: 1,
    descripcion: "Abre y cierra las manos de forma espontanea",
    condicionObservacion: "Observe las manos del bebe mientras esta acostado boca-arriba en estado de alerta tranquila.",
    criterioRespuesta: "Puntue si el bebe abre y cierra las manos espontaneamente al menos una vez durante la observacion.",
    materiales: "Recurso humano"
  },
  {
    id: "mf-1-2",
    numero: 2,
    area: "MF",
    rangoEdad: 1,
    descripcion: "Presenta reflejo de prension palmar",
    condicionObservacion: "Con el bebe en posicion supina, toque la palma de su mano con su dedo indice.",
    criterioRespuesta: "Puntue si el bebe cierra la mano atrapando su dedo.",
    materiales: "Recurso humano"
  },
  {
    id: "mf-1-3",
    numero: 3,
    area: "MF",
    rangoEdad: 1,
    descripcion: "Sigue brevemente con la mirada un objeto",
    condicionObservacion: "Coloque un objeto de color brillante a 20-25 cm del rostro del bebe y muevalo lentamente de un lado a otro.",
    criterioRespuesta: "Puntue si el bebe sigue el objeto con la mirada aunque sea brevemente.",
    materiales: "Objeto de color brillante"
  },
  {
    id: "al-1-1",
    numero: 1,
    area: "AL",
    rangoEdad: 1,
    descripcion: "Reacciona al sonido",
    condicionObservacion: "Con el bebe en estado de alerta, produzca un sonido suave (como aplaudir o usar una sonaja) fuera de su campo visual.",
    criterioRespuesta: "Puntue si el bebe reacciona al sonido cambiando su expresion, moviendo los ojos o el cuerpo.",
    materiales: "Sonaja o similar"
  },
  {
    id: "al-1-2",
    numero: 2,
    area: "AL",
    rangoEdad: 1,
    descripcion: "Emite sonidos guturales",
    condicionObservacion: "Observe si el bebe emite sonidos de forma espontanea o en respuesta a estimulos.",
    criterioRespuesta: "Puntue si el bebe emite sonidos guturales (sonidos de garganta) al menos una vez.",
    materiales: "Recurso humano"
  },
  {
    id: "al-1-3",
    numero: 3,
    area: "AL",
    rangoEdad: 1,
    descripcion: "Se calma al oir la voz del cuidador",
    condicionObservacion: "Si el bebe esta llorando o inquieto, pida al cuidador que le hable suavemente.",
    criterioRespuesta: "Puntue si el bebe se calma o reduce el llanto al escuchar la voz del cuidador.",
    materiales: "Recurso humano"
  },
  {
    id: "ps-1-1",
    numero: 1,
    area: "PS",
    rangoEdad: 1,
    descripcion: "Mira el rostro del examinador o cuidador",
    condicionObservacion: "Coloquese frente al bebe a una distancia de 20-30 cm y llame su atencion hablando suavemente.",
    criterioRespuesta: "Puntue si el bebe mira su rostro o el del cuidador por al menos 2-3 segundos.",
    materiales: "Recurso humano"
  },
  {
    id: "ps-1-2",
    numero: 2,
    area: "PS",
    rangoEdad: 1,
    descripcion: "Responde a estimulos con cambios en su expresion",
    condicionObservacion: "Hable al bebe con diferentes tonos de voz o haga expresiones faciales exageradas.",
    criterioRespuesta: "Puntue si el bebe muestra cambios en su expresion facial en respuesta.",
    materiales: "Recurso humano"
  },
  {
    id: "ps-1-3",
    numero: 3,
    area: "PS",
    rangoEdad: 1,
    descripcion: "Muestra preferencia por el contacto humano",
    condicionObservacion: "Observe si el bebe se calma cuando es tomado en brazos o esta en contacto cercano con el cuidador.",
    criterioRespuesta: "Puntue si el bebe muestra clara preferencia por el contacto humano (se calma, se relaja).",
    materiales: "Recurso humano"
  },

  // Rango 5: 9-12 meses (muestra adicional)
  {
    id: "mg-5-1",
    numero: 13,
    area: "MG",
    rangoEdad: 5,
    descripcion: "Se sienta solo sin apoyo",
    condicionObservacion: "Siente al nino/a en una superficie firme sin ningun apoyo.",
    criterioRespuesta: "Puntue si el nino/a se mantiene sentado sin apoyo por al menos 30 segundos.",
    materiales: "Superficie firme"
  },
  {
    id: "mg-5-2",
    numero: 14,
    area: "MG",
    rangoEdad: 5,
    descripcion: "Gatea o se desplaza de alguna forma",
    condicionObservacion: "Coloque un juguete atractivo a cierta distancia del nino/a y animelo a alcanzarlo.",
    criterioRespuesta: "Puntue si el nino/a se desplaza hacia el objeto de alguna manera (gateando, arrastandose, etc.).",
    materiales: "Juguete atractivo"
  },
  {
    id: "mg-5-3",
    numero: 15,
    area: "MG",
    rangoEdad: 5,
    descripcion: "Se pone de pie con apoyo",
    condicionObservacion: "Ofrezca al nino/a un apoyo estable (mueble, barandilla) y animelo a ponerse de pie.",
    criterioRespuesta: "Puntue si el nino/a logra ponerse de pie sosteniendose del apoyo.",
    materiales: "Apoyo estable"
  },
  {
    id: "mf-5-1",
    numero: 13,
    area: "MF",
    rangoEdad: 5,
    descripcion: "Toma objetos con pinza inferior",
    condicionObservacion: "Ofrezca al nino/a un objeto pequeno (como una bolita de cereal).",
    criterioRespuesta: "Puntue si el nino/a toma el objeto usando el pulgar y los dedos (pinza inferior).",
    materiales: "Objeto pequeno seguro"
  },
  {
    id: "mf-5-2",
    numero: 14,
    area: "MF",
    rangoEdad: 5,
    descripcion: "Pasa objetos de una mano a otra",
    condicionObservacion: "Ofrezca un juguete al nino/a y observe como lo manipula.",
    criterioRespuesta: "Puntue si el nino/a pasa el objeto de una mano a la otra.",
    materiales: "Juguete pequeno"
  },
  {
    id: "mf-5-3",
    numero: 15,
    area: "MF",
    rangoEdad: 5,
    descripcion: "Golpea dos objetos entre si",
    condicionObservacion: "Ofrezca al nino/a dos cubos o juguetes pequenos.",
    criterioRespuesta: "Puntue si el nino/a golpea los dos objetos entre si voluntariamente.",
    materiales: "Dos cubos o juguetes"
  },
  {
    id: "al-5-1",
    numero: 13,
    area: "AL",
    rangoEdad: 5,
    descripcion: "Balbucea silabas (ma, pa, ba)",
    condicionObservacion: "Observe la vocalizacion espontanea del nino/a o animelo a vocalizar.",
    criterioRespuesta: "Puntue si el nino/a produce silabas como ma, pa, ba, da.",
    materiales: "Recurso humano"
  },
  {
    id: "al-5-2",
    numero: 14,
    area: "AL",
    rangoEdad: 5,
    descripcion: "Responde a su nombre",
    condicionObservacion: "Llame al nino/a por su nombre sin hacer gestos ni senales visuales.",
    criterioRespuesta: "Puntue si el nino/a voltea o responde de alguna forma al escuchar su nombre.",
    materiales: "Recurso humano"
  },
  {
    id: "al-5-3",
    numero: 15,
    area: "AL",
    rangoEdad: 5,
    descripcion: "Entiende el 'no'",
    condicionObservacion: "Cuando el nino/a este haciendo algo, digale 'no' con tono firme.",
    criterioRespuesta: "Puntue si el nino/a detiene la accion o muestra que comprende la prohibicion.",
    materiales: "Recurso humano"
  },
  {
    id: "ps-5-1",
    numero: 13,
    area: "PS",
    rangoEdad: 5,
    descripcion: "Muestra ansiedad ante extranos",
    condicionObservacion: "Observe la reaccion del nino/a ante personas desconocidas.",
    criterioRespuesta: "Puntue si el nino/a muestra cautela, llanto o busca al cuidador ante extranos.",
    materiales: "Recurso humano"
  },
  {
    id: "ps-5-2",
    numero: 14,
    area: "PS",
    rangoEdad: 5,
    descripcion: "Imita gestos simples",
    condicionObservacion: "Realice gestos simples frente al nino/a como aplaudir o decir adios.",
    criterioRespuesta: "Puntue si el nino/a intenta imitar el gesto.",
    materiales: "Recurso humano"
  },
  {
    id: "ps-5-3",
    numero: 15,
    area: "PS",
    rangoEdad: 5,
    descripcion: "Juega a taparse y descubrirse",
    condicionObservacion: "Juegue al 'cu-cu' con el nino/a cubriendose el rostro.",
    criterioRespuesta: "Puntue si el nino/a participa del juego, anticipando o descubriendose.",
    materiales: "Tela o manos"
  },

  // Rango 7: 18-24 meses (muestra adicional)
  {
    id: "mg-7-1",
    numero: 19,
    area: "MG",
    rangoEdad: 7,
    descripcion: "Camina solo",
    condicionObservacion: "Observe si el nino/a camina de forma independiente.",
    criterioRespuesta: "Puntue si el nino/a camina al menos 10 pasos sin apoyo.",
    materiales: "Espacio abierto"
  },
  {
    id: "mg-7-2",
    numero: 20,
    area: "MG",
    rangoEdad: 7,
    descripcion: "Patea una pelota",
    condicionObservacion: "Coloque una pelota frente al nino/a y animelo a patearla.",
    criterioRespuesta: "Puntue si el nino/a patea la pelota hacia adelante.",
    materiales: "Pelota"
  },
  {
    id: "mg-7-3",
    numero: 21,
    area: "MG",
    rangoEdad: 7,
    descripcion: "Sube escaleras con ayuda",
    condicionObservacion: "Acompane al nino/a a una escalera y ofrezca su mano como apoyo.",
    criterioRespuesta: "Puntue si el nino/a sube al menos 3 escalones con ayuda.",
    materiales: "Escalera segura"
  },
  {
    id: "mf-7-1",
    numero: 19,
    area: "MF",
    rangoEdad: 7,
    descripcion: "Construye torre de 3-4 cubos",
    condicionObservacion: "Proporcione cubos al nino/a y muestre como hacer una torre.",
    criterioRespuesta: "Puntue si el nino/a construye una torre de al menos 3 cubos.",
    materiales: "Cubos de madera"
  },
  {
    id: "mf-7-2",
    numero: 20,
    area: "MF",
    rangoEdad: 7,
    descripcion: "Hace garabatos espontaneos",
    condicionObservacion: "Ofrezca papel y crayones al nino/a.",
    criterioRespuesta: "Puntue si el nino/a hace trazos o garabatos en el papel.",
    materiales: "Papel y crayones"
  },
  {
    id: "mf-7-3",
    numero: 21,
    area: "MF",
    rangoEdad: 7,
    descripcion: "Pasa paginas de un libro",
    condicionObservacion: "Ofrezca un libro con paginas gruesas al nino/a.",
    criterioRespuesta: "Puntue si el nino/a pasa las paginas (aunque sean varias a la vez).",
    materiales: "Libro infantil"
  },
  {
    id: "al-7-1",
    numero: 19,
    area: "AL",
    rangoEdad: 7,
    descripcion: "Dice al menos 10 palabras",
    condicionObservacion: "Pregunte al cuidador cuantas palabras dice el nino/a y cuales.",
    criterioRespuesta: "Puntue si el cuidador reporta al menos 10 palabras que el nino/a usa consistentemente.",
    materiales: "Recurso humano"
  },
  {
    id: "al-7-2",
    numero: 20,
    area: "AL",
    rangoEdad: 7,
    descripcion: "Senala objetos cuando se le nombran",
    condicionObservacion: "Pida al nino/a que senale objetos conocidos: 'Donde esta la pelota?'",
    criterioRespuesta: "Puntue si el nino/a senala correctamente al menos 3 objetos.",
    materiales: "Objetos variados"
  },
  {
    id: "al-7-3",
    numero: 21,
    area: "AL",
    rangoEdad: 7,
    descripcion: "Sigue instrucciones simples",
    condicionObservacion: "De instrucciones simples: 'Dame la pelota', 'Sientate'.",
    criterioRespuesta: "Puntue si el nino/a sigue al menos 2 instrucciones simples.",
    materiales: "Objetos varios"
  },
  {
    id: "ps-7-1",
    numero: 19,
    area: "PS",
    rangoEdad: 7,
    descripcion: "Imita actividades domesticas",
    condicionObservacion: "Observe o pregunte si el nino/a imita barrer, cocinar, etc.",
    criterioRespuesta: "Puntue si el nino/a imita al menos una actividad domestica.",
    materiales: "Juguetes de imitacion"
  },
  {
    id: "ps-7-2",
    numero: 20,
    area: "PS",
    rangoEdad: 7,
    descripcion: "Come solo con cuchara",
    condicionObservacion: "Pregunte al cuidador o observe si el nino/a come solo.",
    criterioRespuesta: "Puntue si el nino/a lleva la cuchara a la boca aunque derrame algo.",
    materiales: "Cuchara y alimento"
  },
  {
    id: "ps-7-3",
    numero: 21,
    area: "PS",
    rangoEdad: 7,
    descripcion: "Avisa cuando esta mojado o sucio",
    condicionObservacion: "Pregunte al cuidador si el nino/a avisa o se queja cuando necesita cambio de panal.",
    criterioRespuesta: "Puntue si el nino/a avisa de alguna forma cuando esta mojado o sucio.",
    materiales: "Recurso humano"
  },

  // Rango 8: 24-36 meses (muestra adicional)
  {
    id: "mg-8-1",
    numero: 22,
    area: "MG",
    rangoEdad: 8,
    descripcion: "Corre con coordinacion",
    condicionObservacion: "Observe o pida al nino/a que corra en un espacio seguro.",
    criterioRespuesta: "Puntue si el nino/a corre con buena coordinacion, sin caerse frecuentemente.",
    materiales: "Espacio abierto"
  },
  {
    id: "mg-8-2",
    numero: 23,
    area: "MG",
    rangoEdad: 8,
    descripcion: "Salta con ambos pies",
    condicionObservacion: "Pida al nino/a que salte con los dos pies juntos.",
    criterioRespuesta: "Puntue si el nino/a logra despegar ambos pies del suelo simultaneamente.",
    materiales: "Espacio seguro"
  },
  {
    id: "mg-8-3",
    numero: 24,
    area: "MG",
    rangoEdad: 8,
    descripcion: "Sube escaleras alternando pies",
    condicionObservacion: "Observe como el nino/a sube escaleras.",
    criterioRespuesta: "Puntue si alterna los pies al subir (no coloca ambos pies en cada escalon).",
    materiales: "Escalera segura"
  },
  {
    id: "mf-8-1",
    numero: 22,
    area: "MF",
    rangoEdad: 8,
    descripcion: "Construye torre de 6+ cubos",
    condicionObservacion: "Proporcione cubos y pida que haga una torre alta.",
    criterioRespuesta: "Puntue si construye una torre de al menos 6 cubos.",
    materiales: "Cubos de madera"
  },
  {
    id: "mf-8-2",
    numero: 23,
    area: "MF",
    rangoEdad: 8,
    descripcion: "Copia un circulo",
    condicionObservacion: "Dibuje un circulo y pida al nino/a que haga uno igual.",
    criterioRespuesta: "Puntue si el nino/a dibuja una forma circular cerrada.",
    materiales: "Papel y lapiz"
  },
  {
    id: "mf-8-3",
    numero: 24,
    area: "MF",
    rangoEdad: 8,
    descripcion: "Ensarta cuentas grandes",
    condicionObservacion: "Ofrezca cuentas grandes y un cordon grueso.",
    criterioRespuesta: "Puntue si el nino/a ensarta al menos 3 cuentas.",
    materiales: "Cuentas y cordon"
  },
  {
    id: "al-8-1",
    numero: 22,
    area: "AL",
    rangoEdad: 8,
    descripcion: "Usa frases de 2-3 palabras",
    condicionObservacion: "Observe el lenguaje espontaneo del nino/a o pregunte al cuidador.",
    criterioRespuesta: "Puntue si el nino/a combina 2-3 palabras: 'mama agua', 'quiero mas'.",
    materiales: "Recurso humano"
  },
  {
    id: "al-8-2",
    numero: 23,
    area: "AL",
    rangoEdad: 8,
    descripcion: "Dice su nombre cuando se le pregunta",
    condicionObservacion: "Pregunte al nino/a: 'Como te llamas?'",
    criterioRespuesta: "Puntue si el nino/a dice su nombre o apodo.",
    materiales: "Recurso humano"
  },
  {
    id: "al-8-3",
    numero: 24,
    area: "AL",
    rangoEdad: 8,
    descripcion: "Identifica partes del cuerpo",
    condicionObservacion: "Pida al nino/a: 'Donde estan tus ojos/nariz/boca?'",
    criterioRespuesta: "Puntue si senala correctamente al menos 4 partes del cuerpo.",
    materiales: "Recurso humano"
  },
  {
    id: "ps-8-1",
    numero: 22,
    area: "PS",
    rangoEdad: 8,
    descripcion: "Se viste con ayuda minima",
    condicionObservacion: "Pregunte al cuidador sobre la autonomia del nino/a al vestirse.",
    criterioRespuesta: "Puntue si el nino/a colabora activamente y hace parte del vestido solo.",
    materiales: "Ropa simple"
  },
  {
    id: "ps-8-2",
    numero: 23,
    area: "PS",
    rangoEdad: 8,
    descripcion: "Juega con otros ninos",
    condicionObservacion: "Pregunte al cuidador sobre el juego social del nino/a.",
    criterioRespuesta: "Puntue si el nino/a interactua con otros ninos durante el juego (no solo paralelo).",
    materiales: "Recurso humano"
  },
  {
    id: "ps-8-3",
    numero: 24,
    area: "PS",
    rangoEdad: 8,
    descripcion: "Controla esfinteres durante el dia",
    condicionObservacion: "Pregunte al cuidador sobre el control de esfinteres.",
    criterioRespuesta: "Puntue si el nino/a avisa y controla esfinteres durante el dia (puede usar panal de noche).",
    materiales: "Recurso humano"
  },
]

// ECPP-P: Escala de Competencia Parental Percibida
// 21 items en 5 dimensiones
export const ECPP_ITEMS: EcppItem[] = [
  // Dimension 1: Implicacion escolar (5 items)
  { id: "ecpp-1", numero: 1, dimension: "implicacion", pregunta: "Felicito a mis hijos/as cada vez que hacen algo bien" },
  { id: "ecpp-2", numero: 2, dimension: "implicacion", pregunta: "Respaldo en casa las reglas, normas y expectativas de conducta de la escuela/guarderia" },
  { id: "ecpp-3", numero: 3, dimension: "implicacion", pregunta: "En casa fomento que cada uno exprese sus opiniones" },
  { id: "ecpp-4", numero: 4, dimension: "implicacion", pregunta: "Me preocupo por incluir a mis hijos/as en actividades extraescolares" },
  { id: "ecpp-5", numero: 5, dimension: "implicacion", pregunta: "Colaboro en las tareas del hogar junto a mis hijos/as" },

  // Dimension 2: Dedicacion personal (5 items)
  { id: "ecpp-6", numero: 6, dimension: "dedicacion", pregunta: "Dedico tiempo a hablar con mi hijo/a" },
  { id: "ecpp-7", numero: 7, dimension: "dedicacion", pregunta: "Consigo que mis hijos/as obedezcan" },
  { id: "ecpp-8", numero: 8, dimension: "dedicacion", pregunta: "Hablo con mis hijos/as de los temas que les interesan durante el dia" },
  { id: "ecpp-9", numero: 9, dimension: "dedicacion", pregunta: "Me resulta facil expresar afecto a mis hijos/as" },
  { id: "ecpp-10", numero: 10, dimension: "dedicacion", pregunta: "Se cuando mi hijo/a hace algo bien e inmediatamente se lo digo" },

  // Dimension 3: Ocio compartido (4 items)
  { id: "ecpp-11", numero: 11, dimension: "ocio", pregunta: "Conozco los amigos/as de mis hijos/as" },
  { id: "ecpp-12", numero: 12, dimension: "ocio", pregunta: "Establezco los limites y normas de comportamiento de mis hijos/as" },
  { id: "ecpp-13", numero: 13, dimension: "ocio", pregunta: "Reservo un tiempo al dia para jugar, leer o hacer algo con mis hijos/as" },
  { id: "ecpp-14", numero: 14, dimension: "ocio", pregunta: "Mantengo un ambiente familiar de armonia" },

  // Dimension 4: Asesoramiento/orientacion (3 items)
  { id: "ecpp-15", numero: 15, dimension: "asesoramiento", pregunta: "Conozco los cambios que estan experimentando mis hijos/as" },
  { id: "ecpp-16", numero: 16, dimension: "asesoramiento", pregunta: "Me intereso por conocer que hacen mis hijos/as cuando no estan en casa" },
  { id: "ecpp-17", numero: 17, dimension: "asesoramiento", pregunta: "Dedico tiempo para hablar con mi pareja sobre nuestros hijos/as" },

  // Dimension 5: Asuncion del rol de padre/madre (4 items)
  { id: "ecpp-18", numero: 18, dimension: "rol", pregunta: "Soy capaz de decir no a mis hijos/as cuando es necesario" },
  { id: "ecpp-19", numero: 19, dimension: "rol", pregunta: "Consigo tener una buena comunicacion con mis hijos/as" },
  { id: "ecpp-20", numero: 20, dimension: "rol", pregunta: "Me siento satisfecho/a con la educacion que estoy dando a mis hijos/as" },
  { id: "ecpp-21", numero: 21, dimension: "rol", pregunta: "Tengo claro el rol que debo tener como padre/madre" },
]

// Opciones de respuesta ECPP-P
export const ECPP_OPCIONES = [
  { value: 1, label: "Nunca" },
  { value: 2, label: "A veces" },
  { value: 3, label: "Casi siempre" },
  { value: 4, label: "Siempre" },
]

// Nombres de areas EAD-3
export const AREA_NAMES = {
  MG: "Motricidad Gruesa",
  MF: "Motricidad Fina",
  AL: "Audicion y Lenguaje",
  PS: "Personal Social",
}

// Nombres de dimensiones ECPP-P
export const DIMENSION_NAMES = {
  implicacion: "Implicacion Escolar",
  dedicacion: "Dedicacion Personal",
  ocio: "Ocio Compartido",
  asesoramiento: "Asesoramiento/Orientacion",
  rol: "Asuncion del Rol",
}

// Funcion para obtener items de EAD-3 segun la edad
export function getEadItemsByEdad(edadMeses: number): EadItem[] {
  const rangoEdad = getRangoEdadByMeses(edadMeses)
  // Retornamos items del rango correspondiente o el mas cercano disponible
  const itemsDelRango = EAD_ITEMS.filter(item => item.rangoEdad === rangoEdad)
  if (itemsDelRango.length > 0) return itemsDelRango
  
  // Si no hay items para ese rango, buscar el mas cercano
  const rangosDisponibles = [...new Set(EAD_ITEMS.map(i => i.rangoEdad))].sort((a, b) => a - b)
  const rangoCercano = rangosDisponibles.reduce((prev, curr) => 
    Math.abs(curr - rangoEdad) < Math.abs(prev - rangoEdad) ? curr : prev
  )
  return EAD_ITEMS.filter(item => item.rangoEdad === rangoCercano)
}

// Clasificacion de resultados (simplificada - de muestra)
export type ClasificacionDesarrollo = "verde" | "amarillo" | "rojo"

export function clasificarPuntajeEAD(puntajeDirecto: number, maxPosible: number): ClasificacionDesarrollo {
  const porcentaje = (puntajeDirecto / maxPosible) * 100
  if (porcentaje >= 70) return "verde" // Desarrollo esperado
  if (porcentaje >= 40) return "amarillo" // Riesgo
  return "rojo" // Sospecha de problemas
}

export function getClasificacionLabel(clasificacion: ClasificacionDesarrollo): string {
  switch (clasificacion) {
    case "verde": return "Desarrollo esperado para la edad"
    case "amarillo": return "Riesgo de problemas de desarrollo"
    case "rojo": return "Sospecha de problemas de desarrollo"
  }
}

export function getClasificacionColor(clasificacion: ClasificacionDesarrollo): string {
  switch (clasificacion) {
    case "verde": return "bg-green-500"
    case "amarillo": return "bg-yellow-500"
    case "rojo": return "bg-red-500"
  }
}
