export const environment = {
  production: false,
  // Único backend que Angular conoce: el Gateway. Nunca API Colombia directamente
  // (sección 34/103 de la especificación maestra).
  // Relativa: ng serve reenvia /api, /auth, /oauth2... al Gateway y /realms a Keycloak (proxy.conf.json),
  // asi la cookie de sesion del Gateway es del mismo origen que la app.
  gatewayUrl: ''
};
