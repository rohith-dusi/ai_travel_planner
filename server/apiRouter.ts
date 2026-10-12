/**
 * Express router handling all /api endpoints.
 */
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config();
import { validateTripInput } from './validators.ts';
import { generateItineraryWithLLM, getCleanApiKey } from './llm.ts';
import { getAllTrips, getTripById, saveTrip, deleteTrip, type TripRecord } from './db.ts';

export const apiRouter = express.Router();

apiRouter.use(express.json({ limit: '1mb' }));

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    llmConfigured: Boolean(process.env.GEMINI_API_KEY),
    database: 'SQLite (trips.db)',
    timestamp: new Date().toISOString(),
  });
});

// Download project zip archive
apiRouter.get('/download-zip', (req, res) => {
  const zipPath = path.resolve(process.cwd(), 'ai-travel-planner.zip');

  if (!fs.existsSync(zipPath)) {
    return res.status(404).json({ success: false, error: 'Zip file not found' });
  }

  const stat = fs.statSync(zipPath);
  res.writeHead(200, {
    'Content-Type': 'application/zip',
    'Content-Length': stat.size,
    'Content-Disposition': 'attachment; filename="ai-travel-planner.zip"',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-cache',
  });
  const readStream = fs.createReadStream(zipPath);
  readStream.pipe(res);
});

// JSON Base64 fallback for iframe download environments
apiRouter.get('/zip-base64', (req, res) => {
  const zipPath = path.resolve(process.cwd(), 'ai-travel-planner.zip');

  if (!fs.existsSync(zipPath)) {
    return res.status(404).json({ success: false, error: 'Zip file not found' });
  }

  const fileBuffer = fs.readFileSync(zipPath);
  res.json({
    success: true,
    filename: 'ai-travel-planner.zip',
    sizeBytes: fileBuffer.length,
    base64: fileBuffer.toString('base64'),
  });
});

// Generate itinerary using LLM
apiRouter.post('/generate-itinerary', async (req, res) => {
  try {
    const validation = validateTripInput(req.body);
    if (!validation.valid || !validation.data) {
      return res.status(400).json({
        success: false,
        error: 'Input validation failed',
        details: validation.errors,
      });
    }

    const itinerary = await generateItineraryWithLLM(validation.data);

    res.json({
      success: true,
      data: itinerary,
      parameters: validation.data,
    });
  } catch (error: any) {
    console.error('Itinerary generation error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'An error occurred while generating your itinerary.',
    });
  }
});

// List all saved trips
apiRouter.get('/trips', (req, res) => {
  try {
    const trips = getAllTrips();
    res.json({
      success: true,
      data: trips,
      count: trips.length,
    });
  } catch (error: any) {
    console.error('Error fetching trips:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve saved trips.',
    });
  }
});

// Get single saved trip
apiRouter.get('/trips/:id', (req, res) => {
  try {
    const trip = getTripById(req.params.id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found.',
      });
    }
    res.json({
      success: true,
      data: trip,
    });
  } catch (error: any) {
    console.error('Error retrieving trip:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve trip details.',
    });
  }
});

// Save trip to SQLite
apiRouter.post('/trips', (req, res) => {
  try {
    const body = req.body;
    if (!body || !body.destination || !body.itinerary) {
      return res.status(400).json({
        success: false,
        error: 'Missing required trip fields for saving.',
      });
    }

    const id = body.id || `trip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const record: TripRecord = {
      id,
      title: body.title || `${body.destination} Trip`,
      destination: body.destination,
      origin: body.origin || 'Not specified',
      start_date: body.startDate || body.start_date || new Date().toISOString().split('T')[0],
      end_date: body.endDate || body.end_date || '',
      duration_days: Number(body.durationDays || body.duration_days) || 3,
      budget: Number(body.budget) || 1000,
      currency: body.currency || 'USD',
      travelers: Number(body.travelers) || 1,
      travel_style: body.travelStyle || body.travel_style || 'adventure',
      interests: Array.isArray(body.interests) ? body.interests : [],
      transport_mode: body.transportMode || body.transport_mode || 'Public Transit',
      accommodation: body.accommodation || body.accommodationType || 'Hotel',
      dietary_accessibility: body.dietary_accessibility || body.dietaryPreferences || '',
      itinerary: body.itinerary,
      created_at: new Date().toISOString(),
    };

    const saved = saveTrip(record);
    res.status(201).json({
      success: true,
      data: saved,
      message: 'Trip saved successfully to SQLite database.',
    });
  } catch (error: any) {
    console.error('Error saving trip:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save trip to database.',
    });
  }
});

// Delete saved trip
apiRouter.delete('/trips/:id', (req, res) => {
  try {
    const deleted = deleteTrip(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found or already deleted.',
      });
    }
    res.json({
      success: true,
      message: 'Trip deleted successfully.',
    });
  } catch (error: any) {
    console.error('Error deleting trip:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete trip.',
    });
  }
});
