export const environment = {
  production: true,
  // Rutas relativas (/api/...): el nginx del frontend hace de proxy hacia el Gateway (mismo origen).
  // Asi el mismo bundle sirve en Docker Compose y en AWS sin URLs fijas (seccion 60).
  gatewayUrl: ''
};
