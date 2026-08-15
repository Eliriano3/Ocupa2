# Plan de commits — rama `bloque2-publicar`

Guía para separar en commits limpios el trabajo que hoy está mezclado en el
working tree. **Este archivo es de usar y tirar: bórralo antes de commitear, o
déjalo fuera del commit.**

Estado del que partimos: 31 archivos modificados o nuevos, con tres cosas
distintas revueltas — la resolución del conflicto del stash, el ícono de la app
y el módulo del Bloque 2.

---

## Antes de empezar

Hoy el índice tiene cosas a medio agregar (`git add` parcial de una sesión
anterior). Límpialo sin perder nada del disco:

```bash
git reset
```

Eso desmarca todo del índice y **no toca ningún archivo**.

Comprueba que quedan estos cuatro sin rastrear, porque son código nuevo del
Bloque 2 y sin ellos el proyecto no compila:

```
src/features/bloque2-publicar/components/SavedCardList.tsx
src/features/bloque2-publicar/components/WizardLayout.tsx
src/features/bloque2-publicar/hooks/
src/features/bloque2-publicar/services/
```

---

## Orden

El orden importa: cada commit debe dejar el repositorio en un estado que
compile.

| # | Tipo | Qué toca | Obligatorio |
| --- | --- | --- | --- |
| 1 | `chore` | `package.json`, `package-lock.json`, `app.json` | Sí — sin esto npm ni siquiera lee el proyecto |
| 2 | `fix` | `assets/` | Solo si decides recuperar el ícono ahora |
| 3 | `feat` | `src/features/bloque2-publicar/`, `README.md` | Sí — es el entregable |

El 1 va primero porque hasta que `package.json` sea JSON válido no corre nada:
ni `npm run typecheck`, ni `npm start`, ni `npm run apk`.

---

## Commit 1 · Dependencias y conflicto del stash

```bash
git add package.json package-lock.json app.json
```

```
chore: resuelve el conflicto del stash y repone dependencias

El stash pop sobre esta rama dejó marcadores de conflicto en package.json,
package-lock.json y app.json, y con package.json roto npm no podía leer el
proyecto.

- package.json: conserva las versiones nuevas (expo 57.0.13, expo-image-picker
  y expo-location 57.0.10) y devuelve react-native-maps y
  react-native-web-webview, que faltaban en los dos lados del conflicto pese a
  que el mapa del Bloque 4 y los videos del Bloque 5 los usan.
- react-native pasa de 0.86.0 a 0.86.2, la versión que exige el SDK 57.
- app.json: recupera los permisos con nombre completo, RECORD_AUDIO y el bloque
  config.googleMaps que react-native-maps necesita en Android.
- package-lock.json: regenerado con npm install en vez de resolver a mano sus
  veinte conflictos.
```

---

## Commit 2 · Ícono de la app (opcional)

Solo si vas a recuperarlo ahora. El ícono bueno —el collage del equipo con la
marca Ocupa2— está commiteado en `main`; esta rama es anterior a él y arrastra
todavía el chevron de plantilla de Expo.

```bash
git checkout 3171737 -- assets/
git add assets/
```

```
fix: recupera el ícono de la app desde main

Esta rama es anterior al commit que trajo el ícono del equipo, así que el
working tree tenía todavía el chevron de plantilla de Expo y el APK se
instalaba sin identidad.

Restaura assets/icon.png y assets/android-icon-foreground.png desde main
(3171737). No es un cambio de código: los assets nunca se modificaron
localmente, solo faltaban en esta rama.
```

> Si prefieres poner la rama al día con `main` en lugar de traer archivos
> sueltos, sáltate este commit: el merge trae el ícono y de paso los merges
> #4 y #7 que a esta rama le faltan.

---

## Commit 3 · El Bloque 2

```bash
git add src/features/bloque2-publicar README.md
```

