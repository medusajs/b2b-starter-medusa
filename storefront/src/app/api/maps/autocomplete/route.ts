import { PlacesClient } from "@googlemaps/places"
import { NextRequest, NextResponse } from "next/server"

const placesClient = new PlacesClient({
  apiKey: process.env.GOOGLE_MAPS_API_KEY!,
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("query")
    const regions = searchParams.get("regions")?.split(",") || ["GB"]

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      )
    }

    // Use autocomplete to get address suggestions
    const [{ suggestions }] = await placesClient.autocompletePlaces({
      input: query,
      includedRegionCodes: regions,
    })

    return NextResponse.json({
      suggestions: suggestions?.map((s) => ({
        place_id: s.placePrediction?.place,
        description: s.placePrediction?.text?.text,
      })),
    })
  } catch (error) {
    console.error("Google Maps API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch address suggestions" },
      { status: 500 }
    )
  }
}
