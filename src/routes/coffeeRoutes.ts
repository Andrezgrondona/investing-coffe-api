import { Router } from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio'; // Importar cheerio
import { CoffeeScraper } from '../scraper/coffeeScraper';
import { ApiResponse } from '../scraper/types';

const router = Router();
const scraper = new CoffeeScraper();

router.get('/coffee-prices', async (req, res) => {
  try {
    const method = req.query.method as string || 'cheerio';
    let priceData;

    if (method === 'puppeteer') {
      priceData = await scraper.scrapeWithPuppeteer();
    } else {
      priceData = await scraper.scrapeWithCheerio();
    }
    
    const response: ApiResponse = {
      success: true,
      data: priceData,
      message: 'Datos obtenidos correctamente'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Route error:', error);
    const response: ApiResponse = {
      success: false,
      data: {} as any,
      error: error instanceof Error ? error.message : 'Error desconocido',
      message: 'Error al obtener los precios del café'
    };
    
    res.status(500).json(response);
  }
});

// Ruta para debug - CORREGIDO: Agregar tipos a los parámetros
router.get('/debug-bid-ask', async (req, res) => {
  try {
    const scraperInstance = new CoffeeScraper();
    const response = await axios.get('https://www.investing.com/commodities/us-coffee-c', {
      headers: scraperInstance['headers'] as any
    });
    
    const $ = cheerio.load(response.data);
    
    const potentialElements: string[] = [];
    
    // CORREGIDO: Agregar tipos a los parámetros del callback
    $('[class*="bid"], [class*="ask"], [class*="Bid"], [class*="Ask"]').each((i: number, element: cheerio.Element) => {
      const text = $(element).text().trim();
      const className = $(element).attr('class');
      potentialElements.push(`Class: ${className} | Text: ${text}`);
    });
    
    // CORREGIDO: Agregar tipos a los parámetros del callback
    $('*:contains("Bid"), *:contains("Ask")').each((i: number, element: cheerio.Element) => {
      const text = $(element).text().trim();
      if (text.length < 100) {
        potentialElements.push(`Text: ${text}`);
      }
    });

    res.type('text/plain').send(potentialElements.slice(0, 50).join('\n---\n'));
  } catch (error) {
    res.status(500).json({ error: 'Error analizando Bid/Ask' });
  }
});

export default router;