```
feat(bloque2): flujo de publicar oferta, pago US$1 y mis ofertas

Implementa el Bloque 2 completo. Ya no queda ninguna pantalla como
PlaceholderScreen.

Asistente de publicación en cuatro pasos, con barra de progreso y pie fijo:

- Paso 1 · detalles: tipo de trabajo (GET /job-types), tipo de contrato,
  descripción, pago al trabajador y los campos personalizados del tipo
  elegido, que se envían en customAnswers.
- Paso 2 · ubicación: mapa arrastrable, GPS y dirección prellenada por
  geocodificación inversa. Si se niega el permiso de ubicación, la dirección
  escrita a mano permite terminar el flujo.
- Paso 3 · foto y plazo: foto obligatoria vía POST /uploads y fecha límite con
  atajos y tope de 30 días. Sin foto el botón queda bloqueado y el error se
  anuncia con TalkBack.
- Paso 4 · preguntas: constructor de questions (text, date, select, check) con
  marca de requerida, editor de opciones y reordenado accesible.

Pago y creación de la oferta:

- POST /payments y POST /offers en una sola acción, porque el API exige un
  paymentId aprobado para poder publicar.
- Si el cobro sale bien y POST /offers falla, el paymentId queda guardado y el
  reintento lo reusa: nunca se cobra dos veces.
- Número de tarjeta con tope de 16 dígitos y validación por algoritmo de Luhn.
  Las dos tarjetas de prueba del proyecto la pasan.
- Tarjetas recordadas en el almacenamiento cifrado del teléfono, opcionales y
  borrables. El CVV nunca se guarda: se pide en cada cobro.

Se suman la confirmación de oferta publicada, Mis ofertas con desactivar y Mis
pagos, con esqueletos de carga, estado vacío y mensajes claros para 402, 409
y 422.

Arregla que el teclado de Android tapara el campo enfocado: Screen.tsx solo
aplica behavior en iOS, y el modo edge-to-edge de RN 0.86 dejó sin efecto el
adjustResize del que dependía Android. Se resuelve dentro del bloque con
useKeyboardInset y WizardLayout, sin tocar el componente compartido.

Todo el código nuevo vive en src/features/bloque2-publicar/. No se modificó
src/api, src/components, src/services, src/navigation, src/theme, src/hooks ni
src/utils.

Verificado: tsc --noEmit limpio, bundle de Android (1090 módulos) y de web
(822 módulos), y las validaciones de tarjeta probadas ejecutando el código
real.
```

---

## Cómo escribir mensajes de varias líneas

`git commit -m "..."` sirve para una línea. Para estos, guarda el texto en un
archivo y pásalo:

```bash
git commit -F mensaje.txt
```

O escribe `git commit` a secas y pega el texto en el editor que abre.

En Git Bash también funciona el heredoc:

```bash
git commit -F- <<'EOF'
...el mensaje...
EOF
```

En PowerShell el heredoc `<<'EOF'` **no** existe: usa el archivo o el editor.

---

## Verificación antes de subir

```bash
npm run typecheck
npx expo export -p android --output-dir ../tmp-verify
```

Los dos tienen que terminar sin errores. Borra `../tmp-verify` después.

---

## Subir

```bash
git push origin bloque2-publicar
```

**Antes del PR:** esta rama está detrás de `main` — le faltan como commits los
merges #4 (Bloque 4) y #7 (Bloque 5). Ponla al día para que el PR muestre solo
tu trabajo y no arrastre diferencias ajenas:

```bash
git fetch origin
git merge origin/main
```

Si el merge vuelve a chocar en `package.json`, la resolución buena es la misma
del commit 1: versiones nuevas de expo, con `react-native-maps` y
`react-native-web-webview` presentes.

---

## Por qué no más commits

Los componentes, las pantallas y el estado del Bloque 2 se escribieron juntos y
dependen entre sí: partirlos en «primero los componentes, después las
pantallas» daría commits intermedios que no compilan. Un commit por unidad de
trabajo coherente vale más que muchos commits rotos.
