import { PlacesClient } from "@googlemaps/places"
import { NextRequest, NextResponse } from "next/server"

const placesClient = new PlacesClient({
  apiKey: process.env.GOOGLE_MAPS_API_KEY!,
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const placeId = searchParams.get("placeId")

    if (!placeId) {
      return NextResponse.json(
        { error: "placeId parameter is required" },
        { status: 400 }
      )
    }

    // Get place details with only postalAddress field
    const [{ postalAddress }] = await placesClient.getPlace(
      {
        name: placeId,
      },
      {
        otherArgs: {
          headers: {
            "X-Goog-FieldMask": "postalAddress",
          },
        },
      }
    )

    if (!postalAddress) {
      return NextResponse.json(
        { error: "No postal address found for this place" },
        { status: 404 }
      )
    }

    // Map postalAddress to Medusa address format
    const medusaAddress = {
      address_1: postalAddress.addressLines?.[0] || "",
      address_2: postalAddress.addressLines?.[1] || "",
      city: postalAddress.locality || "",
      postal_code: postalAddress.postalCode || "",
      country_code: postalAddress.regionCode?.toLowerCase() || "",
    }

    return NextResponse.json(medusaAddress)
  } catch (error) {
    console.error("Google Places API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch place details" },
      { status: 500 }
    )
  }
}
