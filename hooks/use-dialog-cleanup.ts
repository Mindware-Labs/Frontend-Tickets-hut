"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Hook para limpiar overlays de Dialog/Modal cuando se cambia de ruta
 * Soluciona el problema del blur/overlay oscuro persistente
 */
export function useDialogCleanup() {
  const pathname = usePathname();

  useEffect(() => {
    // Remover todos los overlays de Radix UI que puedan quedar huérfanos
    const removeOrphanedOverlays = () => {
      try {
        // 1. Remover overlays específicos de Radix UI por atributo data-*
        const selectors = [
          "[data-radix-dialog-overlay]",
          "[data-radix-alert-dialog-overlay]",
          "[data-radix-sheet-overlay]",
        ];

        selectors.forEach((selector) => {
          const elements = document.querySelectorAll(selector);
          elements.forEach((el) => {
            try {
              if (el.parentNode) {
                el.parentNode.removeChild(el);
              }
            } catch (e) {
              // Ignorar errores si el elemento ya fue removido
            }
          });
        });

        // 2. Restaurar completamente el estado del body
        document.body.style.pointerEvents = "";
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
        document.body.style.position = "";

        // 3. Remover atributos de Radix en el body y html
        document.body.removeAttribute("data-scroll-locked");
        document.documentElement.removeAttribute("data-scroll-locked");

        // 4. Forzar la remoción de cualquier estilo inline que bloquee el scroll
        document.body.classList.remove("overflow-hidden");
        document.documentElement.classList.remove("overflow-hidden");
      } catch (error) {
        // Ignorar errores del DOM
        console.debug("Error limpiando overlays:", error);
      }
    };

    // Ejecutar limpieza inmediatamente al cambiar de ruta
    removeOrphanedOverlays();

    // Limpieza adicional con un delay para asegurar
    const timeoutId = setTimeout(removeOrphanedOverlays, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [pathname]);
}
