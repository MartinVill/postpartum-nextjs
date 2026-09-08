# Flujo de onboarding, guía y prueba

**Estado:** implementado parcialmente en la interfaz.  
**Última actualización:** 8 de septiembre de 2026.

Este documento describe el recorrido que recibe una persona nueva antes de entrar a la app. Es una especificación de producto y seguridad; no constituye una recomendación clínica.

## Recorrido actual

1. La usuaria completa el onboarding de cuatro pasos.
2. Antes de responder datos físicos y emocionales, acepta el uso de esas respuestas para adaptar su experiencia. Puede elegir “Prefiero no responder”.
3. La app ensambla una guía inicial con reglas deterministas y muestra una propuesta breve y personalizada.
4. La usuaria llega a la pantalla de activación de prueba, con opciones de Google, email o “Ahora no”.
5. Tras continuar, accede al check-in emocional para comenzar a usar la app.

Las pantallas de bienvenida previas al onboarding, el plan de recuperación por fases y la integración de cobro de PayPal siguen pendientes. No deben presentarse como disponibles hasta estar implementadas y verificadas.

## Datos de onboarding usados por la guía

- Nombre elegido por la usuaria.
- Fecha de nacimiento del bebé.
- Tipo de parto y si existieron complicaciones.
- Alta médica para actividad suave.
- Sensaciones físicas seleccionadas.
- Estado emocional seleccionado.

No se piden hobbies ni apodos en este momento. Los hobbies se reservan para una futura personalización contextual del Reto de hoy.

## Motor de reglas y protección

La guía no usa IA para decidir qué movimiento es seguro. Primero evalúa restricciones y solo después selecciona contenidos de bienestar de bajo riesgo.

Se restringe el movimiento activo cuando la usuaria indica falta de alta médica, dudas sobre la alta, complicaciones, dolor/ardor al orinar, dolor en la zona del parto al caminar o dolor bajo abdominal. En ese caso se muestran opciones de descanso, sonido, respiración suave y check-in, junto con el aviso de consultar a un profesional antes de sumar movimiento activo.

En ausencia de una restricción, la guía puede priorizar bloques de calma, postura, reconexión corporal o acompañamiento emocional a partir de las sensaciones informadas. Siempre debe evitar lenguaje de diagnóstico, promesas de resultados físicos o cualquier instrucción que sustituya a un profesional de salud.

## Propuesta visible antes de la prueba

La pantalla comunica el valor concreto del producto con este contenido:

- **Guía diaria:** el check-in permite sugerir una pausa adecuada al momento.
- **Voz o texto:** espacio de acompañamiento para expresarse cuando lo necesite.
- **Tu calendario:** síntomas, eventos y recordatorios con poca carga mental.
- **Pausas de calma:** respiraciones, sonidos y momentos a su ritmo.

El CTA actual es **“Activar 7 días para ti”**. Debajo se conserva el aviso de bienestar general: el contenido no reemplaza la orientación profesional.

## Estado comercial actual

- La prueba de 7 días es la propuesta de producto prevista.
- La futura oferta contempla un pago único de lanzamiento de USD 15 o USD 5/mes.
- PayPal será el proveedor inicial cuando se implemente el cobro.
- Antes de cobrar o publicitar el producto se requieren la integración de PayPal, una fuente de verdad de acceso/pagos, términos, privacidad, cancelación y pruebas de los recorridos de autenticación.

## Criterios de interfaz

- Mobile-first, con lectura cómoda en una pantalla común de 390 × 844 px.
- Fondo crema cálido, magenta para acciones y textos secundarios con contraste suficiente.
- Bloques de valor centrados, iconografía funcional y sin tarjetas innecesarias.
- Lenguaje neutral, cálido y sin presión: “cuando puedas”, “a tu ritmo”, sin promesas de curación ni cambios físicos garantizados.
