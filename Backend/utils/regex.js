'use strict'


/**
 * Escapa los caracteres especiales en una cadena para usarla en una expresión regular.
 * @param {string} string - La cadena a escapar.
 * @returns {string} Cadena escapada segura para regex.
 */
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Convierte una cadena en un "slug" URL-friendly.
 * @param {string} text - Texto a convertir.
 * @returns {string} Slug generado.
 */
function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, '') // quitar tildes
        .replace(/\s+/g, '-') // reemplazar espacios por guiones
        .replace(/[^\w\-]+/g, '') // eliminar caracteres no válidos
        .replace(/\-\-+/g, '-')   // eliminar guiones dobles
        .replace(/^-+/, '')       // quitar guiones al inicio
        .replace(/-+$/, '');      // quitar guiones al final
}

/**
 * Valida si una cadena tiene el formato de correo electrónico válido.
 * @param {string} email - Correo electrónico a validar.
 * @returns {boolean} `true` si es válido, `false` si no.
 */
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

module.exports = {
    escapeRegex,
    slugify,
    isValidEmail
};