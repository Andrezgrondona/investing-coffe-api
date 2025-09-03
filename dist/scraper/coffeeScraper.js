"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoffeeScraper = void 0;
// src/scraper/coffeeScraper.ts - Versión completa mejorada
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
class CoffeeScraper {
    constructor() {
        this.url = 'https://www.investing.com/commodities/us-coffee-c';
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        };
    }
    async scrapeWithCheerio() {
        try {
            const response = await axios_1.default.get(this.url, {
                headers: this.headers,
                timeout: 10000
            });
            const $ = cheerio.load(response.data);
            // Extraer datos principales
            const precioActual = this.extractCleanText($, '[data-test="instrument-price-last"]');
            const cambio = this.extractCleanText($, '[data-test="instrument-price-change"]');
            const cambioPorcentual = this.extractCleanText($, '[data-test="instrument-price-change-percent"]');
            // Calcular Bid/Ask aproximados basados en el precio actual
            const bidAskData = this.calculateBidAsk(precioActual);
            return {
                precioActual: precioActual || 'No disponible',
                cambio: cambio || 'No disponible',
                cambioPorcentual: cambioPorcentual || 'No disponible',
                precioCompra: bidAskData.bid,
                precioVenta: bidAskData.ask,
                fechaActualizacion: new Date().toISOString(),
                unidad: 'USD'
            };
        }
        catch (error) {
            console.error('Error scraping:', error);
            throw new Error(`Error scraping with Cheerio: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    extractCleanText($, selector) {
        const element = $(selector);
        if (element.length) {
            const text = element.text().trim();
            if (text && text !== '' && text !== '0') {
                return text;
            }
        }
        return '';
    }
    calculateBidAsk(precioActual) {
        if (!precioActual || precioActual === 'No disponible') {
            return { bid: 'No disponible', ask: 'No disponible' };
        }
        try {
            const precioNum = parseFloat(precioActual.replace(/[^\d.]/g, ''));
            if (!isNaN(precioNum)) {
                // Spread típico para futuros de café: 0.05 puntos
                const spread = 0.05;
                const bid = (precioNum - spread).toFixed(2);
                const ask = (precioNum + spread).toFixed(2);
                return { bid, ask };
            }
        }
        catch (error) {
            console.log('Error calculando Bid/Ask:', error);
        }
        return { bid: 'No disponible', ask: 'No disponible' };
    }
    async scrapeWithPuppeteer() {
        // Implementación similar pero con Puppeteer
        try {
            const puppeteer = await Promise.resolve().then(() => __importStar(require('puppeteer')));
            const browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();
            await page.setUserAgent(this.headers['User-Agent']);
            await page.goto(this.url, {
                waitUntil: 'networkidle2',
                timeout: 30000
            });
            await page.waitForSelector('[data-test="instrument-price-last"]', {
                timeout: 10000
            });
            const priceData = await page.evaluate(() => {
                const getText = (selector) => {
                    const element = document.querySelector(selector);
                    return element?.textContent?.trim() || '';
                };
                const precioActual = getText('[data-test="instrument-price-last"]');
                return {
                    precioActual,
                    cambio: getText('[data-test="instrument-price-change"]'),
                    cambioPorcentual: getText('[data-test="instrument-price-change-percent"]')
                };
            });
            await browser.close();
            const bidAskData = this.calculateBidAsk(priceData.precioActual);
            return {
                precioActual: priceData.precioActual || 'No disponible',
                cambio: priceData.cambio || 'No disponible',
                cambioPorcentual: priceData.cambioPorcentual || 'No disponible',
                precioCompra: bidAskData.bid,
                precioVenta: bidAskData.ask,
                fechaActualizacion: new Date().toISOString(),
                unidad: 'USD'
            };
        }
        catch (error) {
            console.error('Error with Puppeteer:', error);
            throw new Error(`Error scraping with Puppeteer: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
exports.CoffeeScraper = CoffeeScraper;
