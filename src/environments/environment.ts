export const environment = {
  production: false,
  // Único backend que Angular conoce: el Gateway. Nunca API Colombia directamente
  // (sección 34/103 de la especificación maestra).
  gatewayUrl: 'http://localhost:8080'
};
