export const environment = {
  production: true,
  // Para el demo local con Docker Compose, el navegador llega al Gateway
  // directamente en localhost:8080 (mismo host, puerto expuesto).
  // Para un despliegue real en AWS (sección 55/60), esta URL no puede quedar
  // hardcodeada en el bundle: la práctica recomendada es inyectarla en tiempo
  // de arranque del contenedor (ej. un env.js generado por un entrypoint script
  // que sobrescriba window['GATEWAY_URL'] antes de cargar el bundle de Angular).
  gatewayUrl: 'http://localhost:8080'
};
