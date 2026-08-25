// Programa de ejercicios post-cesárea de 8 semanas

export const workoutProgram = {
  duration: '8 semanas',
  totalMinutes: 120,
  intensity: 'Progresivo',
  goal: 'Recuperación segura y fortalecimiento postparto',
  weeks: [
    {
      week: 1,
      title: 'Inicio seguro',
      duration: '5 minutos diarios',
      theme: 'Respiración y conciencia corporal',
      exercises: [
        {
          id: 'deep-breathing',
          name: 'Respiración Profunda',
          duration: '2 min',
          sets: '3 series x 5 reps',
          instructions: `
1. Siéntate cómodamente en una silla o piso
2. Relaja los hombros
3. Inhala lentamente por la nariz contando hasta 4
4. Sostén el aire contando hasta 2
5. Exhala lentamente por la boca contando hasta 6
6. Pausa 2 segundos antes de inhalar nuevamente
7. Repite 5 veces por serie, 3 series al día

Beneficio: Oxigena tu cuerpo y reduce el estrés
Nota: Este es el ejercicio más importante. No saltees este.
          `.trim(),
          safety: '✓ Post-cesárea seguro, sin presión abdominal'
        },
        {
          id: 'gentle-stretching',
          name: 'Estiramiento Suave',
          duration: '2 min',
          sets: '10 repeticiones',
          instructions: `
CUELLO:
1. Siéntate derecha
2. Inclina lentamente la cabeza hacia el hombro derecho
3. Sostén 10 segundos
4. Vuelve al centro
5. Repite hacia el lado izquierdo

HOMBROS:
1. Levanta los hombros hacia las orejas
2. Sostén 3 segundos
3. Baja lentamente
4. Repite 5 veces

BRAZOS:
1. Lleva un brazo sobre tu cabeza
2. Con la otra mano, tira suavemente del codo
3. Sostén 15 segundos
4. Cambia de lado

CINTURA:
1. Siéntate con la espalda derecha
2. Gira lentamente hacia la derecha, cuidando la incisión
3. Sostén 10 segundos
4. Repite hacia la izquierda

Nota: NUNCA hagas movimientos bruscos. Es un estiramiento suave.
          `.trim(),
          safety: '✓ Sin rebotes, sin presión en la incisión'
        },
        {
          id: 'pelvic-awareness',
          name: 'Conciencia del Piso Pélvico',
          duration: '1 min',
          sets: 'Una vez al día',
          instructions: `
1. Siéntate cómodamente
2. Intenta "detener" el flujo cuando estés orinando (sin hacerlo realmente, solo identifica dónde)
3. Esos son tus músculos del piso pélvico
4. Ahora, de pie o sentada, intenta contraer esos músculos sin flexionar glúteos o muslos
5. Sostén 2 segundos
6. Relaja completamente
7. Repite 5 veces

¡Ya lo hiciste! Solo reconocer dónde están es el primer paso.

Nota: No hagas Kegels intensos aún. Solo conciencia.
          `.trim(),
          safety: '✓ Completamente seguro'
        }
      ],
      tips: [
        'Hazlo en la mañana después de desayunar',
        'Si sientes mareos, siéntate inmediatamente',
        'El dolor debe ser ausente o muy leve',
        'Si sangras más después, baja la intensidad'
      ]
    },
    {
      week: 2,
      title: 'Activación leve',
      duration: '8 minutos',
      theme: 'Introducción a fortalecimiento básico',
      exercises: [
        {
          id: 'week2-breathing',
          name: 'Respiración + Contracción Pélvica',
          duration: '2 min',
          sets: '3 series x 8 reps',
          instructions: `
KOMBINADO - Nunca hagas esto solo sin primero dominar respiración sola:

1. Inhala profundamente (4 segundos)
2. Al exhalar, contrae tu piso pélvico (como si detuvieras orina)
3. Sostén la contracción durante la exhalación (6 segundos)
4. Al inhalar nuevamente, relaja completamente
5. Repite 8 veces

Estos son los famosos "Kegels". Pero hazlos lentamente.

Nota: Si esto causa dolor o incomodidad, vuelve a solo respiración por una semana más.
          `.trim(),
          safety: '✓ Suave, controlado'
        },
        {
          id: 'slow-walking',
          name: 'Caminata Lenta',
          duration: '3 min',
          sets: '1 serie',
          instructions: `
1. Camina a ritmo muy lento (mitad de tu velocidad normal)
2. Concéntrate en tu postura:
   - Hombros atrás y relajados
   - Core ligeramente contraído (sin forzar)
   - Mira al frente
3. Camina durante 3 minutos sin parar
4. Si te cansas, está bien disminuir a 2 minutos

Beneficio: Aumenta circulación, previene coágulos
Nota: Esto NO debe causar dolor ni aumentar sangrado significativamente
          `.trim(),
          safety: '✓ Bajo impacto'
        },
        {
          id: 'gentle-abdominal',
          name: 'Conciencia Abdominal Suave',
          duration: '2 min',
          sets: '1 serie x 10 reps',
          instructions: `
NO HAGAS ABDOMINALES TRADICIONALES AÚN.

1. Acuéstate de espalda, rodillas flexionadas, pies en el piso
2. Coloca una mano sobre tu abdomen
3. Inhala profundamente en la nariz
4. Al exhalar, relaja el abdomen (deja que caiga)
5. Inhala y deja que el abdomen se expanda (como un globo)
6. El abdomen no debe tensarse, solo expandirse y relajarse
7. Repite 10 veces, lentamente

Esto es "diastasis rectus awareness" - aprender a usar tus abdominales sin separar el músculo

Importante: Si ves que tu abdomen se "crea un domo" o sobresale, detente inmediatamente.
          `.trim(),
          safety: '✓ Muy suave, sin presión'
        }
      ],
      tips: [
        'Aumenta gradualmente de semana 1',
        'Si algo duele, vuelve a semana 1',
        'Descansa 1 día entre sesiones',
        'Hidratación es crucial'
      ]
    },
    {
      week: 3,
      title: 'Fortalecimiento',
      duration: '10 minutos',
      theme: 'Aumento gradual de intensidad',
      exercises: [
        {
          id: 'glute-bridge',
          name: 'Puente de Glúteos Modificado',
          duration: '2 min',
          sets: '3 series x 10 reps',
          instructions: `
1. Acuéstate de espalda
2. Rodillas flexionadas, pies paralelos a la anchura de cadera
3. Brazos a los lados
4. Exhala mientras levantas cadera del piso (contrae glúteos)
5. Sostén arriba durante 2 segundos apretando glúteos
6. Inhala mientras bajas lentamente
7. Repite 10 veces

Variación si es fácil: Levanta un pie del piso mientras estás arriba

Beneficio: Fortalece glúteos, soporte de la espalda baja
Seguridad: La incisión está hacia adelante, este ejercicio es seguro
          `.trim(),
          safety: '✓ Sin presión en la incisión'
        },
        {
          id: 'kegel-advanced',
          name: 'Kegels con variación',
          duration: '2 min',
          sets: '3 series x 12 reps',
          instructions: `
Ahora que dominaste los Kegels básicos:

KEGELS SOSTENIDOS:
1. Contrae el piso pélvico
2. Sostén la contracción durante 5 segundos (aumenta gradualmente)
3. Relaja durante 5 segundos
4. Repite 8 veces

KEGELS RÁPIDOS:
1. Contrae y relaja rápidamente (1 segundo en/out)
2. Repite 20 veces
3. Descansa
4. Repite

Beneficio: Fortalecimiento completo del piso pélvico
Nota: No hagas ambos en la misma sesión. Alterna días.
          `.trim(),
          safety: '✓ Normal'
        },
        {
          id: 'modified-plank',
          name: 'Tabla Modificada',
          duration: '2 min',
          sets: '3 series x 20 segundos',
          instructions: `
1. Acuéstate boca abajo
2. Coloca antebrazos en el piso (codos bajo hombros)
3. Levanta cuerpo apoyándote en antebrazos y rodillas
4. Cuerpo forma línea recta desde rodillas a cabeza
5. Contrae abdominales suavemente
6. Respira normal (no sostengas el aliento)
7. Mantén 20 segundos
8. Descansa y repite

Si es muy difícil, puedes mantener la posición contra una pared en lugar de el piso.

Beneficio: Core fortalecido sin presión de abdominales directa
Seguridad: Protege tu incisión mientras fortaleces
          `.trim(),
          safety: '✓ Controlado'
        },
        {
          id: 'side-lying-leg',
          name: 'Levantamiento de Pierna en Posición Lateral',
          duration: '2 min',
          sets: '2 series x 12 reps cada lado',
          instructions: `
1. Acuéstate sobre tu lado derecho
2. Pierna derecha flexionada, pierna izquierda recta
3. Cabeza apoyada cómodamente
4. Levanta pierna izquierda hacia el techo (puede estar un poco atrás)
5. Sostén 1 segundo
6. Baja lentamente sin tocar la pierna derecha
7. Repite 12 veces
8. Cambia de lado

Beneficio: Fortalece caderas y oblicuos sin presión abdominal
Nota: Movimiento pequeño es suficiente. Calidad > Cantidad.
          `.trim(),
          safety: '✓ Seguro'
        }
      ],
      tips: [
        'Ahora puedes hacer 4-5 días a la semana',
        'Sigue comiendo bien - necesitas energía',
        'Si sangras más, reduce intensidad',
        'Duerme cuando puedas'
      ]
    },
    {
      week: 4,
      title: 'Resistencia',
      duration: '12 minutos',
      theme: 'Construcción de fuerza funcional',
      exercises: [
        {
          id: 'modified-pushup',
          name: 'Flexión de Brazos Modificada',
          duration: '2 min',
          sets: '3 series x 8 reps',
          instructions: `
IMPORTANTE: Solo si el abdomen está completamente cicatrizado y sin dolor.

1. Posición de tabla en rodillas (ver "tabla modificada" semana 3)
2. Manos bajo hombros
3. Inhala mientras bajas cuerpo lentamente hacia el piso
4. Solamente baja hasta que sientas presión moderada
5. Exhala mientras subes usando brazos
6. Repite 8 veces

Si es muy difícil: Apoya manos contra una pared y hazlo de pie.

Beneficio: Fortalece brazos y pecho para cargar bebé
          `.trim(),
          safety: '✓ Si sientes dolor en incisión, salta este'
        },
        {
          id: 'squat-assisted',
          name: 'Sentadilla Asistida',
          duration: '2 min',
          sets: '3 series x 10 reps',
          instructions: `
1. De pie frente a una silla o mostrador
2. Manos ligeras sobre el respaldo para soporte
3. Pies a la anchura de cadera
4. Baja lentamente como si fueras a sentarte
5. No necesitas sentarte completamente, solo hasta 60-70% del camino
6. Sostén 1 segundo
7. Sube lentamente usando piernas
8. Repite 10 veces

Variación: Aumenta profundidad gradualmente

Beneficio: Piernas fuertes, essential para perseguir bebé
Seguridad: El soporte evita caídas
          `.trim(),
          safety: '✓ Seguro con soporte'
        },
        {
          id: 'wall-push',
          name: 'Empuje Contra Pared',
          duration: '1.5 min',
          sets: '3 series x 10 reps',
          instructions: `
1. De pie a un brazo de distancia de una pared
2. Manos sobre la pared a la altura del hombro
3. Inclinante cuerpo hacia la pared manteniendo espalda recta
4. Empuja pared vigorosamente durante 3 segundos
5. Relaja
6. Repite 10 veces

Beneficio: Construye fuerza de brazos, accesible para todos los niveles
          `.trim(),
          safety: '✓ Muy seguro'
        },
        {
          id: 'dead-bug',
          name: 'Dead Bug',
          duration: '2 min',
          sets: '3 series x 8 reps',
          instructions: `
SOLO SI dominas conciencia abdominal de semana 2.

1. Acuéstate de espalda
2. Brazos hacia el techo (como si empujaras el techo)
3. Rodillas flexionadas, caderas a 90 grados (muslos verticales)
4. Lentamente, baja brazo derecho sobre la cabeza MIENTRAS bajas pierna izquierda
5. Regresa a posición inicial
6. Repite al lado opuesto
7. Este es uno completo

Importante: Si ves tu abdomen hacer un "domo", para inmediatamente.

Beneficio: Core verdadero sin presión abdominal directa
          `.trim(),
          safety: '✓ Solo si estás lista'
        },
        {
          id: 'hip-circles',
          name: 'Círculos de Cadera',
          duration: '1.5 min',
          sets: '10 ciruclos en cada dirección',
          instructions: `
1. De pie con pies a la anchura de cadera
2. Manos en cadera o brazos extendidos
3. Mueve caderas hacia adelante
4. Luego hacia un lado
5. Hacia atrás
6. Hacia el otro lado (como un círculo)
7. Completa 10 círculos amplios en una dirección
8. Cambia dirección

Beneficio: Movilidad, divertido, ayuda con postura
          `.trim(),
          safety: '✓ Muy seguro'
        }
      ],
      tips: [
        'Estás en semana 4! Celebra tu progreso',
        'Incrementa frecuencia a 5-6 días por semana',
        'Si sientes hormigueo en incisión, consulta médico',
        'Sigue descansando adecuadamente'
      ]
    },
    {
      week: 5,
      title: 'Integración',
      duration: '15 minutos',
      exercises: [
        {
          id: 'yoga-sequence',
          name: 'Secuencia de Yoga Suave',
          duration: '15 min',
          instructions: 'Cat-Cow, Down Dog (modificado), Warrior I (modified), Child\'s Pose'
        }
      ]
    },
    {
      week: 6,
      title: 'Cardio suave',
      duration: '15 minutos',
      exercises: [
        {
          id: 'brisk-walk',
          name: 'Caminata Rápida',
          duration: '15 min',
          instructions: 'Camina a ritmo que puedas hablar pero no cantar (conversational pace)'
        }
      ]
    },
    {
      week: 7,
      title: 'Entrenamiento',
      duration: '20 minutos',
      exercises: [
        {
          id: 'low-impact-hiit',
          name: 'HIIT Bajo Impacto',
          duration: '20 min',
          instructions: 'Alternancia de 30 segundos intensa, 30 segundos descanso'
        }
      ]
    },
    {
      week: 8,
      title: 'Mantenimiento',
      duration: '25 minutos',
      exercises: [
        {
          id: 'maintenance-routine',
          name: 'Rutina Completa de Mantenimiento',
          duration: '25 min',
          instructions: 'Combina todos los ejercicios favoritos en una rutina'
        }
      ]
    }
  ]
};

export function getWeekWorkout(week) {
  return workoutProgram.weeks[week - 1];
}

export function getExerciseById(weekNumber, exerciseId) {
  const week = workoutProgram.weeks[weekNumber - 1];
  return week.exercises.find(e => e.id === exerciseId);
}
