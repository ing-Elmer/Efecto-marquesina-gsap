// Importación de librerías necesarias para las animaciones
import gsap from "gsap"; // Librería principal de animaciones GSAP
import { ScrollTrigger } from "gsap/ScrollTrigger"; // Plugin para activar animaciones basadas en scroll
import { Flip } from "gsap/Flip"; // Plugin para animaciones de transición entre estados
import Lenis from "lenis"; // Librería para smooth scrolling

// Esperar a que el DOM esté completamente cargado antes de ejecutar el código
document.addEventListener("DOMContentLoaded", () => {
    // Registrar los plugins de GSAP que se van a utilizar
    gsap.registerPlugin(ScrollTrigger, Flip);

    // Inicializar Lenis para scroll suave
    const lenis = new Lenis();
    
    // Conectar el scroll de Lenis con ScrollTrigger para sincronizar animaciones
    lenis.on("scroll", ScrollTrigger.update);
    
    // Añadir Lenis al ticker de GSAP para animaciones fluidas
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000); // Ejecutar el requestAnimationFrame de Lenis
    });
    
    // Desactivar el suavizado de lag para mejor rendimiento
    gsap.ticker.lagSmoothing(0);

    // Obtener colores CSS personalizados desde las variables CSS del documento
    const lightColor = getComputedStyle(document.documentElement).getPropertyValue('--light-color').trim();
    const darkColor = getComputedStyle(document.documentElement).getPropertyValue('--dark-color').trim();

    // Función helper para interpolar entre dos colores
    function interpolateColor(color1, color2, factor) {
        return gsap.utils.interpolate(color1, color2, factor);
    }

    // ANIMACIÓN DEL MARQUEE
    // Crear animación que mueve las imágenes del marquee basada en el scroll
    gsap.to(".marquee-images", {
        scrollTrigger: {
            trigger: ".marquee", // Elemento que activa la animación
            start: "top bottom", // Inicia cuando el top del trigger está en el bottom del viewport
            end: "top top", // Termina cuando el top del trigger está en el top del viewport
            scrub: true, // La animación sigue el progreso del scroll
            onUpdate: (self) => {
                const progress = self.progress; // Progreso del scroll (0 a 1)
                const xPosition = -75 + progress * 25; // Calcular posición X (-75% a -50%)
                gsap.set(".marquee-images", { x: `${xPosition}%` }); // Aplicar transformación
            }
        }
    });

    // Variables para controlar el clon de la imagen del marquee
    let pinnnedMarqueeImgClone = null; // Referencia al elemento clonado
    let isImgCloneActive = false; // Estado del clon

    // Función para crear un clon fijado de la imagen del marquee
    function createPinnedMarqueeImgClone() {
        if (isImgCloneActive) return; // Si ya existe un clon activo, no hacer nada

        // Obtener la imagen original del marquee que tiene la clase "pin"
        const originalMarqueeImg = document.querySelector(".marquee-img.pin img");
        
        // Obtener las dimensiones y posición de la imagen original
        const rect = originalMarqueeImg.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2; // Centro X de la imagen
        const centerY = rect.top + rect.height / 2; // Centro Y de la imagen

        // Crear un clon de la imagen original
        pinnnedMarqueeImgClone = originalMarqueeImg.cloneNode(true);

        // Configurar el estilo del clon para que sea una copia exacta fijada en pantalla
        gsap.set(pinnnedMarqueeImgClone, {
            position: "fixed", // Posición fija respecto al viewport
            left: centerX - originalMarqueeImg.offsetWidth / 2 + "px", // Centrar horizontalmente
            top: centerY - originalMarqueeImg.offsetHeight / 2 + "px", // Centrar verticalmente
            width: originalMarqueeImg.offsetWidth + "px", // Mismo ancho
            height: originalMarqueeImg.offsetHeight + "px", // Misma altura
            transform: "rotate(-5deg)", // Rotación inicial
            transformOrigin: "center center", // Punto de origen para transformaciones
            pointerEvents: "none", // No interceptar eventos del mouse
            willChange: "transform", // Optimización para animaciones
            zIndex: 100, // Asegurar que esté por encima de otros elementos
        });

        // Añadir el clon al body del documento
        document.body.appendChild(pinnnedMarqueeImgClone);
        
        // Ocultar la imagen original
        gsap.set(originalMarqueeImg, { opacity: 0 });
        
        // Marcar el clon como activo
        isImgCloneActive = true;
    }

    // Función para remover el clon fijado de la imagen del marquee
    function removePinnedMarqueeImgClone() {
        if (!isImgCloneActive) return; // Si no hay clon activo, no hacer nada
        
        // Eliminar el clon del DOM si existe
        if (pinnnedMarqueeImgClone) {
            pinnnedMarqueeImgClone.remove();
            pinnnedMarqueeImgClone = null;
        }
        
        // Restaurar la visibilidad de la imagen original
        const originalMarqueeImg = document.querySelector(".marquee-img.pin img");
        gsap.set(originalMarqueeImg, { opacity: 1 });
        
        // Marcar el clon como inactivo
        isImgCloneActive = false;
    }

    // SCROLL TRIGGER PARA SECCIÓN HORIZONTAL
    // Crear un scroll trigger que fija la sección de scroll horizontal
    ScrollTrigger.create({
        trigger: ".horizontal-scroll", // Elemento a observar
        start: "top top", // Inicia cuando el top del trigger está en el top del viewport
        end: () => `+=${window.innerWidth * 5}`, // Duración basada en el ancho de pantalla × 5
        pin: true, // Fijar el elemento durante el scroll
    });

    // SCROLL TRIGGER PARA CONTROLAR EL CLON DEL MARQUEE
    ScrollTrigger.create({
        trigger: ".marquee", // Elemento que activa los callbacks
        start: "top top", // Punto de inicio
        onEnter: () => createPinnedMarqueeImgClone(), // Crear clon al entrar
        onEnterBack: () => createPinnedMarqueeImgClone(), // Crear clon al volver hacia arriba
        onLeaveBack: () => removePinnedMarqueeImgClone(), // Remover clon al salir hacia arriba
    });

    // Variable para controlar la animación Flip
    let flipAnimation = null;

    // SCROLL TRIGGER PRINCIPAL PARA ANIMACIONES COMPLEJAS
    ScrollTrigger.create({
        trigger: ".horizontal-scroll", // Elemento trigger
        start: "top 50%", // Inicia cuando el top está al 50% del viewport
        end: ()=> `+=${window.innerWidth * 5.5}`, // Duración extendida
        onEnter: () => {
            // Solo ejecutar si hay un clon activo y no hay animación Flip en curso
            if( pinnnedMarqueeImgClone && isImgCloneActive && !flipAnimation) {
                // Capturar el estado actual del elemento para la animación Flip
                const state = Flip.getState(pinnnedMarqueeImgClone);

                // Configurar el estado final del elemento (pantalla completa)
                gsap.set(pinnnedMarqueeImgClone, {
                    position: "fixed",
                    left: "0px", // Pegado al borde izquierdo
                    top: "0px", // Pegado al borde superior
                    width: "100%", // Ancho completo
                    height: "100svh", // Altura completa del viewport
                    transform: "rotate(0deg)", // Sin rotación
                    transformOrigin: "center center",
                });

                // Crear la animación Flip del estado anterior al nuevo
                flipAnimation = Flip.from(state, {
                    duration: 1, // Duración de 1 segundo
                    ease: "none", // Sin easing
                    paused: true, // Iniciar pausada para control manual
                });
            }
        },
        onLeaveBack: () => {
            // Limpiar al salir hacia atrás
            if(flipAnimation){
                flipAnimation.kill(); // Destruir la animación
                flipAnimation = null;
            }
            
            // Resetear el color de fondo al color claro
            gsap.set(".container", { backgroundColor: lightColor });

            // Resetear la posición del wrapper horizontal
            gsap.set(".horizontal-scroll-wrapper", {
                x: "0%",
            });
        },
    });

    // SCROLL TRIGGER PARA CONTROLAR EL PROGRESO DE LAS ANIMACIONES
    ScrollTrigger.create({
        trigger: ".horizontal-scroll",
        start: "top 50%",
        end: ()=> `+=${window.innerHeight * 5.5}`, // Basado en altura de ventana
        onUpdate: (self) => {
            const progress = self.progress; // Progreso del scroll (0 a 1)

            // FASE 1: Transición de color de fondo (0% - 5%)
            if(progress <= 0.05) {
                const bgColorProgress = Math.min(progress / 0.05, 1); // Normalizar a 0-1
                const newBgColor = interpolateColor(lightColor, darkColor, bgColorProgress);
                gsap.set(".container", { backgroundColor: newBgColor });
            } else if (progress > 0.05) {
                // Mantener color oscuro después del 5%
                gsap.set(".container", { backgroundColor: darkColor });
            }

            // FASE 2: Animación Flip (0% - 20%)
            if(progress <= 0.2){
                const scaleProgress = progress / 0.2; // Normalizar progreso para esta fase
                if(flipAnimation) {
                    flipAnimation.progress(scaleProgress); // Controlar progreso de la animación Flip
                }
            }

            // FASE 3: Scroll horizontal (20% - 95%)
            if(progress > 0.2 && progress <= 0.95){
                // Asegurar que la animación Flip esté completa
                if(flipAnimation) {
                    flipAnimation.progress(1);
                }

                // Calcular progreso para el movimiento horizontal
                const horizontalProgress = (progress - 0.2) / 0.75; // Normalizar 20%-95% a 0-1

                // Mover el wrapper horizontal (simular scroll horizontal)
                const wrapperTranslateX = -66.67 * horizontalProgress; // -66.67% es el máximo
                gsap.set(".horizontal-scroll-wrapper", {
                    x: `${wrapperTranslateX}%`,
                });

                // Mover la imagen clonada en sentido contrario para efecto parallax
                const slideMovement = (66.67 / 100) * 3 * horizontalProgress;
                const imageTranslateX = -slideMovement * 100;
                gsap.set(pinnnedMarqueeImgClone, {
                    x: `${imageTranslateX}%`,
                });
            }
        }
    });

    // ANIMACIÓN DE TEXTO CON CLIP-PATH
    // Iterar sobre todos los elementos con clase 'animate-text'
    document.querySelectorAll('.animate-text').forEach((textElement) => {
        // Guardar el texto original como atributo de data
        textElement.setAttribute('data-text', textElement.innerText);

        // Crear ScrollTrigger para cada elemento de texto
        ScrollTrigger.create({
            trigger: textElement, // El mismo elemento es el trigger
            start: 'top 50%', // Inicia cuando el top está al 50% del viewport
            end: 'bottom 50%', // Termina cuando el bottom está al 50% del viewport
            scrub: 1, // Animación suave vinculada al scroll
            onUpdate: (self) => {
                // Calcular valor de clip basado en el progreso (100% a 0%)
                const clipValue = Math.max(0, 100 - self.progress * 100);
                // Aplicar el clip-path usando una variable CSS personalizada
                textElement.style.setProperty('--clip-value', `${clipValue}%`);
            }
        });
    });

    // ANIMACIÓN DE HEADERS DE SERVICIOS - ENTRADA
    ScrollTrigger.create({
        trigger: '.services', // Sección de servicios
        start: 'top bottom', // Inicia cuando el top está en el bottom del viewport
        end: 'top top', // Termina cuando el top está en el top del viewport
        scrub: 1, // Animación suave
        onUpdate: (self) => {
            // Obtener todos los headers de servicios
            const headers = document.querySelectorAll('.services-header');
            // Animar entrada desde los lados
            gsap.set(headers[0], {x: `${100 - self.progress * 100}%`}); // Desde la derecha
            gsap.set(headers[1], {x: `${-100 + self.progress * 100}%`}); // Desde la izquierda
            gsap.set(headers[2], {x: `${100 - self.progress * 100}%`}); // Desde la derecha
        }
    });

    // ANIMACIÓN DE HEADERS DE SERVICIOS - SECCIÓN FIJADA
    ScrollTrigger.create({
        trigger: '.services', // Sección de servicios
        start: 'top top', // Inicia cuando el top está en el top del viewport
        end: `+=${window.innerHeight * 2}`, // Duración de 2 alturas de ventana
        pin: true, // Fijar la sección durante el scroll
        scrub: 1, // Animación suave
        pinSpacing: false, // No añadir espacio extra
        onUpdate: (self) => {
            const headers = document.querySelectorAll('.services-header');

            // PRIMERA FASE (0% - 50%): Movimiento vertical
            if(self.progress <= 0.5) {
                const yProgress = self.progress / 0.5; // Normalizar 0-50% a 0-1
                gsap.set(headers[0], {y: `${yProgress * 100}%`}); // Mover hacia abajo
                gsap.set(headers[2], {y: `${yProgress * -100}%`}); // Mover hacia arriba
            } else {
                // Mantener posiciones finales
                gsap.set(headers[0], {y: `100%`});
                gsap.set(headers[2], {y: `-100%`});

                // SEGUNDA FASE (50% - 100%): Escalado
                const scaleProgress = (self.progress - 0.5) / 0.5; // Normalizar 50-100% a 0-1
                
                // Escala mínima dependiente del tamaño de pantalla
                const minScale = window.innerHeight <= 1000 ? 0.4 : 0.1;
                const scale = 1 - scaleProgress * (1 - minScale); // De 1 a minScale

                // Aplicar escala a todos los headers
                headers.forEach((header) => {
                    gsap.set(header, {scale});
                });
            }
        }
    });
});