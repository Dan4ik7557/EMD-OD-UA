/*
 * ЗОНИ ПОКРИТТЯ — дані для карти.
 *
 * id       — унікальний ключ (латиницею), такий самий, як data-zone у кнопці в index.html
 * name     — назва станції
 * color    — колір зони на карті та в списку
 * center   — координати станції [широта, довгота]
 * geometry — межі зони у форматі GeoJSON (Polygon або MultiPolygon).
 *            Поки null — на карті показується лише точка станції.
 *
 * ЯК ДОДАТИ СПРАВЖНІ МЕЖІ:
 * 1. Експортуйте межі з вашої карти Google (Google My Maps → «Експортувати в KML/KMZ»).
 * 2. Відкрийте https://mapshaper.org або https://geojson.io, завантажте KML
 *    і збережіть результат як GeoJSON.
 * 3. Для кожної зони скопіюйте об'єкт "geometry" з GeoJSON і вставте замість null.
 *    Приклад: geometry: { "type": "Polygon", "coordinates": [[[30.1, 46.4], [30.3, 46.5], ...]] }
 *    Увага: у GeoJSON порядок координат — [довгота, широта].
 */
window.COVERAGE_ZONES = [
    {
        id: "odesa",
        name: "Одеська міська станція",
        color: "#f59e0b",
        center: [46.4825, 30.7233],
        geometry: null
    },
    {
        id: "ananiv",
        name: "Ананьїв",
        color: "#1e3a8a",
        center: [47.7222, 29.9690],
        geometry: null
    },
    {
        id: "artsyz",
        name: "Арцизька",
        color: "#7c3aed",
        center: [45.9920, 29.4180],
        geometry: null
    },
    {
        id: "bilhorod",
        name: "Білгород-Дністровська",
        color: "#ef4444",
        center: [46.1860, 30.3440],
        geometry: null
    },
    {
        id: "biliaivka",
        name: "Біляївська",
        color: "#34d399",
        center: [46.4820, 30.1980],
        geometry: null
    },
    {
        id: "velyka-mykhailivka",
        name: "Велика-Михайлівська",
        color: "#65a30d",
        center: [47.0710, 29.8550],
        geometry: null
    },
    {
        id: "berezivka",
        name: "Березівка",
        color: "#991b1b",
        center: [47.2030, 30.9120],
        geometry: null
    },
    {
        id: "izmail",
        name: "Ізмаїльська",
        color: "#1d4ed8",
        center: [45.3510, 28.8370],
        geometry: null
    },
    {
        id: "podilsk",
        name: "Подільська та Любашівська",
        color: "#15803d",
        center: [47.7420, 29.5320],
        // Друга точка (Любашівка) — для цієї зони дві підстанції
        extraPoints: [[47.8370, 30.2600]],
        geometry: null
    }
];