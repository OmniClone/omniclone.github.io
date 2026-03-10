document.addEventListener('DOMContentLoaded', () => {

    // --- BibTeX Copy Functionality ---
    const copyBtn = document.getElementById('copy-btn');
    const copySuccess = document.getElementById('copy-success');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const codeBlock = copyBtn.nextElementSibling.nextElementSibling.textContent;
            navigator.clipboard.writeText(codeBlock).then(() => {
                copySuccess.style.opacity = '1';
                // change icon momentarily
                const icon = copyBtn.querySelector('i');
                const oldIcon = icon.getAttribute('data-lucide');
                icon.setAttribute('data-lucide', 'check');
                lucide.createIcons();

                setTimeout(() => {
                    copySuccess.style.opacity = '0';
                    icon.setAttribute('data-lucide', oldIcon);
                    lucide.createIcons();
                }, 2000);
            });
        });
    }

    // --- Custom Video Controls Logic ---
    const videoWrappers = document.querySelectorAll('.custom-video-wrapper');

    videoWrappers.forEach(wrapper => {
        const video = wrapper.querySelector('video');
        if (!video) return;

        const playBtn = wrapper.querySelector('.play-btn');
        const centerPlayBtn = wrapper.querySelector('.center-play');
        const muteBtn = wrapper.querySelector('.mute-btn');
        const speedBtn = wrapper.querySelector('.speed-btn');
        const timeline = wrapper.querySelector('.timeline');
        const progress = wrapper.querySelector('.progress');

        // Play/Pause
        const togglePlay = () => {
            if (video.paused) {
                video.play();
            } else {
                video.pause();
            }
        };

        const updatePlayIcon = () => {
            const iconName = video.paused ? 'play' : 'pause';
            if (playBtn) playBtn.innerHTML = `<i data-lucide="${iconName}" class="w-4 h-4 sm:w-5 sm:h-5 fill-current"></i>`;
            if (centerPlayBtn) {
                if (video.paused) {
                    centerPlayBtn.style.opacity = '1';
                    centerPlayBtn.style.pointerEvents = 'auto';
                    centerPlayBtn.innerHTML = `<i data-lucide="play" class="w-6 h-6 sm:w-8 sm:h-8 fill-current"></i>`;
                } else {
                    centerPlayBtn.style.opacity = '0';
                    centerPlayBtn.style.pointerEvents = 'none';
                    setTimeout(() => {
                        if (!video.paused) centerPlayBtn.innerHTML = `<i data-lucide="pause" class="w-6 h-6 sm:w-8 sm:h-8 fill-current"></i>`;
                    }, 300);
                }
            }
            lucide.createIcons();
        };

        if (playBtn) playBtn.addEventListener('click', togglePlay);
        if (centerPlayBtn) centerPlayBtn.addEventListener('click', togglePlay);
        video.addEventListener('play', updatePlayIcon);
        video.addEventListener('pause', updatePlayIcon);

        // Also allow clicking the video to play/pause (if wrapper clicked, usually caught by overlay but just in case)
        wrapper.addEventListener('click', (e) => {
            if (e.target === wrapper || e.target === video) {
                togglePlay();
            }
        });

        // Mute/Unmute
        const updateMuteIcon = () => {
            if (!muteBtn) return;
            const isMuted = video.muted;
            muteBtn.innerHTML = `<i data-lucide="${isMuted ? 'volume-x' : 'volume-2'}" class="w-4 h-4 sm:w-5 sm:h-5"></i>`;
            lucide.createIcons();
        };

        if (muteBtn) {
            muteBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // prevent play toggle
                video.muted = !video.muted;
                updateMuteIcon();
            });
            // Init
            updateMuteIcon();
        }

        // Speed Control
        if (speedBtn) {
            speedBtn.addEventListener('change', (e) => {
                e.stopPropagation();
                video.playbackRate = parseFloat(speedBtn.value);
            });
        }

        // Timeline
        if (timeline && progress) {
            video.addEventListener('timeupdate', () => {
                const percent = (video.currentTime / video.duration) * 100;
                progress.style.width = `${percent}%`;
            });

            timeline.addEventListener('click', (e) => {
                e.stopPropagation();
                const rect = timeline.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                video.currentTime = pos * video.duration;
            });
        }
    });

    // --- Draggable Carousel Logic ---
    const carousels = document.querySelectorAll('.carousel-container');

    carousels.forEach(carousel => {
        let isDown = false;
        let startX;
        let scrollLeft;

        // Mouse Events
        carousel.addEventListener('mousedown', (e) => {
            // Prevent drag if clicking controls
            if (e.target.closest('button') || e.target.closest('select')) return;

            isDown = true;
            carousel.classList.add('active', 'cursor-grabbing');
            startX = e.pageX - carousel.offsetLeft;
            scrollLeft = carousel.scrollLeft;
        });

        carousel.addEventListener('mouseleave', () => {
            isDown = false;
            carousel.classList.remove('active', 'cursor-grabbing');
        });

        carousel.addEventListener('mouseup', () => {
            isDown = false;
            carousel.classList.remove('active', 'cursor-grabbing');
        });

        carousel.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault(); // Stop text selection
            const x = e.pageX - carousel.offsetLeft;
            const walk = (x - startX) * 2; // Scroll fast
            carousel.scrollLeft = scrollLeft - walk;
        });

        // Touch Events
        carousel.addEventListener('touchstart', (e) => {
            if (e.target.closest('button') || e.target.closest('select')) return;
            isDown = true;
            startX = e.touches[0].pageX - carousel.offsetLeft;
            scrollLeft = carousel.scrollLeft;
        }, { passive: true });

        carousel.addEventListener('touchend', () => {
            isDown = false;
        });

        carousel.addEventListener('touchmove', (e) => {
            if (!isDown || e.touches.length > 1) return;
            // Removed preventDefault to allow vertical scrolling on mobile when not dragging horizontally heavily
            const x = e.touches[0].pageX - carousel.offsetLeft;
            const walk = (x - startX) * 2;

            // Only scroll horizontally if moving significantly horizontally
            if (Math.abs(walk) > 10) {
                carousel.scrollLeft = scrollLeft - walk;
            }
        }, { passive: true });

    });

});

