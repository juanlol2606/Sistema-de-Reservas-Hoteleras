export const HOTELES = [
  {
    nombre: 'Hotel Candelaria Real',
    estrellas: 4,
    direccion: { calle: 'Carrera 7 # 12-45', ciudad: 'Bogotá', pais: 'Colombia' },
    contacto: { telefono: '+57 601 555 0142', email: 'reservas@candelariareal.example' },
    servicios: ['wifi', 'desayuno incluido', 'restaurante', 'sala de reuniones', 'recepción 24 horas'],
    precioBase: 150000,
    calidadResenas: 4.4,
    enMantenimiento: ['204'],
  },
  {
    nombre: 'Poblado Suites Boutique',
    estrellas: 5,
    direccion: { calle: 'Calle 10 # 36-20', ciudad: 'Medellín', pais: 'Colombia' },
    contacto: { telefono: '+57 604 555 0187', email: 'reservas@pobladosuites.example' },
    servicios: ['wifi', 'desayuno incluido', 'piscina', 'spa', 'gimnasio', 'restaurante', 'servicio a la habitación'],
    precioBase: 210000,
    calidadResenas: 4.7,
    enMantenimiento: [],
  },
  {
    nombre: 'Casa Bahía',
    estrellas: 4,
    direccion: { calle: 'Calle del Arsenal # 8-27', ciudad: 'Cartagena', pais: 'Colombia' },
    contacto: { telefono: '+57 605 555 0123', email: 'reservas@casabahia.example' },
    servicios: ['wifi', 'desayuno incluido', 'piscina', 'terraza', 'traslado al aeropuerto'],
    precioBase: 190000,
    calidadResenas: 4.5,
    enMantenimiento: ['102'],
  },
  {
    nombre: 'Hotel Sultana del Valle',
    estrellas: 3,
    direccion: { calle: 'Avenida 6N # 24-60', ciudad: 'Cali', pais: 'Colombia' },
    contacto: { telefono: '+57 602 555 0165', email: 'reservas@sultanadelvalle.example' },
    servicios: ['wifi', 'desayuno incluido', 'parqueadero', 'restaurante'],
    precioBase: 110000,
    calidadResenas: 3.8,
    enMantenimiento: [],
  },
  {
    nombre: 'Rodadero Brisa Mar',
    estrellas: 3,
    direccion: { calle: 'Carrera 2 # 11-35', ciudad: 'Santa Marta', pais: 'Colombia' },
    contacto: { telefono: '+57 605 555 0198', email: 'reservas@brisamar.example' },
    servicios: ['wifi', 'piscina', 'acceso a la playa', 'parqueadero', 'restaurante'],
    precioBase: 120000,
    calidadResenas: 4.0,
    enMantenimiento: ['302'],
  },
];

// Ocho habitaciones por hotel (5 hoteles = 40). El precio base se multiplica según el tipo.
export const DISTRIBUCION_HABITACIONES = [
  {
    tipo: 'sencilla',
    numeros: ['101', '102'],
    capacidades: [1, 2],
    multiplicador: 1,
    amenidades: ['wifi', 'televisor', 'aire acondicionado'],
  },
  {
    tipo: 'doble',
    numeros: ['201', '202', '203', '204'],
    capacidades: [2, 2, 3, 4],
    multiplicador: 1.5,
    amenidades: ['wifi', 'televisor', 'aire acondicionado', 'minibar'],
  },
  {
    tipo: 'suite',
    numeros: ['301', '302'],
    capacidades: [4, 6],
    multiplicador: 2.8,
    amenidades: ['wifi', 'televisor', 'aire acondicionado', 'minibar', 'jacuzzi', 'balcón'],
  },
];

export const NOMBRES = [
  'Juan Camilo', 'Andrés Felipe', 'Carlos Eduardo', 'Santiago', 'Mateo', 'Sebastián', 'Daniel',
  'Luis Fernando', 'Jorge Iván', 'Diego Alejandro', 'María Fernanda', 'Laura Camila', 'Valentina',
  'Daniela', 'Paola Andrea', 'Natalia', 'Carolina', 'Luisa Fernanda', 'Juliana', 'Sofía',
  'Alejandra', 'Ana María', 'Camila', 'Diana Marcela', 'Isabela',
];

export const APELLIDOS = [
  'Rodríguez', 'Gómez', 'Martínez', 'López', 'García', 'Hernández', 'Pérez', 'Ramírez', 'Sánchez',
  'Torres', 'Díaz', 'Vargas', 'Castro', 'Moreno', 'Rojas', 'Ortiz', 'Gutiérrez', 'Jiménez', 'Muñoz',
  'Ríos', 'Cárdenas', 'Pineda', 'Quintero', 'Arango', 'Restrepo',
];

export const CIUDADES_COLOMBIA = [
  'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Bucaramanga', 'Pereira', 'Manizales', 'Cúcuta',
  'Armenia', 'Ibagué',
];

// [ciudad, prefijo telefónico del país]
export const CIUDADES_EXTRANJERAS = [
  ['Ciudad de México', '52'],
  ['Madrid', '34'],
  ['Miami', '1'],
  ['Buenos Aires', '54'],
  ['Lima', '51'],
  ['Quito', '593'],
  ['Santiago de Chile', '56'],
  ['São Paulo', '55'],
];

export const COMENTARIOS_POR_PUNTUACION = {
  1: [
    'La habitación no estaba lista al llegar y nadie supo darnos una solución.',
    'Mucho ruido durante la noche y poca atención del personal.',
  ],
  2: [
    'La ubicación es buena, pero la habitación estaba descuidada.',
    'El desayuno y la limpieza dejan mucho que desear para el precio.',
  ],
  3: [
    'Estadía aceptable: cumple lo básico, aunque sin nada especial.',
    'Buena atención, pero la habitación necesita una renovación.',
  ],
  4: [
    'Muy buena estadía, personal amable y habitación cómoda.',
    'Excelente ubicación y buen desayuno. Volvería sin dudarlo.',
  ],
  5: [
    'Experiencia perfecta: atención impecable y habitación espectacular.',
    'El mejor hotel en el que hemos estado, todo salió mejor de lo esperado.',
  ],
};
