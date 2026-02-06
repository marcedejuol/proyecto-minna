# Guia de Despliegue Privado - MINNA-FEEI

Esta guia explica como publicar el sitio en Vercel de forma que **solo tu tengas acceso**.

---

## Opcion 1: Vercel Authentication (Recomendada - Plan Pro)

Vercel ofrece proteccion nativa para que solo usuarios autorizados puedan acceder al sitio.

### Pasos:

1. **Publica el proyecto desde v0:**
   - Haz clic en el boton **"Publish"** en la esquina superior derecha de v0.
   - Esto creara un deployment en Vercel automaticamente.

2. **Ve al dashboard de Vercel:**
   - Ingresa a [vercel.com/dashboard](https://vercel.com/dashboard).
   - Selecciona tu proyecto.

3. **Configura la proteccion de acceso:**
   - Ve a **Settings > Deployment Protection**.
   - Activa **"Vercel Authentication"**.
   - Esto hara que cualquier persona que intente acceder al sitio deba iniciar sesion con una cuenta de Vercel autorizada.

4. **Limita el acceso solo a tu cuenta:**
   - En la misma seccion, asegurate de que **"Only Team Members"** este seleccionado.
   - Si trabajas solo, tu eres el unico miembro del equipo, por lo que solo tu podras acceder.

5. **Resultado:**
   - Cualquier persona que visite la URL vera una pagina de login de Vercel.
   - Solo tu cuenta podra acceder al contenido.

---

## Opcion 2: Proteccion con Contrasena (Vercel Pro)

Si prefieres proteger con contrasena en vez de autenticacion de Vercel:

1. Ve a **Settings > Deployment Protection** en tu proyecto de Vercel.
2. Activa **"Password Protection"**.
3. Establece una contrasena segura.
4. Cualquier visitante necesitara ingresar la contrasena para ver el sitio.

---

## Opcion 3: Middleware con HTTP Basic Auth (Gratis - Todos los planes)

Si no tienes el plan Pro de Vercel, puedes implementar autenticacion basica directamente en el codigo.

### Pasos:

1. **Agrega variables de entorno en Vercel:**
   - Ve a **Settings > Environment Variables** en tu proyecto.
   - Agrega estas variables:
     ```
     AUTH_USER=tu_usuario
     AUTH_PASSWORD=tu_contrasena_segura
     ```

2. **Crea el archivo `middleware.ts`** en la raiz del proyecto con este contenido:

```typescript
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const authHeader = request.headers.get("authorization")

  if (authHeader) {
    const [scheme, encoded] = authHeader.split(" ")

    if (scheme === "Basic" && encoded) {
      const decoded = atob(encoded)
      const [user, password] = decoded.split(":")

      if (
        user === process.env.AUTH_USER &&
        password === process.env.AUTH_PASSWORD
      ) {
        return NextResponse.next()
      }
    }
  }

  return new NextResponse("Acceso no autorizado", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Secure Area"',
    },
  })
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
```

3. **Despliega el proyecto:**
   - Publica desde v0 o haz push a tu repositorio conectado.
   - El middleware protegera TODAS las rutas del sitio.

4. **Resultado:**
   - Al visitar el sitio, el navegador mostrara un dialogo pidiendo usuario y contrasena.
   - Solo quien conozca las credenciales podra acceder.

---

## Opcion 4: Vercel Firewall (Plan Enterprise)

Para equipos con plan Enterprise, Vercel Firewall permite:
- Restriccion por IP (solo permite tu IP publica).
- Reglas geograficas.
- Bloqueo total excepto IPs especificas.

Configurable desde **Settings > Firewall** en el dashboard de Vercel.

---

## Resumen de opciones

| Opcion | Plan requerido | Facilidad | Seguridad |
|--------|---------------|-----------|-----------|
| Vercel Authentication | Pro | Muy facil | Alta |
| Password Protection | Pro | Muy facil | Media-Alta |
| Middleware Basic Auth | Hobby (gratis) | Facil | Media |
| Vercel Firewall | Enterprise | Media | Muy Alta |

---

## Recomendacion

- **Si tienes plan Pro:** Usa la **Opcion 1 (Vercel Authentication)**. Es la mas segura y facil de configurar.
- **Si tienes plan gratuito:** Usa la **Opcion 3 (Middleware Basic Auth)**. Funciona en todos los planes y protege el sitio completamente.

---

## Notas importantes

- La base de datos Neon ya esta protegida: solo tu proyecto de Vercel tiene la `DATABASE_URL` para conectarse.
- Nunca compartas las variables de entorno (`.env`) con nadie.
- Si usas la Opcion 3, cambia la contrasena periodicamente.
- Puedes combinar opciones (ej: Vercel Auth + Firewall) para mayor seguridad.
