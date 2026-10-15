// Скрипт завантажився — вмикаємо анімації появи блоків.
// Без цього класу весь вміст сторінки видно одразу (на випадок, якщо script.js не підключився).
document.documentElement.classList.add("js_anim");

document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;

    /* ============ DROPDOWN (клік) ============ */
    const dropdownItems = document.querySelectorAll(".has_dropdown");

    const closeAllDropdowns = (except = null) => {
        dropdownItems.forEach((item) => {
            if (item === except) return;
            item.classList.remove("is_open");
            item.querySelector(".nav_toggle").setAttribute("aria-expanded", "false");
        });
    };

    dropdownItems.forEach((item) => {
        const toggle = item.querySelector(".nav_toggle");

        toggle.addEventListener("click", (e) => {
            e.stopPropagation();
            const isOpen = item.classList.toggle("is_open");
            toggle.setAttribute("aria-expanded", String(isOpen));
            closeAllDropdowns(item);
        });

        // Коли мишу прибрали — знімаємо «клікнутий» стан, щоб меню не зависало
        item.addEventListener("mouseleave", () => {
            item.classList.remove("is_open");
            toggle.setAttribute("aria-expanded", "false");
        });
    });

    // Клік поза меню закриває dropdown
    document.addEventListener("click", (e) => {
        if (!e.target.closest(".has_dropdown")) closeAllDropdowns();
    });

    /* ============ МОДАЛКА КОНТАКТІВ ============ */
    const modal = document.getElementById("contactsModal");

    const openModal = () => {
        modal.classList.add("is_open");
        modal.setAttribute("aria-hidden", "false");
        body.classList.add("no_scroll");
        modal.querySelector(".modal_close").focus();
    };

    const closeModal = () => {
        modal.classList.remove("is_open");
        modal.setAttribute("aria-hidden", "true");
        body.classList.remove("no_scroll");
    };

    document.querySelectorAll("[data-open-contacts]").forEach((btn) =>
        btn.addEventListener("click", openModal)
    );
    modal.querySelectorAll("[data-close-modal]").forEach((el) =>
        el.addEventListener("click", closeModal)
    );

    /* ============ МОБІЛЬНЕ МЕНЮ ============ */
    const mobileMenu = document.getElementById("mobileMenu");
    const mobileList = document.getElementById("mobileList");
    const burgerBtn = document.getElementById("burgerBtn");

    // Будуємо мобільне меню з десктопного, щоб пункти не дублювати вручну
    document.querySelectorAll(".nav_list > .nav_item").forEach((item) => {
        const li = document.createElement("li");
        li.className = "mobile_item";

        if (item.classList.contains("has_dropdown")) {
            const toggle = item.querySelector(".nav_toggle");
            const links = item.querySelectorAll(".dropdown_list a");

            li.innerHTML = `
                <button type="button" class="mobile_link" aria-expanded="false">
                    ${toggle.textContent.trim()}
                    ${toggle.querySelector("svg").outerHTML}
                </button>
                <div class="mobile_sub">
                    <ul>
                        ${[...links].map((a) => `<li><a href="${a.getAttribute("href")}">${a.textContent}</a></li>`).join("")}
                    </ul>
                </div>`;

            const btn = li.querySelector(".mobile_link");
            btn.addEventListener("click", () => {
                const isOpen = li.classList.toggle("is_open");
                btn.setAttribute("aria-expanded", String(isOpen));
                // Акордеон: одночасно відкритий лише один розділ
                mobileList.querySelectorAll(".mobile_item.is_open").forEach((other) => {
                    if (other !== li) {
                        other.classList.remove("is_open");
                        other.querySelector(".mobile_link").setAttribute("aria-expanded", "false");
                    }
                });
            });
        } else {
            const a = item.querySelector("a");
            li.innerHTML = `<a href="${a.getAttribute("href")}" class="mobile_link">${a.textContent}</a>`;
        }

        mobileList.appendChild(li);
    });

    const openMobile = () => {
        mobileMenu.classList.add("is_open");
        mobileMenu.setAttribute("aria-hidden", "false");
        body.classList.add("no_scroll");
    };

    const closeMobile = () => {
        mobileMenu.classList.remove("is_open");
        mobileMenu.setAttribute("aria-hidden", "true");
        if (!modal.classList.contains("is_open")) body.classList.remove("no_scroll");
    };

    burgerBtn.addEventListener("click", openMobile);
    mobileMenu.querySelectorAll("[data-close-mobile]").forEach((el) =>
        el.addEventListener("click", closeMobile)
    );
    // Перехід за посиланням закриває панель
    mobileList.addEventListener("click", (e) => {
        if (e.target.closest("a")) closeMobile();
    });

    /* ============ HERO: запуск анімації появи ============ */
    const hero = document.querySelector(".hero");
    if (hero) {
        // Наступний кадр — щоб браузер встиг відмалювати початковий стан
        requestAnimationFrame(() => hero.classList.add("hero_ready"));
    }

    /* ============ ПОЯВА БЛОКІВ ПРИ ПРОКРУТЦІ ============ */
    const revealEls = document.querySelectorAll(".reveal, .reveal_fade");

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add("is_visible");
                    observer.unobserve(entry.target); // анімуємо лише один раз
                });
            },
            { threshold: 0.15 }
        );
        revealEls.forEach((el) => observer.observe(el));
    } else {
        revealEls.forEach((el) => el.classList.add("is_visible"));
    }

    /* ============ ПОСЛУГИ: пунктирні лінії від карток до ілюстрації ============ */
    const svcBody = document.getElementById("svcBody");
    const svcLines = document.getElementById("svcLines");

    const drawServiceLines = () => {
        if (!svcBody || !svcLines) return;
        svcLines.innerHTML = "";
        // На вузьких екранах лінії приховані CSS — нічого не малюємо
        if (getComputedStyle(svcLines).display === "none") return;

        const bodyRect = svcBody.getBoundingClientRect();
        const NS = "http://www.w3.org/2000/svg";

        svcBody.querySelectorAll(".svc_card").forEach((card) => {
            const anchor = svcBody.querySelector(`.svc_anchor[data-anchor="${card.dataset.anchor}"]`);
            if (!anchor) return;

            // offset* не залежать від transform анімації появи
            const sx = card.offsetLeft + card.offsetWidth + 12;
            const sy = card.offsetTop + card.offsetHeight / 2;

            const a = anchor.getBoundingClientRect();
            const ex = a.left + a.width / 2 - bodyRect.left;
            const ey = a.top + a.height / 2 - bodyRect.top;

            // Злам лінії — трохи лівіше від точки на ілюстрації
            const bx = Math.max(sx + 24, ex - 28);

            const path = document.createElementNS(NS, "path");
            path.setAttribute("d", `M${sx} ${sy} H${bx} V${ey} H${ex}`);
            svcLines.appendChild(path);

            const dot = document.createElementNS(NS, "circle");
            dot.setAttribute("cx", sx);
            dot.setAttribute("cy", sy);
            dot.setAttribute("r", 4);
            svcLines.appendChild(dot);
        });
    };

    if (svcBody) {
        drawServiceLines();
        window.addEventListener("load", drawServiceLines);
        if ("ResizeObserver" in window) {
            new ResizeObserver(drawServiceLines).observe(svcBody);
        } else {
            window.addEventListener("resize", drawServiceLines);
        }

        // Лінії з'являються разом з ілюстрацією
        const art = svcBody.querySelector(".svc_art");
        if ("IntersectionObserver" in window && art) {
            new IntersectionObserver((entries, obs) => {
                if (entries[0].isIntersecting) {
                    svcLines.classList.add("is_visible");
                    obs.disconnect();
                }
            }, { threshold: 0.2 }).observe(art);
        } else {
            svcLines.classList.add("is_visible");
        }
    }

    /* ============ ФАКТИ: числа крутяться, як кодовий замок ============ */
    const factNums = document.querySelectorAll(".fact_num[data-value]");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (factNums.length && !reduceMotion) {
        const LOOPS = 3; // скільки повних обертів робить кожне коліщатко

        // Будуємо барабани замість звичайного тексту
        factNums.forEach((el) => {
            const value = el.dataset.value;
            const suffix = el.dataset.suffix || "";
            el.setAttribute("aria-label", value + suffix);
            el.innerHTML = "";

            [...value].forEach((char) => {
                const digit = document.createElement("span");
                digit.className = "odo_digit";
                digit.setAttribute("aria-hidden", "true");

                const strip = document.createElement("span");
                strip.className = "odo_strip";
                for (let n = 0; n < LOOPS * 10; n++) {
                    const s = document.createElement("span");
                    s.textContent = n % 10;
                    strip.appendChild(s);
                }
                strip.dataset.target = (LOOPS - 1) * 10 + Number(char);

                digit.appendChild(strip);
                el.appendChild(digit);
            });

            if (suffix) {
                const suf = document.createElement("span");
                suf.className = "odo_suffix";
                suf.setAttribute("aria-hidden", "true");
                suf.textContent = suffix;
                el.appendChild(suf);
            }
        });

        const spin = (el, startDelay) => {
            const strips = el.querySelectorAll(".odo_strip");
            let longest = 0;

            strips.forEach((strip, i) => {
                // Кожне наступне коліщатко крутиться довше — зупиняються по черзі, зліва направо
                const duration = 1.6 + i * 0.35;
                const delay = startDelay;
                longest = Math.max(longest, duration + delay);

                // Легкий «перекрут» у кінці — як клацання коліщатка замка
                strip.style.transition = `transform ${duration}s cubic-bezier(0.2, 1.08, 0.35, 1) ${delay}s`;
                strip.style.transform = `translateY(-${strip.dataset.target * 1.1}em)`;
            });

            setTimeout(() => el.classList.add("is_done"), longest * 1000);
        };

        const grid = document.querySelector(".facts_grid");
        const startAll = () =>
            factNums.forEach((el, idx) => spin(el, 0.2 + idx * 0.15));

        if ("IntersectionObserver" in window && grid) {
            new IntersectionObserver((entries, obs) => {
                if (entries[0].isIntersecting) {
                    // Кадр затримки, щоб браузер зафіксував стартову позицію барабанів
                    requestAnimationFrame(() => requestAnimationFrame(startAll));
                    obs.disconnect();
                }
            }, { threshold: 0.35 }).observe(grid);
        } else {
            startAll();
        }
    }

    /* ============ КЕРІВНИЦТВО: карусель ============ */
    const teamTrack = document.getElementById("teamTrack");

    if (teamTrack) {
        const prevBtn = document.getElementById("teamPrev");
        const nextBtn = document.getElementById("teamNext");
        const progress = document.getElementById("teamProgress");

        // Крок прокрутки = ширина однієї картки + проміжок
        const step = () => {
            const card = teamTrack.querySelector(".team_card");
            const gap = parseFloat(getComputedStyle(teamTrack).columnGap) || 0;
            return card ? card.offsetWidth + gap : teamTrack.clientWidth * 0.8;
        };

        const update = () => {
            const max = teamTrack.scrollWidth - teamTrack.clientWidth;
            const x = teamTrack.scrollLeft;
            prevBtn.disabled = x <= 4;
            nextBtn.disabled = x >= max - 4;

            // Смужка прогресу: ширина = видима частина, зсув = позиція прокрутки
            const visible = teamTrack.clientWidth / teamTrack.scrollWidth;
            const barWidth = Math.max(visible, 0.15) * 100;
            progress.style.width = barWidth + "%";
            const ratio = max > 0 ? x / max : 0;
            progress.style.transform = `translateX(${ratio * (100 / barWidth * 100 - 100)}%)`;
        };

        prevBtn.addEventListener("click", () => teamTrack.scrollBy({ left: -step(), behavior: "smooth" }));
        nextBtn.addEventListener("click", () => teamTrack.scrollBy({ left: step(), behavior: "smooth" }));
        teamTrack.addEventListener("scroll", update, { passive: true });
        window.addEventListener("resize", update);
        update();

        // Перетягування мишею на ПК (на телефоні працює звичайний свайп)
        let startX = 0;
        let startScroll = 0;
        let dragging = false;

        teamTrack.addEventListener("pointerdown", (e) => {
            if (e.pointerType !== "mouse" || e.button !== 0) return;
            dragging = true;
            startX = e.clientX;
            startScroll = teamTrack.scrollLeft;
            teamTrack.classList.add("is_dragging");
            teamTrack.setPointerCapture(e.pointerId);
        });

        teamTrack.addEventListener("pointermove", (e) => {
            if (!dragging) return;
            teamTrack.scrollLeft = startScroll - (e.clientX - startX);
        });

        const endDrag = () => {
            if (!dragging) return;
            dragging = false;
            // Після відпускання — плавно «доїжджаємо» до найближчої картки
            const s = step();
            const target = Math.round(teamTrack.scrollLeft / s) * s;
            teamTrack.classList.remove("is_dragging");
            teamTrack.scrollTo({ left: target, behavior: "smooth" });
        };

        teamTrack.addEventListener("pointerup", endDrag);
        teamTrack.addEventListener("pointercancel", endDrag);
        // Забороняємо «перетягування» картинок браузером
        teamTrack.addEventListener("dragstart", (e) => e.preventDefault());
    }

    /* ============ ЗОНИ ПОКРИТТЯ: карта ============ */
    const zonesMapEl = document.getElementById("zonesMap");
    const zoneList = document.getElementById("zoneList");

    if (zonesMapEl && zoneList && Array.isArray(window.COVERAGE_ZONES)) {
        const zones = window.COVERAGE_ZONES;
        const infoName = document.getElementById("zonesInfoName");
        const infoDot = document.getElementById("zonesInfoDot");

        // 1. Список зон будуємо з даних zones.js
        zones.forEach((z) => {
            const li = document.createElement("li");
            li.innerHTML = `
                <button type="button" class="zone_btn" data-zone="${z.id}" aria-pressed="false">
                    <span class="zone_dot" style="--c: ${z.color}"></span>
                    <span class="zone_name">${z.name}</span>
                </button>`;
            zoneList.appendChild(li);
        });

        let map = null;
        const layers = {}; // id → { polygons, markers, bounds }
        let allBounds = null;
        let pendingId = "all";

        const polygonStyle = (z, mode) => ({
            color: z.color,
            fillColor: z.color,
            weight: mode === "active" ? 3 : mode === "dim" ? 1 : 2,
            opacity: mode === "dim" ? 0.3 : 0.9,
            fillOpacity: mode === "active" ? 0.5 : mode === "dim" ? 0.06 : 0.3
        });

        const selectZone = (id) => {
            pendingId = id;

            // Кнопки
            zoneList.querySelectorAll(".zone_btn").forEach((btn) => {
                const on = btn.dataset.zone === id;
                btn.classList.toggle("is_active", on);
                btn.setAttribute("aria-pressed", String(on));
                if (on && window.innerWidth < 1024) {
                    btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
                }
            });

            // Плашка на карті
            const zone = zones.find((z) => z.id === id);
            infoName.textContent = zone ? zone.name : "Вся зона покриття";
            infoDot.style.setProperty("--c", zone ? zone.color : "var(--red)");

            if (!map) return; // карта ще не створена — застосуємо після ініціалізації

            // Підсвічування зон і точок
            zones.forEach((z) => {
                const l = layers[z.id];
                const mode = id === "all" ? "normal" : z.id === id ? "active" : "dim";

                l.polygons.setStyle(polygonStyle(z, mode));
                if (mode === "active") l.polygons.bringToFront();

                l.markers.forEach((m) => {
                    const pin = m.getElement() && m.getElement().querySelector(".map_pin");
                    if (pin) {
                        pin.classList.toggle("is_active", mode === "active");
                        pin.classList.toggle("is_dim", mode === "dim");
                    }
                    m.setZIndexOffset(mode === "active" ? 1000 : 0);
                    if (mode === "active") m.openTooltip();
                    else m.closeTooltip();
                });
            });

            // Переліт камери
            if (id === "all") {
                map.flyToBounds(allBounds, { padding: [30, 30], duration: 0.9 });
            } else {
                const l = layers[id];
                map.flyToBounds(l.bounds, {
                    padding: [70, 70],
                    maxZoom: l.hasGeometry ? 11 : 10, // не більше 16 — межа підкладки Esri
                    duration: 0.9
                });
            }
        };

        zoneList.addEventListener("click", (e) => {
            const btn = e.target.closest(".zone_btn");
            if (btn) selectZone(btn.dataset.zone);
        });

        // 2. Карту створюємо, лише коли блок наближається до екрана
        const initMap = () => {
            if (map) return;
            if (!window.L) {
                zonesMapEl.innerHTML = '<p class="zones_error">Не вдалося завантажити карту. Перевірте підключення до інтернету.</p>';
                return;
            }

            map = L.map(zonesMapEl, {
                zoomControl: true,
                scrollWheelZoom: false,   // сторінка не «застрягає» на карті під час прокрутки
                dragging: !L.Browser.mobile, // на телефоні сторінка гортається пальцем, карта — двома
                tap: false
            });

            // Підкладка без API-ключа: світло-сіра карта Esri (основа + підписи міст)
            const esriBase = L.tileLayer(
                "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
                {
                    maxZoom: 16,
                    attribution: 'Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                }
            ).addTo(map);

            // Підписи міст — окремим шаром поверх кольорових зон
            map.createPane("labels");
            map.getPane("labels").style.zIndex = 450;
            map.getPane("labels").style.pointerEvents = "none";

            const esriLabels = L.tileLayer(
                "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
                { maxZoom: 16, pane: "labels" }
            ).addTo(map);

            // Запасний варіант: якщо Esri недоступний — перемикаємось на OpenStreetMap
            let tileErrors = 0;
            esriBase.on("tileerror", () => {
                tileErrors += 1;
                if (tileErrors !== 4) return;
                map.removeLayer(esriBase);
                map.removeLayer(esriLabels);
                L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    maxZoom: 18,
                    className: "osm_tiles",
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                }).addTo(map);
            });

            // Колесо миші вмикається після кліку по карті
            map.on("click", () => map.scrollWheelZoom.enable());
            map.on("mouseout", () => map.scrollWheelZoom.disable());

            // Орієнтовні межі Одеської області — для виду «вся зона», поки немає полігонів
            allBounds = L.latLngBounds([45.2, 28.2], [47.95, 31.3]);

            zones.forEach((z) => {
                const polygons = L.geoJSON(z.geometry || null, {
                    style: polygonStyle(z, "normal")
                }).addTo(map);
                polygons.on("click", () => selectZone(z.id));

                const points = [z.center].concat(z.extraPoints || []);
                const markers = points.map((p) => {
                    const m = L.marker(p, {
                        icon: L.divIcon({
                            className: "map_pin_wrap",
                            html: `<span class="map_pin" style="--c: ${z.color}"></span>`,
                            iconSize: [18, 18],
                            iconAnchor: [9, 9]
                        }),
                        keyboard: false
                    })
                        .bindTooltip(z.name, { direction: "top", offset: [0, -12] })
                        .addTo(map);
                    m.on("click", () => selectZone(z.id));
                    return m;
                });

                const hasGeometry = Boolean(z.geometry);
                const bounds = hasGeometry
                    ? polygons.getBounds()
                    : L.latLngBounds(points).pad(points.length > 1 ? 0.3 : 0);
                if (hasGeometry) allBounds.extend(bounds);

                layers[z.id] = { polygons, markers, bounds, hasGeometry };
            });

            map.fitBounds(allBounds, { padding: [30, 30] });
            selectZone(pendingId);
        };

        if ("IntersectionObserver" in window) {
            new IntersectionObserver((entries, obs) => {
                if (entries[0].isIntersecting) {
                    initMap();
                    obs.disconnect();
                }
            }, { rootMargin: "300px" }).observe(zonesMapEl);
        } else {
            initMap();
        }
    }

    /* ============ FOOTER ============ */
    const footerYear = document.getElementById("footerYear");
    if (footerYear) footerYear.textContent = new Date().getFullYear();

    const toTop = document.getElementById("toTop");
    if (toTop) {
        toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    }

    /* ============ СТРУКТУРНІ ПІДРОЗДІЛИ: карта + пошук ============ */
    const unitsMapEl = document.getElementById("unitsMap");
    const unitList = document.getElementById("unitList");

    if (unitsMapEl && unitList) {
        const cards = [...unitList.querySelectorAll(".unit_card")];
        const searchBox = document.getElementById("unitSearch");
        const searchWrap = searchBox ? searchBox.closest(".un_search") : null;
        const clearBtn = document.getElementById("unitSearchClear");
        const filterBtns = [...document.querySelectorAll(".un_filter")];
        const countEl = document.getElementById("unitCount");
        const emptyEl = document.getElementById("unitEmpty");
        const resetBtn = document.getElementById("unitsReset");

        const TYPE_LABEL = { center: "Центр", station: "Станція", sub: "Підстанція", ppb: "Пункт постійного базування" };

        // Нормалізація для пошуку: регістр, апострофи, крапки й пробіли не важливі
        const norm = (s) => s.toLowerCase().replace(/[’'`ʼ]/g, "").replace(/ё/g, "е").replace(/[^a-zа-яіїєґ0-9]+/g, "");

        // Дані кожної картки
        const units = cards.map((card) => {
            const title = card.querySelector(".unit_title");
            const addr = card.querySelector(".unit_addr_text");
            return {
                id: card.dataset.unit,
                type: card.dataset.type,
                lat: parseFloat(card.dataset.lat),
                lng: parseFloat(card.dataset.lng),
                card,
                titleEl: title,
                addrEl: addr,
                titleText: title.textContent.trim(),
                addrText: addr.textContent.trim(),
                haystack: norm(card.dataset.unit + " " + title.textContent + " " + addr.textContent),
                marker: null
            };
        });
        const byId = Object.fromEntries(units.map((u) => [u.id, u]));

        let map = null;
        let layer = null;          // кластер-група (або звичайна група, якщо плагін не завантажився)
        let activeId = null;
        let filterType = "all";
        let query = "";

        /* ---------- Підсвітка збігів у тексті ---------- */
        const escapeHtml = (s) => s.replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
        const highlight = (el, text, q) => {
            if (!q) { el.textContent = text; return; }
            const idx = text.toLowerCase().indexOf(q.toLowerCase());
            if (idx < 0) { el.textContent = text; return; }
            el.innerHTML = escapeHtml(text.slice(0, idx)) +
                "<mark>" + escapeHtml(text.slice(idx, idx + q.length)) + "</mark>" +
                escapeHtml(text.slice(idx + q.length));
        };

        /* ---------- Фільтрація ---------- */
        const visibleUnits = () => units.filter((u) => !u.card.hidden);

        const applyFilter = (fit) => {
            const q = norm(query);
            const raw = query.trim();
            let shown = 0;

            units.forEach((u) => {
                const ok = (filterType === "all" || u.type === filterType) && (!q || u.haystack.includes(q));
                u.card.hidden = !ok;
                if (ok) shown++;
                highlight(u.titleEl, u.titleText, ok ? raw : "");
                highlight(u.addrEl, u.addrText, ok ? raw : "");
            });

            if (countEl) countEl.innerHTML = `Знайдено: <b>${shown}</b> з ${units.length}`;
            if (emptyEl) emptyEl.classList.toggle("is_visible", shown === 0);
            if (searchWrap) searchWrap.classList.toggle("has_value", raw.length > 0);

            if (activeId && byId[activeId].card.hidden) setActive(null);
            syncMarkers(fit);
        };

        const syncMarkers = (fit) => {
            if (!map || !layer) return;
            layer.clearLayers();
            const list = visibleUnits();
            if (layer.addLayers) layer.addLayers(list.map((u) => u.marker));
            else list.forEach((u) => layer.addLayer(u.marker));
            if (fit) fitTo(list);
        };

        const fitTo = (list) => {
            if (!map || !list.length) return;
            if (list.length === 1) {
                map.flyTo([list[0].lat, list[0].lng], 14, { duration: 0.6 });
            } else {
                map.flyToBounds(list.map((u) => [u.lat, u.lng]), { padding: [50, 50], maxZoom: 14, duration: 0.6 });
            }
        };

        /* ---------- Вибір підрозділу ---------- */
        const setActive = (id, fromMap) => {
            activeId = id;
            units.forEach((u) => {
                const on = u.id === id;
                u.card.classList.toggle("is_active", on);
                u.card.querySelector(".unit_main").setAttribute("aria-expanded", on ? "true" : "false");
                if (u.marker) {
                    u.marker.setZIndexOffset(on ? 1000 : 0);
                    const pin = u.marker.getElement() && u.marker.getElement().querySelector(".unit_pin");
                    if (pin) pin.classList.toggle("is_active", on);
                }
            });
            if (!id) return;

            const u = byId[id];
            if (fromMap) {
                // Прокручуємо список до картки (на ПК — лише всередині списку)
                if (window.innerWidth >= 1024) {
                    unitList.scrollTo({ top: u.card.offsetTop - unitList.offsetTop - 4, behavior: "smooth" });
                } else {
                    u.card.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            }

            if (!map || !u.marker) return;
            const open = () => {
                u.marker.openPopup();
                const pin = u.marker.getElement() && u.marker.getElement().querySelector(".unit_pin");
                if (pin) pin.classList.add("is_active");
            };
            if (fromMap) { open(); return; }

            if (layer.zoomToShowLayer) {
                // Маркер може бути всередині кластера — спочатку наближаємось
                if (map.getZoom() < 13) {
                    map.flyTo([u.lat, u.lng], 14, { duration: 0.7 });
                    map.once("moveend", () => layer.zoomToShowLayer(u.marker, open));
                } else {
                    layer.zoomToShowLayer(u.marker, open);
                }
            } else {
                map.flyTo([u.lat, u.lng], 14, { duration: 0.7 });
                map.once("moveend", open);
            }
        };

        // Клік по картці
        unitList.addEventListener("click", (e) => {
            const btn = e.target.closest(".unit_main");
            if (!btn) return;
            const id = btn.closest(".unit_card").dataset.unit;
            if (!map) initMap();
            setActive(id, false);
            // На телефоні карта над списком — піднімаємось до неї
            if (window.innerWidth < 1024) {
                unitsMapEl.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        });

        /* ---------- Пошук ---------- */
        let searchTimer = null;
        if (searchBox) {
            searchBox.addEventListener("input", () => {
                query = searchBox.value;
                clearTimeout(searchTimer);
                searchTimer = setTimeout(() => applyFilter(true), 150);
            });
            searchBox.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    const first = visibleUnits()[0];
                    if (first) setActive(first.id, false);
                }
            });
        }
        if (clearBtn) {
            clearBtn.addEventListener("click", () => {
                searchBox.value = "";
                query = "";
                applyFilter(true);
                searchBox.focus();
            });
        }

        /* ---------- Фільтр за типом ---------- */
        filterBtns.forEach((btn) => {
            btn.addEventListener("click", () => {
                filterType = btn.dataset.filter;
                filterBtns.forEach((b) => {
                    const on = b === btn;
                    b.classList.toggle("is_active", on);
                    b.setAttribute("aria-pressed", on ? "true" : "false");
                });
                applyFilter(true);
            });
        });

        // Показати всі підрозділи на карті
        if (resetBtn) {
            resetBtn.addEventListener("click", () => {
                if (map) map.closePopup();
                setActive(null);
                fitTo(visibleUnits());
            });
        }

        /* ---------- Карта ---------- */
        const initMap = () => {
            if (map) return;
            if (!window.L) {
                unitsMapEl.innerHTML = '<p class="un_map_error">Не вдалося завантажити карту. Перевірте підключення до інтернету.</p>';
                return;
            }

            map = L.map(unitsMapEl, {
                scrollWheelZoom: false,
                dragging: !L.Browser.mobile,
                tap: false
            });

            // Та сама підкладка, що й на головній: світло-сіра Esri + підписи
            const base = L.tileLayer(
                "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
                { maxZoom: 16, attribution: 'Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }
            ).addTo(map);
            map.createPane("labels");
            map.getPane("labels").style.zIndex = 450;
            map.getPane("labels").style.pointerEvents = "none";
            const labels = L.tileLayer(
                "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
                { maxZoom: 16, pane: "labels" }
            ).addTo(map);

            // Запасний варіант — OpenStreetMap
            let errors = 0;
            base.on("tileerror", () => {
                if (++errors !== 4) return;
                map.removeLayer(base);
                map.removeLayer(labels);
                L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    maxZoom: 18,
                    className: "osm_tiles",
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                }).addTo(map);
            });

            map.on("click", () => map.scrollWheelZoom.enable());
            map.on("mouseout", () => map.scrollWheelZoom.disable());

            // Кластери: близькі мітки об'єднуються в кружок з числом
            if (L.markerClusterGroup) {
                layer = L.markerClusterGroup({
                    maxClusterRadius: 46,
                    showCoverageOnHover: false,
                    spiderfyOnMaxZoom: true,
                    disableClusteringAtZoom: 15,
                    iconCreateFunction: (cluster) => {
                        const n = cluster.getChildCount();
                        const size = n < 10 ? 40 : n < 30 ? 48 : 56;
                        const cls = n < 10 ? "" : n < 30 ? " un_cluster_md" : " un_cluster_lg";
                        return L.divIcon({
                            html: `<span>${n}</span>`,
                            className: "un_cluster" + cls,
                            iconSize: [size, size]
                        });
                    }
                });
            } else {
                layer = L.featureGroup();
            }
            layer.addTo(map);

            units.forEach((u) => {
                const route = `https://www.google.com/maps/dir/?api=1&destination=${u.lat},${u.lng}`;
                u.marker = L.marker([u.lat, u.lng], {
                    icon: L.divIcon({
                        className: "unit_pin_wrap",
                        html: `<span class="unit_pin" data-type="${u.type}"><span>${u.id}</span></span>`,
                        iconSize: [30, 30],
                        iconAnchor: [4, 30],
                        popupAnchor: [11, -30]
                    }),
                    keyboard: false,
                    title: u.titleText
                }).bindPopup(
                    `<em>${TYPE_LABEL[u.type]}</em><b>${escapeHtml(u.titleText)}</b><span>${escapeHtml(u.addrText)}</span>` +
                    `<a href="${route}" target="_blank" rel="noopener">Прокласти маршрут →</a>`,
                    { className: "un_popup", autoPanPadding: [30, 30] }
                );
                u.marker.on("click", () => setActive(u.id, true));
                // Після «розкриття» кластера повертаємо підсвітку обраній мітці
                u.marker.on("add", () => {
                    if (u.id !== activeId) return;
                    const pin = u.marker.getElement() && u.marker.getElement().querySelector(".unit_pin");
                    if (pin) pin.classList.add("is_active");
                });
            });

            syncMarkers(false);
            const list = visibleUnits();
            map.fitBounds((list.length ? list : units).map((u) => [u.lat, u.lng]), { padding: [40, 40] });
        };

        if ("IntersectionObserver" in window) {
            new IntersectionObserver((entries, obs) => {
                if (entries[0].isIntersecting) {
                    initMap();
                    obs.disconnect();
                }
            }, { rootMargin: "300px" }).observe(unitsMapEl);
        } else {
            initMap();
        }

        applyFilter(false);
    }

    /* ============ ESCAPE ============ */
    document.addEventListener("keydown", (e) => {
        if (e.key !== "Escape") return;
        closeAllDropdowns();
        closeModal();
        closeMobile();
    });
});