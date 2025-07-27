
/**
 * Actualiza el mensaje de estado en la interfaz de usuario.
 * @param {string} message - El mensaje a mostrar.
 * @param {string} type - El tipo de mensaje ('info', 'success', 'warning', 'error').
 */
export function updateStatus(message, type = 'info') {
    const statusDiv = document.getElementById('status-message');
    if (statusDiv) {
        // Limpiar clases anteriores
        statusDiv.className = 'p-3 rounded-md text-center font-semibold mb-4'; // Clases base de Tailwind

        // Aplicar clases de color según el tipo de mensaje
        switch (type) {
            case 'success':
                statusDiv.classList.add('bg-green-100', 'text-green-800');
                break;
            case 'error':
                statusDiv.classList.add('bg-red-100', 'text-red-800');
                break;
            case 'warning':
                statusDiv.classList.add('bg-yellow-100', 'text-yellow-800');
                break;
            case 'info':
            default:
                statusDiv.classList.add('bg-blue-100', 'text-blue-800');
                break;
        }
        statusDiv.textContent = message;
        statusDiv.style.display = 'block'; // Asegurarse de que el mensaje sea visible

        // Opcional: Ocultar el mensaje después de un tiempo
        setTimeout(() => {
            statusDiv.style.display = 'none';
            statusDiv.textContent = '';
        }, 5000); // El mensaje se oculta después de 5 segundos
    } else {
        console.warn("Elemento 'statusMessage' no encontrado en el DOM. No se puede mostrar el estado.");
    }
}
