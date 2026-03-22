# Fetch Instagram Premades

## Descripcion
Descarga posts de Instagram con hashtag #premade, guarda las imagenes en venganza-portfolio/public/premades/ y genera el archivo de datos premades.js con numeracion secuencial.

## Cuando usar este script
- "Actualiza los premades desde Instagram"
- "Sincroniza la galeria con mis posts de Instagram"
- "Descarga los nuevos premades"

## Prerequisitos
- Variables de entorno en `.env` (raiz del proyecto):
  - `INSTAGRAM_ACCESS_TOKEN`
  - `INSTAGRAM_USER_ID`
- Dependencias: `pip install -r requirements.txt`
- Cuenta de Instagram Business/Creator conectada a Facebook App

## Como ejecutar

```bash
python main.py
```

### Parametros
| Parametro | Tipo | Requerido | Default | Descripcion |
|---|---|---|---|---|
| `--hashtag` | str | No | `#premade` | Hashtag para filtrar |
| `--limit` | int | No | `100` | Max posts a obtener |
| `--price` | int | No | `200` | Precio por premade USD |
| `--verbose` | flag | No | False | Logs detallados |

## Output
- Imagenes: `venganza-portfolio/public/premades/001.jpg`, `002.jpg`, etc.
- Datos: `venganza-portfolio/src/data/premades.js`

## Errores comunes
| Error | Causa | Solucion |
|---|---|---|
| `INSTAGRAM_ACCESS_TOKEN not found` | Falta variable | Anadir al `.env` |
| `400 Bad Request` | Token expirado | Renovar en Facebook Developer |
| `No premades found` | Sin posts con hashtag | Verificar #premade en captions |
