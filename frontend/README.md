# Frontend

Aplicación Next.js 15 App Router con React 19, TypeScript y Tailwind. El flujo principal autenticado es `/courses`; la jerarquía es `Curso → Módulo → Sección`.

El acceso a API debe pasar por `/api/proxy/[...path]`. `video_repo_token` es una cookie `httpOnly`: no debe exponerse ni leerse desde componentes de cliente.

## Comandos

Ejecutar desde la raíz:

```powershell
npm run dev --workspace frontend
npm run verify --workspace frontend
npm run build --workspace frontend
```

El servidor de desarrollo escucha en `http://localhost:3001`. Configura la URL del backend según los helpers existentes; en local normalmente es `http://localhost:3000`.

Consulta [arquitectura actual](../context/architecture/current-system.md), [API](../docs/api.md) y las reglas de [AGENTS.md](AGENTS.md) antes de cambiar rutas, sesión o contratos.
