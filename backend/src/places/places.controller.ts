import { Controller, Get, Query, HttpException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

const GMAPS_KEY = process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyCFoPTcIqM5HENk3gFJMX1o_sGXXc_9FX4';

@ApiTags('Places')
@Controller('places')
export class PlacesController {

  @Get('autocomplete')
  @ApiOperation({ summary: 'Proxy Google Places Autocomplete (avoids browser CORS)' })
  async autocomplete(
    @Query('input') input: string,
    @Query('sessiontoken') sessiontoken: string,
  ) {
    if (!input) return { status: 'ZERO_RESULTS', predictions: [] };

    const params = new URLSearchParams({
      input,
      key: GMAPS_KEY,
      sessiontoken: sessiontoken || '',
      components: 'country:in',
      language: 'en',
      types: 'geocode',
    });

    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`,
    );
    if (!res.ok) throw new HttpException('Places API error', 502);
    return res.json();
  }

  @Get('details')
  @ApiOperation({ summary: 'Proxy Google Place Details (avoids browser CORS)' })
  async details(@Query('place_id') placeId: string) {
    if (!placeId) throw new HttpException('place_id required', 400);

    const params = new URLSearchParams({
      place_id: placeId,
      fields: 'geometry,formatted_address',
      key: GMAPS_KEY,
    });

    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?${params}`,
    );
    if (!res.ok) throw new HttpException('Places API error', 502);
    return res.json();
  }
}
