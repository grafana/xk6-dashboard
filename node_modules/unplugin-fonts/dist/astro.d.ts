import { AstroIntegration } from 'astro';
import { Options } from './types.js';

declare function export_default(options: Options): AstroIntegration;

export { export_default as default };
