# Fetch Instagram Premades

## Descripcion
Descarga posts de Instagram que contengan el hashtag #premade, guarda las imagenes en la carpeta del proyecto web, y genera el archivo de datos `premades.js` con numeracion secuencial.

## Cuando usar este script
- "Actualiza los premades desde Instagram"
- "Sincroniza la galeria con mis posts de Instagram"
- "Descarga los nuevos premades"

## Prerequisitos
- Variables de entorno requeridas en `.env` (raiz del proyecto):
  - `INSTAGRAM_ACCESS_TOKEN` — Token de acceso de Instagram Graph API
  - `INSTAGRAM_USER_ID` — ID numerico de tu cuenta de Instagram
- Dependencias: `pip install -r requirements.txt`
- Cuenta de Instagram Business/Creator conectada a Facebook App

## Como ejecutar

### Ejecucion basica
```bash
python main.py
```

### Todos los parametros
| Parametro | Tipo | Requerido | Default | Descripcion |
|---|---|---|---|---|
| `--hashtag` | str | No | `#premade` | Hashtag para filtrar posts |
| `--limit` | int | No | `100` | Maximo de posts a obtener |
| `--price` | int | No | `200` | Precio por premade en USD |
| `--verbose` | flag | No | False | Activa logs detallados |

## Output esperado
- Imagenes descargadas en `mat-renders-landing/public/premades/001.jpg`, `002.jpg`, etc.
- Archivo de datos generado en `mat-renders-landing/src/data/premades.js`

## Errores comunes y soluciones
| Error | Causa | Solucion |
|---|---|---|
| `INSTAGRAM_ACCESS_TOKEN not found` | Falta variable de entorno | Anadir token al `.env` |
| `400 Bad Request` | Token expirado | Renovar token en Facebook Developer |
| `No premades found` | Ningun post tiene el hashtag | Verificar que los posts tengan #premade en el caption |

## Notas
- El token de Instagram Graph API expira cada 60 dias. Usa un Long-Lived Token.
- Las imagenes ya descargadas no se vuelven a descargar (skip automatico).
- El script sobrescribe `premades.js` cada vez que se ejecuta.
