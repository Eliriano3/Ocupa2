/**
 * Catálogo — `GET /job-types`.
 * Lo usa el Bloque 2 (publicar oferta), el Bloque 4 (filtros) y el Bloque 5
 * (experiencias).
 */

import { api } from './client';
import type { JobType } from './types';

/** Tipos de trabajo disponibles, con sus campos personalizados. */
export function getJobTypes() {
  return api.get<JobType[]>('/job-types');
}