// Common Popover Toggle Logic Function
function setupPopover(btnId, menuId) {
    const btn = document.getElementById(btnId);
    const menu = document.getElementById(menuId);

    if (btn && menu) {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isClosed = menu.classList.contains('opacity-0');

            // First close all menus
            document.querySelectorAll('[id$="-menu"]').forEach(m => {
                m.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
                m.classList.remove('opacity-100', 'scale-100', 'pointer-events-auto');
            });

            if (isClosed) {
                menu.classList.remove('opacity-0', 'scale-95', 'pointer-events-none');
                menu.classList.add('opacity-100', 'scale-100', 'pointer-events-auto');
            }
        });

        // Close when clicking outside of the menu
        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target) && !btn.contains(e.target)) {
                menu.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
                menu.classList.remove('opacity-100', 'scale-100', 'pointer-events-auto');
            }
        });

        // Close menu on link click (for TOC)
        const links = menu.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
                menu.classList.remove('opacity-100', 'scale-100', 'pointer-events-auto');
            });
        });
    }
}

// Setup Popovers
setupPopover('related-projects-btn', 'related-projects-menu');

// Intersection Observer for highlighting Active TOC section
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.toc-link');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.3 // Highlight when 30% of the section is visible
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                // Remove active classes from all links
                navLinks.forEach(link => {
                    link.classList.remove('text-amber-600', 'font-bold', 'border-amber-500');
                    link.classList.add('text-themeTextSoft', 'font-medium', 'border-transparent');
                });

                // Add active classes to the current specific link
                const activeLink = document.querySelector(`.toc-link[href="#${id}"]`);
                if (activeLink) {
                    activeLink.classList.remove('text-themeTextSoft', 'font-medium', 'border-transparent');
                    activeLink.classList.add('text-amber-600', 'font-bold', 'border-amber-500');
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });
});
